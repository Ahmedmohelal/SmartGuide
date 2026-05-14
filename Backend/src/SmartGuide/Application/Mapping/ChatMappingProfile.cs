//using Application.DTOs.Chat;
//using AutoMapper;
//using Domain.Entities.Chat;
//using static System.Runtime.InteropServices.JavaScript.JSType;

//namespace Application.Mapping
//{
//    public sealed class ChatMappingProfile : Profile
//    {
//        public ChatMappingProfile()
//        {
//            CreateMap<ChatMessage, ChatMessageResponseDto>()
//                .ForMember(d => d.DisplayContent, o => o.MapFrom(s =>
//                    s.IsDeleted ? ChatConstants.DeletedMessagePlaceholder : s.Content))
//                .ForMember(d => d.Status, o => o.MapFrom(s =>
//                    s.SeenAtUtc != null ? ChatMessageStatus.Seen :
//                    s.DeliveredAtUtc != null ? ChatMessageStatus.Delivered :
//                    ChatMessageStatus.Sent));
//        }
//    }
//}
