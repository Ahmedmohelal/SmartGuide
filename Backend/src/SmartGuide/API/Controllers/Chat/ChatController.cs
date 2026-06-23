using Application.DTOs.Chat;
using Application.Services.Interfaces.Chat;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers.Chat
{
    [ApiController]
    [Route("api/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        private readonly IValidator<CreateOrGetConversationRequestDto>
            _createConversationValidator;

        private readonly IValidator<SendChatMessageRequestDto>
            _sendMessageValidator;

        private readonly IValidator<EditChatMessageRequestDto>
            _editMessageValidator;

        public ChatController(
            IChatService chatService,
            IValidator<CreateOrGetConversationRequestDto> createConversationValidator,
            IValidator<SendChatMessageRequestDto> sendMessageValidator,
            IValidator<EditChatMessageRequestDto> editMessageValidator)
        {
            _chatService = chatService;

            _createConversationValidator = createConversationValidator;

            _sendMessageValidator = sendMessageValidator;

            _editMessageValidator = editMessageValidator;
        }

        private string? UserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        // =========================================================
        // Conversations
        // =========================================================

        [HttpGet("conversations")]
        [ProducesResponseType(
            typeof(PagedResultDto<ConversationSummaryDto>),
            StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        public async Task<ActionResult<PagedResultDto<ConversationSummaryDto>>>
            GetConversationsAsync(
                [FromQuery] int page = 1,
                [FromQuery] int pageSize = ChatConstants.DefaultPageSize,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.GetConversationsAsync(
                uid,
                page,
                pageSize,
                cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }

        [HttpGet("conversations/{conversationId:guid}")]
        [ProducesResponseType(
            typeof(ConversationDetailDto),
            StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        [ProducesResponseType(StatusCodes.Status403Forbidden)]

        [ProducesResponseType(StatusCodes.Status404NotFound)]

        public async Task<ActionResult<ConversationDetailDto>>
            GetConversationAsync(
                Guid conversationId,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.GetConversationDetailAsync(
                uid,
                conversationId,
                cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }

        [HttpPost("conversations")]
        [ProducesResponseType(
            typeof(ConversationDetailDto),
            StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        public async Task<ActionResult<ConversationDetailDto>>
            CreateOrGetConversationAsync(
                [FromBody] CreateOrGetConversationRequestDto request,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var validation =
                await _createConversationValidator.ValidateAsync(
                    request,
                    cancellationToken);

            if (!validation.IsValid)
            {
                return BadRequest(new
                {
                    errors = validation.Errors.Select(e => new
                    {
                        e.PropertyName,
                        e.ErrorMessage
                    })
                });
            }

            var result =
                await _chatService.CreateOrGetConversationAsync(
                    uid,
                    request,
                    cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }

        // =========================================================
        // Messages
        // =========================================================

        [HttpGet("conversations/{conversationId:guid}/messages")]
        [ProducesResponseType(
            typeof(PagedResultDto<ChatMessageResponseDto>),
            StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        [ProducesResponseType(StatusCodes.Status403Forbidden)]

        [ProducesResponseType(StatusCodes.Status404NotFound)]

        public async Task<ActionResult<PagedResultDto<ChatMessageResponseDto>>>
            GetMessagesAsync(
                Guid conversationId,
                [FromQuery] DateTime? beforeSentAtUtc,
                [FromQuery] int pageSize = ChatConstants.DefaultPageSize,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.GetMessagesAsync(
                uid,
                conversationId,
                beforeSentAtUtc,
                pageSize,
                cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }

        [HttpPost("conversations/{conversationId:guid}/messages")]
        [ProducesResponseType(
            typeof(ChatMessageResponseDto),
            StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        [ProducesResponseType(StatusCodes.Status403Forbidden)]

        public async Task<ActionResult<ChatMessageResponseDto>>
            SendMessageAsync(
                Guid conversationId,
                [FromBody] SendChatMessageRequestDto request,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var validation =
                await _sendMessageValidator.ValidateAsync(
                    request,
                    cancellationToken);

            if (!validation.IsValid)
            {
                return BadRequest(new
                {
                    errors = validation.Errors.Select(e => new
                    {
                        e.PropertyName,
                        e.ErrorMessage
                    })
                });
            }

            var result = await _chatService.SendMessageAsync(
                uid,
                conversationId,
                request,
                cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }

        [HttpPatch("messages/{messageId:guid}")]
        [ProducesResponseType(
            typeof(ChatMessageResponseDto),
            StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        [ProducesResponseType(StatusCodes.Status403Forbidden)]

        [ProducesResponseType(StatusCodes.Status404NotFound)]

        public async Task<ActionResult<ChatMessageResponseDto>>
            EditMessageAsync(
                Guid messageId,
                [FromBody] EditChatMessageRequestDto request,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var validation =
                await _editMessageValidator.ValidateAsync(
                    request,
                    cancellationToken);

            if (!validation.IsValid)
            {
                return BadRequest(new
                {
                    errors = validation.Errors.Select(e => new
                    {
                        e.PropertyName,
                        e.ErrorMessage
                    })
                });
            }

            var result = await _chatService.EditMessageAsync(
                uid,
                messageId,
                request,
                cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }

        [HttpDelete("messages/{messageId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        [ProducesResponseType(StatusCodes.Status403Forbidden)]

        [ProducesResponseType(StatusCodes.Status404NotFound)]

        public async Task<ActionResult<Unit>>
            DeleteMessageAsync(
                Guid messageId,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.DeleteMessageAsync(
                uid,
                messageId,
                cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }

        // =========================================================
        // Seen
        // =========================================================

        [HttpPost("conversations/{conversationId:guid}/read")]
        [ProducesResponseType(StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        [ProducesResponseType(StatusCodes.Status403Forbidden)]

        public async Task<ActionResult<Unit>>
            MarkSeenAsync(
                Guid conversationId,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result =
                await _chatService.MarkConversationSeenAsync(
                    uid,
                    conversationId,
                    cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }

        // =========================================================
        // Block / Unblock
        // =========================================================

        [HttpPost("conversations/{conversationId:guid}/block")]
        [Authorize(Roles = "TourGuide")]

        [ProducesResponseType(StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        [ProducesResponseType(StatusCodes.Status403Forbidden)]

        public async Task<ActionResult<Unit>>
            BlockTouristAsync(
                Guid conversationId,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.BlockTouristAsync(
                uid,
                conversationId,
                cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }

        [HttpPost("conversations/{conversationId:guid}/unblock")]
        [Authorize(Roles = "TourGuide")]

        [ProducesResponseType(StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        [ProducesResponseType(StatusCodes.Status403Forbidden)]

        public async Task<ActionResult<Unit>>
            UnblockTouristAsync(
                Guid conversationId,
                CancellationToken cancellationToken = default)
        {
            var uid = UserId;

            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.UnblockTouristAsync(
                uid,
                conversationId,
                cancellationToken);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new
                {
                    code = result.ErrorCode,
                    message = result.ErrorMessage
                });
            }

            return Ok(result.Value);
        }
    }
}