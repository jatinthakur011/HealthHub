import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TuneIcon from "@mui/icons-material/Tune";
import ClearIcon from "@mui/icons-material/Clear";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import bloodServices from "../../appwrite/blood";
import ReqCard from "./ReqCard";

function AllReq() {
  const [posts, setPosts] = useState([]);
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    if (!posts.length) {
      bloodServices.getMessages([]).then((res) => {
        if (res && Array.isArray(res.documents)) {
          setPosts(res.documents);
          setFilteredPosts(res.documents);
        } else {
          setPosts([]);
          setFilteredPosts([]);
        }
      });
    }
  }, [posts.length]);

  const getFilteredData = () =>
    posts.filter((post) => {
      const groupMatch = bloodGroupFilter
        ? post.group?.toLowerCase().includes(bloodGroupFilter.toLowerCase()) ||
          post.bloodGroup?.toLowerCase().includes(bloodGroupFilter.toLowerCase())
        : true;
      const locationMatch = locationFilter
        ? post.location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
          post.hospital?.toLowerCase().includes(locationFilter.toLowerCase())
        : true;
      return groupMatch && locationMatch;
    });

  const applyFilter = (e) => {
    e.preventDefault();
    setFilteredPosts(getFilteredData());
  };

  useEffect(() => {
    if (posts.length > 0) {
      setFilteredPosts(getFilteredData());
    }
  }, [bloodGroupFilter, locationFilter, posts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/60 via-white to-pink-50/50">
      <div className="mx-6 my-6 overflow-hidden rounded-[28px] border border-rose-100/70 bg-white/70 shadow-[0_14px_40px_rgba(148,163,184,0.12)] backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full border-b border-rose-100 bg-white/85 p-8 backdrop-blur-xl lg:w-[290px] lg:flex-shrink-0 lg:border-b-0 lg:border-r">
            <div className="mb-6 flex items-center gap-2">
              <TuneIcon className="text-red-600 text-2xl" />
              <h1 className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
                Filter Requests
              </h1>
            </div>

            <p className="mb-6 text-sm leading-6 text-slate-500">
              Find urgent blood requests by blood group and location, then open
              the case details to respond quickly.
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/60 p-4 shadow-sm">
                <div className="mb-2 flex min-w-0 items-center gap-2 text-rose-500">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                    <BloodtypeIcon fontSize="small" />
                  </div>
                  <span className="min-w-0 break-words text-[11px] font-semibold uppercase tracking-[0.08em] leading-4">
                    Requests
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{posts.length}</p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/70 p-4 shadow-sm">
                <div className="mb-2 flex min-w-0 items-center gap-2 text-orange-500">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <FmdGoodOutlinedIcon fontSize="small" />
                  </div>
                  <span className="min-w-0 break-words text-[11px] font-semibold uppercase tracking-[0.08em] leading-4">
                    Visible
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {filteredPosts.length}
                </p>
              </div>
            </div>

            <form onSubmit={applyFilter} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Blood Group
                </label>
                <select
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                  className="w-full rounded-2xl border-2 border-rose-100 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <option value="">All Blood Groups</option>
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+ (B Positive)</option>
                  <option value="B-">B- (B Negative)</option>
                  <option value="AB+">AB+ (AB Positive)</option>
                  <option value="AB-">AB- (AB Negative)</option>
                  <option value="O+">O+ (O Positive)</option>
                  <option value="O-">O- (O Negative)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Search city or hospital"
                  className="w-full rounded-2xl border-2 border-rose-100 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 py-3 font-semibold text-white transition duration-300 hover:shadow-md"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBloodGroupFilter("");
                    setLocationFilter("");
                    setFilteredPosts(posts);
                  }}
                  className="flex items-center justify-center rounded-2xl bg-slate-100 p-3 text-gray-600 transition duration-300 hover:bg-slate-200"
                  title="Clear Filters"
                >
                  <ClearIcon />
                </button>
              </div>
            </form>

            {(bloodGroupFilter || locationFilter) && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="mb-3 text-xs font-semibold text-gray-600">
                  Active Filters:
                </p>
                <div className="flex flex-wrap gap-2">
                  {bloodGroupFilter && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                      {bloodGroupFilter}
                      <button
                        onClick={() => setBloodGroupFilter("")}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {locationFilter && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-800">
                      {locationFilter}
                      <button
                        onClick={() => setLocationFilter("")}
                        className="hover:text-pink-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
                  Live Blood Requests
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Review urgent requests, verify location details, and open the
                  case to donate safely.
                </p>
              </div>
            </div>

            {(bloodGroupFilter || locationFilter) && !filteredPosts.length ? (
              <div className="flex h-96 w-full flex-col items-center justify-center">
                <div className="mb-4 text-6xl">🔍</div>
                <p className="mb-2 text-2xl font-semibold text-gray-600">
                  No Requests Found
                </p>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            ) : filteredPosts.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post) => (
                  <Link
                    to={`/blood-req/${post._id || post.$id}`}
                    key={post._id || post.$id}
                    className="transition duration-300 hover:-translate-y-2"
                  >
                    <ReqCard {...post} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex h-96 flex-col items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-red-500"></div>
                <p className="mt-4 text-xl text-gray-600">
                  Loading blood requests...
                </p>
              </div>
            )}

            {filteredPosts.length > 0 && (
              <div className="mt-8 rounded-2xl border border-red-100 bg-white/80 p-4 text-center backdrop-blur-sm">
                <p className="text-gray-700">
                  Showing{" "}
                  <span className="font-bold text-red-600">
                    {filteredPosts.length}
                  </span>{" "}
                  blood request{filteredPosts.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllReq;

