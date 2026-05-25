import axios from "axios";
import { API_BASE } from "../../config/api";
import { authHeader } from "../utils/tokenUtils";

const CHAT_BASE = `${API_BASE}/chat`;
const chatUrl = (path) => `${CHAT_BASE}${path}`;
const encoded = (value) => encodeURIComponent(String(value));

export const getConversations = async (page = 1, pageSize = 30) => {
  const response = await axios.get(chatUrl("/conversations"), {
    headers: authHeader(),
    params: { page, pageSize },
  });
  return response.data;
};

export const createConversation = async (otherPartyUserId) => {
  const response = await axios.post(
    chatUrl("/conversations"),
    { otherPartyUserId },
    { headers: authHeader() },
  );
  return response.data;
};

export const getConversation = async (conversationId) => {
  const response = await axios.get(chatUrl(`/conversations/${encoded(conversationId)}`), {
    headers: authHeader(),
  });
  return response.data;
};

export const getMessages = async (conversationId, beforeSentAtUtc = "", pageSize = 30) => {
  const response = await axios.get(
    chatUrl(`/conversations/${encoded(conversationId)}/messages`),
    {
      headers: authHeader(),
      params: {
        ...(beforeSentAtUtc ? { beforeSentAtUtc } : {}),
        pageSize,
      },
    },
  );
  return response.data;
};

export const sendMessage = async (conversationId, content) => {
  const response = await axios.post(
    chatUrl(`/conversations/${encoded(conversationId)}/messages`),
    { content },
    { headers: authHeader() },
  );
  return response.data;
};

export const editMessage = async (messageId, content) => {
  const response = await axios.patch(
    chatUrl(`/messages/${encoded(messageId)}`),
    { content },
    { headers: authHeader() },
  );
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await axios.delete(chatUrl(`/messages/${encoded(messageId)}`), {
    headers: authHeader(),
  });
  return response.data;
};

export const markConversationRead = async (conversationId) => {
  const response = await axios.post(
    chatUrl(`/conversations/${encoded(conversationId)}/read`),
    undefined,
    { headers: authHeader() },
  );
  return response.data;
};

export const blockConversation = async (conversationId) => {
  const response = await axios.post(
    chatUrl(`/conversations/${encoded(conversationId)}/block`),
    undefined,
    { headers: authHeader() },
  );
  return response.data;
};

export const unblockConversation = async (conversationId) => {
  const response = await axios.post(
    chatUrl(`/conversations/${encoded(conversationId)}/unblock`),
    undefined,
    { headers: authHeader() },
  );
  return response.data;
};
