import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import docService from "../services/doctors";
import { toast } from "react-toastify";

const statusConfig = {
  accepted: {
    label: "Accepted",
    badge: "bg-emerald-100 text-emerald-700",
    card: "border-emerald-200 bg-emerald-50/70",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-rose-100 text-rose-700",
    card: "border-rose-200 bg-rose-50/70",
  },
  pending: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-700",
    card: "border-amber-200 bg-amber-50/70",
  },
};

const getRequestStatus = (request) => {
  const raw = String(request?.status || "").toLowerCase();
  return raw === "accepted" || raw === "cancelled" ? raw : "pending";
};

export default function DoctorEmail() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [savingIndex, setSavingIndex] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const loggedInDoctor = await docService.getCurrentDoctor();
        if (!loggedInDoctor) {
          toast.error("Please login as a doctor to access this page");
          navigate("/doctor-login");
          return;
        }

        const doctorData = await docService.getDoctor(doctorId);

        if (loggedInDoctor._id !== doctorId && loggedInDoctor.id !== doctorId) {
          toast.error("You can only access your own booking management");
          navigate("/doctor-home");
          return;
        }

        setDoctor(doctorData);
        setRequests(doctorData.requests || []);
        setAuthenticated(true);
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast.error("Authentication failed");
        navigate("/doctor-login");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      checkAuthentication();
    }
  }, [doctorId, navigate]);

  useEffect(() => {
    if (!doctorId || !authenticated) return;
    try {
      localStorage.setItem(`doctor-bookings-last-seen:${doctorId}`, new Date().toISOString());
      window.dispatchEvent(new Event("doctor-bookings-updated"));
    } catch (error) {
      console.error("Unable to store booking seen timestamp", error);
    }
  }, [doctorId, authenticated, requests.length]);

  const stats = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let cancelled = 0;

    for (const request of requests) {
      const status = getRequestStatus(request);
      if (status === "accepted") accepted += 1;
      else if (status === "cancelled") cancelled += 1;
      else pending += 1;
    }

    return {
      total: requests.length,
      pending,
      accepted,
      cancelled,
    };
  }, [requests]);

  const updateDoctorRequests = async (updatedRequests, successMessage) => {
    await docService.updateRequests(doctorId, updatedRequests);
    setRequests(updatedRequests);
    window.dispatchEvent(new Event("doctor-bookings-updated"));
    toast.success(successMessage);
  };

  const handleAcceptBooking = async (requestIndex) => {
    setSavingIndex(requestIndex);
    try {
      const updatedRequests = [...requests];
      updatedRequests[requestIndex].status = "accepted";
      updatedRequests[requestIndex].acceptedAt = new Date().toISOString();
      updatedRequests[requestIndex].confirmed = true;

      const safeDoc = String(doctorId || "doc").replace(/[^a-zA-Z0-9]/g, "");
      const reqRow = updatedRequests[requestIndex];
      const pid = String(reqRow.userid || reqRow.email || reqRow.name || "");
      const safePat = pid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 48);
      reqRow.videoRoomId = `HealthHub-${safeDoc}-pat-${safePat}`;

      await updateDoctorRequests(updatedRequests, "Booking accepted successfully");
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error("Failed to accept booking");
    } finally {
      setSavingIndex(null);
    }
  };

  const handleCancelBooking = async (requestIndex) => {
    setSavingIndex(requestIndex);
    try {
      const updatedRequests = [...requests];
      updatedRequests[requestIndex].status = "cancelled";
      updatedRequests[requestIndex].confirmed = false;

      await updateDoctorRequests(updatedRequests, "Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setSavingIndex(null);
    }
  };

  const handleDeleteBooking = async (requestIndex) => {
    setSavingIndex(requestIndex);
    try {
      const updatedRequests = requests.filter((_, index) => index !== requestIndex);
      await updateDoctorRequests(updatedRequests, "Booking removed successfully");
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    } finally {
      setSavingIndex(null);
    }
  };

  const handleOpenChat = (request) => {
    const patientId = request.userid || request.email || request.name;
    if (!patientId) {
      toast.error("Patient chat is not available for this booking");
      return;
    }
    navigate(`/room?thread=${encodeURIComponent(patientId)}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            You don&apos;t have permission to access this booking page.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/doctor-login")}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Login as Doctor
            </button>
            <button
              onClick={() => navigate("/doctors")}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Doctors
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Doctor Not Found</h2>
          <button
            onClick={() => navigate("/doctor-home")}
            className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_46%,_#f8fbff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                  <VerifiedOutlinedIcon sx={{ fontSize: 14 }} />
                  Secure Booking Desk
                </div>
                <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Dr. {doctor.name}</h1>
                <p className="mt-2 text-sm font-medium text-cyan-100/90">
                  {doctor.title || "Medical professional"}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-200">
                  <MailOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                  {doctor.email}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/doctor-home")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("doctor_token");
                    navigate("/doctor-login");
                  }}
                  className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 sm:px-8">
            {[
              {
                label: "Total Requests",
                value: stats.total,
                icon: EventAvailableOutlinedIcon,
                color: "text-blue-700",
                bg: "bg-blue-50",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: PendingActionsOutlinedIcon,
                color: "text-amber-700",
                bg: "bg-amber-50",
              },
              {
                label: "Accepted",
                value: stats.accepted,
                icon: CheckCircleOutlineOutlinedIcon,
                color: "text-emerald-700",
                bg: "bg-emerald-50",
              },
              {
                label: "Cancelled",
                value: stats.cancelled,
                icon: CancelOutlinedIcon,
                color: "text-rose-700",
                bg: "bg-rose-50",
              },
            ].map((card) => (
              <div key={card.label} className={`rounded-3xl ${card.bg} p-5`}>
                <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${card.color}`}>
                  <card.icon sx={{ fontSize: 18 }} />
                  {card.label}
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Appointment Requests
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Manage patient bookings
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Review booking details, confirm visits, and start calls from one place.
              </p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-700">
                <CalendarMonthOutlinedIcon sx={{ fontSize: 32 }} />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-slate-900">No appointment requests</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                New booking requests from patients will appear here with their preferred date, time, and notes.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {requests.map((request, index) => {
                const status = getRequestStatus(request);
                const config = statusConfig[status];
                const isPending = status === "pending";
                const isAccepted = status === "accepted";

                return (
                  <article
                    key={`${request.email || request.userid || request.name || "request"}-${index}`}
                    className={`rounded-[28px] border p-5 shadow-sm transition ${config.card}`}
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                            <PersonOutlineOutlinedIcon sx={{ fontSize: 28 }} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {request.name || "Patient"}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${config.badge}`}>
                                {config.label}
                              </span>
                              {(request.email || request.userid) && (
                                <span className="text-sm text-slate-500">
                                  {request.email || request.userid}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="rounded-2xl border border-white/70 bg-white/90 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
                              Date
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-800">
                              {request.appointment?.date || request.date || "Not provided"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/70 bg-white/90 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
                              Time
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-800">
                              {request.appointment?.time || request.time || "Not provided"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/70 bg-white/90 p-4 md:col-span-2 xl:col-span-1">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              <NoteAltOutlinedIcon sx={{ fontSize: 18 }} />
                              Note
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {request.appointment?.note || request.note || "No note provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full xl:max-w-[260px]">
                        <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Actions
                          </p>

                          <div className="mt-4 flex flex-col gap-3">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  disabled={savingIndex === index}
                                  onClick={() => handleAcceptBooking(index)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  disabled={savingIndex === index}
                                  onClick={() => handleCancelBooking(index)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <CancelOutlinedIcon sx={{ fontSize: 18 }} />
                                  Cancel
                                </button>
                              </>
                            ) : null}

                            {isAccepted ? (
                              <button
                                type="button"
                                onClick={() => handleOpenChat(request)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                              >
                                <ForumOutlinedIcon sx={{ fontSize: 18 }} />
                                Open Chat
                              </button>
                            ) : null}

                            {!isPending && !isAccepted ? (
                              <button
                                type="button"
                                disabled={savingIndex === index}
                                onClick={() => handleDeleteBooking(index)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

