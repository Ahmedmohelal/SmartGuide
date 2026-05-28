using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Common.Results
{
    public class Result
    {
        protected Result(
            bool isSuccess,
            int statusCode,
            string? message = null,
            List<string>? errors = null)
        {
            IsSuccess = isSuccess;

            StatusCode = statusCode;

            Message = message;

            Errors = errors ?? new();
        }

        public bool IsSuccess { get; }

        public int StatusCode { get; }

        public string? Message { get; }

        public List<string> Errors { get; }

        public static Result Success(
            string? message = null,
            int statusCode = 200)
        {
            return new Result(
                true,
                statusCode,
                message);
        }

        public static Result Failure(
            string message,
            int statusCode = 400,
            List<string>? errors = null)
        {
            return new Result(
                false,
                statusCode,
                message,
                errors);
        }
    }

    public class Result<T> : Result
    {
        private Result(
            T? data,
            bool isSuccess,
            int statusCode,
            string? message = null,
            List<string>? errors = null)

            : base(
                isSuccess,
                statusCode,
                message,
                errors)
        {
            Data = data;
        }

        public T? Data { get; }

        public static Result<T> Success(
            T data,
            string? message = null,
            int statusCode = 200)
        {
            return new Result<T>(
                data,
                true,
                statusCode,
                message);
        }

        public static new Result<T> Failure(
            string message,
            int statusCode = 400,
            List<string>? errors = null)
        {
            return new Result<T>(
                default,
                false,
                statusCode,
                message,
                errors);
        }
    }

}
