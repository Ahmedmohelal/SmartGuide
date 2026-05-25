import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Check,
  Inbox,
  Pencil,
  RefreshCw,
  Send,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  blockConversation,
  deleteMessage,
  editMessage,
  getConversation,
  getConversations,
  getMessages,
  markConversationRead,
  sendMessage,
  unblockConversation,
} from "../Services/api/chatService";
import { getGuideById } from "../Services/api/guideService";
import { getTouristById } from "../Services/api/touristService";
import { getToken, getUserIdFromToken, getUserRole } from "../Services/utils/tokenUtils";

const API_ORIGIN = "https://smartguide.runasp.net";

const pick = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.conversations)) return data.conversations;
  if (Array.isArray(data?.messages)) return data.messages;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const normalizeImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";
  const cleaned = image.replace(/\\/g, "/").trim();
  if (!cleaned) return "";
  if (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://") ||
    cleaned.startsWith("data:") ||
    cleaned.startsWith("blob:")
  ) {
    return cleaned;
  }
  return cleaned.startsWith("/") ? `${API_ORIGIN}${cleaned}` : `${API_ORIGIN}/${cleaned}`;
};

const getConversationId = (conversation) =>
  pick(conversation?.conversationId, conversation?.ConversationId, conversation?.id, conversation?.Id);

const getMessageId = (message) =>
  pick(message?.id, message?.Id, message?.messageId, message?.MessageId);

const getConversationIds = (conversation) =>
  [
    {
      id: pick(conversation?.otherPartyUserId, conversation?.OtherPartyUserId),
      role: pick(conversation?.otherPartyRole, conversation?.OtherPartyRole),
    },
    {
      id: pick(conversation?.otherUserId, conversation?.OtherUserId),
      role: pick(conversation?.otherUserRole, conversation?.OtherUserRole),
    },
    {
      id: pick(conversation?.participantUserId, conversation?.ParticipantUserId),
      role: pick(conversation?.participantRole, conversation?.ParticipantRole),
    },
    {
      id: pick(conversation?.receiverUserId, conversation?.ReceiverUserId),
      role: pick(conversation?.receiverRole, conversation?.ReceiverRole),
    },
    {
      id: pick(conversation?.tourGuideUserId, conversation?.TourGuideUserId),
      role: "TourGuide",
    },
    {
      id: pick(conversation?.guideUserId, conversation?.GuideUserId),
      role: "TourGuide",
    },
    {
      id: pick(conversation?.touristUserId, conversation?.TouristUserId),
      role: "Tourist",
    },
  ].filter((item) => item.id);

const getOtherParty = (conversation, currentUserId) => {
  const nested = pick(
    conversation?.otherParty,
    conversation?.OtherParty,
    conversation?.participant,
    conversation?.Participant,
    conversation?.receiver,
    conversation?.Receiver,
    conversation?.otherUser,
    conversation?.OtherUser,
  );

  if (nested) return nested;

  const participants = pick(
    conversation?.participants,
    conversation?.Participants,
    conversation?.users,
    conversation?.Users,
  );

  if (Array.isArray(participants)) {
    return (
      participants.find((participant) => {
        const participantId = pick(
          participant?.userId,
          participant?.UserId,
          participant?.id,
          participant?.Id,
        );
        return participantId && String(participantId) !== String(currentUserId);
      }) || participants[0]
    );
  }

  return {};
};

const getPersonName = (person) => {
  const firstName = pick(person?.firstName, person?.FirstName, person?.firstname);
  const lastName = pick(person?.lastName, person?.LastName, person?.lastname);
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  return pick(
    fullName,
    person?.fullName,
    person?.FullName,
    person?.name,
    person?.Name,
    person?.userName,
    person?.UserName,
    person?.username,
  );
};

const getOtherPartyName = (conversation, currentUserId) => {
  const otherParty = getOtherParty(conversation, currentUserId);

  return (
    pick(
      conversation?.otherPartyName,
      conversation?.OtherPartyName,
      conversation?.otherPartyUserName,
      conversation?.OtherPartyUserName,
      conversation?.otherUserName,
      conversation?.OtherUserName,
      conversation?.participantName,
      conversation?.ParticipantName,
      conversation?.receiverName,
      conversation?.ReceiverName,
      getPersonName(otherParty),
    ) || "User"
  );
};

const getOtherPartyId = (conversation, currentUserId) => {
  const otherParty = getOtherParty(conversation, currentUserId);
  const nestedId = pick(
    otherParty?.userId,
    otherParty?.UserId,
    otherParty?.id,
    otherParty?.Id,
  );
  if (nestedId && String(nestedId) !== String(currentUserId)) return nestedId;

  const directIds = getConversationIds(conversation);
  const directOther = directIds.find((item) => String(item.id) !== String(currentUserId));
  return directOther?.id || nestedId || directIds[0]?.id;
};

const getOtherPartyRole = (conversation, currentUserId) => {
  const otherParty = getOtherParty(conversation, currentUserId);
  const nestedRole = pick(
    conversation?.otherPartyRole,
    conversation?.OtherPartyRole,
    conversation?.otherUserRole,
    conversation?.OtherUserRole,
    conversation?.participantRole,
    conversation?.ParticipantRole,
    otherParty?.role,
    otherParty?.Role,
    otherParty?.userRole,
    otherParty?.UserRole,
  );
  if (nestedRole) return nestedRole;

  const otherId = getOtherPartyId(conversation, currentUserId);
  const directRole = getConversationIds(conversation).find(
    (item) => String(item.id) === String(otherId),
  )?.role;
  if (directRole) return directRole;

  const currentRole = String(getUserRole() || "").toLowerCase();
  return currentRole.includes("guide") ? "Tourist" : "TourGuide";
};

const getOtherPartyImage = (conversation, currentUserId) => {
  const otherParty = getOtherParty(conversation, currentUserId);
  return normalizeImageUrl(
    pick(
      conversation?.otherPartyImage,
      conversation?.OtherPartyImage,
      conversation?.otherPartyImageUrl,
      conversation?.OtherPartyImageUrl,
      conversation?.otherPartyProfilePicture,
      conversation?.OtherPartyProfilePicture,
      conversation?.otherPartyTouristImage,
      conversation?.OtherPartyTouristImage,
      conversation?.participantImage,
      conversation?.ParticipantImage,
      otherParty?.profilePicture,
      otherParty?.ProfilePicture,
      otherParty?.profilePictureUrl,
      otherParty?.ProfilePictureUrl,
      otherParty?.touristImage,
      otherParty?.TouristImage,
      otherParty?.touristImageUrl,
      otherParty?.TouristImageUrl,
      otherParty?.imageUrl,
      otherParty?.ImageUrl,
      otherParty?.image,
      otherParty?.Image,
    ),
  );
};

const getOtherPartyProfilePath = (conversation, currentUserId) => {
  const otherPartyId = getOtherPartyId(conversation, currentUserId);
  if (!otherPartyId) return "";

  const role = String(getOtherPartyRole(conversation, currentUserId) || "").toLowerCase();
  if (role.includes("guide")) return `/guides/${otherPartyId}`;
  if (role.includes("tourist")) return `/tourists/${otherPartyId}`;

  const currentRole = String(getUserRole() || "").toLowerCase();
  return currentRole.includes("guide")
    ? `/tourists/${otherPartyId}`
    : `/guides/${otherPartyId}`;
};

const getProfileKind = (conversation, currentUserId) => {
  const role = String(getOtherPartyRole(conversation, currentUserId) || "").toLowerCase();
  return role.includes("tourist") ? "tourist" : "guide";
};

const getProfileCacheKey = (kind, id) => (kind && id ? `${kind}:${id}` : "");

const getProfileName = (profile) => {
  const firstName = pick(profile?.firstName, profile?.FirstName, profile?.firstname);
  const lastName = pick(profile?.lastName, profile?.LastName, profile?.lastname);
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  return pick(fullName, profile?.fullName, profile?.FullName, profile?.name, profile?.Name);
};

const getProfileImage = (profile) =>
  normalizeImageUrl(
    pick(
      profile?.profilePicture,
      profile?.ProfilePicture,
      profile?.profilePictureUrl,
      profile?.ProfilePictureUrl,
      profile?.touristImage,
      profile?.TouristImage,
      profile?.touristImageUrl,
      profile?.TouristImageUrl,
      profile?.imageUrl,
      profile?.ImageUrl,
      profile?.image,
      profile?.Image,
    ),
  );

const getLastMessage = (conversation) =>
  pick(
    conversation?.lastMessage,
    conversation?.LastMessage,
    conversation?.lastMessageContent,
    conversation?.LastMessageContent,
    conversation?.latestMessage?.content,
    conversation?.LatestMessage?.Content,
    "No messages yet",
  );

const getMessageContent = (message) =>
  pick(message?.content, message?.Content, message?.text, message?.Text, "");

const getMessageSenderId = (message) =>
  pick(message?.senderUserId, message?.SenderUserId, message?.senderId, message?.SenderId, message?.userId, message?.UserId);

const getMessageDate = (message) =>
  pick(message?.sentAtUtc, message?.SentAtUtc, message?.createdAt, message?.CreatedAt, message?.sentAt, message?.SentAt);

const isMessageRead = (message) =>
  Boolean(
    pick(
      message?.isRead,
      message?.IsRead,
      message?.read,
      message?.Read,
      message?.isSeen,
      message?.IsSeen,
      message?.seen,
      message?.Seen,
      message?.readAtUtc,
      message?.ReadAtUtc,
      message?.readAt,
      message?.ReadAt,
      message?.seenAtUtc,
      message?.SeenAtUtc,
      message?.seenAt,
      message?.SeenAt,
      false,
    ),
  );

const MESSAGE_ACTION_WINDOW_MS = 15 * 60 * 1000;

const isMessageActionAllowed = (message, action) => {
  const explicit = pick(
    message?.[`can${action}`],
    message?.[`Can${action}`],
    message?.[`${action.toLowerCase()}Allowed`],
    message?.[`${action}Allowed`],
  );

  if (typeof explicit === "boolean") return explicit;

  const expiresAt = pick(
    message?.[`${action.toLowerCase()}ExpiresAtUtc`],
    message?.[`${action}ExpiresAtUtc`],
    message?.[`${action.toLowerCase()}ExpiresAt`],
    message?.[`${action}ExpiresAt`],
  );

  if (expiresAt) {
    const expiresDate = new Date(expiresAt);
    return !Number.isNaN(expiresDate.getTime()) && Date.now() <= expiresDate.getTime();
  }

  const sentDate = new Date(getMessageDate(message) || 0);
  if (Number.isNaN(sentDate.getTime())) return true;
  return Date.now() - sentDate.getTime() <= MESSAGE_ACTION_WINDOW_MS;
};

const isConversationBlocked = (conversation) =>
  Boolean(
    pick(
      conversation?.isBlocked,
      conversation?.IsBlocked,
      conversation?.blocked,
      conversation?.Blocked,
      conversation?.isBlockedByMe,
      conversation?.IsBlockedByMe,
      conversation?.isBlockedByOther,
      conversation?.IsBlockedByOther,
      conversation?.isBlockedForCurrentUser,
      conversation?.IsBlockedForCurrentUser,
      conversation?.blockedByUserId,
      conversation?.BlockedByUserId,
      conversation?.blockedBy,
      conversation?.BlockedBy,
      conversation?.blockedAtUtc,
      conversation?.BlockedAtUtc,
      conversation?.blockedAt,
      conversation?.BlockedAt,
      false,
    ),
  ) ||
  String(pick(conversation?.status, conversation?.Status, "")).toLowerCase() === "blocked";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [profileCache, setProfileCache] = useState({});
  const [lastMessageCache, setLastMessageCache] = useState({});
  const [blockStateOverrides, setBlockStateOverrides] = useState({});

  const currentUserId = useMemo(() => {
    try {
      return getUserIdFromToken();
    } catch {
      return localStorage.getItem("userId");
    }
  }, []);

  const selectedId = conversationId || getConversationId(activeConversation);
  const displayedConversation =
    activeConversation ||
    conversations.find(
      (conversation) => String(getConversationId(conversation)) === String(selectedId),
    );
  const blocked =
    selectedId && blockStateOverrides[selectedId] !== undefined
      ? blockStateOverrides[selectedId]
      : isConversationBlocked(displayedConversation);
  const displayedOtherId = getOtherPartyId(displayedConversation, currentUserId);
  const displayedKind = getProfileKind(displayedConversation, currentUserId);
  const displayedProfile =
    profileCache[getProfileCacheKey(displayedKind, displayedOtherId)];
  const displayedName =
    getProfileName(displayedProfile) ||
    getOtherPartyName(displayedConversation, currentUserId);
  const displayedImage =
    getProfileImage(displayedProfile) ||
    getOtherPartyImage(displayedConversation, currentUserId);
  const displayedProfilePath = getOtherPartyProfilePath(displayedConversation, currentUserId);
  const selectedLastMessage = messages.length ? getMessageContent(messages[messages.length - 1]) : "";
  const canManageBlock = String(getUserRole() || "").toLowerCase().includes("guide");

  const loadConversations = useCallback(async () => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    try {
      setLoadingConversations(true);
      const data = await getConversations();
      const list = asList(data);
      setConversations(list);
    } catch (err) {
      console.error("Failed to load chats:", err);
      toast.error("Couldn't load chats");
    } finally {
      setLoadingConversations(false);
    }
  }, [conversationId, navigate]);

  const loadActiveConversation = useCallback(async () => {
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      const [conversationData, messagesData] = await Promise.all([
        getConversation(conversationId),
        getMessages(conversationId),
      ]);
      const conversation = conversationData?.data || conversationData;
      setActiveConversation(conversation);
      const sortedMessages = asList(messagesData).sort((a, b) => {
          const first = new Date(getMessageDate(a) || 0).getTime();
          const second = new Date(getMessageDate(b) || 0).getTime();
          return first - second;
        });
      setMessages(sortedMessages);
      const lastMessage = sortedMessages.length
        ? getMessageContent(sortedMessages[sortedMessages.length - 1])
        : "";
      if (lastMessage) {
        setLastMessageCache((prev) => ({ ...prev, [conversationId]: lastMessage }));
      }
      await markConversationRead(conversationId);
    } catch (err) {
      console.error("Failed to load chat:", err);
      toast.error("Couldn't load this chat");
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadActiveConversation();
  }, [loadActiveConversation]);

  useEffect(() => {
    if (blocked) setContent("");
  }, [blocked]);

  useEffect(() => {
    const missing = conversations
      .map((conversation) => ({
        id: getConversationId(conversation),
        apiPreview: getLastMessage(conversation),
      }))
      .filter(
        ({ id, apiPreview }) =>
          id &&
          !lastMessageCache[id] &&
          (!apiPreview || apiPreview === "No messages yet"),
      );

    if (missing.length === 0) return;

    let cancelled = false;

    const loadLastMessages = async () => {
      const entries = await Promise.all(
        missing.map(async ({ id }) => {
          try {
            const data = await getMessages(id);
            const sorted = asList(data).sort((a, b) => {
              const first = new Date(getMessageDate(a) || 0).getTime();
              const second = new Date(getMessageDate(b) || 0).getTime();
              return first - second;
            });
            const last = sorted.length ? getMessageContent(sorted[sorted.length - 1]) : "";
            return last ? [id, last] : null;
          } catch (err) {
            console.error("Failed to load chat preview:", err);
            return null;
          }
        }),
      );

      if (cancelled) return;

      setLastMessageCache((prev) => {
        const next = { ...prev };
        entries.filter(Boolean).forEach(([id, last]) => {
          next[id] = last;
        });
        return next;
      });
    };

    loadLastMessages();

    return () => {
      cancelled = true;
    };
  }, [conversations, lastMessageCache]);

  useEffect(() => {
    const source = [activeConversation, ...conversations].filter(Boolean);
    const targets = source
      .map((conversation) => {
        const id = getOtherPartyId(conversation, currentUserId);
        const kind = getProfileKind(conversation, currentUserId);
        const key = getProfileCacheKey(kind, id);
        return { id, kind, key };
      })
      .filter((target) => target.id && target.kind && target.key && !profileCache[target.key]);

    const uniqueTargets = Array.from(
      new Map(targets.map((target) => [target.key, target])).values(),
    );

    if (uniqueTargets.length === 0) return;

    let cancelled = false;

    const loadProfiles = async () => {
      const entries = await Promise.all(
        uniqueTargets.map(async ({ id, kind, key }) => {
          try {
            const profile = kind === "tourist" ? await getTouristById(id) : await getGuideById(id);
            return [key, profile];
          } catch (err) {
            console.error("Failed to load chat profile:", err);
            return null;
          }
        }),
      );

      if (cancelled) return;

      setProfileCache((prev) => {
        const next = { ...prev };
        entries.filter(Boolean).forEach(([key, profile]) => {
          next[key] = profile;
        });
        return next;
      });
    };

    loadProfiles();

    return () => {
      cancelled = true;
    };
  }, [activeConversation, conversations, currentUserId, profileCache]);

  const refreshChat = async () => {
    await Promise.all([loadConversations(), loadActiveConversation()]);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!selectedId || !trimmed || blocked) return;

    try {
      setSending(true);
      const newMessage = await sendMessage(selectedId, trimmed);
      const message = newMessage?.data || newMessage;
      setMessages((prev) => [...prev, message]);
      setLastMessageCache((prev) => ({ ...prev, [selectedId]: trimmed }));
      setContent("");
      loadConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
      if (err.response?.status === 403 && selectedId) {
        setBlockStateOverrides((prev) => ({ ...prev, [selectedId]: true }));
        setActiveConversation((prev) =>
          prev ? { ...prev, isBlocked: true, IsBlocked: true } : prev,
        );
        toast.error("can't send or recieve message");
      } else {
        toast.error("Message couldn't be sent");
      }
    } finally {
      setSending(false);
    }
  };

  const startEditing = (message) => {
    setEditingId(getMessageId(message));
    setEditingContent(getMessageContent(message));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const handleEdit = async (messageId) => {
    const trimmed = editingContent.trim();
    if (!trimmed) return;

    try {
      setActionLoading(true);
      const updated = await editMessage(messageId, trimmed);
      const updatedMessage = updated?.data || updated;
      setMessages((prev) =>
        prev.map((message) =>
          String(getMessageId(message)) === String(messageId)
            ? { ...message, ...updatedMessage, content: trimmed, Content: trimmed }
            : message,
        ),
      );
      setLastMessageCache((prev) => ({ ...prev, [selectedId]: trimmed }));
      cancelEditing();
      loadConversations();
    } catch (err) {
      console.error("Failed to edit message:", err);
      toast.error("Message couldn't be edited");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      setActionLoading(true);
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev.filter((message) => String(getMessageId(message)) !== String(messageId)),
      );
      loadConversations();
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Message couldn't be deleted");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedId) return;

    try {
      setActionLoading(true);
      if (blocked) {
        await unblockConversation(selectedId);
        setBlockStateOverrides((prev) => ({ ...prev, [selectedId]: false }));
        setActiveConversation((prev) =>
          prev ? { ...prev, isBlocked: false, IsBlocked: false } : prev,
        );
        setConversations((prev) =>
          prev.map((conversation) =>
            String(getConversationId(conversation)) === String(selectedId)
              ? { ...conversation, isBlocked: false, IsBlocked: false }
              : conversation,
          ),
        );
        toast.success("Chat unblocked");
      } else {
        await blockConversation(selectedId);
        setBlockStateOverrides((prev) => ({ ...prev, [selectedId]: true }));
        setContent("");
        setActiveConversation((prev) =>
          prev ? { ...prev, isBlocked: true, IsBlocked: true } : prev,
        );
        setConversations((prev) =>
          prev.map((conversation) =>
            String(getConversationId(conversation)) === String(selectedId)
              ? { ...conversation, isBlocked: true, IsBlocked: true }
              : conversation,
          ),
        );
        toast.success("Chat blocked");
      }
      loadActiveConversation();
    } catch (err) {
      console.error("Failed to update block state:", err);
      const status = err.response?.status;
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        err.response?.data?.title ||
        err.response?.data;

      toast.error(
        status === 403
          ? "You are not allowed to block this chat."
          : apiMessage || "Couldn't update chat",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 px-4 pb-6 pt-28 lg:px-8" dir="ltr">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
           
          </div>
          <button
            type="button"
            onClick={refreshChat}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-egypt-teal hover:text-egypt-teal"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_1fr]">
          <aside className="min-h-0 border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 border-b border-slate-100 p-5">
              <Inbox size={20} className="text-egypt-teal" />
              <h2 className="truncate font-bold text-slate-900">
                Your Chats
              </h2>
            </div>

            <div className="h-full overflow-y-auto">
              {loadingConversations ? (
                <p className="p-5 text-sm text-slate-500">Loading chats...</p>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-egypt-teal">
                    <Inbox size={22} />
                  </div>
                  <p className="font-semibold text-slate-800">No chats yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Start one from a guide or tourist profile.
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const id = getConversationId(conversation);
                  const isActive = String(id) === String(selectedId);
                  const otherId = getOtherPartyId(conversation, currentUserId);
                  const kind = getProfileKind(conversation, currentUserId);
                  const profile = profileCache[getProfileCacheKey(kind, otherId)];
                  const name =
                    getProfileName(profile) ||
                    getOtherPartyName(conversation, currentUserId);
                  const image =
                    getProfileImage(profile) ||
                    getOtherPartyImage(conversation, currentUserId);
                  const lastMessage = isActive
                    ? selectedLastMessage || lastMessageCache[id] || getLastMessage(conversation)
                    : lastMessageCache[id] || getLastMessage(conversation);

                  return (
                    <button
                      type="button"
                      key={id || name}
                      onClick={() => id && navigate(`/chat/${id}`)}
                      className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition ${
                        isActive ? "bg-teal-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-500">
                        {image ? (
                          <img src={image} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          <UserRound size={22} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-semibold text-slate-900">{name}</p>
                          {isConversationBlocked(conversation) && (
                            <ShieldOff size={15} className="text-red-500" />
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            {!selectedId ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-egypt-teal">
                    <Inbox size={26} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Start chatting</h2>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
                  <button
                    type="button"
                    onClick={() => navigate("/chat")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-egypt-teal hover:text-egypt-teal lg:hidden"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>

                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => displayedProfilePath && navigate(displayedProfilePath)}
                      disabled={!displayedProfilePath}
                      title={displayedProfilePath ? "Open profile" : "Profile unavailable"}
                      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-500 transition hover:ring-2 hover:ring-egypt-teal disabled:cursor-default disabled:hover:ring-0"
                    >
                      {displayedImage ? (
                        <img
                          src={displayedImage}
                          alt={displayedName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={21} />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-slate-900">
                        {displayedName}
                      </h2>
                    </div>
                  </div>

                  {canManageBlock && (
                    <button
                      type="button"
                      onClick={handleToggleBlock}
                      disabled={actionLoading}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        blocked
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {blocked ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                      {blocked ? "Unblock" : "Block"}
                    </button>
                  )}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
                  {loadingMessages ? (
                    <p className="text-center text-sm text-slate-500">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        <p className="font-semibold text-slate-800">No messages yet</p>
                        <p className="mt-1 text-sm text-slate-500">Send the first message.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const messageId = getMessageId(message);
                        const senderId = getMessageSenderId(message);
                        const mine =
                          message?.isMine ||
                          message?.IsMine ||
                          (senderId && currentUserId && String(senderId) === String(currentUserId));
                        const isEditing = String(editingId) === String(messageId);
                        const canEdit = mine && isMessageActionAllowed(message, "Edit");
                        const canDelete = mine && isMessageActionAllowed(message, "Delete");

                        return (
                          <div
                            key={messageId || `${senderId}-${getMessageDate(message)}`}
                            className={`flex ${mine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                                mine
                                  ? "rounded-br-md bg-egypt-teal text-white"
                                  : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editingContent}
                                    onChange={(event) => setEditingContent(event.target.value)}
                                    className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 outline-none focus:border-egypt-teal"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={cancelEditing}
                                      className="rounded-lg bg-slate-100 p-2 text-slate-700"
                                    >
                                      <X size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(messageId)}
                                      disabled={actionLoading}
                                      className="rounded-lg bg-egypt-teal p-2 text-white"
                                    >
                                      <Check size={15} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="whitespace-pre-wrap text-sm leading-6">
                                    {getMessageContent(message)}
                                  </p>
                                  <div
                                    className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${
                                      mine ? "text-white/75" : "text-slate-400"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span>{formatTime(getMessageDate(message))}</span>
                                      {mine && (
                                        <span>{isMessageRead(message) ? "Read" : "Sent"}</span>
                                      )}
                                    </span>
                                    {(canEdit || canDelete) && (
                                      <span className="flex items-center gap-1">
                                        {canEdit && (
                                          <button
                                            type="button"
                                            onClick={() => startEditing(message)}
                                            className="rounded-md p-1 transition hover:bg-white/15"
                                          >
                                            <Pencil size={13} />
                                          </button>
                                        )}
                                        {canDelete && (
                                          <button
                                            type="button"
                                            onClick={() => handleDelete(messageId)}
                                            disabled={actionLoading}
                                            className="rounded-md p-1 transition hover:bg-white/15"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-4">
                  <div className="flex gap-3">
                    <input
                      value={blocked ? "can't send or recieve message" : content}
                      onChange={(event) => setContent(event.target.value)}
                      disabled={blocked}
                      placeholder="Type a message..."
                      className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-egypt-teal disabled:bg-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={sending || blocked || !content.trim()}
                      className="inline-flex items-center justify-center rounded-2xl bg-egypt-teal px-5 py-3 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
