import React, { useState } from "react";
import authServices from "../appwrite/auth";
import docService from "../services/doctors";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginUser = async (data) => {
    setLoading(true);
    try {
      const docSession = await docService.doctorLogin(data);
      if (docSession) {
        const doctorInfo =
          docSession.doctor ||
          JSON.parse(localStorage.getItem("doctor_info") || "null");

        if (doctorInfo) {
          dispatch(
            authLogin({
              userData: {
                id: doctorInfo.id || doctorInfo._id,
                name: doctorInfo.name,
                email: doctorInfo.email,
                role: "doctor",
                doctorData: doctorInfo,
              },
              role: "doctor",
            })
          );
        }

        toast.success("Doctor login successful");
        navigate("/doctor-home", { replace: true });
        return;
      }
    } catch {}

    try {
      const session = await authServices.login(data);

      if (session) {
        const userData = await authServices.getCurrentUser();
        if (userData) {
          dispatch(authLogin({ userData, role: "user" }));
        }
        toast.success("Login successful");
        navigate(userData?.role === "admin" ? "/admin" : "/", { replace: true });
        return;
      }
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid md:grid-cols-2 overflow-hidden bg-white">

      <div className="absolute w-80 h-80 bg-green-300 rounded-full blur-3xl opacity-20 top-10 left-10"></div>
      <div className="absolute w-80 h-80 bg-blue-300 rounded-full blur-3xl opacity-20 bottom-10 right-10"></div>

      <div className="hidden md:flex flex-col justify-center px-16 bg-gradient-to-br from-green-600 to-blue-600 text-white relative z-10">
        <h1 className="text-5xl font-extrabold mb-4 leading-tight">
          Welcome Back 👋
        </h1>
        <p className="text-lg opacity-90 mb-8 max-w-md">
          Continue your healthcare journey with secure and seamless access.
        </p>

        <div className="space-y-3 text-sm opacity-90">
          <p>✔ Secure & Encrypted Data</p>
          <p>✔ One-click Appointments</p>
          <p>✔ Trusted by Patients</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 relative z-10">

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">

          <h2 className="text-3xl font-bold text-gray-800 mb-1">
            Sign In
          </h2>
          <p className="text-gray-500 mb-6">
            Login to your HealthHub account
          </p>

          <form onSubmit={handleSubmit(loginUser)} className="space-y-5">

            <div>
              <input
                type="email"
                placeholder="Email Address"
                {...register("email", { required: "Email is required" })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70 focus:ring-2 focus:ring-green-400 focus:shadow-md outline-none transition-all duration-200"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", { required: "Password is required" })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70 focus:ring-2 focus:ring-green-400 focus:shadow-md outline-none transition-all duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-400 hover:text-green-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-semibold bg-gradient-to-r from-green-600 to-blue-600 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition"></span>
              <span className="relative z-10">
                {loading ? "Signing in..." : "Sign In"}
              </span>
            </button>

            <button
              type="button"
              className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Continue with Google
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-green-600 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

