import React from "react";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import PlaceIcon from "@mui/icons-material/Place";
import PhoneIcon from "@mui/icons-material/Phone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";

export default function ReqCard(props) {
  const name = props.name || props.patientName || "Anonymous";
  const group = props.group || props.bloodGroup || "N/A";
  const location = props.location || props.hospital || "N/A";
  const phno = props.phno || props.contact || "N/A";
  const createdAt =
    props.$createdAt || props.createdAt || new Date().toISOString();
  const type = props.type || "request";
  const status = props.status || "pending";

  const isDonation = type === "donation";
  const isFulfilled = status === "fulfilled";

  return (
    <div
      className={`group relative overflow-hidden rounded-[22px] border border-rose-100/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        isFulfilled ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className="absolute -inset-0.5 -z-10 rounded-[22px] bg-gradient-to-r from-red-200 via-pink-200 to-red-200 opacity-0 blur transition duration-300 group-hover:opacity-15"></div>

      <div
        className={`flex items-start justify-between px-4 py-3 text-white ${
          isDonation
            ? "bg-gradient-to-r from-green-500 to-emerald-500"
            : "bg-gradient-to-r from-red-500 to-rose-500"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-white/15 px-2.5 py-1.5 text-sm font-bold">
            {isDonation ? "DONOR" : "SOS"}
          </div>
          <div>
            <div className="text-lg font-bold leading-tight">
              {isDonation ? "Blood Available" : "Blood Needed"}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/80">
              {isFulfilled ? "Fulfilled case" : "Urgent support"}
            </div>
          </div>
        </div>

        <div className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] opacity-90">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-200 to-pink-200 font-bold text-red-600">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
              Requested by
            </p>
            <div className="text-base font-bold text-gray-800">{name}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/55 p-3">
            <BloodtypeIcon className="text-lg text-red-600" />
            <div>
              <p className="text-xs text-gray-500">Blood Group</p>
              <p className="text-lg font-bold text-gray-800">{group}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/55 p-3">
            <AccessTimeFilledIcon className="text-lg text-amber-600" />
            <div>
              <p className="text-xs text-gray-500">Posted On</p>
              <p className="font-semibold text-gray-800">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/55 p-3">
            <PlaceIcon className="text-lg text-blue-600" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Location</p>
              <p className="truncate font-semibold text-gray-800">{location}</p>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/55 p-3">
            <PhoneIcon className="text-lg text-emerald-600" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Contact</p>
              <a
                href={`tel:${phno}`}
                className="font-semibold text-emerald-700 transition hover:text-emerald-900"
              >
                {phno}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 pb-4 pt-3">
        <button
          className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-300 ${
            isDonation
              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-md"
              : "bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-md"
          }`}
        >
          {isDonation ? "Contact Donor" : "View Request"}
        </button>
      </div>

      {isFulfilled && (
        <div className="absolute right-3 top-3 rounded-full bg-green-500 p-1.5 text-white shadow-md">
          <CheckCircleIcon sx={{ fontSize: 18 }} />
        </div>
      )}
    </div>
  );
}

