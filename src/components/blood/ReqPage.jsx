import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import PlaceIcon from "@mui/icons-material/Place";
import CallIcon from "@mui/icons-material/Call";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import FavoriteIcon from "@mui/icons-material/Favorite";

const COUNTRY_CODES = [
  { label: "India", code: "+91" },
  { label: "United States", code: "+1" },
  { label: "United Kingdom", code: "+44" },
  { label: "Canada", code: "+1" },
  { label: "Australia", code: "+61" },
  { label: "UAE", code: "+971" },
  { label: "Singapore", code: "+65" },
  { label: "Germany", code: "+49" },
];

function ReqPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [donorName, setDonorName] = useState("");
  const [donorPhoneCode, setDonorPhoneCode] = useState("+91");
  const [donorPhone, setDonorPhone] = useState("");
  const [units, setUnits] = useState("");
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/blood/${slug}`);
        if (!res.ok) throw new Error("Failed to load request");
        const data = await res.json();
        setPost(data);
        setDonorName(userData?.name || "");
      } catch (err) {
        toast.error("Error loading request");
      }
    };
    fetchPost();
  }, [slug, userData]);

  const handleDonate = async () => {
    if (!donorName.trim()) return toast.error("Please enter your name");
    if (!/^[0-9]{6,14}$/.test(donorPhone.trim())) {
      return toast.error("Please enter a valid phone number");
    }
    if (!units || Number(units) < 1) {
      return toast.error("Please enter units (minimum 1)");
    }

    const remaining = post.requiredUnits - post.receivedUnits;
    const unitsNum = parseInt(units, 10);

    if (unitsNum > remaining) {
      return toast.error(
        `Cannot donate ${unitsNum} units. Only ${remaining} unit(s) needed!`
      );
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/blood/${slug}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: donorName.trim(),
          donorPhone: `${donorPhoneCode} ${donorPhone.trim()}`,
          bloodGroup: post?.group || post?.bloodGroup,
          units: unitsNum,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.success) {
          toast.success(data.message);
          setTimeout(() => {
            window.history.back();
          }, 1500);
        } else {
          toast.success("Blood donated successfully!");
          setPost(data);
          setDonorName(userData?.name || "");
          setDonorPhoneCode("+91");
          setDonorPhone("");
          setUnits("");
        }
      } else {
        toast.error(data.message || "Donation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while recording donation");
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="rounded-3xl border border-rose-100 bg-white px-8 py-6 text-center shadow-sm">
          Loading blood request...
        </div>
      </div>
    );
  }

  const requiredUnits = Number(post.requiredUnits) || 0;
  const receivedUnits = Number(post.receivedUnits) || 0;
  const remainingUnits = Math.max(requiredUnits - receivedUnits, 0);
  const progressPercent = requiredUnits
    ? Math.min((receivedUnits / requiredUnits) * 100, 100)
    : 0;
  const isCompleted =
    post.status === "completed" ||
    post.status === "fulfilled" ||
    remainingUnits === 0;

  const inputClassName =
    "w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100";

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 px-5 py-8 text-white sm:px-8 sm:py-10">
            <div className="absolute -left-12 top-4 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-200/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Blood Request Details
                </p>
                <h1 className="text-3xl font-bold sm:text-4xl">
                  {post.name || post.patientName}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
                  Review the current need, then submit your donation details so
                  the requester can coordinate with you quickly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                    Blood Group
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {post.group || post.bloodGroup}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                    Status
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {isCompleted ? "Completed" : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-8">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border border-red-100 bg-red-50/70 p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <BloodtypeIcon />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
                    Needed
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {requiredUnits} units
                  </p>
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <FavoriteIcon />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
                    Received
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {receivedUnits} units
                  </p>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-orange-50/80 p-5 sm:col-span-2 xl:col-span-1">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <MonitorHeartIcon />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                    Still Needed
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {remainingUnits} units
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-800">
                    Blood Collection Progress
                  </h2>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                    {receivedUnits} / {requiredUnits} units
                  </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? "bg-gradient-to-r from-emerald-500 to-green-500"
                        : "bg-gradient-to-r from-red-500 to-pink-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {isCompleted
                    ? "This request has already been fulfilled."
                    : `${remainingUnits} more unit(s) are still needed.`}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] border border-blue-100 bg-blue-50/70 p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <PlaceIcon />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
                    Location
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-800">
                    {post.location}
                  </p>
                </div>

                <div className="rounded-[26px] border border-emerald-100 bg-emerald-50/70 p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <CallIcon />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
                    Contact Number
                  </p>
                  <a
                    href={`tel:${post.phno || post.contact}`}
                    className="mt-2 block text-base font-semibold text-emerald-700 transition hover:text-emerald-900"
                  >
                    {post.phno || post.contact}
                  </a>
                </div>
              </div>

              {post.donations && post.donations.length > 0 && (
                <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="text-lg font-bold text-slate-800">
                    Donation History
                  </h3>
                  <div className="mt-4 space-y-3">
                    {post.donations.map((donation, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {donation.donorName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {donation.donorPhone}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-red-600">
                            {donation.units} units
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(donation.donatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {!isCompleted ? (
                <div className="sticky top-6 rounded-[30px] border border-rose-100 bg-white p-5 shadow-[0_18px_50px_rgba(244,63,94,0.12)] sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">
                    Donor Form
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-800">
                    Donate Blood
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Add your details below. The requester will receive your name,
                    international phone number, and the number of units you can donate.
                  </p>

                  <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm text-orange-700">
                    Maximum allowed right now:{" "}
                    <span className="font-semibold">{remainingUnits} unit(s)</span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className={inputClassName}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Mobile Number
                      </label>
                      <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
                        <select
                          value={donorPhoneCode}
                          onChange={(e) => setDonorPhoneCode(e.target.value)}
                          className={inputClassName}
                        >
                          {COUNTRY_CODES.map((item, index) => (
                            <option
                              key={`${item.code}-${item.label}-${index}`}
                              value={item.code}
                            >
                              {item.label} ({item.code})
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={donorPhone}
                          onChange={(e) =>
                            setDonorPhone(e.target.value.replace(/\D/g, ""))
                          }
                          className={inputClassName}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Example: {donorPhoneCode} 9876543210
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Units to Donate
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={remainingUnits}
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                        className={inputClassName}
                        placeholder={`Enter units (max ${remainingUnits})`}
                      />
                    </div>

                    <button
                      onClick={handleDonate}
                      disabled={loading}
                      className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? "Processing..." : "Confirm Donation"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[30px] border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
                  <h3 className="text-2xl font-bold text-emerald-700">
                    Request Fulfilled
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-emerald-700/85">
                    This blood request has already received the needed units. Thank
                    you for being ready to help.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReqPage;

