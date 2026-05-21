import React, { useState } from "react";
import { logoutAll } from "../../store/authSlice";
import authServices from "../../appwrite/auth";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LogoutIcon from "@mui/icons-material/Logout";

function LogoutBtn({ handleClick, userdata, isopen }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const slug =
    Array.isArray(userdata?.labels) && userdata.labels.length
      ? userdata.labels[0]
      : null;

  const logoutHandler = () => {
    setLoading(true);
    authServices.logout().then(() => {
      dispatch(logoutAll());
      handleClick();
      setLoading(false);
    });
  };

  return (
    <div
      id="userAcc"
      className={`absolute right-6 top-[78px] z-30 w-60 origin-top-right transition-all duration-300 ${
        isopen
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <div className="relative rounded-[24px] border border-violet-100/80 bg-gradient-to-br from-white via-violet-50/95 to-sky-50/90 p-3 shadow-[0_22px_55px_rgba(167,139,250,0.2)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/20" />
        <div className="relative space-y-2">
          <div className="px-3 pb-2 pt-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Signed In
            </p>
            <p className="truncate text-sm font-semibold text-slate-700">
              {userdata?.name || "User"}
            </p>
          </div>

          {slug && (
            <Link
              to={`/doctor/${slug}`}
              onClick={handleClick}
              className="flex h-11 w-full items-center justify-between rounded-2xl border border-white/70 bg-white/65 px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              <span>Your account</span>
              <ManageAccountsIcon fontSize="small" />
            </Link>
          )}

          <Link
            to="/"
            onClick={logoutHandler}
            className="flex h-11 w-full items-center justify-between rounded-2xl border border-rose-100/80 bg-gradient-to-r from-rose-50 to-orange-50 px-4 text-sm font-medium text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span>{loading ? "Logging out..." : "Sign out"}</span>
            {!loading && <LogoutIcon fontSize="small" />}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LogoutBtn;

