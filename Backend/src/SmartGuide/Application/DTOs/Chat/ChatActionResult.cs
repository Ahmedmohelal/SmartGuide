using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Chat
{
    public sealed class ChatActionResult<T>
    {
        private ChatActionResult(
            bool success,
            T? value,
            int statusCode,
            string? errorMessage,
            string? errorCode)
        {
            Success = success;
            Value = value;
            StatusCode = statusCode;
            ErrorMessage = errorMessage;
            ErrorCode = errorCode;
        }

        public bool Success { get; }

        public T? Value { get; }

        public int StatusCode { get; }

        public string? ErrorMessage { get; }

        public string? ErrorCode { get; }

        public static ChatActionResult<T> Ok(T value) =>
            new(true, value, StatusCodes.Status200OK, null, null);

        public static ChatActionResult<T> Fail(
            int statusCode,
            string code,
            string message) =>
            new(false, default, statusCode, message, code);
    }
}
