import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function loadJitsiScript() {
  if (typeof window !== "undefined" && window.JitsiMeetExternalAPI) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-jitsi-api="1"]');
    if (existing) {
      if (window.JitsiMeetExternalAPI) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Could not load video")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://meet.jit.si/external_api.js";
    s.async = true;
    s.dataset.jitsiApi = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load video"));
    document.body.appendChild(s);
  });
}

function buildRoomName(roomid) {
  const raw = roomid ? decodeURIComponent(roomid) : `HealthHub-${Date.now()}`;
  return (
    String(raw)
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 200) || `HealthHub-${Date.now()}`
  );
}

export default function Video() {
  const { roomid } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth.userData);
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const endedRef = useRef(false);
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState(null);

  const roomName = buildRoomName(roomid);
  const displayName = auth?.name || "Guest";

  const finishEnd = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    try {
      apiRef.current?.dispose?.();
    } catch {
    }
    apiRef.current = null;
    setPhase("ended");
    setTimeout(() => navigate(-1), 1200);
  }, [navigate]);

  const hangup = useCallback(() => {
    try {
      apiRef.current?.executeCommand?.("hangup");
    } catch {
    }
    setTimeout(() => finishEnd(), 400);
  }, [finishEnd]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadJitsiScript();
        if (cancelled || !containerRef.current) return;
        if (!window.JitsiMeetExternalAPI) {
          setError("Video unavailable");
          setPhase("error");
          return;
        }

        const domain = "meet.jit.si";
        const options = {
          roomName,
          width: "100%",
          height: "100%",
          parentNode: containerRef.current,
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
          },
          userInfo: {
            displayName,
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;
        setPhase("active");

        const syncIframeSize = () => {
          const iframe = api.getIFrame?.();
          const node = containerRef.current;
          if (!iframe || !node) return;
          const h = node.clientHeight;
          const w = node.clientWidth;
          if (h > 0 && w > 0) {
            iframe.style.width = "100%";
            iframe.style.height = `${h}px`;
          }
        };
        syncIframeSize();
        requestAnimationFrame(syncIframeSize);

        const onLeft = () => {
          if (cancelled) return;
          finishEnd();
        };

        api.addEventListener("videoConferenceLeft", onLeft);
        api.addEventListener("readyToClose", onLeft);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(e?.message || "Failed to start call");
          setPhase("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch {
        }
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, finishEnd]);

  useLayoutEffect(() => {
    if (phase !== "active" || !containerRef.current) return;
    const node = containerRef.current;
    const sync = () => {
      const iframe = apiRef.current?.getIFrame?.();
      if (!iframe || !node) return;
      const h = node.clientHeight;
      if (h > 0) {
        iframe.style.width = "100%";
        iframe.style.height = `${h}px`;
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(node);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [phase]);

  return (
    <div className="flex h-full min-h-0 w-full max-w-[100vw] flex-1 flex-col overflow-hidden bg-slate-950">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => hangup()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
          Back
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">HealthHub</p>
          <p className="text-sm font-semibold text-white">Video consultation</p>
        </div>
        <button
          type="button"
          onClick={() => hangup()}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700"
        >
          <CallEndIcon sx={{ fontSize: 20 }} />
          End call
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        {phase === "loading" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
            <p className="text-sm text-slate-300">Connecting…</p>
          </div>
        )}

        {(phase === "ended" || phase === "error") && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-slate-950 p-6 text-center">
            <p className="text-lg font-semibold text-white">
              {phase === "ended" ? "Call ended" : "Could not start call"}
            </p>
            {error && <p className="max-w-sm text-sm text-red-300">{error}</p>}
            <p className="text-sm text-slate-400">Returning…</p>
          </div>
        )}

        <div ref={containerRef} className="absolute inset-0 h-full min-h-[240px] w-full" />
      </div>
    </div>
  );
}

