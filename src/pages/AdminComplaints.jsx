import React, { useEffect, useMemo, useState } from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { toast } from "react-toastify";
import api from "../conf/api";

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api.apiBaseUrl}/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch complaints");

      const json = await res.json();
      const docs = json.documents || [];
      setComplaints(docs);
      setSelectedId((prev) =>
        prev && docs.some((item) => item._id === prev) ? prev : "",
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const selectedComplaint = useMemo(
    () => complaints.find((item) => item._id === selectedId) || null,
    [complaints, selectedId],
  );

  const openCount = useMemo(
    () => complaints.filter((item) => item.status !== "resolved").length,
    [complaints],
  );

  const updateStatus = async (id, status) => {
    setSavingId(id);
    try {
      const res = await fetch(`${api.apiBaseUrl}/complaints/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update complaint");

      toast.success(`Complaint marked as ${status}`);
      window.dispatchEvent(new Event("complaints-updated"));
      await fetchComplaints();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update complaint");
    } finally {
      setSavingId("");
    }
  };

  const sendReply = async () => {
    if (!selectedComplaint || !replyMessage.trim()) return;

    setSavingId(selectedComplaint._id);
    try {
      const res = await fetch(`${api.apiBaseUrl}/complaints/${selectedComplaint._id}/replies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          senderName: "Admin",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to send reply");

      setReplyMessage("");
      toast.success("Reply sent to patient");
      window.dispatchEvent(new Event("complaints-updated"));
      await fetchComplaints();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send reply");
    } finally {
      setSavingId("");
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint thread?")) {
      return;
    }

    setSavingId(id);
    try {
      const res = await fetch(`${api.apiBaseUrl}/complaints/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete complaint");

      toast.success("Complaint deleted");
      window.dispatchEvent(new Event("complaints-updated"));
      setReplyMessage("");
      setSelectedId((prev) => (prev === id ? "" : prev));
      await fetchComplaints();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete complaint");
    } finally {
      setSavingId("");
    }
  };

  if (loading) return <div className="p-6">Loading complaints...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Complaint Center</h1>
            <p className="mt-1 text-sm text-slate-600">
              Review complaints and reply directly to patients.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{complaints.length}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-600">Open</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">{openCount}</p>
            </div>
          </div>
        </div>

        {complaints.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No complaints found.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <ForumOutlinedIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Complaint threads</h2>
                  <p className="text-xs text-slate-500">Choose a patient conversation</p>
                </div>
              </div>

              <div className="space-y-3">
                {complaints.map((complaint) => {
                  const isActive = selectedComplaint?._id === complaint._id;
                  return (
                    <button
                      key={complaint._id}
                      type="button"
                      onClick={() => setSelectedId(complaint._id)}
                      className={`w-full rounded-3xl border p-4 text-left transition ${
                        isActive
                          ? "border-blue-200 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {complaint.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {complaint.email}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                            complaint.status === "resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                        {complaint.message}
                      </p>
                    </button>
                  );
                })}
              </div>
            </aside>

            {selectedComplaint ? (
              <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">
                          {selectedComplaint.name}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                            selectedComplaint.status === "resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {selectedComplaint.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <MailOutlineIcon sx={{ fontSize: 18 }} />
                          {selectedComplaint.email}
                        </span>
                        {selectedComplaint.phone ? (
                          <span className="inline-flex items-center gap-2">
                            <LocalPhoneOutlinedIcon sx={{ fontSize: 18 }} />
                            {selectedComplaint.phone}
                          </span>
                        ) : null}
                        <span>{formatDate(selectedComplaint.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={savingId === selectedComplaint._id}
                        onClick={() => deleteComplaint(selectedComplaint._id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                        Delete
                      </button>
                      <button
                        type="button"
                        disabled={savingId === selectedComplaint._id || selectedComplaint.status === "open"}
                        onClick={() => updateStatus(selectedComplaint._id, "open")}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        <RadioButtonUncheckedOutlinedIcon sx={{ fontSize: 18 }} />
                        Mark Open
                      </button>
                      <button
                        type="button"
                        disabled={savingId === selectedComplaint._id || selectedComplaint.status === "resolved"}
                        onClick={() => updateStatus(selectedComplaint._id, "resolved")}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                      >
                        <TaskAltOutlinedIcon sx={{ fontSize: 18 }} />
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Original complaint
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      {selectedComplaint.message}
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    {(selectedComplaint.replies || []).map((reply, index) => {
                      const isAdminReply = reply.senderRole === "admin";
                      return (
                        <div key={`${selectedComplaint._id}-reply-${index}`} className={`flex ${isAdminReply ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-2xl rounded-3xl px-4 py-3 text-sm leading-7 ${
                              isAdminReply
                                ? "bg-blue-600 text-white"
                                : "border border-slate-200 bg-white text-slate-800"
                            }`}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                              {isAdminReply ? "Admin reply" : reply.senderName || "Patient"}
                            </p>
                            <p className="mt-1">{reply.message}</p>
                            <p className="mt-2 text-[11px] opacity-75">
                              {formatDate(reply.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Reply to patient
                    </label>
                    <textarea
                      rows="4"
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                      placeholder="Write your response here..."
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={sendReply}
                        disabled={savingId === selectedComplaint._id || !replyMessage.trim()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <SendRoundedIcon sx={{ fontSize: 18 }} />
                        Send Reply
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="flex min-h-[540px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <div className="max-w-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700">
                    <ForumOutlinedIcon sx={{ fontSize: 32 }} />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-slate-900">
                    Select a complaint thread
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Patient chat tabhi open hoga jab aap left side se kisi complaint ko select karenge.
                  </p>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

