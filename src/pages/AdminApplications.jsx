import React, { useEffect, useMemo, useState } from "react";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import api from "../conf/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const token = localStorage.getItem("token");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api.apiBaseUrl}/doctor-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setApplications(json.documents || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const approve = async (id) => {
    setSavingId(id);
    try {
      const res = await fetch(
        `${api.apiBaseUrl}/doctor-applications/${id}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message || "Approve failed");
      }
      const json = await res.json();
      toast.success("Approved");
      window.dispatchEvent(new Event("applications-updated"));
      await fetchApplications();
      if (json.doctor && (json.doctor._id || json.doctor.id)) {
        const doctorId = json.doctor._id || json.doctor.id;
        navigate(`/doctor/${doctorId}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Approve failed");
    } finally {
      setSavingId("");
    }
  };

  const reject = async (id) => {
    setSavingId(id);
    try {
      const res = await fetch(
        `${api.apiBaseUrl}/doctor-applications/${id}/reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Reject failed");
      toast.success("Rejected");
      window.dispatchEvent(new Event("applications-updated"));
      await fetchApplications();
    } catch (e) {
      console.error(e);
      toast.error("Reject failed");
    } finally {
      setSavingId("");
    }
  };

  const stats = useMemo(() => {
    const pending = applications.filter((app) => app.status === "pending").length;
    const approved = applications.filter((app) => app.status === "approved").length;
    const rejected = applications.filter((app) => app.status === "rejected").length;

    return {
      total: applications.length,
      pending,
      approved,
      rejected,
    };
  }, [applications]);

  const getLicenseUrl = (license) => {
    if (!license) return "";
    if (license.startsWith("http")) return license;
    const baseUrl = api.apiBaseUrl.replace("/api", "");
    return `${baseUrl}/api/uploads/${license}`;
  };

  if (loading) return <div className="p-6">Loading applications...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[32px] border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="inline-flex rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                Admin Panel
              </div>
              <h1 className="mt-4 text-3xl font-bold text-slate-900">
                Doctor Applications
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Review doctor onboarding requests, verify credentials, and approve
                or reject applications from one organized workspace.
              </p>
            </div>

            <button
              onClick={() =>
                window.open(
                  "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit",
                  "_blank",
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              View Google Form Responses
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Total
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-amber-700">
                <HourglassEmptyOutlinedIcon sx={{ fontSize: 18 }} />
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Pending
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold text-amber-700">{stats.pending}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-5">
              <div className="flex items-center gap-2 text-emerald-700">
                <VerifiedOutlinedIcon sx={{ fontSize: 18 }} />
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Approved
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{stats.approved}</p>
            </div>
            <div className="rounded-3xl bg-rose-50 p-5">
              <div className="flex items-center gap-2 text-rose-700">
                <HighlightOffOutlinedIcon sx={{ fontSize: 18 }} />
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Rejected
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold text-rose-700">{stats.rejected}</p>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No doctor applications found.
          </div>
        ) : (
          <div className="grid gap-5">
            {applications.map((app) => (
              <article
                key={app._id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <BadgeOutlinedIcon sx={{ fontSize: 28 }} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-2xl font-bold text-slate-900">
                          {app.name}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                              app.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : app.status === "rejected"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {app.status || "pending"}
                          </span>
                          <span className="text-sm text-slate-500">{app.title || "General"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MailOutlineIcon sx={{ fontSize: 18 }} />
                          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                            Email
                          </p>
                        </div>
                        <p className="mt-2 break-all text-sm font-medium text-slate-800">
                          {app.email}
                        </p>
                      </div>

                      <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <SchoolOutlinedIcon sx={{ fontSize: 18 }} />
                          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                            Degree
                          </p>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-800">
                          {app.degree || "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
                          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                            License No
                          </p>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-800">
                          {app.licenseNumber || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {app.description ? (
                      <div className="mt-5 rounded-3xl bg-blue-50/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                          Description
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">
                          {app.description}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="w-full xl:max-w-[280px]">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Documents
                      </p>

                      {app.license ? (
                        <a
                          href={getLicenseUrl(app.license)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <InsertDriveFileOutlinedIcon sx={{ fontSize: 18 }} />
                            View License
                          </span>
                          <OpenInNewOutlinedIcon sx={{ fontSize: 18 }} />
                        </a>
                      ) : (
                        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                          No license document
                        </div>
                      )}

                      <div className="mt-5 flex flex-col gap-3">
                        {app.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              disabled={savingId === app._id}
                              onClick={() => approve(app._id)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <TaskAltOutlinedIcon sx={{ fontSize: 18 }} />
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={savingId === app._id}
                              onClick={() => reject(app._id)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <HighlightOffOutlinedIcon sx={{ fontSize: 18 }} />
                              Reject
                            </button>
                          </>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
                            This application has already been {app.status}.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

