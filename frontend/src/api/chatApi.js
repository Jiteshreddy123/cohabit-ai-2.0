import apiClient from "./apiClient";

export const chatApi = {
  /** Start (or get existing) conversation with another student about a listing / gig */
  startConversation: (data) =>
    apiClient.post("/chat/start", data).then((r) => r.data),

  /** List all conversations the current student is part of */
  getConversations: () =>
    apiClient.get("/chat/conversations").then((r) => r.data),

  /** Get all messages in a specific conversation */
  getMessages: (convId) =>
    apiClient.get(`/chat/conversations/${convId}/messages`).then((r) => r.data),

  /** Send a message in a conversation */
  sendMessage: (convId, message) =>
    apiClient
      .post(`/chat/conversations/${convId}/messages`, { message })
      .then((r) => r.data),
};
