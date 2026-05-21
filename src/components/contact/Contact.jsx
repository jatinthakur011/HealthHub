import React, { useEffect, useState } from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../../conf/api";

const contactCards = [
  {
    icon: <CallOutlinedIcon />,
    title: "Call us",
    detail: "+91 12345 67890",
    note: "For quick questions and basic assistance.",
  },
  {
    icon: <MailOutlineIcon />,
    title: "Email us",
    detail: "healthhub@gmail.com",
    note: "For partnerships, feedback, or support requests.",
  },
];

export default function Contact() {
  const auth = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    name: auth.userData?.name || "",
    phone: "",
    email: auth.userData?.email || "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const fetchMyComplaints = async () => {
    if (!token) {
      setComplaints([]);
      setLoadingComplaints(false);
      return;
    }

    setLoadingComplaints(true);
    try {
      const res = await fetch(`${api.apiBaseUrl}/complaints/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load complaints");
      const data = await res.json();
      setComplaints(data.documents || []);
    } catch (error) {
      console.error(error);
      setComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;

    const intervalId = window.setInterval(() => {
      fetchMyComplaints();
    }, 5000);

    const handleFocus = () => {
      fetchMyComplaints();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Name, email, and complaint are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${api.apiBaseUrl}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          userId: auth.userData?.id || auth.userData?._id || "",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit complaint");
      }

      toast.success("Complaint submitted successfully");
      window.dispatchEvent(new Event("complaints-updated"));
      await fetchMyComplaints();
      setFormData((prev) => ({
        ...prev,
        phone: "",
        message: "",
      }));
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComplaint = async (complaintId) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this complaint thread?")) {
      return;
    }

    setDeletingId(complaintId);
    try {
      const res = await fetch(`${api.apiBaseUrl}/complaints/${complaintId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete complaint");

      toast.success("Complaint deleted");
      window.dispatchEvent(new Event("complaints-updated"));
      await fetchMyComplaints();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete complaint");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 pb-16 pt-6 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <section className="rounded-[28px] border-2 border-blue-200 bg-white px-6 py-10 shadow-[0_18px_40px_rgba(148,163,184,0.10)] sm:px-8 lg:px-12 lg:py-12">
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                Contact HealthHub
              </span>

              <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Get in touch with our team.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                If you have any question about appointments, doctors, or the
                platform, send us a message and we will get back to you.
              </p>

              <div className="mt-8 space-y-4">
                {contactCards.map((card) => (
                  <div
                    key={card.title}
                    className="flex gap-4 rounded-3xl border border-blue-100 bg-blue-50/30 p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {card.title}
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {card.detail}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {card.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Send a message
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Complaint form
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Fill in your details below and your complaint will go directly to the admin panel.
                </p>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Full Name
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Phone Number
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Message
                    </span>
                    <textarea
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you"
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                    <ArrowOutwardIcon fontSize="small" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border-2 border-blue-100 bg-white px-6 py-8 shadow-[0_18px_40px_rgba(148,163,184,0.10)] sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 shadow-sm">
                <ForumOutlinedIcon />
              </div>
              <div>
                <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Support Updates
                </div>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Your complaint chat</h2>
                <p className="mt-1 text-sm text-slate-600">
                Admin replies to your complaint will appear here.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              {complaints.length} {complaints.length === 1 ? "thread" : "threads"}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {loadingComplaints ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Loading your complaints...
              </div>
            ) : complaints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                No complaint thread yet.
              </div>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint._id} className="overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-sm">
                  <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-sky-50 to-white px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <SupportAgentOutlinedIcon sx={{ fontSize: 18 }} className="text-blue-700" />
                        <h3 className="text-lg font-semibold text-slate-900">
                          Complaint thread
                        </h3>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Created on {new Date(complaint.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className="flex items-center gap-2"
                    >
                      <button
                        type="button"
                        disabled={deletingId === complaint._id}
                        onClick={() => deleteComplaint(complaint._id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-60"
                      >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                        {deletingId === complaint._id ? "Deleting..." : "Delete"}
                      </button>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          complaint.status === "resolved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </span>
                  </div>
                  </div>

                  <div className="space-y-4 bg-slate-50/60 px-5 py-5">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                          Your Complaint
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">
                          {new Date(complaint.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-800">
                        {complaint.message}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Support Response
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Latest admin updates
                        </p>
                      </div>

                      {(complaint.replies || []).filter((reply) => reply.senderRole === "admin").length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                          Admin response abhi pending hai.
                        </div>
                      ) : (
                        (complaint.replies || [])
                          .filter((reply) => reply.senderRole === "admin")
                          .map((reply, index) => (
                            <div
                              key={`${complaint._id}-reply-${index}`}
                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                                  Admin Response
                                </p>
                                <p className="text-[11px] font-medium text-slate-500">
                                  {reply.createdAt
                                    ? new Date(reply.createdAt).toLocaleString()
                                    : ""}
                                </p>
                              </div>
                              <p className="mt-3 text-sm leading-7 text-slate-800">
                                {reply.message}
                              </p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

