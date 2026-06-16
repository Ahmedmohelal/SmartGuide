using Application.Contracts.Chat;
using Application.DTOs.Chat;
using Application.Helper;
using Application.Services.Interfaces.Chat;
using Domain.Entities.Chat;
using Domain.Interfaces.Chat;

namespace Application.Services.UseCases.Chat
{
    public class ChatService : IChatService
    {
        private readonly IChatConversationRepository _conversations;
        private readonly IChatMessageRepository _messages;
        private readonly IChatUserConnectionRepository _connections;
        private readonly IChatUnitOfWork _unitOfWork;
        private readonly IChatRealtimePublisher _realtime;
        private readonly IChatUserReader _users;

        public ChatService(
            IChatConversationRepository conversations,
            IChatMessageRepository messages,
            IChatUserConnectionRepository connections,
            IChatUnitOfWork unitOfWork,
            IChatRealtimePublisher realtime,
            IChatUserReader users)
        {
            _conversations = conversations;
            _messages = messages;
            _connections = connections;
            _unitOfWork = unitOfWork;
            _realtime = realtime;
            _users = users;
        }

        public async Task<bool> IsParticipantAsync(string userId, Guid conversationId, CancellationToken cancellationToken = default)
        {
            var c = await _conversations.GetByIdWithParticipantsAsync(conversationId, cancellationToken);
            return c != null && !c.IsDeleted && (c.TouristUserId == userId || c.GuideUserId == userId);
        }

        public async Task<ChatActionResult<ConversationDetailDto>> CreateOrGetConversationAsync(
            string requesterUserId,
            CreateOrGetConversationRequestDto request,
            CancellationToken cancellationToken = default)
        {
            var requester = await _users.GetAsync(requesterUserId, cancellationToken);
            var other = await _users.GetAsync(request.OtherPartyUserId, cancellationToken);
            if (requester == null || other == null)
                return ChatActionResult<ConversationDetailDto>.Fail(404, "USER_NOT_FOUND", "User not found.");

            if (string.Equals(requester.UserId, other.UserId, StringComparison.Ordinal))
                return ChatActionResult<ConversationDetailDto>.Fail(400, "INVALID_TARGET", "Cannot start a conversation with yourself.");

            string touristId;
            string guideId;
            if (string.Equals(requester.Role, Roles.Tourist, StringComparison.OrdinalIgnoreCase)
                && string.Equals(other.Role, Roles.TourGuide, StringComparison.OrdinalIgnoreCase))
            {
                touristId = requester.UserId;
                guideId = other.UserId;
            }
            else if (string.Equals(requester.Role, Roles.TourGuide, StringComparison.OrdinalIgnoreCase)
                     && string.Equals(other.Role, Roles.Tourist, StringComparison.OrdinalIgnoreCase))
            {
                touristId = other.UserId;
                guideId = requester.UserId;
            }
            else
            {
                return ChatActionResult<ConversationDetailDto>.Fail(400, "INVALID_PAIR",
                    "Private chat is only allowed between one Tourist and one Tour Guide.");
            }

            var existing = await _conversations.GetByTouristAndGuideAsync(touristId, guideId, cancellationToken);
            if (existing != null)
            {
                var dto = await MapConversationDetailAsync(existing, requesterUserId, cancellationToken);
                return ChatActionResult<ConversationDetailDto>.Ok(dto);
            }

            var now = DateTime.UtcNow;
            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                TouristUserId = touristId,
                GuideUserId = guideId,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };

            await _conversations.AddAsync(conversation, cancellationToken);
            await _conversations.AddParticipantAsync(new ConversationParticipant
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                UserId = touristId,
                Role = ChatParticipantRole.Tourist,
                JoinedAtUtc = now
            }, cancellationToken);
            await _conversations.AddParticipantAsync(new ConversationParticipant
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                UserId = guideId,
                Role = ChatParticipantRole.TourGuide,
                JoinedAtUtc = now
            }, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var created = await _conversations.GetByIdWithParticipantsAsync(conversation.Id, cancellationToken)
                          ?? conversation;

            var detail = await MapConversationDetailAsync(created, requesterUserId, cancellationToken);
            return ChatActionResult<ConversationDetailDto>.Ok(detail);
        }

        public async Task<ChatActionResult<PagedResultDto<ConversationSummaryDto>>> GetConversationsAsync(
            string userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, ChatConstants.MaxPageSize);

            var total = await _conversations.CountForUserAsync(userId, cancellationToken);
            var skip = (page - 1) * pageSize;
            var list = await _conversations.ListForUserAsync(userId, skip, pageSize, cancellationToken);
            var ids = list.Select(c => c.Id).ToList();
            var unread = await _messages.GetUnreadCountsAsync(ids, userId, cancellationToken);


            //        var items = (await Task.WhenAll(
            //list.Select(async c => new ConversationSummaryDto
            //        {
            //            Id = c.Id,
            //            TouristUserId = c.TouristUserId,
            //            GuideUserId = c.GuideUserId,

            //            ProfilePictureUrl = c.TouristUserId == userId
            //                ? await _users.GetProfilePictureUrlAsync(c.GuideUserId)
            //                : await _users.GetProfilePictureUrlAsync(c.TouristUserId),

            //            FullName = c.TouristUserId == userId
            //                ? await _users.GetFullNameAsync(c.GuideUserId)
            //                : await _users.GetFullNameAsync(c.TouristUserId),

            //            CreatedAtUtc = c.CreatedAtUtc,
            //            UpdatedAtUtc = c.UpdatedAtUtc,
            //            LastMessagePreview = c.LastMessagePreview,
            //            LastMessageSentAtUtc = c.LastMessageSentAtUtc,
            //            UnreadCount = unread.TryGetValue(c.Id, out var u) ? u : 0,
            //            IsMessagingBlocked = c.IsMessagingBlocked
            //        })
            //    )).ToList();

            var items = new List<ConversationSummaryDto>();

            foreach (var c in list)
            {
                var otherUserId =
                    c.TouristUserId == userId
                    ? c.GuideUserId
                    : c.TouristUserId;

                var fullName = await _users.GetFullNameAsync(otherUserId);

                var photo = await _users.GetProfilePictureUrlAsync(otherUserId);

                items.Add(new ConversationSummaryDto
                {
                    Id = c.Id,
                    FullName = fullName,
                    ProfilePictureUrl = photo,
                    TouristUserId = c.TouristUserId,
                    GuideUserId = c.GuideUserId,
                    CreatedAtUtc = c.CreatedAtUtc,
                    UpdatedAtUtc = c.UpdatedAtUtc,
                    LastMessagePreview = c.LastMessagePreview,
                    LastMessageSentAtUtc = c.LastMessageSentAtUtc,
                    UnreadCount = unread.TryGetValue(c.Id, out var u) ? u : 0,
                    IsMessagingBlocked = c.IsMessagingBlocked
                });
            }

            return ChatActionResult<PagedResultDto<ConversationSummaryDto>>.Ok(new PagedResultDto<ConversationSummaryDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = total
            });
        }

        public async Task<ChatActionResult<ConversationDetailDto>> GetConversationDetailAsync(
            string userId,
            Guid conversationId,
            CancellationToken cancellationToken = default)
        {
            var c = await _conversations.GetByIdWithParticipantsAsync(conversationId, cancellationToken);
            if (c == null || c.IsDeleted)
                return ChatActionResult<ConversationDetailDto>.Fail(404, "NOT_FOUND", "Conversation not found.");

            if (c.TouristUserId != userId && c.GuideUserId != userId)
                return ChatActionResult<ConversationDetailDto>.Fail(403, "FORBIDDEN", "You are not a participant in this conversation.");

            var dto = await MapConversationDetailAsync(c, userId, cancellationToken);
            return ChatActionResult<ConversationDetailDto>.Ok(dto);
        }

        public async Task<ChatActionResult<PagedResultDto<ChatMessageResponseDto>>> GetMessagesAsync(
            string userId,
            Guid conversationId,
            DateTime? beforeSentAtUtc,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            if (!await IsParticipantAsync(userId, conversationId, cancellationToken))
                return ChatActionResult<PagedResultDto<ChatMessageResponseDto>>.Fail(403, "FORBIDDEN", "You are not a participant in this conversation.");

            pageSize = Math.Clamp(pageSize, 1, ChatConstants.MaxPageSize);
            var page = await _messages.GetPageAsync(conversationId, beforeSentAtUtc, pageSize, cancellationToken);
            var chronological = page.OrderBy(m => m.SentAtUtc).ToList();

            var items = chronological.Select(MapMessageDto).ToList();
            return ChatActionResult<PagedResultDto<ChatMessageResponseDto>>.Ok(new PagedResultDto<ChatMessageResponseDto>
            {
                Items = items,
                Page = 1,
                PageSize = items.Count,
                TotalCount = items.Count
            });
        }

        public async Task<ChatActionResult<ChatMessageResponseDto>> SendMessageAsync(
            string senderUserId,
            Guid conversationId,
            SendChatMessageRequestDto request,
            CancellationToken cancellationToken = default)
        {
            var conversation = await _conversations.GetByIdForUpdateAsync(conversationId, cancellationToken);
            if (conversation == null || conversation.IsDeleted)
                return ChatActionResult<ChatMessageResponseDto>.Fail(404, "NOT_FOUND", "Conversation not found.");

            if (conversation.TouristUserId != senderUserId && conversation.GuideUserId != senderUserId)
                return ChatActionResult<ChatMessageResponseDto>.Fail(403, "FORBIDDEN", "You are not a participant in this conversation.");

            if (conversation.IsMessagingBlocked && string.Equals(conversation.TouristUserId, senderUserId, StringComparison.Ordinal))
            {
                return ChatActionResult<ChatMessageResponseDto>.Fail(403, "BLOCKED",
                    "The tour guide has blocked messages from your account. You can still view past messages.");
            }

            var content = request.Content.Trim();
            if (content.Length == 0 || content.Length > ChatConstants.MaxMessageLength)
                return ChatActionResult<ChatMessageResponseDto>.Fail(400, "INVALID_CONTENT", "Message content is invalid.");

            var now = DateTime.UtcNow;
            var recipientId = conversation.TouristUserId == senderUserId ? conversation.GuideUserId : conversation.TouristUserId;
            var recipientOnline = await _connections.HasActiveConnectionAsync(recipientId, cancellationToken);

            var message = new ChatMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                SenderUserId = senderUserId,
                Content = content,
                SentAtUtc = now,
                DeliveredAtUtc = recipientOnline ? now : null,
                SeenAtUtc = null,
                Status = recipientOnline ? ChatMessageStatus.Delivered : ChatMessageStatus.Sent,
                IsEdited = false,
                IsDeleted = false
            };

            await _messages.AddAsync(message, cancellationToken);
            conversation.UpdatedAtUtc = now;
            conversation.LastMessagePreview = content.Length > 200 ? content[..200] : content;
            conversation.LastMessageSentAtUtc = now;
            _conversations.Update(conversation);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = MapMessageDto(message);
            var realtime = ToRealtimeDto(message);

            await _realtime.PublishNewMessageAsync(conversationId, realtime, cancellationToken);

            if (recipientOnline)
            {
                await _realtime.PublishMessageStatusAsync(conversationId, new ChatMessageStatusRealtimeDto
                {
                    MessageId = message.Id,
                    ConversationId = conversationId,
                    Status = ChatMessageStatus.Delivered,
                    DeliveredAtUtc = now,
                    SeenAtUtc = null
                }, cancellationToken);
            }

            return ChatActionResult<ChatMessageResponseDto>.Ok(dto);
        }

        public async Task<ChatActionResult<ChatMessageResponseDto>> EditMessageAsync(
            string userId,
            Guid messageId,
            EditChatMessageRequestDto request,
            CancellationToken cancellationToken = default)
        {
            var message = await _messages.GetByIdAsync(messageId, cancellationToken);
            if (message == null)
                return ChatActionResult<ChatMessageResponseDto>.Fail(404, "NOT_FOUND", "Message not found.");

            if (message.SenderUserId != userId)
                return ChatActionResult<ChatMessageResponseDto>.Fail(403, "FORBIDDEN", "You can only edit your own messages.");

            if (message.IsDeleted)
                return ChatActionResult<ChatMessageResponseDto>.Fail(400, "DELETED", "Deleted messages cannot be edited.");

            var now = DateTime.UtcNow;
            if (now - message.SentAtUtc > ChatConstants.EditOrDeleteWindow)
                return ChatActionResult<ChatMessageResponseDto>.Fail(400, "EDIT_WINDOW_CLOSED", "Messages can only be edited within 5 minutes of sending.");

            var newContent = request.Content.Trim();
            if (newContent.Length == 0 || newContent.Length > ChatConstants.MaxMessageLength)
                return ChatActionResult<ChatMessageResponseDto>.Fail(400, "INVALID_CONTENT", "Message content is invalid.");

            message.Content = newContent;
            message.IsEdited = true;
            message.EditedAtUtc = now;
            _messages.Update(message);

            var conversation = await _conversations.GetByIdForUpdateAsync(message.ConversationId, cancellationToken);
            if (conversation != null && !conversation.IsDeleted)
            {
                conversation.UpdatedAtUtc = now;
                var latest = await _messages.GetLatestNonDeletedAsync(conversation.Id, cancellationToken);
                if (latest != null)
                {
                    conversation.LastMessagePreview = latest.Content.Length > 200 ? latest.Content[..200] : latest.Content;
                    conversation.LastMessageSentAtUtc = latest.SentAtUtc;
                }
                _conversations.Update(conversation);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = MapMessageDto(message);
            await _realtime.PublishMessageEditedAsync(message.ConversationId, new ChatMessageEditedRealtimeDto
            {
                MessageId = message.Id,
                ConversationId = message.ConversationId,
                Content = message.IsDeleted ? ChatConstants.DeletedMessagePlaceholder : message.Content,
                EditedAtUtc = message.EditedAtUtc ?? now,
                IsEdited = true
            }, cancellationToken);

            return ChatActionResult<ChatMessageResponseDto>.Ok(dto);
        }

        public async Task<ChatActionResult<Unit>> DeleteMessageAsync(
            string userId,
            Guid messageId,
            CancellationToken cancellationToken = default)
        {
            var message = await _messages.GetByIdAsync(messageId, cancellationToken);
            if (message == null)
                return ChatActionResult<Unit>.Fail(404, "NOT_FOUND", "Message not found.");

            if (message.SenderUserId != userId)
                return ChatActionResult<Unit>.Fail(403, "FORBIDDEN", "You can only delete your own messages.");

            if (message.IsDeleted)
                return ChatActionResult<Unit>.Ok(Unit.Value);

            var now = DateTime.UtcNow;
            if (now - message.SentAtUtc > ChatConstants.EditOrDeleteWindow)
                return ChatActionResult<Unit>.Fail(400, "DELETE_WINDOW_CLOSED", "Messages can only be deleted within 5 minutes of sending.");

            message.IsDeleted = true;
            message.DeletedAtUtc = now;
            message.Content = ChatConstants.DeletedMessagePlaceholder;
            _messages.Update(message);

            var conversation = await _conversations.GetByIdForUpdateAsync(message.ConversationId, cancellationToken);
            if (conversation != null && !conversation.IsDeleted)
            {
                conversation.UpdatedAtUtc = now;
                var latest = await _messages.GetLatestNonDeletedAsync(conversation.Id, cancellationToken);
                if (latest != null)
                {
                    conversation.LastMessagePreview = latest.IsDeleted
                        ? ChatConstants.DeletedMessagePlaceholder
                        : (latest.Content.Length > 200 ? latest.Content[..200] : latest.Content);
                    conversation.LastMessageSentAtUtc = latest.SentAtUtc;
                }
                else
                {
                    conversation.LastMessagePreview = null;
                    conversation.LastMessageSentAtUtc = null;
                }
                _conversations.Update(conversation);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _realtime.PublishMessageDeletedAsync(message.ConversationId, new ChatMessageDeletedRealtimeDto
            {
                MessageId = message.Id,
                ConversationId = message.ConversationId,
                DisplayContent = ChatConstants.DeletedMessagePlaceholder,
                DeletedAtUtc = now
            }, cancellationToken);

            return ChatActionResult<Unit>.Ok(Unit.Value);
        }

        public async Task<ChatActionResult<Unit>> MarkConversationSeenAsync(
            string readerUserId,
            Guid conversationId,
            CancellationToken cancellationToken = default)
        {
            if (!await IsParticipantAsync(readerUserId, conversationId, cancellationToken))
                return ChatActionResult<Unit>.Fail(403, "FORBIDDEN", "You are not a participant in this conversation.");

            var ids = await _messages.GetUnreadIncomingMessageIdsAsync(conversationId, readerUserId, cancellationToken);
            if (ids.Count == 0)
                return ChatActionResult<Unit>.Ok(Unit.Value);

            var seenAt = DateTime.UtcNow;
            await _messages.MarkBulkSeenAsync(conversationId, readerUserId, seenAt, cancellationToken);

            await _realtime.PublishReadReceiptAsync(conversationId, new ConversationReadReceiptRealtimeDto
            {
                ConversationId = conversationId,
                ReaderUserId = readerUserId,
                SeenAtUtc = seenAt,
                MessageIds = ids
            }, cancellationToken);

            foreach (var messageId in ids)
            {
                await _realtime.PublishMessageStatusAsync(conversationId, new ChatMessageStatusRealtimeDto
                {
                    MessageId = messageId,
                    ConversationId = conversationId,
                    Status = ChatMessageStatus.Seen,
                    DeliveredAtUtc = seenAt,
                    SeenAtUtc = seenAt
                }, cancellationToken);
            }

            return ChatActionResult<Unit>.Ok(Unit.Value);
        }

        public async Task<ChatActionResult<Unit>> BlockTouristAsync(
            string guideUserId,
            Guid conversationId,
            CancellationToken cancellationToken = default)
        {
            var conversation = await _conversations.GetByIdForUpdateAsync(conversationId, cancellationToken);
            if (conversation == null || conversation.IsDeleted)
                return ChatActionResult<Unit>.Fail(404, "NOT_FOUND", "Conversation not found.");

            if (conversation.GuideUserId != guideUserId)
                return ChatActionResult<Unit>.Fail(403, "FORBIDDEN", "Only the tour guide for this conversation can block the tourist.");

            conversation.IsMessagingBlocked = true;
            conversation.MessagingBlockedAtUtc = DateTime.UtcNow;
            conversation.MessagingBlockedByGuideUserId = guideUserId;
            conversation.UpdatedAtUtc = DateTime.UtcNow;
            _conversations.Update(conversation);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return ChatActionResult<Unit>.Ok(Unit.Value);
        }

        public async Task<ChatActionResult<Unit>> UnblockTouristAsync(
            string guideUserId,
            Guid conversationId,
            CancellationToken cancellationToken = default)
        {
            var conversation = await _conversations.GetByIdForUpdateAsync(conversationId, cancellationToken);
            if (conversation == null || conversation.IsDeleted)
                return ChatActionResult<Unit>.Fail(404, "NOT_FOUND", "Conversation not found.");

            if (conversation.GuideUserId != guideUserId)
                return ChatActionResult<Unit>.Fail(403, "FORBIDDEN", "Only the tour guide for this conversation can unblock the tourist.");

            conversation.IsMessagingBlocked = false;
            conversation.MessagingBlockedAtUtc = null;
            conversation.MessagingBlockedByGuideUserId = null;
            conversation.UpdatedAtUtc = DateTime.UtcNow;
            _conversations.Update(conversation);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return ChatActionResult<Unit>.Ok(Unit.Value);
        }

        public async Task RegisterConnectionAsync(string userId, string connectionId, CancellationToken cancellationToken = default)
        {
            var wasOnline = await _connections.HasActiveConnectionAsync(userId, cancellationToken);
            var now = DateTime.UtcNow;

            await _connections.AddAsync(new ChatUserConnection
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ConnectionId = connectionId,
                ConnectedAtUtc = now
            }, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _messages.MarkBulkDeliveredForRecipientAsync(userId, now, cancellationToken);

            if (!wasOnline)
            {
                var partners = await _conversations.GetDistinctPartnerUserIdsAsync(userId, cancellationToken);
                var presence = new UserPresenceRealtimeDto
                {
                    UserId = userId,
                    IsOnline = true,
                    OccurredAtUtc = now
                };
                foreach (var partnerId in partners)
                    await _realtime.PublishPresenceAsync(partnerId, presence, cancellationToken);
            }
        }

        public async Task HandleDisconnectedAsync(string connectionId, CancellationToken cancellationToken = default)
        {
            var row = await _connections.GetActiveByConnectionIdAsync(connectionId, cancellationToken);
            if (row == null)
                return;

            var userId = row.UserId;
            await _connections.DisconnectAsync(connectionId, DateTime.UtcNow, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var stillOnline = await _connections.HasActiveConnectionAsync(userId, cancellationToken);
            if (!stillOnline)
            {
                var now = DateTime.UtcNow;
                var partners = await _conversations.GetDistinctPartnerUserIdsAsync(userId, cancellationToken);
                var presence = new UserPresenceRealtimeDto
                {
                    UserId = userId,
                    IsOnline = false,
                    OccurredAtUtc = now
                };
                foreach (var partnerId in partners)
                    await _realtime.PublishPresenceAsync(partnerId, presence, cancellationToken);
            }
        }

        private async Task<ConversationDetailDto> MapConversationDetailAsync(
            Conversation c,
            string requesterUserId,
            CancellationToken cancellationToken)
        {
            var unread = await _messages.GetUnreadCountsAsync(new[] { c.Id }, requesterUserId, cancellationToken);
            var otherPartyId = c.TouristUserId == requesterUserId ? c.GuideUserId : c.TouristUserId;
            var other = await _users.GetAsync(otherPartyId, cancellationToken);

            return new ConversationDetailDto
            {
                Id = c.Id,
                TouristUserId = c.TouristUserId,
                GuideUserId = c.GuideUserId,
                CreatedAtUtc = c.CreatedAtUtc,
                UpdatedAtUtc = c.UpdatedAtUtc,
                LastMessagePreview = c.LastMessagePreview,
                LastMessageSentAtUtc = c.LastMessageSentAtUtc,
                UnreadCount = unread.TryGetValue(c.Id, out var u) ? u : 0,
                IsMessagingBlocked = c.IsMessagingBlocked,
                OtherPartyUserId = otherPartyId,
                OtherPartyDisplayName = other?.DisplayName,
                OtherPartyProfilePictureUrl = await _users.GetProfilePictureUrlAsync(otherPartyId, cancellationToken)
            };
        }

        private static ChatMessageResponseDto MapMessageDto(ChatMessage m)
        {
            var display = m.IsDeleted ? ChatConstants.DeletedMessagePlaceholder : m.Content;
            return new ChatMessageResponseDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderUserId = m.SenderUserId,
                Content = m.Content,
                DisplayContent = display,
                SentAtUtc = m.SentAtUtc,
                DeliveredAtUtc = m.DeliveredAtUtc,
                SeenAtUtc = m.SeenAtUtc,
                Status = ResolveStatus(m),
                IsEdited = m.IsEdited,
                EditedAtUtc = m.EditedAtUtc,
                IsDeleted = m.IsDeleted,
                DeletedAtUtc = m.DeletedAtUtc
            };
        }

        private static ChatMessageRealtimeDto ToRealtimeDto(ChatMessage m) => new()
        {
            MessageId = m.Id,
            ConversationId = m.ConversationId,
            SenderUserId = m.SenderUserId,
            Content = m.IsDeleted ? ChatConstants.DeletedMessagePlaceholder : m.Content,
            SentAtUtc = m.SentAtUtc,
            DeliveredAtUtc = m.DeliveredAtUtc,
            SeenAtUtc = m.SeenAtUtc,
            Status = ResolveStatus(m),
            IsEdited = m.IsEdited,
            IsDeleted = m.IsDeleted
        };

        private static ChatMessageStatus ResolveStatus(ChatMessage m)
        {
            if (m.SeenAtUtc.HasValue)
                return ChatMessageStatus.Seen;
            if (m.DeliveredAtUtc.HasValue)
                return ChatMessageStatus.Delivered;
            return ChatMessageStatus.Sent;
        }
    }
}
