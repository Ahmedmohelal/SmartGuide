using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Chat
{
    public sealed class ChatActionResult<T>
    {
        private ChatActionResult(T? value, int? statusCode, string? errorMessage, string? errorCode)
        {
            Value = value;
            StatusCode = statusCode;
            ErrorMessage = errorMessage;
            ErrorCode = errorCode;
        }

        public T? Value { get; }
        public int? StatusCode { get; }
        public string? ErrorMessage { get; }
        public string? ErrorCode { get; }

        public bool Success => StatusCode == null;

        public static ChatActionResult<T> Ok(T value) => new(value, null, null, null);

        public static ChatActionResult<T> Fail(int statusCode, string code, string message) =>
            new(default, statusCode, message, code);
    }
}
