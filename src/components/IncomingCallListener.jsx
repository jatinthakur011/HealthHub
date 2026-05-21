import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import CallEndIcon from "@mui/icons-material/CallEnd";
import VideocamIcon from "@mui/icons-material/Videocam";
import api from "../conf/api";

export default function IncomingCallListener() {
  const auth = useSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState(null);

  useEffect(() => {
    if (!auth.status) return;
    if (location.pathname.startsWith("/video")) return;

    const getToken = () =>
      auth.currentRole === "doctor"
        ? localStorage.getItem("doctor_token")
        : localStorage.getItem("token");

    const poll = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${api.apiBaseUrl}/calls/incoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.invite?.id && data.invite?.roomId) {
          setIncoming((prev) => prev || data.invite);
        }
      } catch {
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [auth.status, auth.currentRole, location.pathname]);

  const dismiss = async (inviteId) => {
    const token =
      auth.currentRole === "doctor"
        ? localStorage.getItem("doctor_token")
        : localStorage.getItem("token");
    if (token && inviteId) {
      try {
        await fetch(`${api.apiBaseUrl}/calls/dismiss/${inviteId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
      }
    }
    setIncoming(null);
  };

  const accept = async () => {
    if (!incoming) return;
    const room = incoming.roomId;
    const id = incoming.id;
    await dismiss(id);
    navigate(`/video/${encodeURIComponent(room)}`);
  };

  if (!incoming) return null;

  const label = incoming.fromRole === "doctor" ? "Doctor" : "Patient";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 ring-2 ring-emerald-400/50">
          <PhoneCallbackIcon sx={{ fontSize: 36, color: "#34d399" }} className="animate-pulse" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Incoming video call</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{incoming.fromName || "Someone"}</h2>
        <p className="mt-1 text-sm text-slate-300">
          {label} is calling you on HealthHub
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => dismiss(incoming.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            <CallEndIcon sx={{ fontSize: 22 }} />
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
          >
            <VideocamIcon sx={{ fontSize: 22 }} />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

