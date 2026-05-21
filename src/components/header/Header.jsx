import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogoutBtn, SessionSwitcher } from "../index";
import docService from "../../appwrite/authDoc";
import api from "../../conf/api";
import { login, logoutAll } from "../../store/authSlice";
import authServices from "../../appwrite/auth";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";

export default function Header() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [pendingApps, setPendingApps] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [pendingDoctorBookings, setPendingDoctorBookings] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [patientChatReadyCount, setPatientChatReadyCount] = useState(0);
  const [down, setDown] = useState(false);
  const [doctorStatus, setDoctorStatus] = useState("active");
  const [statusSaving, setStatusSaving] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const hideNav =
    location.pathname.toLowerCase().includes("login") ||
    location.pathname.toLowerCase().includes("signup");

  const slug =
    Array.isArray(auth.userData?.labels) && auth.userData?.labels.length
      ? auth.userData.labels[0]
      : null;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Doctors", path: "/doctors" },
    { name: "Blood", path: "/blood" },
    { name: "Contact", path: "/contact" },
  ];
  const adminNavItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Applications", path: "/admin/applications" },
    { name: "Complaints", path: "/admin/complaints" },
  ];

  const doctorToken = localStorage.getItem("doctor_token");
  const isAdminRole = auth.userData?.role === "admin";
  const isDoctorRole =
    auth.currentRole === "doctor" ||
    auth.userData?.role === "doctor" ||
    !!auth.doctorSession ||
    !!doctorToken;
  const brandHomePath = isDoctorRole ? "/doctor-home" : isAdminRole ? "/admin" : "/";

  const shouldRenderCenterNav = !hideNav;
  const spacerHeight = 120;
  const displayName = auth.userData?.name || "User";
  const doctorProfile =
    auth.userData?.doctorData ||
    auth.doctorSession?.doctorData ||
    auth.doctorSession ||
    null;
  const doctorProfileId = doctorProfile?._id || doctorProfile?.id || auth.userData?.id || auth.userData?._id;
  const bookingPagePath = `/doctor-email/${auth.userData?.id || auth.userData?._id}`;
  const chatSeenStorageKey = doctorProfileId ? `doctor-chat-last-seen:${doctorProfileId}` : null;
  const bookingSeenStorageKey = doctorProfileId ? `doctor-bookings-last-seen:${doctorProfileId}` : null;

  useEffect(() => {
    if (!isDoctorRole) return;
    const nextStatus = String(doctorProfile?.status || "active").toLowerCase();
    setDoctorStatus(nextStatus === "inactive" ? "inactive" : "active");
  }, [doctorProfile?.status, isDoctorRole]);

  useEffect(() => {
    if (!isDoctorRole || !doctorProfileId) {
      setPendingDoctorBookings(0);
      setUnreadChatCount(0);
      return;
    }

    let active = true;

    const fetchDoctorNotificationCounts = async () => {
      try {
        const [doctorPost, messagesRes] = await Promise.all([
          docService.getPost(doctorProfileId),
          fetch(`${api.apiBaseUrl}/messages?doctor_id=${doctorProfileId}`, { credentials: "include" }).then((res) => {
            if (!res.ok) throw new Error("Failed to load messages");
            return res.json();
          }),
        ]);

        if (!active) return;

        const requests = Array.isArray(doctorPost?.requests) ? doctorPost.requests : [];
        const bookingSeenAt = bookingSeenStorageKey ? localStorage.getItem(bookingSeenStorageKey) : null;
        const bookingSeenMs = bookingSeenAt ? new Date(bookingSeenAt).getTime() : 0;
        const nextPendingBookings = requests.filter((request) => {
          const status = String(request?.status || "").toLowerCase();
          const isPending = status !== "accepted" && status !== "cancelled";
          if (!isPending) return false;
          if (location.pathname === bookingPagePath) return false;
          if (!bookingSeenMs) return true;
          const createdMs = new Date(request?.createdAt || 0).getTime();
          return Number.isNaN(createdMs) || createdMs > bookingSeenMs;
        }).length;

        const documents = Array.isArray(messagesRes?.documents) ? messagesRes.documents : [];
        const chatSeenAt = chatSeenStorageKey ? localStorage.getItem(chatSeenStorageKey) : null;
        const chatSeenMs = chatSeenAt ? new Date(chatSeenAt).getTime() : 0;
        const nextUnreadChatCount = documents.filter((message) => {
          const senderRole = String(message?.sender_role || "").toLowerCase();
          const isIncoming = senderRole ? senderRole !== "doctor" : message?.sender_id !== doctorProfileId;
          if (!isIncoming) return false;
          if (location.pathname === "/room") return false;
          if (!chatSeenMs) return true;
          const createdMs = new Date(message?.createdAt || 0).getTime();
          return !Number.isNaN(createdMs) && createdMs > chatSeenMs;
        }).length;

        setPendingDoctorBookings(nextPendingBookings);
        setUnreadChatCount(nextUnreadChatCount);
      } catch (error) {
        if (!active) return;
        setPendingDoctorBookings(0);
        setUnreadChatCount(0);
      }
    };

    fetchDoctorNotificationCounts();
    const intervalId = setInterval(fetchDoctorNotificationCounts, 10000);
    window.addEventListener("doctor-bookings-updated", fetchDoctorNotificationCounts);
    window.addEventListener("doctor-chat-updated", fetchDoctorNotificationCounts);

    return () => {
      active = false;
      clearInterval(intervalId);
      window.removeEventListener("doctor-bookings-updated", fetchDoctorNotificationCounts);
      window.removeEventListener("doctor-chat-updated", fetchDoctorNotificationCounts);
    };
  }, [isDoctorRole, doctorProfileId, bookingSeenStorageKey, chatSeenStorageKey, location.pathname, bookingPagePath]);

  const doctorNavItems = isDoctorRole
    ? [
        { name: "Home", path: "/doctor-home" },
        { name: "Chat", path: "/room" },
        {
          name: "Profile",
          path: `/doc-ud/${auth.userData?.id || auth.userData?._id}`,
        },
        { name: "Video", path: "/video/lobby" },
        {
          name: "Bookings",
          path: `/doctor-email/${auth.userData?.id || auth.userData?._id}`,
        },
        { name: "Logout", path: "/doctor-login", isLogout: true },
      ]
    : navItems;
  const isPatientRole = auth.status && !isDoctorRole && !isAdminRole;
  const patientNavItems = navItems;
  const applicationsActive = location.pathname.startsWith("/admin/applications");
  const complaintsActive = location.pathname.startsWith("/admin/complaints");
  const visibleNavItems = isDoctorRole
    ? doctorNavItems
    : isAdminRole
      ? adminNavItems
      : patientNavItems;

  useEffect(() => {
    if (!isPatientRole) {
      setPatientChatReadyCount(0);
      return;
    }

    let active = true;
    const patientSeenStorageKey = `patient-chat-last-seen:${auth.userData?.$id || auth.userData?.id || auth.userData?.email || "guest"}`;

    const fetchPatientChatCount = async () => {
      try {
        const doctorsRes = await fetch(`${api.apiBaseUrl}/doctors`, { credentials: "include" });
        if (!doctorsRes.ok) throw new Error("Failed to load doctors");
        const doctorsData = await doctorsRes.json();
        const doctors = Array.isArray(doctorsData?.documents) ? doctorsData.documents : [];
        const viewerIdentity = String(auth.userData?.$id || auth.userData?.id || auth.userData?.email || "").toLowerCase();
        const viewerEmail = String(auth.userData?.email || "").toLowerCase();
        const seenAt = localStorage.getItem(patientSeenStorageKey);
        const seenMs = seenAt ? new Date(seenAt).getTime() : 0;
        const readyCount = doctors.filter((doctor) => {
          const requests = Array.isArray(doctor?.requests) ? doctor.requests : [];
          return requests.some((request) => {
            const identity = String(request?.userid || request?.userEmail || request?.email || "").toLowerCase();
            const matchesViewer = identity && (identity === viewerIdentity || identity === viewerEmail);
            if (!matchesViewer) return false;
            const type = String(request?.type || request?.requestType || "").toLowerCase();
            if (type && type !== "chat" && type !== "appointment") return false;
            if (String(request?.status || "").toLowerCase() !== "accepted") return false;
            if (location.pathname === "/room") return false;
            if (!seenMs) return true;
            const acceptedMs = new Date(request?.acceptedAt || request?.updatedAt || request?.createdAt || 0).getTime();
            return !Number.isNaN(acceptedMs) && acceptedMs > seenMs;
          });
        }).length;

        if (!active) return;
        setPatientChatReadyCount(readyCount);
      } catch (error) {
        if (!active) return;
        setPatientChatReadyCount(0);
      }
    };

    fetchPatientChatCount();
    const intervalId = setInterval(fetchPatientChatCount, 10000);
    window.addEventListener("patient-chat-updated", fetchPatientChatCount);

    return () => {
      active = false;
      clearInterval(intervalId);
      window.removeEventListener("patient-chat-updated", fetchPatientChatCount);
    };
  }, [isPatientRole, auth.userData?.$id, auth.userData?.id, auth.userData?.email, location.pathname]);

  useEffect(() => {
    if (!isAdminRole) {
      setPendingApps(0);
      return;
    }

    const token = localStorage.getItem("token");

    const fetchApplicationsCount = () => {
      fetch(`${api.apiBaseUrl}/doctor-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load applications");
          return res.json();
        })
        .then((data) => {
          const docs = Array.isArray(data.documents) ? data.documents : [];
          const pending = docs.filter((app) => app.status === "pending").length;
          setPendingApps(pending);
        })
        .catch(() => setPendingApps(0));
    };

    fetchApplicationsCount();
    window.addEventListener("applications-updated", fetchApplicationsCount);

    return () => {
      window.removeEventListener("applications-updated", fetchApplicationsCount);
    };
  }, [isAdminRole]);

  useEffect(() => {
    if (!isAdminRole) {
      setPendingComplaints(0);
      return;
    }

    const token = localStorage.getItem("token");

    const fetchComplaintCount = () => {
      fetch(`${api.apiBaseUrl}/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load complaints");
          return res.json();
        })
        .then((data) => {
          const docs = Array.isArray(data.documents) ? data.documents : [];
          const pending = docs.filter((item) => item.status !== "resolved").length;
          setPendingComplaints(pending);
        })
        .catch(() => setPendingComplaints(0));
    };

    fetchComplaintCount();
    window.addEventListener("complaints-updated", fetchComplaintCount);

    return () => {
      window.removeEventListener("complaints-updated", fetchComplaintCount);
    };
  }, [isAdminRole]);

  const handleDoctorLogout = () => {
    setDown(false);
    authServices.logout();
    dispatch(logoutAll());
    navigate("/", { replace: true });
  };

  const handleDoctorStatusChange = async (nextStatus) => {
    if (!isDoctorRole || !doctorProfileId || statusSaving || doctorStatus === nextStatus) return;

    setStatusSaving(true);
    try {
      const updatedDoctor = await docService.updatePost(doctorProfileId, {
        ...doctorProfile,
        status: nextStatus,
      });

      const normalizedDoctor = {
        ...(doctorProfile || {}),
        ...(updatedDoctor || {}),
        status: nextStatus,
      };

      try {
        localStorage.setItem("doctor_info", JSON.stringify(normalizedDoctor));
      } catch (e) {
      }

      dispatch(
        login({
          userData: {
            ...(auth.doctorSession || auth.userData || {}),
            id: normalizedDoctor._id || normalizedDoctor.id || auth.userData?.id,
            name: normalizedDoctor.name || auth.userData?.name,
            email: normalizedDoctor.email || auth.userData?.email,
            role: "doctor",
            doctorData: normalizedDoctor,
          },
          role: "doctor",
        }),
      );

      setDoctorStatus(nextStatus);
    } catch (error) {
      console.error("Failed to update doctor status:", error);
    } finally {
      setStatusSaving(false);
    }
  };

  const isDoctorNavItemActive = (item) => {
    if (item.name === "Chat") {
      return location.pathname === "/room";
    }
    if (item.name === "Video") {
      return location.pathname.startsWith("/video") || location.pathname.startsWith("/video-call");
    }
    return location.pathname === item.path;
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50">
        <nav className="relative h-[120px] ">
          <div className="relative h-[65%] flex items-center justify-between px-6 md:px-12 bg-white/40 backdrop-blur-[240px] border-b border-white/30 rounded-b-2xl shadow-lg">
            <div className="flex items-center">
              <Link
                to={brandHomePath}
                className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-transparent bg-clip-text hover:scale-110 transition cursor-pointer"
              >
                HealthHub
              </Link>
            </div>

            {shouldRenderCenterNav && (
             <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
  <div
    className="relative flex items-center gap-2 rounded-[28px]
    bg-gradient-to-r from-violet-100/85 via-fuchsia-50/90 to-sky-100/85 backdrop-blur-xl
    border border-violet-100/80
    px-2 py-2 shadow-[0_18px_40px_rgba(167,139,250,0.18)]"
  >
    <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-white/18" />

    <div className={`relative flex items-center ${isAdminRole ? "gap-4 px-2" : "gap-2"}`}>
      {visibleNavItems.map((item) => {
        const active = isDoctorRole
          ? isDoctorNavItemActive(item)
          : location.pathname === item.path;
        const isBlood = item.name === "Blood";
        const isDoctors = item.name === "Doctors";
        const isLogout = item.name === "Logout";
        const badgeCount =
          isDoctorRole && item.name === "Bookings"
            ? pendingDoctorBookings
            : isDoctorRole && item.name === "Chat"
              ? unreadChatCount
              : isAdminRole && item.name === "Applications"
            ? applicationsActive
              ? 0
              : pendingApps
            : isAdminRole && item.name === "Complaints"
              ? complaintsActive
                ? 0
                : pendingComplaints
              : 0;
        const activeClass = isLogout
          ? "bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white border-rose-200/60 shadow-[0_12px_30px_rgba(244,63,94,0.35)]"
          : isBlood
            ? "bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white border-red-200/60 shadow-[0_12px_30px_rgba(239,68,68,0.35)]"
            : isDoctors
              ? "bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 text-white border-violet-200/70 shadow-[0_16px_34px_rgba(99,102,241,0.34)] scale-[1.06] -translate-y-1 ring-1 ring-white/55"
              : "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white border-cyan-200/60 shadow-[0_12px_30px_rgba(37,99,235,0.35)]";
        const inactiveClass = isLogout
          ? "bg-white text-rose-600 border-rose-100 shadow-sm hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-md"
          : isBlood
            ? "bg-white text-slate-700 border-gray-200 shadow-sm hover:-translate-y-0.5 hover:text-red-700 hover:bg-red-50 hover:border-red-200 hover:shadow-md"
            : isDoctors
              ? "bg-white text-slate-700 border-gray-200 shadow-sm hover:-translate-y-1 hover:scale-[1.03] hover:text-indigo-700 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-violet-50 hover:border-indigo-200 hover:shadow-[0_12px_26px_rgba(99,102,241,0.16)]"
              : "bg-white text-slate-700 border-gray-200 shadow-sm hover:-translate-y-0.5 hover:text-slate-800 hover:bg-gray-50 hover:shadow-md";

        const className = `px-3.5 ${isAdminRole ? "lg:px-6" : "lg:px-4"} py-2 rounded-full text-xs lg:text-sm font-semibold border backdrop-blur-md whitespace-nowrap transition-all duration-300 ${active ? activeClass : inactiveClass}`;

        if (isDoctorRole) {
          if (isLogout) {
            return (
              <button key={item.name} type="button" onClick={handleDoctorLogout} className={className}>
                {item.name}
              </button>
            );
          }

          const handleClick = () => {
            if (item.name === "Video") {
              const room = `HealthHub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
              navigate(`/video/${encodeURIComponent(room)}`);
              return;
            }
            navigate(item.path);
          };

          return (
            <button key={item.name} type="button" onClick={handleClick} className={className}>
              <span className="inline-flex items-center gap-2">
                <span>{item.name}</span>
                {badgeCount > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {badgeCount}
                  </span>
                )}
              </span>
            </button>
          );
        }

        return (
          <NavLink key={item.name} to={item.path} className={className}>
            <span className="inline-flex items-center gap-2">
              <span>{item.name}</span>
              {badgeCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {badgeCount}
                </span>
              )}
            </span>
          </NavLink>
        );
      })}
    </div>
  </div>
</div>
            )}

            {!auth.status ? (
              <div className="flex items-center gap-4 md:gap-8">
                <Link
                  to="/login"
                  className="relative text-gray-700 hover:text-black after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-black hover:after:w-full after:transition-all"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="px-6 py-2 rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-500 shadow-lg hover:scale-110 hover:shadow-2xl transition"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                {isPatientRole && (
                  <button
                    type="button"
                    onClick={() => navigate("/room")}
                    className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition md:inline-flex ${
                      location.pathname === "/room"
                        ? "border-cyan-200 bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-[0_12px_28px_rgba(8,145,178,0.24)]"
                        : "border-cyan-100 bg-white/85 text-cyan-700 hover:bg-cyan-50"
                    }`}
                  >
                    <ForumOutlinedIcon sx={{ fontSize: 18 }} />
                    <span>Chat</span>
                    {patientChatReadyCount > 0 && (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                        {patientChatReadyCount}
                      </span>
                    )}
                  </button>
                )}

                <SessionSwitcher />

                {isDoctorRole && (
                  <div className="hidden items-center rounded-full border border-cyan-100/80 bg-white/80 p-1 shadow-[0_10px_24px_rgba(8,145,178,0.10)] md:flex">
                    {["active", "inactive"].map((status) => {
                      const isActiveStatus = doctorStatus === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleDoctorStatusChange(status)}
                          disabled={statusSaving}
                          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                            isActiveStatus
                              ? status === "active"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.25)]"
                                : "bg-gradient-to-r from-slate-500 to-slate-700 text-white shadow-[0_10px_24px_rgba(51,65,85,0.22)]"
                              : "text-slate-500 hover:bg-slate-50"
                          } ${statusSaving ? "cursor-wait opacity-70" : ""}`}
                        >
                          {statusSaving && isActiveStatus ? "Saving..." : status}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div
                  onClick={() => setDown(!down)}
                  className="flex items-center gap-3 px-2.5 py-1.5 rounded-full border border-violet-100/80 bg-gradient-to-r from-white via-violet-50/80 to-sky-50/80 shadow-[0_10px_24px_rgba(167,139,250,0.14)] hover:scale-105 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(99,102,241,0.28)]">
                        {displayName.charAt(0).toUpperCase()}
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_0_3px_rgba(74,222,128,0.16)]" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                          Welcome
                        </span>
                        <span
                          className="max-w-[132px] truncate text-sm font-semibold text-slate-700"
                          title={displayName}
                        >
                          {displayName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {down ? (
                    <ExpandLessIcon className="text-slate-600" />
                  ) : (
                    <ExpandMoreIcon className="text-slate-600" />
                  )}
                </div>
              </div>
            )}
          </div>

          <LogoutBtn
            handleClick={() => setDown(false)}
            userdata={auth.userData}
            isopen={down}
          />
        </nav>
      </header>

      <div style={{ height: spacerHeight }} />
    </>
  );
}

