import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import CircleIcon from "@mui/icons-material/Circle";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SouthWestRoundedIcon from "@mui/icons-material/SouthWestRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import service from "../../appwrite/config";
import docService from "../../appwrite/authDoc";
import api from "../../conf/api";
import { toast } from "react-toastify";
import { ringCall } from "../../services/calls";

const Room = () => {
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [threadQuery, setThreadQuery] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [patientChatAccess, setPatientChatAccess] = useState("unknown");
  const [patientDoctors, setPatientDoctors] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const doctorIdFromUrl = searchParams.get("doctor_id");
  const threadFromUrl = searchParams.get("thread");
  const startMode = searchParams.get("start");
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorIdFromUrl || null);
  const chatAreaRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const autoStartedVideoRef = useRef("");
  const user = useSelector((state) => state.auth.userData);
  const currentRole = useSelector((state) => state.auth.currentRole);
  const viewerId = user?.$id || user?.id || user?.email || "guest";
  const isDoctor = currentRole === "doctor";
  const activeDoctorId = doctorIdFromUrl || selectedDoctorId;
  const patientIdentity = user?.$id || user?.id || user?.email || null;
  const patientEmail = user?.email || null;
  const selectedDoctor = useMemo(
    () => patientDoctors.find((doctor) => (doctor._id || doctor.id) === activeDoctorId) || null,
    [patientDoctors, activeDoctorId],
  );
  const patientConversationKey = useMemo(
    () =>
      selectedDoctor?.approvedChatRequest?.userid ||
      selectedDoctor?.approvedChatRequest?.userEmail ||
      selectedDoctor?.approvedChatRequest?.email ||
      patientEmail ||
      patientIdentity,
    [
      selectedDoctor?.approvedChatRequest?.userid,
      selectedDoctor?.approvedChatRequest?.userEmail,
      selectedDoctor?.approvedChatRequest?.email,
      patientEmail,
      patientIdentity,
    ],
  );

  useEffect(() => {
    if (!isDoctor) return;
    const currentDoctorId = doctorIdFromUrl || user?.id || user?._id;
    if (!currentDoctorId) return;

    try {
      localStorage.setItem(`doctor-chat-last-seen:${currentDoctorId}`, new Date().toISOString());
      window.dispatchEvent(new Event("doctor-chat-updated"));
    } catch (error) {
      console.error("Unable to store chat seen timestamp", error);
    }
  }, [isDoctor, doctorIdFromUrl, user?.id, user?._id, messages.length, selectedThread]);

  useEffect(() => {
    if (isDoctor) return;
    try {
      localStorage.setItem(`patient-chat-last-seen:${user?.$id || user?.id || user?.email || "guest"}`, new Date().toISOString());
      window.dispatchEvent(new Event("patient-chat-updated"));
    } catch (error) {
      console.error("Unable to store patient chat seen timestamp", error);
    }
  }, [isDoctor, user?.$id, user?.id, user?.email, activeDoctorId]);

  const getConversationStorageKey = (threadUserId) => {
    const doctorId = activeDoctorId || (currentRole === "doctor" ? user?.id : null);
    const userId = threadUserId || patientEmail || patientIdentity;
    return `chat-cleared:${currentRole || "user"}:${viewerId}:${doctorId || "unknown"}:${userId || "unknown"}`;
  };

  useEffect(() => {
    getMessages();
    scrollToBottom();

    pollingIntervalRef.current = setInterval(() => {
      getMessages();
    }, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [doctorIdFromUrl, selectedDoctorId, user?.role, user?.id, patientIdentity, patientEmail]);

  useEffect(() => {
    if (!isDoctor || !threadFromUrl) return;
    setSelectedThread(threadFromUrl);
  }, [isDoctor, threadFromUrl]);

  useEffect(() => {
    if (doctorIdFromUrl) {
      setSelectedDoctorId(doctorIdFromUrl);
    }
  }, [doctorIdFromUrl]);

  useEffect(() => {
    if (isDoctor) return;
    let active = true;
    const viewerIdentity = String(user?.$id || user?.id || user?.email || "").toLowerCase();
    const viewerEmail = String(user?.email || "").toLowerCase();

    const loadPatientDoctors = async () => {
      try {
        const res = await docService.getPosts();
        const docs = Array.isArray(res?.documents) ? res.documents : [];
        const approved = docs
          .map((doctor) => {
            const requests = Array.isArray(doctor?.requests) ? doctor.requests : [];
            const request = requests.find((req) => {
              const identity = String(req?.userid || req?.userEmail || req?.email || "").toLowerCase();
              const type = String(req?.type || req?.requestType || "").toLowerCase();
              const isAllowedType = !type || type === "chat" || type === "appointment";
              return (
                identity &&
                (identity === viewerIdentity || identity === viewerEmail) &&
                isAllowedType &&
                String(req?.status || "").toLowerCase() === "accepted"
              );
            });
            return request ? { ...doctor, approvedChatRequest: request } : null;
          })
          .filter(Boolean);

        if (!active) return;
        setPatientDoctors(approved);
        if (!doctorIdFromUrl && approved.length && !selectedDoctorId) {
          setSelectedDoctorId(approved[0]._id || approved[0].id);
        }
      } catch (error) {
        if (!active) return;
        setPatientDoctors([]);
      }
    };

    loadPatientDoctors();
    return () => {
      active = false;
    };
  }, [isDoctor, user?.$id, user?.id, user?.email, doctorIdFromUrl, selectedDoctorId]);

  useEffect(() => {
    if (isDoctor || !activeDoctorId) {
      setPatientChatAccess("granted");
      return;
    }

    const approvedDoctor = patientDoctors.find((doctor) => (doctor._id || doctor.id) === activeDoctorId);
    setPatientChatAccess(approvedDoctor ? "granted" : "blocked");
  }, [isDoctor, activeDoctorId, patientDoctors]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedThread]);

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  const formatName = (name) => {
    if (!name) return isDoctor ? "Patient" : "Doctor";
    return name.includes("@") ? "Patient" : name;
  };

  const getInitials = (name) => {
    const safeName = formatName(name);
    return (
      safeName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "PT"
    );
  };

  const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatThreadTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  const buildInternalVideoLink = (roomId) => {
    if (!roomId) return "";
    const base = window.location.origin.replace(/\/$/, "");
    return `${base}/video/${encodeURIComponent(roomId)}`;
  };

  const extractMeetingLink = (body) => {
    if (typeof body !== "string" || !body) return null;
    const appLinkMatch = body.match(/https?:\/\/[^\s]+\/video\/[^\s)]+/i);
    if (appLinkMatch) return appLinkMatch[0];
    const jitsiMatch = body.match(/https:\/\/meet\.jit\.si\/[A-Za-z0-9\-_%]+/);
    return jitsiMatch ? jitsiMatch[0] : null;
  };

  const getPreviewText = (body) => {
    if (!body) return "No messages yet";
    if (extractMeetingLink(body)) {
      return "Video call link shared";
    }
    return body;
  };
  const getMessageThreadKey = (message) =>
    String(message?.userEmail || message?.email || message?.user_id || "").trim();

  const getMessages = async () => {
    try {
      let url = `${api.apiBaseUrl}/messages`;
      if (currentRole === "doctor" && user?.id) {
        url += `?doctor_id=${user.id}`;
      } else if (activeDoctorId && patientConversationKey) {
        url += `?doctor_id=${activeDoctorId}&user_id=${encodeURIComponent(patientConversationKey)}`;
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data.documents || []);
    } catch (error) {
      console.log("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const startVideoCall = async () => {
    const resolvedDoctorId = activeDoctorId || (isDoctor ? user?.id || user?._id : null);
    const targetUserId = isDoctor ? selectedThread : patientConversationKey;

    if (!resolvedDoctorId || !targetUserId) {
      toast.error(isDoctor ? "Select a patient conversation first" : "Doctor chat is not available");
      return;
    }

    const safeDoc = String(resolvedDoctorId || "doc").replace(/[^a-zA-Z0-9]/g, "");
    const safePat = String(targetUserId || "patient").replace(/[^a-zA-Z0-9]/g, "").slice(0, 48);
    const room = `HealthHub-${safeDoc}-pat-${safePat}`;
    const meetingLink = buildInternalVideoLink(room);

    try {
      if (isDoctor) {
        const patientEmail =
          activeThread?.userEmail ||
          activeThread?.email ||
          (typeof selectedThread === "string" && selectedThread.includes("@") ? selectedThread : null);
        if (!patientEmail) {
          toast.error("Patient email not found for video call");
          return;
        }

        await service.createMessage({
          doctor_id: resolvedDoctorId,
          user_id: targetUserId,
          userEmail: patientEmail,
          sender_id: viewerId,
          sender_role: "doctor",
          sender_name: user?.name || "Doctor",
          username: user?.name || "Doctor",
          body: `Doctor started a video consultation. Join here: ${meetingLink}`,
        });

        await ringCall({
          roomId: room,
          targetUserEmail: patientEmail,
          fromName: user?.name || "Doctor",
          fromRole: "doctor",
        });
        await getMessages();
      } else {
        await ringCall({
          roomId: room,
          targetDoctorId: resolvedDoctorId,
          fromName: user?.name || user?.email || "Patient",
          fromRole: "patient",
        });
      }
    } catch (error) {
      console.warn("Ring notify failed:", error);
    }

    window.dispatchEvent(new Event("doctor-chat-updated"));
    navigate(`/video/${encodeURIComponent(room)}`);
  };

  useEffect(() => {
    if (isDoctor || startMode !== "video" || patientChatAccess !== "granted" || !activeDoctorId) return;

    const autoStartKey = `${activeDoctorId}:${startMode}`;
    if (autoStartedVideoRef.current === autoStartKey) return;
    autoStartedVideoRef.current = autoStartKey;
    startVideoCall();
  }, [isDoctor, startMode, patientChatAccess, activeDoctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageBody.trim()) return;

    const resolvedDoctorId = activeDoctorId || (currentRole === "doctor" ? user?.id : null);
    const targetUserId = currentRole === "doctor" ? selectedThread : patientConversationKey;

    if (!resolvedDoctorId || !targetUserId) {
      toast.error(currentRole === "doctor" ? "Select a patient conversation first" : "Doctor chat is not available");
      return;
    }

    const payload = {
      doctor_id: resolvedDoctorId,
      user_id: targetUserId,
      userEmail:
        currentRole === "doctor"
          ? activeThread?.userEmail || (typeof selectedThread === "string" && selectedThread.includes("@") ? selectedThread : null)
          : patientEmail || patientConversationKey || null,
      sender_id: viewerId,
      sender_role: currentRole === "doctor" ? "doctor" : "patient",
      sender_name: user?.name || user?.email || "User",
      username: user?.name,
      body: messageBody,
    };

    const response = await service.createMessage(payload);
    if (response) {
      setMessages((prevState) => [response, ...prevState]);
      window.dispatchEvent(new Event("doctor-chat-updated"));
    }
    setMessageBody("");
  };

  const deleteMessage = async (id) => {
    if (!id) return;
    setDeletingMessageId(id);
    const ok = await service.deleteMessage(id);
    if (ok) {
      setMessages((prevState) => prevState.filter((message) => (message._id || message.id) !== id));
      if (editingMessage === id) {
        setEditingMessage(null);
        setEditText("");
      }
      toast.success("Message deleted");
    } else {
      toast.error("Unable to delete message");
    }
    setDeletingMessageId(null);
  };

  const startEditMessage = (message) => {
    setEditingMessage(message._id || message.id);
    setEditText(message.body);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const saveEditMessage = async () => {
    if (!editText.trim() || !editingMessage) return;

    const updatedMessage = await service.updateMessage(editingMessage, editText);
    if (updatedMessage) {
      setMessages((prevState) =>
        prevState.map((msg) =>
          msg._id === editingMessage || msg.id === editingMessage
            ? { ...msg, body: editText, edited: true, editedAt: new Date() }
            : msg,
        ),
      );
    }
    setEditingMessage(null);
    setEditText("");
  };

  const clearChat = async () => {
    if (!window.confirm("Are you sure you want to clear all messages in this chat? This action cannot be undone.")) {
      return;
    }

    const userId = selectedThread || patientConversationKey || patientIdentity;
    const storageKey = getConversationStorageKey(userId);

    try {
      localStorage.setItem(storageKey, new Date().toISOString());
      toast.success("Chat cleared only for your side");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Error clearing chat. Please try again.");
    }
  };

  const threads = useMemo(() => {
    const threadMap = new Map();
    (messages || []).forEach((message) => {
      const threadKey = getMessageThreadKey(message);
      if (!threadKey) return;
      const existing = threadMap.get(threadKey);
      const messageTime = new Date(message.createdAt || 0).getTime();

      if (!existing || messageTime > existing.lastMessageTime) {
        threadMap.set(threadKey, {
          user_id: threadKey,
          username: message.username || "Patient",
          userEmail: message.userEmail || message.email || null,
          preview: getPreviewText(message.body),
          createdAt: message.createdAt,
          lastMessageTime: messageTime,
        });
      }
    });

    return Array.from(threadMap.values()).sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  }, [messages]);

  const filteredThreads = useMemo(() => {
    const query = threadQuery.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter((thread) => {
      const name = formatName(thread.username).toLowerCase();
      const preview = (thread.preview || "").toLowerCase();
      return name.includes(query) || preview.includes(query);
    });
  }, [threadQuery, threads]);

  const messagesToShow = useMemo(() => {
    const filterByClearTime = (list, threadUserId) => {
      const clearedAt = localStorage.getItem(getConversationStorageKey(threadUserId));
      if (!clearedAt) return list;
      const clearedAtMs = new Date(clearedAt).getTime();
      if (Number.isNaN(clearedAtMs)) return list;
      return list.filter((m) => {
        const createdAtMs = new Date(m.createdAt || 0).getTime();
        return Number.isNaN(createdAtMs) || createdAtMs > clearedAtMs;
      });
    };

    if (isDoctor) {
      if (!selectedThread) return [];
      return filterByClearTime(
        messages.filter((m) => getMessageThreadKey(m) === selectedThread).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
        selectedThread,
      );
    }

    return filterByClearTime(
      [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      patientConversationKey || patientIdentity,
    );
  }, [messages, isDoctor, selectedThread, patientConversationKey, patientIdentity]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.user_id === selectedThread) || null,
    [threads, selectedThread],
  );
  const doctorIdentityValues = useMemo(
    () =>
      [
        user?.id,
        user?._id,
        user?.email,
        user?.doctorData?._id,
        user?.doctorData?.id,
        user?.doctorData?.email,
        activeDoctorId,
        selectedDoctor?.email,
        selectedDoctor?._id,
        selectedDoctor?.id,
      ]
        .map((value) => String(value || "").trim().toLowerCase())
        .filter(Boolean),
    [user?.id, user?._id, user?.email, user?.doctorData?._id, user?.doctorData?.id, user?.doctorData?.email, activeDoctorId, selectedDoctor?.email, selectedDoctor?._id, selectedDoctor?.id],
  );
  const patientIdentityValues = useMemo(
    () =>
      [
        patientIdentity,
        user?.$id,
        user?.id,
        user?._id,
        user?.email,
        viewerId,
      ]
        .map((value) => String(value || "").trim().toLowerCase())
        .filter(Boolean),
    [patientIdentity, user?.$id, user?.id, user?._id, user?.email, viewerId],
  );
  const isMessageMine = (message) => {
    const senderRole = String(message?.sender_role || "").trim().toLowerCase();
    if (senderRole) {
      return isDoctor ? senderRole === "doctor" : senderRole === "patient";
    }

    const senderId = String(message?.sender_id || "").trim().toLowerCase();
    const senderName = String(message?.sender_name || message?.username || "").trim().toLowerCase();
    const senderEmail = String(message?.userEmail || message?.email || "").trim().toLowerCase();

    if (isDoctor) {
      return (
        (senderId && doctorIdentityValues.includes(senderId)) ||
        (senderEmail && doctorIdentityValues.includes(senderEmail)) ||
        (!!senderName && senderName === String(user?.name || "").trim().toLowerCase())
      );
    }

    return (
      (senderId && patientIdentityValues.includes(senderId)) ||
      (!!senderName && senderName === String(user?.name || "").trim().toLowerCase()) ||
      (!!senderEmail && patientIdentityValues.includes(senderEmail))
    );
  };
  const currentParticipantName = isDoctor
    ? formatName(activeThread?.username) || "Patient"
    : `Dr. ${selectedDoctor?.name || "Doctor"}`;
  const heroSurfaceClass = isDoctor
    ? "border-indigo-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8f7ff_38%,#eef4ff_100%)]"
    : "border-cyan-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#f4fcfd_38%,#edf7fb_100%)]";
  const accentChipClass = isDoctor
    ? "border-indigo-100 bg-indigo-50 text-indigo-700"
    : "border-cyan-100 bg-cyan-50 text-cyan-700";
  const conversationCount = isDoctor ? filteredThreads.length : patientDoctors.length;
  const headerSubtitle = isDoctor
    ? activeThread
      ? "Real-time consultation stream with your current patient."
      : "Choose a patient thread to begin reviewing updates and messages."
    : selectedDoctor
      ? `${selectedDoctor.title || "Consultation ready"}`
      : "Your approved doctor chats will appear here.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.14),_transparent_22%),linear-gradient(180deg,#eef7fb_0%,#f7fbff_34%,#edf3f9_100%)] px-2 py-4 sm:px-4 lg:px-5">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1520px] overflow-hidden rounded-[40px] border border-white/90 bg-white/90 shadow-[0_34px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <aside className="hidden w-[360px] border-r border-slate-200/70 bg-[linear-gradient(180deg,#eef9fd_0%,#f6fbff_34%,#f8fbfd_100%)] md:flex md:flex-col">
          <div className="relative border-b border-slate-200/80 px-6 py-6 text-slate-900">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-cyan-100/50 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-[0_12px_30px_rgba(14,116,144,0.22)]">
                <ForumOutlinedIcon sx={{ fontSize: 24, color: "#ffffff" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">Consultation Chat</p>
                <h2 className="mt-1 text-[28px] font-semibold tracking-tight text-slate-900">
                  {isDoctor ? "Patient Messages" : "Messages"}
                </h2>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              {isDoctor ? "Manage patient conversations in a polished clinical workspace." : "Stay in touch with your doctor through a secure channel."}
            </p>
            <div className="mt-5 rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(8,145,178,0.08),rgba(255,255,255,0.92),rgba(59,130,246,0.06))] px-4 py-4 shadow-[0_18px_40px_rgba(14,116,144,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Workspace</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">Clinical communication desk</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Active
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/90 bg-white/80 px-3 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Threads</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{isDoctor ? filteredThreads.length : patientDoctors.length}</p>
                </div>
                <div className="rounded-2xl border border-white/90 bg-white/80 px-3 py-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Messages</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{messagesToShow.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200/80 bg-white/70 px-4 py-4 backdrop-blur">
            <div className="flex items-center gap-3 rounded-[22px] border border-white bg-white/90 px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.07)]">
              <SearchOutlinedIcon sx={{ fontSize: 18, color: "#0f766e" }} />
              <input
                type="text"
                value={threadQuery}
                onChange={(e) => setThreadQuery(e.target.value)}
                placeholder="Search conversation"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f7fbfe_0%,#f9fbfd_100%)] p-3">
            {isDoctor ? (
              filteredThreads.length ? (
                <div className="space-y-3">
                  {filteredThreads.map((thread) => {
                    const isActive = selectedThread === thread.user_id;
                    return (
                      <button
                        key={thread.user_id}
                        onClick={() => setSelectedThread(thread.user_id)}
                        className={`group w-full rounded-[28px] border px-4 py-4 text-left transition-all duration-200 ${
                          isActive
                            ? "border-cyan-200 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_54%,#eef8ff_100%)] shadow-[0_20px_36px_rgba(8,145,178,0.12)]"
                            : "border-white bg-white/95 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:border-cyan-100 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold shadow-sm ${
                            isActive
                              ? "bg-gradient-to-br from-cyan-500 to-sky-600 text-white"
                              : "bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100 text-cyan-800"
                          }`}>
                            {getInitials(thread.username)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">{formatName(thread.username)}</p>
                              <span className="text-xs text-slate-400">{formatThreadTime(thread.createdAt)}</span>
                            </div>
                            <p className="mt-1 truncate text-xs leading-5 text-slate-500">{thread.preview}</p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                <CircleIcon sx={{ fontSize: 8, color: isActive ? "#0891b2" : "#cbd5e1" }} />
                                Consultation thread
                              </div>
                              {isActive && (
                                <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                                  Open
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                  <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                      <PersonOutlineOutlinedIcon sx={{ fontSize: 28, color: "#64748b" }} />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-700">No conversations yet</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">Patient chats will appear here once they send a message.</p>
                  </div>
              )
            ) : (
              patientDoctors.length ? (
                <div className="space-y-3">
                  {patientDoctors.map((doctor) => {
                    const doctorKey = doctor._id || doctor.id;
                    const isActive = activeDoctorId === doctorKey;
                    return (
                      <button
                        key={doctorKey}
                        onClick={() => setSelectedDoctorId(doctorKey)}
                        className={`group w-full rounded-[28px] border px-4 py-4 text-left transition-all duration-200 ${
                          isActive
                            ? "border-cyan-200 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_54%,#eef8ff_100%)] shadow-[0_20px_36px_rgba(8,145,178,0.12)]"
                            : "border-white bg-white/95 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:border-cyan-100 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold shadow-sm ${
                            isActive
                              ? "bg-gradient-to-br from-cyan-500 to-sky-600 text-white"
                              : "bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100 text-cyan-800"
                          }`}>
                            {getInitials(doctor.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">{`Dr. ${doctor.name || "Doctor"}`}</p>
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-700">
                                Approved
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs leading-5 text-slate-500">
                              {doctor.title || "Secure doctor chat available"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[28px] border border-white bg-white p-5 text-sm text-slate-500 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                  No approved chat requests yet. Once a doctor accepts your chat request, it will appear here.
                </div>
              )
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,#fcfeff_0%,#f8fcfd_52%,#f6fafc_100%)]">
          <div className="border-b border-slate-200/90 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
            <div className={`relative overflow-hidden rounded-[34px] border p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)] sm:p-6 ${heroSurfaceClass}`}>
              <div className="pointer-events-none absolute -left-16 -top-20 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-100/40 blur-2xl" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/45 to-transparent" />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`relative flex h-[74px] w-[74px] items-center justify-center rounded-[26px] text-lg font-semibold shadow-[0_16px_34px_rgba(8,145,178,0.16)] ${
                    isDoctor
                      ? "bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 text-white"
                      : "bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-500 text-white"
                  }`}>
                    <div className="absolute inset-0 rounded-[24px] border border-white/70" />
                    {getInitials(activeThread?.username || (isDoctor ? "Patient" : "Doctor"))}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">Profile Section</p>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
                        <VerifiedOutlinedIcon sx={{ fontSize: 12 }} />
                        Verified
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-100 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-500 shadow-sm">
                        <CircleIcon sx={{ fontSize: 9, color: "#22c55e" }} />
                        Active
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-sm ${accentChipClass}`}>
                        {isDoctor ? "Doctor Workspace" : "Patient Workspace"}
                      </span>
                    </div>
                    <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-900">
                      {isDoctor ? currentParticipantName || "Select a patient to open chat" : currentParticipantName}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      {headerSubtitle}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                        <AutoAwesomeOutlinedIcon sx={{ fontSize: 15 }} />
                        Premium consultation flow
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                        <CircleIcon sx={{ fontSize: 10, color: "#22c55e" }} />
                        {conversationCount} active {conversationCount === 1 ? "thread" : "threads"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-[22px] border border-white/90 bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Thread Type</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">Clinical Chat</p>
                    <p className="mt-1 text-[11px] text-slate-500">Protected channel</p>
                  </div>
                  <div className="rounded-[22px] border border-white/90 bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Messages</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{messagesToShow.length}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Visible in thread</p>
                  </div>
                  {(!isDoctor || selectedThread) && (
                    <button
                      type="button"
                      onClick={startVideoCall}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:from-cyan-100 hover:to-sky-100"
                    >
                      <VideocamOutlinedIcon sx={{ fontSize: 18 }} />
                      Video Call
                    </button>
                  )}
                  <div className="hidden items-center gap-1 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs text-cyan-700 sm:flex">
                    <LockOutlinedIcon sx={{ fontSize: 14 }} />
                    Secure chat
                  </div>
                  {messagesToShow.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50"
                    >
                      <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                      Clear Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200/80 bg-[linear-gradient(90deg,#ffffff_0%,#fbfdff_50%,#ffffff_100%)] px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                {messagesToShow.length} {messagesToShow.length === 1 ? "message" : "messages"}
              </div>
              <div className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700">
                Consultation ready
              </div>
              <div className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                Live updates
              </div>
              <div className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:block">
                Encrypted delivery
              </div>
            </div>
          </div>

          <div ref={chatAreaRef} className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(186,230,253,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(165,180,252,0.12),_transparent_25%),linear-gradient(180deg,#fbfdff_0%,#f4f8fb_100%)] px-4 py-6 sm:px-6">
            {messagesToShow.length === 0 ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[30px] border border-dashed border-slate-300 bg-white/90 text-center shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-100 to-sky-100 text-cyan-700">
                  <ForumOutlinedIcon sx={{ fontSize: 32 }} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-800">
                  {isDoctor && !selectedThread ? "Select a conversation" : "No messages yet"}
                </h3>
                <p className="mt-2 max-w-md px-6 text-sm text-slate-500">
                  {isDoctor && !selectedThread
                    ? "Choose a patient from the left panel to open that conversation."
                    : "Start with a clear and friendly message."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messagesToShow.map((message, index) => {
                  const isMine = isMessageMine(message);
                  const safeName = formatName(message.username || message.sender_name || "User");
                  const messageKey = message._id || message.id || index;
                  const meetingLink = extractMeetingLink(message.body);
                  const containsMeetingLink = !!meetingLink;

                  const showDateBadge =
                    index === 0 ||
                    new Date(messagesToShow[index - 1]?.createdAt || 0).toDateString() !== new Date(message.createdAt || 0).toDateString();

                  return (
                    <React.Fragment key={messageKey}>
                      {showDateBadge && (
                        <div className="flex justify-center">
                          <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                            {new Date(message.createdAt || Date.now()).toLocaleDateString([], {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      )}
                    <div key={messageKey} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] sm:max-w-[72%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                        <div className="mb-1.5 flex items-center gap-2 px-1 text-xs text-slate-500">
                          <span className={`rounded-full px-2 py-0.5 font-semibold ${isMine ? "bg-cyan-100 text-cyan-700" : "bg-white text-slate-700 shadow-sm"}`}>
                            {isMine ? "You" : safeName}
                          </span>
                          <span>{formatTime(message.createdAt)}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isMine ? "bg-cyan-500/10 text-cyan-700" : "bg-slate-100 text-slate-500"}`}>
                            {isMine ? <NorthEastRoundedIcon sx={{ fontSize: 12 }} /> : <SouthWestRoundedIcon sx={{ fontSize: 12 }} />}
                            {isMine ? "Sent" : "Received"}
                          </span>
                        </div>

                        {editingMessage === (message._id || message.id) ? (
                          <div className="w-full rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.07)]">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditMessage();
                                if (e.key === "Escape") cancelEdit();
                              }}
                            />
                            <div className="mt-3 flex justify-end gap-2">
                              <button
                                onClick={cancelEdit}
                                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEditMessage}
                                className="rounded-full bg-sky-600 px-4 py-2 text-xs font-medium text-white hover:bg-sky-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`relative overflow-hidden rounded-[28px] border px-5 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.07)] ${
                              isMine
                                ? "border-cyan-200 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-white"
                                : "border-white bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] text-slate-800"
                            }`}
                          >
                            <div className={`pointer-events-none absolute inset-x-0 top-0 h-px ${isMine ? "bg-white/30" : "bg-slate-100"}`} />
                            {!isMine && <div className="pointer-events-none absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-sky-500" />}
                            {containsMeetingLink ? (
                              <div className="space-y-3">
                                <div className={`rounded-[22px] border px-4 py-3 ${isMine ? "border-white/20 bg-white/10" : "border-emerald-100 bg-emerald-50/80"}`}>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Consultation Room Ready</p>
                                  <p className="mt-2 text-sm leading-6">{message.body}</p>
                                </div>
                                <a
                                  href={meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
                                    isMine ? "bg-white text-cyan-700" : "bg-emerald-600 text-white"
                                  }`}
                                >
                                  <VideocamOutlinedIcon sx={{ fontSize: 16 }} />
                                  Join Video Call
                                </a>
                              </div>
                            ) : (
                              <p className="text-sm leading-6">{message.body}</p>
                            )}
                            {message.edited && <p className={`mt-2 text-[11px] ${isMine ? "text-sky-100" : "text-slate-400"}`}>Edited</p>}
                          </div>
                        )}

                        {editingMessage !== (message._id || message.id) && (
                          <div className={`mt-2 flex gap-2 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                            {isMine && (
                              <button
                                onClick={() => startEditMessage(message)}
                                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-cyan-700"
                              >
                                <EditOutlinedIcon sx={{ fontSize: 14 }} />
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => deleteMessage(message._id || message.id)}
                              disabled={deletingMessageId === (message._id || message.id)}
                              className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                              {deletingMessageId === (message._id || message.id) ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white/95 px-4 py-4 sm:px-6">
            <form onSubmit={handleSubmit} className="rounded-[32px] border border-white bg-[linear-gradient(180deg,#fcffff_0%,#f7fbff_100%)] p-3 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[24px] border border-white/80 bg-white/75 px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Compose</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {isDoctor ? "Send a clinical update to your patient" : "Send a message to your doctor"}
                  </p>
                </div>
                <div className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                  Private conversation
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Message</label>
                  <input
                    type="text"
                    placeholder={isDoctor ? "Write a message to the patient" : "Type your message"}
                    onChange={(e) => setMessageBody(e.target.value)}
                    value={messageBody}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.10)]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    disabled={isDoctor && !selectedThread}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!messageBody.trim() || (isDoctor && !selectedThread)}
                  className="inline-flex h-[54px] items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(8,145,178,0.22)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <SendRoundedIcon sx={{ fontSize: 18 }} />
                  Send
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-xs text-slate-500">Messages stay private between doctor and patient.</p>
                <p className="text-xs font-medium text-cyan-700">Designed for secure clinical communication</p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Room;

