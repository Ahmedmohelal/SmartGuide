/**
 * API Error Handler
 * معالج مركزي لأخطاء API
 */

import { RESPONSE_MESSAGES, HTTP_STATUS } from "../constants";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const message = data?.message || RESPONSE_MESSAGES.ERROR;

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return {
          message: message || RESPONSE_MESSAGES.VALIDATION_ERROR,
          status,
          isValidationError: true,
          errors: data?.errors || {},
        };

      case HTTP_STATUS.UNAUTHORIZED:
        // Clear tokens and redirect to login
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return {
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
          status,
          requiresLogin: true,
        };

      case HTTP_STATUS.FORBIDDEN:
        return {
          message: RESPONSE_MESSAGES.FORBIDDEN,
          status,
        };

      case HTTP_STATUS.NOT_FOUND:
        return {
          message: RESPONSE_MESSAGES.NOT_FOUND,
          status,
        };

      case HTTP_STATUS.CONFLICT:
        return {
          message: message || "البيانات موجودة بالفعل",
          status,
        };

      case HTTP_STATUS.INTERNAL_ERROR:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return {
          message: message || "خطأ في الخادم، يرجى المحاولة لاحقاً",
          status,
        };

      default:
        return {
          message: message || RESPONSE_MESSAGES.ERROR,
          status,
        };
    }
  } else if (error.request) {
    // Request was made but no response
    return {
      message: RESPONSE_MESSAGES.NETWORK_ERROR,
      status: 0,
      isNetworkError: true,
    };
  } else {
    // Error in request setup
    return {
      message: error.message || RESPONSE_MESSAGES.ERROR,
      status: 0,
    };
  }
};

export const getErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (error instanceof ApiError) return error.message;
  if (error?.message) return error.message;
  return RESPONSE_MESSAGES.ERROR;
};
