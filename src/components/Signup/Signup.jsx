import React, { useState } from "react";
import authServices from "../../appwrite/auth";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../store/authSlice";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const create = async (data) => {
    setLoading(true);
    try {
      const session = await authServices.createAccount(data);
      if (session) {
        const userData = await authServices.getCurrentUser();
        if (userData) dispatch(login({ userData }));
        toast.success("Registration successful");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen grid md:grid-cols-2 overflow-hidden bg-white">

      <div className="absolute w-72 h-72 bg-green-300 rounded-full blur-3xl opacity-30 top-10 left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-30 bottom-10 right-10 animate-pulse"></div>

      <div className="hidden md:flex flex-col justify-center px-16 bg-gradient-to-br from-green-600 to-blue-600 text-white relative z-10">
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Your Health, <br /> Simplified.
        </h1>
        <p className="text-lg opacity-90 mb-6">
          Book appointments, track records, and manage care — all in one place.
        </p>

        <div className="space-y-3 text-sm opacity-90">
          <p>✔ Secure Medical Records</p>
          <p>✔ Easy Doctor Appointments</p>
          <p>✔ 24/7 Health Access</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 relative z-10">

        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-100">

          <h2 className="text-3xl font-bold text-gray-800 mb-1">
            Create Account
          </h2>
          <p className="text-gray-500 mb-6">
            Start your healthcare journey
          </p>

          <form onSubmit={handleSubmit(create)} className="space-y-5">

            <div>
              <input
                type="text"
                placeholder="Full Name"
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:shadow-md outline-none transition-all duration-200"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                {...register("email", {
                  required: "Email is required",
                  validate: {
                    matchPattern: (value) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                      "Invalid email",
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:shadow-md outline-none transition-all duration-200"
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
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Min 6 characters" },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:shadow-md outline-none transition-all duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-400 hover:text-green-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <button
              type="button"
              className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Continue with Google
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
