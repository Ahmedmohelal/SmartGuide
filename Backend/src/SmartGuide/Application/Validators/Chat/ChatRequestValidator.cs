using Application.DTOs.Chat;
using FluentValidation;

namespace Application.Validators.Chat
{
    public sealed class CreateOrGetConversationRequestValidator : AbstractValidator<CreateOrGetConversationRequestDto>
    {
        public CreateOrGetConversationRequestValidator()
        {
            RuleFor(x => x.OtherPartyUserId)
                .NotEmpty()
                .MaximumLength(450);
        }
    }

    public sealed class SendChatMessageRequestValidator : AbstractValidator<SendChatMessageRequestDto>
    {
        public SendChatMessageRequestValidator()
        {
            RuleFor(x => x.Content)
                .NotEmpty()
                .MaximumLength(ChatConstants.MaxMessageLength);
        }
    }

    public sealed class EditChatMessageRequestValidator : AbstractValidator<EditChatMessageRequestDto>
    {
        public EditChatMessageRequestValidator()
        {
            RuleFor(x => x.Content)
                .NotEmpty()
                .MaximumLength(ChatConstants.MaxMessageLength);
        }
    }
}
