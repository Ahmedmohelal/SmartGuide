using Application.DTOs.Chat;
using Application.Services.Interfaces.Chat;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
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
        private readonly IValidator<CreateOrGetConversationRequestDto> _createConversationValidator;
        private readonly IValidator<SendChatMessageRequestDto> _sendMessageValidator;
        private readonly IValidator<EditChatMessageRequestDto> _editMessageValidator;

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

        private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        private static IActionResult FromChatResult<T>(ChatActionResult<T> result)
        {
            if (result.Success)
                return new OkObjectResult(result.Value);
            return new ObjectResult(new { code = result.ErrorCode, message = result.ErrorMessage })
            {
                StatusCode = result.StatusCode
            };
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversationsAsync([FromQuery] int page = 1, [FromQuery] int pageSize = ChatConstants.DefaultPageSize, CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.GetConversationsAsync(uid, page, pageSize, cancellationToken);
            return FromChatResult(result);
        }

        [HttpGet("conversations/{conversationId:guid}")]
        public async Task<IActionResult> GetConversationAsync(Guid conversationId, CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.GetConversationDetailAsync(uid, conversationId, cancellationToken);
            return FromChatResult(result);
        }

        [HttpPost("conversations")]
        public async Task<IActionResult> CreateOrGetConversationAsync([FromBody] CreateOrGetConversationRequestDto request, CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var v = await _createConversationValidator.ValidateAsync(request, cancellationToken);
            if (!v.IsValid)
                return BadRequest(new { errors = v.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }) });

            var result = await _chatService.CreateOrGetConversationAsync(uid, request, cancellationToken);
            return FromChatResult(result);
        }

        [HttpGet("conversations/{conversationId:guid}/messages")]
        public async Task<IActionResult> GetMessagesAsync(
            Guid conversationId,
            [FromQuery] DateTime? beforeSentAtUtc,
            [FromQuery] int pageSize = ChatConstants.DefaultPageSize,
            CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.GetMessagesAsync(uid, conversationId, beforeSentAtUtc, pageSize, cancellationToken);
            return FromChatResult(result);
        }

        [HttpPost("conversations/{conversationId:guid}/messages")]
        public async Task<IActionResult> SendMessageAsync(Guid conversationId, [FromBody] SendChatMessageRequestDto request, CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var v = await _sendMessageValidator.ValidateAsync(request, cancellationToken);
            if (!v.IsValid)
                return BadRequest(new { errors = v.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }) });

            var result = await _chatService.SendMessageAsync(uid, conversationId, request, cancellationToken);
            return FromChatResult(result);
        }

        [HttpPatch("messages/{messageId:guid}")]
        public async Task<IActionResult> EditMessageAsync(Guid messageId, [FromBody] EditChatMessageRequestDto request, CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var v = await _editMessageValidator.ValidateAsync(request, cancellationToken);
            if (!v.IsValid)
                return BadRequest(new { errors = v.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }) });

            var result = await _chatService.EditMessageAsync(uid, messageId, request, cancellationToken);
            return FromChatResult(result);
        }

        [HttpDelete("messages/{messageId:guid}")]
        public async Task<IActionResult> DeleteMessageAsync(Guid messageId, CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.DeleteMessageAsync(uid, messageId, cancellationToken);
            return FromChatResult(result);
        }

        [HttpPost("conversations/{conversationId:guid}/read")]
        public async Task<IActionResult> MarkSeenAsync(Guid conversationId, CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.MarkConversationSeenAsync(uid, conversationId, cancellationToken);
            return FromChatResult(result);
        }

        [HttpPost("conversations/{conversationId:guid}/block")]
        [Authorize(Roles = "TourGuide")]
        public async Task<IActionResult> BlockTouristAsync(Guid conversationId, CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.BlockTouristAsync(uid, conversationId, cancellationToken);
            return FromChatResult(result);
        }

        [HttpPost("conversations/{conversationId:guid}/unblock")]
        [Authorize(Roles = "TourGuide")]
        public async Task<IActionResult> UnblockTouristAsync(Guid conversationId, CancellationToken cancellationToken = default)
        {
            var uid = UserId;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized();

            var result = await _chatService.UnblockTouristAsync(uid, conversationId, cancellationToken);
            return FromChatResult(result);
        }
    }
}
