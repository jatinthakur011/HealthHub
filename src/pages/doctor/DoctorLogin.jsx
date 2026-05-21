import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login as authLogin } from "../../store/authSlice";
import docService from "../../services/doctors";

export default function DoctorLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await docService.doctorLogin({ email, password });
      const doctorInfo =
        result?.doctor ||
        JSON.parse(localStorage.getItem("doctor_info") || "null");

      if (!doctorInfo) {
        throw new Error("Unable to resolve doctor info");
      }

      const docUserData = {
        id: doctorInfo._id || doctorInfo.id,
        name: doctorInfo.name,
        email: doctorInfo.email,
        role: "doctor",
        doctorData: doctorInfo,
      };

      dispatch(
        authLogin({
          userData: docUserData,
          role: "doctor",
        }),
      );

      navigate("/doctor-home", { replace: true });
    } catch (e) {
      console.error("Doctor login failed:", e);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Doctor Login</h2>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

