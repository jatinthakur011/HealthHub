import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import docService from "../services/doctors";
import api from "../conf/api";
import maleDoctorImage from "../assets/doc1.jpg";
import femaleDoctorImage from "../assets/femdoc.jpg";

const StarRating = ({ rating, max = 5 }) => (
  <span style={{ display: "inline-flex", gap: "1px" }}>
    {Array.from({ length: max }).map((_, i) => (
      <svg key={i} width="12" height="12" viewBox="0 0 24 24">
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill={i < Math.round(rating) ? "#f59e0b" : "#334155"}
        />
      </svg>
    ))}
  </span>
);

const SPEC_COLORS = {
  dermatolog: { bg: "#422006", color: "#fde68a" },
  neurolog:   { bg: "#2e1065", color: "#c4b5fd" },
  orthoped:   { bg: "#052e16", color: "#86efac" },
  cardiolog:  { bg: "#450a0a", color: "#fca5a5" },
  pediatric:  { bg: "#431407", color: "#fed7aa" },
  psychiatr:  { bg: "#052e16", color: "#6ee7b7" },
  pulmonolog: { bg: "#082f49", color: "#7dd3fc" },
  gynecolog:  { bg: "#500724", color: "#fbcfe8" },
  ophthalmol: { bg: "#022c22", color: "#6ee7b7" },
  dentist:    { bg: "#0c1a2e", color: "#93c5fd" },
  general:    { bg: "#1e293b", color: "#94a3b8" },
  default:    { bg: "#1e1b4b", color: "#a5b4fc" },
};

function getSpecColor(title) {
  const t = (title || "").toLowerCase();
  for (const [k, v] of Object.entries(SPEC_COLORS)) {
    if (t.includes(k)) return v;
  }
  return SPEC_COLORS.default;
}

const SPECIALTY_FILTERS = [
  { value: "", label: "All Specialties" },
  { value: "cardiology",    label: "🫀 Cardiology",    aliases: ["cardiology","cardiologist"] },
  { value: "neurology",     label: "🧠 Neurology",     aliases: ["neurology","neurologist"] },
  { value: "pediatrics",    label: "👶 Pediatrics",    aliases: ["pediatrics","pediatrician","pediatric"] },
  { value: "dentistry",     label: "🦷 Dentistry",     aliases: ["dentistry","dentist","dental"] },
  { value: "ophthalmology", label: "👁️ Ophthalmology", aliases: ["ophthalmology","ophthalmologist","eye"] },
  { value: "gynecology",    label: "🤰 Gynecology",    aliases: ["gynecology","gynecologist","gynaecology"] },
  { value: "orthopedics",   label: "💪 Orthopedics",   aliases: ["orthopedics","orthopedist","orthopedic"] },
  { value: "pulmonology",   label: "🫁 Pulmonology",   aliases: ["pulmonology","pulmonologist","chest"] },
  { value: "dermatology",   label: "🩺 Dermatology",   aliases: ["dermatology","dermatologist","skin"] },
  { value: "psychiatry",    label: "🧘 Psychiatry",    aliases: ["psychiatry","psychiatrist","mental health"] },
  { value: "general",       label: "⚕️ General",       aliases: ["general","general physician","general medicine"] },
];

export default function AllPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filterOption, setFilterOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [doctorRatings, setDoctorRatings] = useState({});
  const [ratingLoading, setRatingLoading] = useState(false);
  const user = useSelector((s) => s.auth.userData);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    docService.getPosts().then((r) => setPosts(r?.documents || []));
    if (!isAdmin) {
      docService.getCurrentDoctor().then(setCurrentDoctor).catch(() => setCurrentDoctor(null));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!posts.length) return;
    let cancelled = false;
    setRatingLoading(true);
    const map = {};
    Promise.all(posts.map(async (p) => {
      try {
        const r = await fetch(`${api.apiBaseUrl}/reviews/doctor/${p._id}/summary`);
        if (!r.ok) return;
        const s = await r.json();
        if (!cancelled) map[p._id] = { averageRating: Number(s?.averageRating || 0), reviewCount: Number(s?.reviewCount || 0) };
      } catch {}
    })).then(() => { if (!cancelled) { setDoctorRatings(map); setRatingLoading(false); } });
    return () => { cancelled = true; };
  }, [posts]);

  const filteredPosts = filterOption || searchTerm
    ? posts.filter((post) => {
        const sf = SPECIALTY_FILTERS.find((x) => x.value === filterOption);
        const pt = (post.title || "").toLowerCase();
        const titleMatch = filterOption
          ? sf?.aliases ? sf.aliases.some((a) => pt.includes(a)) : pt.includes(filterOption)
          : true;
        const nameMatch = searchTerm
          ? post.name.toLowerCase().includes(searchTerm) || pt.includes(searchTerm)
          : true;
        return titleMatch && nameMatch;
      })
    : posts;

  const getDoctorCardImage = (post) => {
    const fb = String(post?.gender || "").toLowerCase() === "female" ? femaleDoctorImage : maleDoctorImage;
    const img = post?.doctorImage;
    if (!img) return fb;
    if (typeof img === "string") {
      if (img.startsWith("http") || img.startsWith("/")) return img;
      return docService.getFilePreview(img);
    }
    if (img?.fileId) return docService.getFilePreview(img.fileId);
    if (img?.url) return `${api.apiBaseUrl.replace("/api", "")}${img.url}`;
    return fb;
  };

  const handleManageBookings = (doctorId) => {
    if (!currentDoctor) { navigate("/doctor-login"); return; }
    if (currentDoctor._id === doctorId || currentDoctor.id === doctorId) navigate(`/doctor-email/${doctorId}`);
    else { alert("Login with correct doctor account"); navigate("/doctor-login"); }
  };

  const activeCount = posts.filter((d) => d.status === "active").length;
  const inactiveCount = posts.filter((d) => d.status === "inactive").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .ap-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 900px 600px at 10% 20%, rgba(99,102,241,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 700px 500px at 85% 60%, rgba(168,85,247,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 600px 400px at 50% 100%, rgba(59,130,246,0.08) 0%, transparent 60%),
            linear-gradient(160deg, #f8fbff 0%, #eef4ff 35%, #f4f0ff 65%, #f9fbff 100%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 26px 20px 52px;
        }

        .ap-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .ap-body {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 18px;
          align-items: start;
        }
        @media(max-width:860px){ .ap-body { grid-template-columns: 1fr; } }

        .ap-sidebar {
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(148,163,184,0.22);
          border-radius: 16px;
          padding: 22px 18px;
          backdrop-filter: blur(20px);
          position: sticky;
          top: 20px;
        }

        .ap-sb-head {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 5px;
        }
        .ap-sb-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .ap-sb-title {
          font-size: 16px; font-weight: 800;
          color: #1e293b; margin: 0; letter-spacing: -0.3px;
        }
        .ap-sb-sub {
          font-size: 12px; color: #64748b;
          line-height: 1.6; margin: 0 0 18px 0;
        }

        .ap-search-wrap { position: relative; margin-bottom: 9px; }
        .ap-search-ic {
          position: absolute; left: 11px; top: 50%;
          transform: translateY(-50%); color: #475569;
          pointer-events: none;
        }
        .ap-search-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(148,163,184,0.30);
          border-radius: 10px;
          padding: 9px 10px 9px 33px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12.5px; color: #0f172a; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .ap-search-input::placeholder { color: #94a3b8; }
        .ap-search-input:focus {
          border-color: rgba(99,102,241,.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }

        .ap-spec-select {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(148,163,184,0.30);
          border-radius: 10px;
          padding: 9px 28px 9px 11px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12.5px; color: #0f172a; outline: none;
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 9px center;
          transition: border-color .2s;
        }
        .ap-spec-select:focus { border-color: rgba(99,102,241,.5); }
        .ap-spec-select option { background: #ffffff; color: #0f172a; }

        .ap-hr { height: 1px; background: rgba(148,163,184,0.25); margin: 15px 0; }
        .ap-filter-ttl {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          color: #334155; margin-bottom: 8px;
        }
        .ap-chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .ap-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 999px;
          font-size: 11px; font-weight: 600;
          border: none; cursor: pointer; transition: opacity .15s;
        }
        .ap-chip:hover { opacity: .7; }
        .chip-blue   { background: rgba(99,102,241,.2); color: #818cf8; }
        .chip-purple { background: rgba(168,85,247,.2); color: #c084fc; }

        .ap-main {}

        .ap-status {
          background: linear-gradient(135deg,
            rgba(99,102,241,.14) 0%,
            rgba(139,92,246,.10) 50%,
            rgba(59,130,246,.12) 100%);
          border: 1px solid rgba(99,102,241,.18);
          border-radius: 16px;
          padding: 18px 22px;
          margin-bottom: 16px;
          backdrop-filter: blur(12px);
          position: relative; overflow: hidden;
        }
        .ap-status::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.025),transparent);
          pointer-events: none;
        }
        .ap-status-ttl {
          font-size: 10px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          color: #6366f1; margin: 0 0 12px;
        }
        .ap-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media(max-width:640px){ .ap-stats-grid { grid-template-columns: repeat(2,1fr); } }
        .ap-stat {
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(148,163,184,0.20);
          border-radius: 11px;
          padding: 12px 14px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
        }
        .ap-stat-num {
          font-size: 24px; font-weight: 800;
          line-height: 1; letter-spacing: -1px;
        }
        .ap-stat-lbl { font-size: 10.5px; color: #475569; font-weight: 500; margin-bottom: 3px; }
        .s-indigo { color: #818cf8; }
        .s-green  { color: #34d399; }
        .s-red    { color: #f87171; }
        .s-amber  { color: #fbbf24; }
        .ap-stat-emoji {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .e-indigo { background: rgba(99,102,241,.18); }
        .e-green  { background: rgba(52,211,153,.12); }
        .e-red    { background: rgba(248,113,113,.12); }
        .e-amber  { background: rgba(251,191,36,.12); }

        .ap-browse-hd {
          display: flex; align-items: baseline; flex-wrap: wrap;
          gap: 10px 20px; margin-bottom: 14px;
        }
        .ap-browse-h { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -.4px; }
        .ap-browse-sub { font-size: 12.5px; color: #64748b; margin: 0; }

        .ap-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media(max-width:1200px){ .ap-grid { grid-template-columns: repeat(3,1fr); } }
        @media(max-width:820px) { .ap-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:460px) { .ap-grid { grid-template-columns: 1fr; } }

        .ap-card {
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(148,163,184,0.18);
          border-radius: 14px;
          overflow: hidden;
          display: flex; flex-direction: column;
          backdrop-filter: blur(10px);
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s;
          animation: fadeUp .35s ease both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .ap-card:hover {
          transform: translateY(-5px);
          border-color: rgba(99,102,241,.45);
          box-shadow: 0 14px 36px rgba(99,102,241,.2), 0 0 0 1px rgba(99,102,241,.12);
        }

        .ap-card-photo {
          position: relative;
          height: 160px;
          overflow: hidden;
          background: linear-gradient(160deg, #dbeafe, #e9d5ff);
          flex-shrink: 0;
        }
        .ap-card-photo img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: top center;
          transition: transform .4s ease;
        }
        .ap-card:hover .ap-card-photo img { transform: scale(1.07); }
        .ap-photo-shade {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(5,5,20,.6) 0%, transparent 50%);
        }

        .ap-avail {
          position: absolute; top: 9px; right: 9px;
          display: flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 999px;
          font-size: 10px; font-weight: 700;
          backdrop-filter: blur(5px);
        }
        .av-on  { background: rgba(16,185,129,.88); color: #fff; }
        .av-off { background: rgba(239,68,68,.88);  color: #fff; }
        .av-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,.8);
          animation: blink 1.5s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }

        .ap-new-tag {
          position: absolute; top: 9px; left: 9px;
          background: linear-gradient(135deg,#f59e0b,#f97316);
          color: #fff; font-size: 9px; font-weight: 800;
          letter-spacing: .1em; text-transform: uppercase;
          padding: 2px 6px; border-radius: 5px;
        }

        .ap-card-body {
          padding: 13px 13px 12px;
          display: flex; flex-direction: column; flex: 1;
        }

        .ap-verified {
          display: flex; align-items: center; gap: 4px;
          font-size: 9px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          color: #6366f1; margin-bottom: 6px;
        }

        .ap-doc-name {
          font-size: 13.5px; font-weight: 800;
          color: #0f172a; margin: 0 0 5px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          display: flex; align-items: center; gap: 4px;
          letter-spacing: -.2px;
        }
        .ap-check {
          width: 14px; height: 14px; border-radius: 50%;
          background: #6366f1; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
        }

        .ap-spec {
          display: inline-block;
          padding: 3px 8px; border-radius: 6px;
          font-size: 10.5px; font-weight: 700;
          margin-bottom: 7px; width: fit-content;
          letter-spacing: .01em;
        }

        .ap-desc {
          font-size: 11.5px; color: #475569;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 9px; flex: 1;
        }

        .ap-rating {
          display: flex; align-items: center; gap: 5px;
          margin-bottom: 10px;
        }
        .ap-rating-txt { font-size: 10.5px; color: #475569; font-weight: 500; }

        .ap-footer {
          display: flex; gap: 6px;
          padding-top: 10px;
          border-top: 1px solid rgba(148,163,184,0.22);
        }

        .ap-btn-main {
          flex: 1; padding: 7px 0;
          border-radius: 8px; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px; font-weight: 700; color: #fff;
          transition: opacity .15s, transform .12s;
        }
        .ap-btn-main:hover { opacity: .85; transform: scale(.97); }
        .btn-active   { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
        .btn-inactive { background: linear-gradient(135deg, #ef4444, #f97316); }

        .ap-btn-book {
          flex: 1; padding: 7px 0;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px; font-weight: 700;
          border: 1.5px solid rgba(52,211,153,.45);
          background: rgba(52,211,153,.08); color: #34d399;
          cursor: pointer; transition: background .15s;
        }
        .ap-btn-book:hover { background: rgba(52,211,153,.16); }

        .ap-empty {
          grid-column: 1/-1; text-align: center; padding: 56px 20px;
        }
        .ap-empty-em { font-size: 46px; margin-bottom: 12px; }
        .ap-empty-h  { font-size: 19px; font-weight: 800; color: #0f172a; margin: 0 0 5px; }
        .ap-empty-s  { font-size: 13px; color: #64748b; margin: 0; }

        .ap-count { margin-top: 20px; text-align: center; font-size: 12px; color: #334155; }
        .ap-count strong { color: #818cf8; font-weight: 700; }
      `}</style>

      <div className="ap-page">
        <div className="ap-container">
          <div className="ap-body">

            <aside className="ap-sidebar">
              <div className="ap-sb-head">
                <div className="ap-sb-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <h1 className="ap-sb-title">Find Doctors</h1>
              </div>
              <p className="ap-sb-sub" style={{ marginTop: "6px" }}>
                Browse verified specialists, compare real patient reviews, and book the doctor that's right for you.
              </p>

              <div className="ap-search-wrap">
                <svg className="ap-search-ic" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                  placeholder="Search by name or specialty..."
                  className="ap-search-input"
                />
              </div>

              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="ap-spec-select"
              >
                {SPECIALTY_FILTERS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {(searchTerm || filterOption) && (
                <>
                  <div className="ap-hr" />
                  <p className="ap-filter-ttl">Active Filters</p>
                  <div className="ap-chips">
                    {searchTerm && (
                      <button className="ap-chip chip-blue" onClick={() => setSearchTerm("")}>
                        {searchTerm} ×
                      </button>
                    )}
                    {filterOption && (
                      <button className="ap-chip chip-purple" onClick={() => setFilterOption("")}>
                        {filterOption} ×
                      </button>
                    )}
                  </div>
                </>
              )}
            </aside>

            <main className="ap-main">

              <div className="ap-status">
                <p className="ap-status-ttl">Status Overview</p>
                <div className="ap-stats-grid">
                  <div className="ap-stat">
                    <div>
                      <p className="ap-stat-lbl">Total Doctors</p>
                      <div className="ap-stat-num s-indigo">{posts.length}</div>
                    </div>
                    <div className="ap-stat-emoji e-indigo">🩺</div>
                  </div>
                  <div className="ap-stat">
                    <div>
                      <p className="ap-stat-lbl">Active</p>
                      <div className="ap-stat-num s-green">{activeCount}</div>
                    </div>
                    <div className="ap-stat-emoji e-green">💚</div>
                  </div>
                  <div className="ap-stat">
                    <div>
                      <p className="ap-stat-lbl">Inactive</p>
                      <div className="ap-stat-num s-red">{inactiveCount}</div>
                    </div>
                    <div className="ap-stat-emoji e-red">🚫</div>
                  </div>
                  <div className="ap-stat">
                    <div>
                      <p className="ap-stat-lbl">Appointments Today</p>
                      <div className="ap-stat-num s-amber">—</div>
                    </div>
                    <div className="ap-stat-emoji e-amber">📅</div>
                  </div>
                </div>
              </div>

              <div className="ap-browse-hd">
                <h2 className="ap-browse-h">Browse Doctors</h2>
                <p className="ap-browse-sub">Verified profiles with ratings, availability, and quick access to detailed doctor pages.</p>
              </div>

              <div className="ap-grid">
                {searchTerm && !filteredPosts.length ? (
                  <div className="ap-empty">
                    <div className="ap-empty-em">🔍</div>
                    <p className="ap-empty-h">No doctors found</p>
                    <p className="ap-empty-s">Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredPosts.map((post, idx) => {
                    const fb = String(post?.gender || "").toLowerCase() === "female" ? femaleDoctorImage : maleDoctorImage;
                    const isInactive = String(post.status || "").toLowerCase() === "inactive";
                    const rating = doctorRatings[post._id];
                    const sc = getSpecColor(post.title);
                    const isMyCard = currentDoctor && (currentDoctor._id === post._id || currentDoctor.id === post._id);

                    return (
                      <div
                        key={post._id}
                        className="ap-card"
                        style={{ animationDelay: `${Math.min(idx * 0.045, 0.4)}s` }}
                      >
                        <div className="ap-card-photo">
                          <img
                            src={getDoctorCardImage(post)}
                            alt={post.name}
                            onError={(e) => { e.currentTarget.src = fb; }}
                          />
                          <div className="ap-photo-shade" />
                          <div className={`ap-avail ${isInactive ? "av-off" : "av-on"}`}>
                            <span className="av-dot" />
                            {isInactive ? "Unavailable" : "Available"}
                          </div>
                        </div>

                        <div className="ap-card-body">
                          <div className="ap-verified">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="#6366f1">
                              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            HealthHub Verified
                          </div>

                          <h2 className="ap-doc-name">
                            Dr. {post.name}
                            {!isInactive && (
                              <span className="ap-check">
                                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </span>
                            )}
                          </h2>

                          <span className="ap-spec" style={{ background: sc.bg, color: sc.color }}>
                            {post.title}
                          </span>

                          <p className="ap-desc">{post.description}</p>

                          <div className="ap-rating">
                            <StarRating rating={rating?.averageRating || 0} />
                            <span className="ap-rating-txt">
                              {rating?.reviewCount > 0
                                ? `${rating.averageRating.toFixed(1)}/5.0 - ${rating.reviewCount} Review${rating.reviewCount !== 1 ? "s" : ""}`
                                : ratingLoading ? "Loading..." : "No reviews yet"}
                            </span>
                          </div>

                          <div className="ap-footer">
                            <Link to={`/doctor/${post._id}`} state={{ post }} style={{ flex: 1, textDecoration: "none" }}>
                              <button className={`ap-btn-main ${isInactive ? "btn-inactive" : "btn-active"}`}>
                                See Profile
                              </button>
                            </Link>
                            {!isAdmin && isMyCard && (
                              <button className="ap-btn-book" onClick={() => handleManageBookings(post._id)}>
                                Bookings
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {filteredPosts.length > 0 && (
                <p className="ap-count">
                  Showing <strong>{filteredPosts.length}</strong> doctor{filteredPosts.length !== 1 ? "s" : ""}
                </p>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
