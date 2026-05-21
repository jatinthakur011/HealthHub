import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  PeopleAltOutlined,
  AssignmentOutlined,
  WarningAmberOutlined,
  DashboardOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";
import api from "../conf/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const doctorsRes = await fetch(`${api.apiBaseUrl}/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctorsData = await doctorsRes.json();
      setDoctors(doctorsData.documents || []);

      const appsRes = await fetch(`${api.apiBaseUrl}/doctor-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appsData = await appsRes.json();
      setApplications(appsData.documents || []);

      const complaintsRes = await fetch(`${api.apiBaseUrl}/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const complaintsData = await complaintsRes.json();
      setComplaints(complaintsData.documents || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const removeDoctor = async (id, name) => {
    if (!window.confirm(`Remove Dr. ${name}?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${api.apiBaseUrl}/doctors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Doctor removed");
      fetchData();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  const stats = {
    totalDoctors: doctors.length,
    pendingApplications: applications.filter((a) => a.status === "pending").length,
    totalComplaints: complaints.length,
    pendingComplaints: complaints.filter((c) => c.status === "pending").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* 🔥 Gradient Header */}
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-indigo-100">
            Manage doctors, applications, and complaints efficiently.
          </p>
        </div>

        {/* 🔥 Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div onClick={() => navigate("/admin/doctors")}
            className="cursor-pointer rounded-2xl bg-white/70 backdrop-blur-lg p-5 shadow hover:shadow-xl transition hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white p-3 rounded-xl">
                <PeopleAltOutlined />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDoctors}</p>
                <p className="text-sm text-gray-600">Doctors</p>
              </div>
            </div>
          </div>

          <div onClick={() => navigate("/admin/applications")}
            className="cursor-pointer rounded-2xl bg-white/70 backdrop-blur-lg p-5 shadow hover:shadow-xl transition hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 text-white p-3 rounded-xl">
                <AssignmentOutlined />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                <p className="text-sm text-gray-600">Applications</p>
              </div>
            </div>
          </div>

          <div onClick={() => navigate("/admin/complaints")}
            className="cursor-pointer rounded-2xl bg-white/70 backdrop-blur-lg p-5 shadow hover:shadow-xl transition hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 text-white p-3 rounded-xl">
                <WarningAmberOutlined />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingComplaints}</p>
                <p className="text-sm text-gray-600">Pending Complaints</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/70 backdrop-blur-lg p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 text-white p-3 rounded-xl">
                <DashboardOutlined />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalComplaints}</p>
                <p className="text-sm text-gray-600">Total Complaints</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 Doctors Table */}
        <div className="mt-8 bg-white rounded-3xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Doctors</h2>

          {doctors.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No doctors found</p>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full">
                <thead className="bg-gray-100 text-left text-sm">
                  <tr>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((d) => (
                    <tr key={d._id} className="border-t hover:bg-indigo-50 transition">
                      <td className="p-3 flex items-center gap-3">
                        {d.doctorImage ? (
                          <img src={d.doctorImage} className="h-10 w-10 rounded-full" />
                        ) : (
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            {d.name?.[0]}
                          </div>
                        )}
                        {d.name}
                      </td>

                      <td className="p-3">{d.title}</td>
                      <td className="p-3">{d.email}</td>

                      <td className="p-3">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          {d.status || "active"}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => removeDoctor(d._id, d.name)}
                          disabled={deletingId === d._id}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <DeleteOutlineOutlined fontSize="small" />
                          {deletingId === d._id ? "Removing..." : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}