import React, { useEffect, useMemo, useState } from "react";
import docService from "../../appwrite/authDoc.js";
import maleDoctorImage from "../../assets/doc1.jpg";
import femaleDoctorImage from "../../assets/femdoc.jpg";
import { Link } from "react-router-dom";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import WorkHistoryRoundedIcon from "@mui/icons-material/WorkHistoryRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";

export default function DocPost({
  _id,
  name,
  title,
  doctorImage,
  gender,
  createdAt,
  averageRating = 0,
  reviewCount = 0,
  ratingLoading = false,
  experience,
  status = "active",
}) {
  const normalizedGender = String(gender || "").toLowerCase();
  const normalizedStatus = String(status || "active").toLowerCase();
  const isInactive = normalizedStatus === "inactive";
  const defaultImage =
    normalizedGender === "female" ? femaleDoctorImage : maleDoctorImage;
  const yearsExperience =
    Number(experience) > 0
      ? Number(experience)
      : createdAt
        ? Math.max(
            0,
            new Date().getFullYear() - new Date(createdAt).getFullYear(),
          )
        : 0;

  const resolvedImage = useMemo(() => {
    if (
      typeof doctorImage === "string" &&
      (doctorImage.startsWith("http") || doctorImage.startsWith("/"))
    ) {
      return doctorImage;
    }

    if (doctorImage) {
      return docService.getFilePreview(doctorImage);
    }

    return defaultImage;
  }, [defaultImage, doctorImage]);

  const [imgSrc, setImgSrc] = useState(resolvedImage);

  useEffect(() => {
    setImgSrc(resolvedImage);
  }, [resolvedImage]);

  return (
    <div className="group relative overflow-hidden rounded-[26px] p-4">
      <div className="absolute inset-x-4 top-0 h-28 rounded-b-[30px] bg-gradient-to-br from-sky-100 via-violet-50 to-fuchsia-100 opacity-90" />

      <div className="relative">
        <div className="relative overflow-hidden rounded-[22px] border border-white/70 shadow-[0_18px_35px_rgba(148,163,184,0.18)]">
          <img
            className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
            src={imgSrc}
            onError={() => setImgSrc(defaultImage)}
            alt={name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/15 via-transparent to-white/10" />
          <span
            className={`absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              isInactive
                ? "bg-red-50/95 text-red-700"
                : "bg-white/88 text-sky-700"
            }`}
          >
            {isInactive ? (
              <FiberManualRecordRoundedIcon sx={{ fontSize: 12 }} />
            ) : (
              <VerifiedRoundedIcon sx={{ fontSize: 16 }} />
            )}
            {isInactive ? "Unavailable" : "Available"}
          </span>
        </div>

        <div className="px-2 pt-5">
          <h2 className="text-xl font-semibold text-slate-800">Dr. {name}</h2>
          <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
            {title || "Specialist doctor ready to help you with better care."}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-3 py-3">
              <div className="flex items-center gap-2 text-amber-500">
                <StarRoundedIcon fontSize="small" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Rating
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {reviewCount > 0
                  ? `${averageRating.toFixed(1)}/5`
                  : ratingLoading
                    ? "Loading..."
                    : "No reviews"}
              </p>
              <p className="text-xs text-slate-500">
                {reviewCount > 0
                  ? `${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
                  : "Real patient feedback"}
              </p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-3 py-3">
              <div className="flex items-center gap-2 text-sky-600">
                <WorkHistoryRoundedIcon fontSize="small" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Experience
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {yearsExperience > 0
                  ? `${yearsExperience}+ years`
                  : "Not added yet"}
              </p>
              <p className="text-xs text-slate-500">
                {yearsExperience > 0
                  ? "Based on current doctor data"
                  : "Add experience in doctor profile"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                HealthHub Care
              </p>
              <p className="text-sm font-medium text-slate-600">
                Trusted Specialist
              </p>
            </div>

            <Link to={`/doctor/${_id}`}>
              <button
                type="button"
                className="rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(99,102,241,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(99,102,241,0.34)]"
              >
                See Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

