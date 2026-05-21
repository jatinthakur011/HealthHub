import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import docService from "../../services/doctors";
import doc1Fallback from "../../assets/doc1.jpg";
import femaleDoctorFallback from "../../assets/femdoc.jpg";

const getImageUrl = (doctorImage, fallbackImage) => {
  if (!doctorImage) return fallbackImage;
  if (typeof doctorImage === "string") {
    if (doctorImage.startsWith("http") || doctorImage.startsWith("/")) return doctorImage;
    return docService.getFilePreview(doctorImage);
  }
  if (doctorImage?.url) return doctorImage.url;
  if (doctorImage?.fileId) return docService.getFilePreview(doctorImage.fileId);
  return fallbackImage;
};

const patientLabel = (r) => r?.patientName || r?.name || "Patient";

export default function DoctorDashboard() {
  const authData = useSelector((state) => state.auth.userData);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState("");

  const defaultImg =
    String(doctor?.gender || "").toLowerCase() === "female" ? femaleDoctorFallback : doc1Fallback;

  useEffect(() => {
    if (!doctor) {
      setImgSrc("");
      return;
    }
    setImgSrc(getImageUrl(doctor?.doctorImage, defaultImg));
  }, [doctor, defaultImg]);

  useEffect(() => {
    (async () => {
      try {
        if (authData?.doctorData) {
          setDoctor(authData.doctorData);
          setLoading(false);
          return;
        }
        const me = await docService.getCurrentDoctor();
        if (me) setDoctor(me);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [authData]);

  const doctorId = doctor?.$id || doctor?._id || doctor?.id || "";
  const requests = Array.isArray(doctor?.requests) ? doctor.requests : [];

  const counts = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let cancelled = 0;
    for (const r of requests) {
      const s = String(r?.status || "").toLowerCase();
      if (s === "accepted") accepted += 1;
      else if (s === "cancelled") cancelled += 1;
      else pending += 1;
    }
    return { pending, accepted, cancelled, total: requests.length };
  }, [requests]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 to-indigo-50/40 px-4">
        <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
        <p className="text-sm font-medium text-slate-600">Loading your dashboard…</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-center text-sm font-medium text-rose-600">Please log in as a doctor.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 shadow-[0_24px_60px_-20px_rgba(30,27,75,0.55)]">
          <div className="relative px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl"
              aria-hidden
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-cyan-400 via-indigo-400 to-violet-500 p-[3px] shadow-lg">
                    <div className="h-full w-full overflow-hidden rounded-[1.2rem] bg-slate-900">
                      <img
                        src={imgSrc || defaultImg}
                        alt={doctor?.name || "Doctor"}
                        className="h-32 w-32 object-cover sm:h-36 sm:w-36"
                        onError={() => setImgSrc(defaultImg)}
                      />
                    </div>
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 rounded-full border-[3px] border-slate-900 bg-emerald-500 shadow-md"
                    title="Active"
                  />
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-200/90 ring-1 ring-white/15">
                    <VerifiedIcon sx={{ fontSize: 14 }} />
                    Doctor profile
                  </div>
                  <h1 className="font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[1.75rem] lg:leading-tight">
                    Dr. {doctor?.name}
                  </h1>
                  <p className="mt-1.5 text-sm font-medium text-indigo-200/90">{doctor?.title || "Medical professional"}</p>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300/95 sm:mx-0">
                    {doctor?.description
                      ? `${doctor.description.slice(0, 220)}${doctor.description.length > 220 ? "…" : ""}`
                      : "Add a short bio from Edit profile so patients understand your expertise and approach."}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                      <AccessTimeIcon sx={{ fontSize: 15 }} className="text-cyan-300/90" />
                      {doctor?.availability || "Hours not set"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                      <LocationOnIcon sx={{ fontSize: 15 }} className="text-violet-300/90" />
                      {doctor?.zone || "Online"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:min-w-[200px] lg:flex-col">
                <Link
                  to={`/doc-ud/${doctorId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-900 shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-50"
                >
                  <EditOutlinedIcon sx={{ fontSize: 20 }} />
                  Edit profile
                </Link>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <Link
                    to="/doctor-home"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/95 backdrop-blur-sm transition hover:bg-white/10"
                  >
                    <HomeOutlinedIcon sx={{ fontSize: 18 }} />
                    Home
                  </Link>
                  <Link
                    to={`/doctor-email/${doctorId}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/95 backdrop-blur-sm transition hover:bg-white/10"
                  >
                    <MailOutlineIcon sx={{ fontSize: 18 }} />
                    Bookings
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Total",
                  value: counts.total,
                  icon: EventAvailableOutlinedIcon,
                  accent: "from-indigo-500/20 to-violet-500/10",
                  ring: "ring-indigo-400/30",
                },
                {
                  label: "Pending",
                  value: counts.pending,
                  icon: PendingActionsOutlinedIcon,
                  accent: "from-amber-500/20 to-orange-500/10",
                  ring: "ring-amber-400/35",
                },
                {
                  label: "Accepted",
                  value: counts.accepted,
                  icon: CheckCircleOutlineIcon,
                  accent: "from-emerald-500/20 to-teal-500/10",
                  ring: "ring-emerald-400/35",
                },
                {
                  label: "Cancelled",
                  value: counts.cancelled,
                  icon: CancelOutlinedIcon,
                  accent: "from-rose-500/20 to-pink-500/10",
                  ring: "ring-rose-400/30",
                },
              ].map(({ label, value, icon: Icon, accent, ring }) => (
                <div
                  key={label}
                  className={`rounded-2xl bg-gradient-to-br ${accent} p-4 ring-1 ${ring} backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-2 text-white/70">
                    <Icon sx={{ fontSize: 18 }} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_40px_-16px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">Inbox</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Appointment requests</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review and track bookings from your public profile.
              </p>
            </div>
          </div>

          {requests.length ? (
            <ul className="flex flex-col gap-4">
              {requests.map((r, idx) => {
                const status = String(r?.status || "").toLowerCase();
                const isAccepted = status === "accepted";
                const isCancelled = status === "cancelled";
                const badgeClass = isAccepted
                  ? "bg-emerald-50 text-emerald-800 ring-emerald-200/80"
                  : isCancelled
                    ? "bg-rose-50 text-rose-800 ring-rose-200/80"
                    : "bg-amber-50 text-amber-900 ring-amber-200/80";
                const label = isAccepted ? "Accepted" : isCancelled ? "Cancelled" : "Pending";

                return (
                  <li
                    key={r?._id ?? idx}
                    className="group rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-5 transition hover:border-indigo-200/60 hover:shadow-md hover:shadow-indigo-500/5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-lg font-bold text-slate-900">{patientLabel(r)}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarMonthIcon sx={{ fontSize: 18, color: "#6366f1" }} />
                            {r.appointment?.date || "—"} <span className="text-slate-400">·</span>{" "}
                            {r.appointment?.time || "—"}
                          </span>
                        </div>
                        {r.appointment?.note ? (
                          <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2.5 text-sm text-slate-700">
                            <span className="font-semibold text-slate-800">Note: </span>
                            {r.appointment.note}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 sm:pt-0.5">
                        <span
                          className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold ring-1 ${badgeClass}`}
                        >
                          {label}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                📅
              </div>
              <p className="text-base font-semibold text-slate-800">No appointment requests yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                When patients book from your profile, they will show up here with date, time, and notes.
              </p>
              <Link
                to={`/doc-ud/${doctorId}`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700"
              >
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                Polish your profile
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

