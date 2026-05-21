import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import docService from "../appwrite/authDoc";
import api from "../conf/api";
import maleDoctorImage from "../assets/doc1.jpg";
import femaleDoctorImage from "../assets/femdoc.jpg";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import reviewServices from "../services/reviews.js";
import { ringCall } from "../services/calls.js";
function BookingFormInline({ onSubmit, onCancel, loading }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) { toast.error("Please select both date and time"); return; }
    onSubmit?.({ date, time, note });
  };

  return (
    <div className="pp-booking-form">
      <div className="pp-bf-header">
        <h3 className="pp-bf-title">Choose Date & Time</h3>
        <button className="pp-bf-close" onClick={onCancel}>×</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="pp-bf-grid">
          <div className="pp-field">
            <label className="pp-label">📅 Date <span style={{color:"#f87171"}}>*</span></label>
            <input type="date" className="pp-input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="pp-field">
            <label className="pp-label">⏰ Time <span style={{color:"#f87171"}}>*</span></label>
            <input type="time" className="pp-input" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>
        <div className="pp-field" style={{ marginTop: "14px" }}>
          <label className="pp-label">📝 Note (optional)</label>
          <textarea className="pp-input pp-textarea" rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe your concern..." />
        </div>
        <div className="pp-bf-actions">
          <button type="button" className="pp-btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button type="submit" className="pp-btn-primary" disabled={loading}>
            {loading ? <span className="pp-spinner" /> : null}
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

function StarRow({ rating, max = 5, interactive = false, onRate }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          width="16" height="16" viewBox="0 0 24 24"
          style={{ cursor: interactive ? "pointer" : "default" }}
          onClick={() => interactive && onRate?.(i + 1)}
        >
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i < Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.15)"}
          />
        </svg>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const [post, setPost] = useState(null);
  const [request, setRequest] = useState();
  const [profileImgSrc, setProfileImgSrc] = useState("");
  const [showInactivePopup, setShowInactivePopup] = useState(false);
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const viewerId = userData?.id || userData?._id || userData?.$id || userData?.userid || userData?.userId || userData?.email;
  const viewerEmail = userData?.email || userData?.userEmail || null;

  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({ reviewCount: 0, averageRating: 0, reviews: [] });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const viewerIdentifiers = useMemo(
    () =>
      [viewerId, viewerEmail]
        .map((value) => String(value || "").trim().toLowerCase())
        .filter(Boolean),
    [viewerId, viewerEmail],
  );

  const doesRequestBelongToViewer = (req) => {
    const requestIdentifiers = [
      req?.userid,
      req?.userEmail,
      req?.email,
    ]
      .map((value) => String(value || "").trim().toLowerCase())
      .filter(Boolean);

    return requestIdentifiers.some((value) => viewerIdentifiers.includes(value));
  };

  const fetchPost = async (forceFresh = false) => {
    try {
      if (!slug) return;
      const statePost = location.state?.post;
      const fetched =
        !forceFresh && statePost && statePost._id === slug
          ? statePost
          : await docService.getPost(slug);
      if (!fetched) { setPost(null); return; }
      setPost(fetched);
      const userRequest = Array.isArray(fetched.requests)
        ? fetched.requests.find((req) => doesRequestBelongToViewer(req))
        : null;
      setRequest(userRequest || null);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load doctor profile");
    }
  };

  useEffect(() => { fetchPost(); }, [slug, navigate, userData]);

  const deletePost = () => {
    if (!post) return;
    docService.deletePost(post._id).then((status) => {
      if (status) { docService.deleteFile(post.doctorImage); navigate("/"); }
    });
  };

  const cancelBooking = async () => {
    try {
      const updatedRequests = (post.requests || []).filter((e) => {
        return !doesRequestBelongToViewer(e);
      });
      await docService.updateRequests(post._id, updatedRequests);
      setRequest(null);
      setShowBookingForm(false);
      setPost((prev) => ({ ...prev, requests: updatedRequests }));
      toast.success("Booking cancelled successfully");
      await fetchPost(true);
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  const doctorId = post?._id || post?.id;
  const requestAccepted = request?.status === "accepted";
  const yearsExperience = post?.experience || (post?.createdAt ? Math.max(0, new Date().getFullYear() - new Date(post.createdAt).getFullYear()) : 0);

  useEffect(() => {
    if (!doctorId) { setReviewSummary({ reviewCount: 0, averageRating: 0, reviews: [] }); return; }
    reviewServices.getDoctorReviewSummary(doctorId)
      .then((data) => setReviewSummary({ reviewCount: Number(data?.reviewCount || 0), averageRating: Number(data?.averageRating || 0), reviews: Array.isArray(data?.reviews) ? data.reviews : [] }))
      .catch(() => setReviewSummary({ reviewCount: 0, averageRating: 0, reviews: [] }));
  }, [doctorId]);

  const canReview = requestAccepted;
  const openReviewForm = () => { setReviewRating(existingReview?.rating || 5); setReviewComment(existingReview?.comment || ""); setReviewFormOpen(true); };

  useEffect(() => {
    if (!doctorId || !viewerEmail || !requestAccepted || !canReview) return;
    setReviewLoading(true);
    reviewServices.getPatientReview(doctorId, viewerEmail)
      .then((data) => { setExistingReview(data?.review || null); setReviewFormOpen(false); })
      .catch(() => {})
      .finally(() => setReviewLoading(false));
  }, [doctorId, viewerEmail, requestAccepted, request?.appointment?.date, canReview]);

  const submitReview = async () => {
    if (!doctorId || !viewerEmail || !reviewRating) return;
    setReviewSubmitting(true);
    try {
      const result = await reviewServices.createReview({ doctorId, patientId: viewerId, patientName: userData?.name || "", patientEmail: viewerEmail, rating: reviewRating, comment: reviewComment });
      setExistingReview(result);
      setReviewFormOpen(false);
      toast.success("Review submitted. Thank you!");
    } catch (e) { toast.error(e?.message || "Failed to submit review"); }
    finally { setReviewSubmitting(false); }
  };

  function parseTimeToMinutes(t) {
    if (!t || typeof t !== "string") return null;
    const m = t.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (!m) return null;
    let hh = parseInt(m[1], 10); const mm = parseInt(m[2], 10); const ampm = m[3];
    if (ampm) { if (ampm.toUpperCase() === "PM" && hh < 12) hh += 12; if (ampm.toUpperCase() === "AM" && hh === 12) hh = 0; }
    return hh * 60 + mm;
  }

  function checkAvailability(str, dateStr, timeStr) {
    if (!str) return true;
    if (/online/i.test(str)) return true;
    const timeMatch = str.match(/(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)/i);
    const daysMap = { mon:1, tue:2, wed:3, thu:4, fri:5, sat:6, sun:0 };
    const daysMatch = str.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:\s*-\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?/i);
    if (daysMatch) {
      const start = daysMatch[1].slice(0,3).toLowerCase(); const end = daysMatch[2]?.slice(0,3).toLowerCase();
      const si = daysMap[start]; const ei = end ? daysMap[end] : si;
      const days = []; for (let i = si;;) { days.push(i); if (i === ei) break; i = (i+1)%7; }
      if (!days.includes(new Date(dateStr+"T00:00:00").getDay())) return false;
    }
    if (timeMatch) {
      const t = parseTimeToMinutes(timeStr); const s = parseTimeToMinutes(timeMatch[1]); const e = parseTimeToMinutes(timeMatch[2]);
      if (t < s || t > e) return false;
    }
    return true;
  }

  const handleBookingSubmit = async (appointmentData) => {
    if (!userData) return;
    if (String(post?.status || "").toLowerCase() === "inactive") { setShowInactivePopup(true); return; }
    if (userData?.role === "doctor") { toast.error("Booking not allowed: you're signed in as a doctor"); return; }
    if (!post) return;
    setBookingLoading(true);
    try {
      let name = userData?.name || ""; let email = userData?.email || "";
      if (!name) { const n = window.prompt("Enter your name", ""); if (n === null) { setBookingLoading(false); return; } name = n.trim(); }
      if (!email) { const e = window.prompt("Enter your email", ""); if (e === null) { setBookingLoading(false); return; } email = e.trim(); }
      if (!email) { toast.error("Email is required"); setBookingLoading(false); return; }
      if (!checkAvailability(post?.availability, appointmentData.date, appointmentData.time)) { toast.error("Selected time is outside availability"); setBookingLoading(false); return; }
      const res = await fetch(`${api.apiBaseUrl}/booking`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorEmail: post.email, userName: name, userEmail: email, doctorName: post.name, appointmentDate: appointmentData.date, appointmentTime: appointmentData.time }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        const nr = json?.request || { name, email, userid: userData.$id || email, status: "pending", appointment: appointmentData, createdAt: new Date().toISOString() };
        setRequest(nr); setShowBookingForm(false);
        setPost((prev) => ({ ...prev, requests: [...(prev?.requests || []), nr] }));
        toast.success("Booking request sent!");
      } else toast.error(json?.message || "Failed to send booking request");
    } catch { toast.error("Error sending booking request"); }
    finally { setBookingLoading(false); }
  };

  const isInactiveDoctor = String(post?.status || "").toLowerCase() === "inactive";
  const localDoctorToken = !!localStorage.getItem("doctor_token") && !userData;
  const isDoctorViewer = (userData && userData.role === "doctor") || localDoctorToken;
  const viewerIsOwner = !!post && ((viewerEmail && viewerEmail === post.email) || (viewerId && post.user_id && post.user_id === viewerId));
  const zoneMismatch = !!post?.zone && !/online/i.test(post.zone) && userData?.zone && post.zone.toLowerCase() !== userData.zone.toLowerCase();
  const canBook = !isDoctorViewer && !viewerIsOwner && !request && !zoneMismatch;

  const getImageUrl = (img, gender) => {
    const fb = String(gender || "").toLowerCase() === "female" ? femaleDoctorImage : maleDoctorImage;
    if (!img) return fb;
    if (typeof img === "string") { if (img.startsWith("http") || img.startsWith("/")) return img; return docService.getFilePreview(img); }
    if (img?.url) return img.url;
    if (img?.fileId) return docService.getFilePreview(img.fileId);
    return fb;
  };

  const fallbackProfileImage = useMemo(() => String(post?.gender || "").toLowerCase() === "female" ? femaleDoctorImage : maleDoctorImage, [post?.gender]);
  useEffect(() => { if (!post) { setProfileImgSrc(""); return; } setProfileImgSrc(getImageUrl(post.doctorImage, post.gender)); }, [post]);
  useEffect(() => { setShowInactivePopup(isInactiveDoctor); }, [isInactiveDoctor]);

  if (!post) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#080b1a,#0f1035,#080b1a)", flexDirection: "column", gap: "12px" }}>
      <p style={{ color: "#94a3b8", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "18px" }}>Doctor not found</p>
      <Link to="/all-doctors" style={{ color: "#818cf8", textDecoration: "none", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>← Back to Doctors</Link>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@400;600;700&display=swap');

        .pp-page {
          --pp-bg-main: #F1F3F6;
          --pp-bg-card: #d8dee7;
          --pp-primary: #5f6fd6;
          --pp-secondary: #4f8fda;
          --pp-accent-orange: #E69D37;
          --pp-accent-red: #C96E6E;
          --pp-accent-green: #4CAF50;
          --pp-text-main: #253041;
          --pp-text-sub: #5d6b7d;
          --pp-border: rgba(255, 255, 255, 0.56);
          --pp-shadow: 0 14px 44px rgba(58, 72, 92, 0.10);
          --pp-surface: rgba(236, 241, 247, 0.92);
          --pp-surface-dark: rgba(243, 247, 251, 0.98);
          --pp-surface-border: rgba(178, 193, 214, 0.82);
          min-height: 100vh;
          background:
            radial-gradient(circle at 10% 10%, rgba(96, 165, 250, 0.12) 0%, transparent 20%),
            radial-gradient(circle at 88% 16%, rgba(129, 140, 248, 0.12) 0%, transparent 22%),
            linear-gradient(180deg, #f8fafd 0%, #eef3f8 46%, #f7fafc 100%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 24px 14px 72px;
          color: var(--pp-text-main);
        }

        .pp-container { max-width: 1320px; margin: 0 auto; }
        @media(max-width:760px){ .pp-page { padding: 18px 12px 58px; } }

        .pp-back {
          display: inline-flex; align-items: center; gap: 7px;
          color: var(--pp-primary); font-size: 13.5px; font-weight: 600;
          text-decoration: none; margin-bottom: 22px;
          padding: 7px 14px; border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid var(--pp-border);
          box-shadow: var(--pp-shadow);
          backdrop-filter: blur(10px);
          transition: background .2s, color .2s, box-shadow .2s;
        }
        .pp-back:hover { background: rgba(255,255,255,0.92); color: var(--pp-secondary); box-shadow: 0 8px 34px rgba(0, 0, 0, 0.07); }

        .pp-hero {
          background: linear-gradient(135deg,
            rgba(241,245,251,0.98) 0%,
            rgba(230,236,245,0.96) 48%,
            rgba(238,242,248,0.98) 100%);
          border: 1px solid rgba(255,255,255,0.78);
          border-radius: 30px;
          padding: 42px 46px;
          margin-bottom: 24px;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 64px rgba(70, 78, 92, 0.14);
          position: relative;
          overflow: hidden;
        }
        .pp-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 520px 260px at 78% 50%, rgba(125,105,217,0.1), transparent),
            linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0));
          pointer-events: none;
        }
        .pp-hero::after {
          content: '';
          position: absolute; right: -60px; top: -60px;
          width: 260px; height: 260px;
          background: rgba(106,126,217,0.10); border-radius: 50%;
          filter: blur(10px);
          pointer-events: none;
        }

        .pp-hero-inner {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 44px;
          align-items: center;
        }
        @media(max-width:700px){ .pp-hero-inner { grid-template-columns: 1fr; text-align: center; } }

        .pp-photo-wrap {
          position: relative; width: 220px; height: 260px; flex-shrink: 0;
        }
        @media(max-width:700px){ .pp-photo-wrap { width: 180px; height: 210px; margin: 0 auto; } }

        .pp-photo-glow {
          position: absolute; inset: -8px;
          background: linear-gradient(135deg, var(--pp-secondary), var(--pp-primary));
          border-radius: 24px; opacity: 0.5; filter: blur(16px);
          animation: glow-pulse 3s ease-in-out infinite alternate;
        }
        @keyframes glow-pulse { from { opacity: 0.4; } to { opacity: 0.7; } }

        .pp-photo {
          position: relative; width: 100%; height: 100%;
          object-fit: cover; object-position: top center;
          border-radius: 20px;
          border: 2px solid rgba(255,255,255,0.86);
          box-shadow: 0 18px 40px rgba(148,163,184,0.26);
        }

        .pp-avail-float {
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 999px;
          font-size: 11px; font-weight: 700;
          backdrop-filter: blur(8px);
          white-space: nowrap;
        }
        .pp-avail-float.on  { background: rgba(16,185,129,0.9); color: #fff; }
        .pp-avail-float.off { background: rgba(239,68,68,0.9);  color: #fff; }
        .pp-avail-float.on  { background: var(--pp-accent-green); color: #fff; }
        .pp-avail-float.off { background: var(--pp-accent-red);  color: #fff; }
        .pp-avail-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.85); animation: blink 1.5s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

        .pp-hero-content {}
        .pp-verified-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: var(--pp-primary); background: rgba(125,105,217,0.08);
          border: 1px solid rgba(125,105,217,0.16);
          border-radius: 6px; padding: 3px 9px; margin-bottom: 10px;
        }

        .pp-doc-name {
          font-family: 'Fraunces', serif;
          font-size: 38px; font-weight: 700;
          color: var(--pp-text-main); margin: 0 0 4px; line-height: 1.1;
          letter-spacing: -0.5px;
        }
        @media(max-width:700px){ .pp-doc-name { font-size: 28px; } }

        .pp-doc-title {
          font-size: 17px; font-weight: 600;
          color: var(--pp-primary); margin: 0 0 16px;
        }

        .pp-meta-pills {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
        }
        @media(max-width:700px){ .pp-meta-pills { justify-content: center; } }

        .pp-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(248,249,251,0.95);
          border: 1px solid rgba(255,255,255,0.54);
          border-radius: 999px; padding: 6px 14px;
          font-size: 13px; font-weight: 600; color: var(--pp-text-main);
          box-shadow: 0 8px 24px rgba(70, 78, 92, 0.07);
        }

        .pp-desc {
          font-size: 14px; color: var(--pp-text-sub); line-height: 1.7;
          margin-bottom: 22px; max-width: 580px;
        }

        .pp-book-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 800;
          border: none; cursor: pointer;
          transition: box-shadow .2s, opacity .2s, border-color .2s, background .2s;
          letter-spacing: .01em;
        }
        .pp-book-btn.active {
          background: linear-gradient(135deg, #ffffff, #eef3fa);
          color: #253041;
          border: 1px solid #cfd8e7;
          box-shadow: 0 14px 30px rgba(70, 78, 92, 0.14);
        }
        .pp-book-btn.active:hover {
          background: linear-gradient(135deg, #ffffff, #f3f6fb);
          border-color: #b8c4d9;
          box-shadow: 0 16px 28px rgba(70, 78, 92, 0.18);
        }
        .pp-book-btn.disabled { background: #e7eaee; color: #8b96a3; cursor: not-allowed; border: 1px solid var(--pp-border); }

        .pp-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }
        @media(max-width:760px){ .pp-info-grid { grid-template-columns: 1fr; } }

        .pp-info-card {
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 24px; padding: 24px 24px;
          box-shadow: 0 18px 34px rgba(60, 72, 88, 0.12);
          position: relative;
          overflow: hidden;
          transition: border-color .25s, box-shadow .25s, background .25s;
        }
        .pp-info-card:hover {
          background: var(--pp-surface-dark);
          border-color: var(--pp-surface-border);
          box-shadow: 0 22px 36px rgba(70, 78, 92, 0.15);
        }
        .pp-info-card:hover .pp-info-icon {
          background: rgba(125,105,217,0.16);
        }

        .pp-info-icon {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 12px;
        }
        .ic-blue   { background: rgba(106,126,217,0.14); }
        .ic-purple { background: rgba(125,105,217,0.14); }
        .ic-teal   { background: rgba(76,175,80,0.12); }

        .pp-info-label {
          font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: var(--pp-text-sub); margin-bottom: 5px;
        }
        .pp-info-value {
          font-size: 14.5px; font-weight: 700; color: var(--pp-text-main);
        }

        .pp-section {
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 28px; padding: 32px 34px;
          margin-bottom: 20px;
          box-shadow: 0 20px 52px rgba(70, 78, 92, 0.12);
          position: relative;
          overflow: hidden;
          transition: box-shadow .25s ease, border-color .25s ease, background .25s ease;
        }
        .pp-section:hover {
          background: var(--pp-surface-dark);
          box-shadow: 0 24px 40px rgba(70, 78, 92, 0.14);
          border-color: var(--pp-surface-border);
        }

        .pp-section-title {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 600;
          color: var(--pp-text-main); margin: 0 0 18px;
          display: flex; align-items: center; gap: 10px;
        }
        .pp-section-title-accent {
          width: 4px; height: 20px;
          background: linear-gradient(to bottom, var(--pp-primary), var(--pp-secondary));
          border-radius: 99px; flex-shrink: 0;
        }

        .pp-services-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        }
        @media(max-width:600px){ .pp-services-grid { grid-template-columns: 1fr; } }

        .pp-service-item {
          display: flex; align-items: center; gap: 10px;
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 12px; padding: 13px 16px;
          font-size: 13.5px; font-weight: 600; color: var(--pp-text-main);
          transition: background .25s, border-color .25s, box-shadow .25s;
        }
        .pp-service-item:hover {
          background: var(--pp-surface-dark);
          border-color: var(--pp-surface-border);
          box-shadow: 0 10px 18px rgba(70, 78, 92, 0.14);
          color: var(--pp-text-main);
        }
        .pp-service-check {
          width: 22px; height: 22px; border-radius: 50%;
          background: linear-gradient(135deg, var(--pp-primary), var(--pp-secondary));
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .pp-accepted-banner {
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 28px; padding: 28px 32px;
          margin-bottom: 20px;
          box-shadow: 0 20px 48px rgba(70, 78, 92, 0.12);
          position: relative;
          overflow: hidden;
          transition: box-shadow .25s ease, border-color .25s ease, background .25s ease;
        }
        .pp-accepted-banner:hover {
          background: var(--pp-surface-dark);
          border-color: var(--pp-surface-border);
          box-shadow: 0 18px 28px rgba(70, 78, 92, 0.16);
        }
        .pp-accepted-banner:hover .pp-accepted-title,
        .pp-accepted-banner:hover .pp-accepted-sub,
        .pp-accepted-banner:hover .pp-accepted-meta { color: var(--pp-text-main); }
        .pp-accepted-banner:hover .pp-accepted-meta {
          background: rgba(255,255,255,0.74);
          border-color: rgba(188,199,217,0.8);
        }
        .pp-accepted-top {
          display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
        }
        .pp-accepted-icon {
          width: 50px; height: 50px; border-radius: 16px;
          background: rgba(76,175,80,0.16);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; flex-shrink: 0;
        }
        .pp-accepted-title {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 600; color: var(--pp-text-main); margin: 0 0 4px;
        }
        .pp-accepted-sub { font-size: 13px; color: var(--pp-text-sub); opacity: .9; margin: 0; }
        .pp-accepted-meta {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.84); border: 1px solid rgba(255,255,255,0.48);
          border-radius: 10px; padding: 8px 14px;
          font-size: 13px; font-weight: 600; color: var(--pp-text-main);
        }

        .pp-action-btns {
          display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px;
        }
        .pp-action-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 20px; border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 700;
          cursor: pointer; border: none;
          transition: transform .22s, opacity .22s, box-shadow .22s, filter .22s;
          text-decoration: none;
        }
        .pp-action-btn:hover {
          transform: none;
          opacity: .96;
          filter: none;
          box-shadow: 0 10px 20px rgba(70, 78, 92, 0.18);
        }
        .btn-chat  { background: linear-gradient(135deg, var(--pp-primary), var(--pp-secondary)); color: #fff; }
        .btn-video { background: linear-gradient(135deg, var(--pp-secondary), var(--pp-primary)); color: #fff; }
        .btn-review-new { background: linear-gradient(135deg, var(--pp-accent-green), #5fc162); color: #fff; }
        .btn-review-upd { background: linear-gradient(135deg, var(--pp-accent-orange), #f0ad4e); color: #fff; }
        .btn-cancel { background: rgba(201,110,110,0.08); border: 1.5px solid rgba(201,110,110,0.45); color: var(--pp-accent-red); }

        .pp-pending-banner {
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 26px; padding: 24px 30px;
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 20px;
          box-shadow: 0 18px 38px rgba(70, 78, 92, 0.11);
          transition: box-shadow .25s ease, border-color .25s ease, background .25s ease;
        }
        .pp-pending-banner:hover {
          background: var(--pp-surface-dark);
          border-color: var(--pp-surface-border);
          box-shadow: 0 14px 24px rgba(70, 78, 92, 0.16);
        }
        .pp-pending-banner:hover .pp-pending-title,
        .pp-pending-banner:hover .pp-pending-sub { color: var(--pp-text-main); }
        .pp-pending-banner:hover .pp-pending-icon { filter: drop-shadow(0 2px 6px rgba(0,0,0,0.16)); }
        .pp-pending-icon { font-size: 32px; flex-shrink: 0; }
        .pp-pending-title { font-size: 16px; font-weight: 700; color: var(--pp-accent-orange); margin: 0 0 4px; }
        .pp-pending-sub { font-size: 12.5px; color: var(--pp-text-sub); margin: 0; }
        .pp-pending-actions { margin-top: 12px; }

        .pp-booking-form {
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 20px; padding: 26px 28px;
          box-shadow: 0 16px 38px rgba(70, 78, 92, 0.14);
          transition: box-shadow .25s ease, border-color .25s ease, background .25s ease;
        }
        .pp-booking-form:hover {
          background: var(--pp-surface-dark);
          border-color: var(--pp-surface-border);
          box-shadow: 0 16px 26px rgba(70, 78, 92, 0.16);
        }
        .pp-booking-form:hover .pp-bf-title,
        .pp-booking-form:hover .pp-label { color: var(--pp-text-main); }
        .pp-booking-form:hover .pp-bf-close {
          background: rgba(255,255,255,0.84);
          border-color: rgba(188,199,217,0.85);
          color: #334155;
        }
        .pp-bf-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px;
        }
        .pp-bf-title { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; color: var(--pp-text-main); margin: 0; }
        .pp-bf-close {
          background: rgba(255,255,255,0.75); border: 1px solid rgba(203,213,225,0.9); color: #64748b;
          width: 28px; height: 28px; border-radius: 50%; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; line-height: 1;
          transition: background .2s;
        }
        .pp-bf-close:hover { background: rgba(255,255,255,0.98); color: #334155; }
        .pp-bf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media(max-width:500px){ .pp-bf-grid { grid-template-columns: 1fr; } }
        .pp-field { display: flex; flex-direction: column; gap: 5px; }
        .pp-label { font-size: 12px; font-weight: 600; color: var(--pp-text-sub); }
        .pp-input {
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 10px; padding: 10px 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; color: var(--pp-text-main); outline: none;
          transition: border-color .2s, box-shadow .2s;
          color-scheme: light;
        }
        .pp-input:focus { border-color: rgba(125,105,217,.45); box-shadow: 0 0 0 3px rgba(125,105,217,.12); }
        .pp-textarea { resize: vertical; min-height: 80px; }
        .pp-bf-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 18px; }

        .pp-btn-outline {
          padding: 9px 18px; border-radius: 10px;
          background: rgba(255,255,255,0.88); border: 1px solid var(--pp-border);
          color: var(--pp-text-sub); font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: border-color .2s, color .2s;
        }
        .pp-btn-outline:hover { border-color: rgba(125,105,217,0.35); color: var(--pp-text-main); }

        .pp-btn-primary {
          padding: 9px 20px; border-radius: 10px;
          background: linear-gradient(135deg, var(--pp-primary), var(--pp-secondary));
          border: none; color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: opacity .2s;
        }
        .pp-btn-primary:hover { opacity: .88; }
        .pp-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

        .pp-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .pp-review-summary {
          display: flex; align-items: center; gap: 20px;
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 14px; padding: 16px 20px;
          margin-bottom: 18px;
        }
        .pp-rating-big {
          font-family: 'Fraunces', serif;
          font-size: 42px; font-weight: 700; color: var(--pp-accent-orange); line-height: 1;
        }
        .pp-rating-out { font-size: 12px; color: var(--pp-text-sub); font-weight: 500; }
        .pp-review-count { font-size: 12px; color: var(--pp-text-sub); margin-top: 3px; }

        .pp-review-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 10px; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
          transition: opacity .15s;
          margin-bottom: 14px;
        }
        .pp-review-btn:hover { opacity: .88; }
        .pp-review-btn.leave { background: linear-gradient(135deg, var(--pp-accent-orange), #f0ad4e); color: #fff; }
        .pp-review-btn.update { background: linear-gradient(135deg, var(--pp-primary), var(--pp-secondary)); color: #fff; }

        .pp-review-form {
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 16px; padding: 22px 24px;
          margin-bottom: 18px;
          box-shadow: 0 16px 34px rgba(70, 78, 92, 0.13);
          transition: box-shadow .25s ease, border-color .25s ease, background .25s ease;
        }
        .pp-review-form:hover {
          background: var(--pp-surface-dark);
          border-color: var(--pp-surface-border);
          box-shadow: 0 16px 26px rgba(70, 78, 92, 0.16);
        }
        .pp-review-form:hover .pp-review-form-title { color: var(--pp-text-main); }
        .pp-review-form-title { font-size: 15px; font-weight: 700; color: var(--pp-text-main); margin: 0 0 14px; }
        .pp-star-row { display: flex; gap: 4px; margin-bottom: 14px; }
        .pp-star {
          font-size: 28px; cursor: pointer; transition: filter .15s;
          filter: grayscale(1); user-select: none;
        }
        .pp-star.lit { filter: grayscale(0); }

        .pp-existing-review {
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 14px; padding: 16px 18px;
          margin-bottom: 14px;
        }
        .pp-er-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--pp-accent-green); margin-bottom: 6px; }
        .pp-er-comment { font-size: 13.5px; color: var(--pp-text-main); font-style: italic; margin: 4px 0 0; }

        .pp-reviews-list { display: flex; flex-direction: column; gap: 12px; }
        .pp-review-card {
          background: var(--pp-surface);
          border: 1px solid var(--pp-surface-border);
          border-radius: 14px; padding: 16px 18px;
          position: relative;
          overflow: hidden;
          transition: border-color .25s, box-shadow .25s, background .25s;
        }
        .pp-review-card:hover {
          background: var(--pp-surface-dark);
          border-color: var(--pp-surface-border);
          box-shadow: 0 12px 22px rgba(70, 78, 92, 0.15);
        }
        .pp-review-card:hover .pp-rev-name,
        .pp-review-card:hover .pp-rev-date,
        .pp-review-card:hover .pp-rev-comment { color: var(--pp-text-main); }
        .pp-review-card:hover polygon[fill="rgba(255,255,255,0.15)"] { fill: rgba(125,105,217,0.28); }

        .btn-chat:hover,
        .btn-video:hover,
        .btn-review-new:hover,
        .btn-review-upd:hover,
        .btn-cancel:hover {
          box-shadow: 0 12px 22px rgba(31, 41, 55, 0.24);
          transform: none;
        }
        .pp-rev-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .pp-rev-name { font-size: 14px; font-weight: 700; color: var(--pp-text-main); }
        .pp-rev-date { font-size: 11px; color: var(--pp-text-sub); }
        .pp-rev-comment { font-size: 13px; color: var(--pp-text-sub); line-height: 1.6; }

        .pp-no-reviews { font-size: 13.5px; color: var(--pp-text-sub); text-align: center; padding: 24px 0; }

        .pp-popup-overlay {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
          padding: 20px;
        }
        .pp-popup {
          background: linear-gradient(160deg, rgba(255,255,255,0.98), rgba(242,244,248,0.96));
          border: 1px solid rgba(255,255,255,0.96);
          border-radius: 24px; padding: 32px; max-width: 420px; width: 100%;
          box-shadow: 0 30px 80px rgba(15,23,42,0.18);
        }
        .pp-popup-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: rgba(239,68,68,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 16px;
        }
        .pp-popup-title { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600; color: #1f1b3d; margin: 0 0 8px; }
        .pp-popup-sub { font-size: 13.5px; color: #64748b; line-height: 1.6; margin: 0 0 22px; }
        .pp-popup-close {
          width: 100%; padding: 12px; border-radius: 12px;
          background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.35);
          color: #f87171; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: background .2s;
        }
        .pp-popup-close:hover { background: rgba(239,68,68,0.3); }

        @media (prefers-reduced-motion: reduce) {
          .pp-info-card,
          .pp-section,
          .pp-service-item,
          .pp-accepted-banner,
          .pp-pending-banner,
          .pp-booking-form,
          .pp-review-form,
          .pp-review-card,
          .pp-action-btn {
            transition: none;
            transform: none !important;
          }
        }
      `}</style>

      <div className="pp-page">
        <div className="pp-container">

          {showInactivePopup && (
            <div className="pp-popup-overlay">
              <div className="pp-popup">
                <div className="pp-popup-icon">🚫</div>
                <h2 className="pp-popup-title">Doctor Unavailable</h2>
                <p className="pp-popup-sub">This doctor is currently inactive. You can view the profile, but bookings and consultations are unavailable right now.</p>
                <button className="pp-popup-close" onClick={() => setShowInactivePopup(false)}>Got it</button>
              </div>
            </div>
          )}

          <Link to="/all-doctors" className="pp-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Doctors
          </Link>

          <div className="pp-hero">
            <div className="pp-hero-inner">

              <div className="pp-photo-wrap">
                <div className="pp-photo-glow" />
                <img
                  src={profileImgSrc}
                  alt={post.name}
                  className="pp-photo"
                  onError={() => setProfileImgSrc(fallbackProfileImage)}
                />
                <div className={`pp-avail-float ${isInactiveDoctor ? "off" : "on"}`}>
                  <span className="pp-avail-dot" />
                  {isInactiveDoctor ? "Unavailable" : "Available Now"}
                </div>
              </div>

              <div className="pp-hero-content">
                <div className="pp-verified-badge">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="#818cf8"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  HealthHub Verified
                </div>

                <h1 className="pp-doc-name">Dr. {post.name}</h1>
                <p className="pp-doc-title">{post.title}</p>

                <div className="pp-meta-pills">
                  <div className="pp-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                    {reviewSummary.reviewCount > 0 ? `${reviewSummary.averageRating.toFixed(1)}/5 · ${reviewSummary.reviewCount} review${reviewSummary.reviewCount !== 1 ? "s" : ""}` : "No reviews yet"}
                  </div>
                  <div className="pp-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {yearsExperience > 0 ? `${yearsExperience}+ Years Exp.` : "Experienced"}
                  </div>
                  {post.zone && (
                    <div className="pp-pill">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {post.zone}
                    </div>
                  )}
                </div>

                <p className="pp-desc">{post.description}</p>

                <button
                  className={`pp-book-btn ${canBook && !isInactiveDoctor ? "active" : "disabled"}`}
                  disabled={!canBook || bookingLoading || isInactiveDoctor}
                  onClick={() => {
                    if (!userData) { navigate("/login?redirect=/doctor/" + slug); return; }
                    if (isInactiveDoctor) { setShowInactivePopup(true); return; }
                    if (canBook) setShowBookingForm(true);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {isInactiveDoctor ? "Doctor Unavailable" : bookingLoading ? "Sending..." : request ? "Appointment Requested" : "Book Appointment Now"}
                </button>
              </div>
            </div>
          </div>

          <div className="pp-info-grid">
            <div className="pp-info-card">
              <div className="pp-info-icon ic-blue">⏰</div>
              <p className="pp-info-label">Availability</p>
              <p className="pp-info-value">{post.availability || "Mon – Fri, 9:00 AM – 5:00 PM"}</p>
            </div>
            <div className="pp-info-card">
              <div className="pp-info-icon ic-purple">📍</div>
              <p className="pp-info-label">Location</p>
              <p className="pp-info-value">{post.zone || "Online Appointments"}</p>
            </div>
            <div className="pp-info-card">
              <div className="pp-info-icon ic-teal">🎓</div>
              <p className="pp-info-label">Specialty</p>
              <p className="pp-info-value">{post.title}</p>
            </div>
          </div>

          <div className="pp-section">
            <h2 className="pp-section-title">
              <span className="pp-section-title-accent" />
              Services Offered
            </h2>
            <div className="pp-services-grid">
              {["In-person Consultation", "Follow-up Visit", "Online Video Session"].map((s) => (
                <div key={s} className="pp-service-item">
                  <div className="pp-service-check">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {showBookingForm && !request && (
            <div style={{ marginBottom: "16px" }}>
              <BookingFormInline onSubmit={handleBookingSubmit} onCancel={() => setShowBookingForm(false)} loading={bookingLoading} />
            </div>
          )}

          {request && requestAccepted && (
            <div className="pp-accepted-banner" style={{ marginBottom: "16px" }}>
              <div className="pp-accepted-top">
                <div className="pp-accepted-icon">✅</div>
                <div>
                  <h3 className="pp-accepted-title">Appointment Confirmed!</h3>
                  <p className="pp-accepted-sub">Your appointment has been accepted by the doctor</p>
                </div>
              </div>
              <div className="pp-accepted-meta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {request?.appointment?.date} at {request?.appointment?.time}
              </div>
              <div className="pp-action-btns">
                <Link to={`/room?doctor_id=${post._id}`} className="pp-action-btn btn-chat">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Chat with Doctor
                </Link>
                <button
                  type="button"
                  className="pp-action-btn btn-video"
                  onClick={async () => {
                    const safeDoc = String(post._id || "doc").replace(/[^a-zA-Z0-9]/g, "");
                    const pid = String(request?.userid || viewerEmail || viewerId || "patient");
                    const safePat = pid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 48);
                    const room = request?.videoRoomId || `HealthHub-${safeDoc}-pat-${safePat}`;
                    try {
                      await ringCall({
                        roomId: room,
                        targetDoctorId: post._id,
                        fromName: userData?.name || "Patient",
                        fromRole: "patient",
                      });
                    } catch (e) {
                      console.warn("Ring notify failed", e);
                    }
                    navigate(`/video/${encodeURIComponent(room)}`);
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  Video Call
                </button>
                <button
                  className={`pp-action-btn ${existingReview ? "btn-review-upd" : "btn-review-new"}`}
                  onClick={openReviewForm}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>
                  {existingReview ? "Update Review" : "Leave Review"}
                </button>
                <button className="pp-action-btn btn-cancel" onClick={cancelBooking}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {request && !requestAccepted && (
            <div className="pp-pending-banner" style={{ marginBottom: "16px" }}>
              <div className="pp-pending-icon">⏳</div>
              <div style={{ flex: 1 }}>
                <p className="pp-pending-title">Appointment Pending Approval</p>
                <p className="pp-pending-sub">Requested for {request?.appointment?.date} at {request?.appointment?.time} — awaiting doctor confirmation.</p>
                <div className="pp-pending-actions">
                  <button className="pp-action-btn btn-cancel" onClick={cancelBooking}>
                    Cancel Request
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pp-section">
            <h2 className="pp-section-title">
              <span className="pp-section-title-accent" />
              Patient Reviews
            </h2>

            {reviewSummary.reviewCount > 0 && (
              <div className="pp-review-summary">
                <div>
                  <div className="pp-rating-big">{reviewSummary.averageRating.toFixed(1)}</div>
                  <div className="pp-rating-out">out of 5</div>
                </div>
                <div>
                  <StarRow rating={reviewSummary.averageRating} />
                  <div className="pp-review-count" style={{ marginTop: "5px" }}>{reviewSummary.reviewCount} review{reviewSummary.reviewCount !== 1 ? "s" : ""}</div>
                </div>
              </div>
            )}

            {existingReview && (
              <div className="pp-existing-review">
                <p className="pp-er-label">✓ Your Review · {existingReview.rating}/5</p>
                <StarRow rating={existingReview.rating} />
                <p className="pp-er-comment">"{existingReview.comment}"</p>
              </div>
            )}

            {canReview && !reviewFormOpen && (
              <button className={`pp-review-btn ${existingReview ? "update" : "leave"}`} onClick={openReviewForm}>
                {existingReview ? "✏️ Update Your Review" : "⭐ Leave a Review"}
              </button>
            )}

            {reviewFormOpen && (
              <div className="pp-review-form">
                <p className="pp-review-form-title">{existingReview ? "Update Your Review" : "Share Your Experience"}</p>
                <div className="pp-star-row">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={`pp-star ${s <= reviewRating ? "lit" : ""}`} onClick={() => setReviewRating(s)}>★</span>
                  ))}
                </div>
                <textarea
                  className="pp-input pp-textarea"
                  style={{ width: "100%", boxSizing: "border-box" }}
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your experience with this doctor..."
                />
                <div className="pp-bf-actions" style={{ marginTop: "14px" }}>
                  <button className="pp-btn-outline" onClick={() => setReviewFormOpen(false)}>Cancel</button>
                  <button className="pp-btn-primary" onClick={submitReview} disabled={reviewSubmitting}>
                    {reviewSubmitting ? <span className="pp-spinner" /> : null}
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            )}

            {reviewSummary.reviews.length > 0 ? (
              <div className="pp-reviews-list" style={{ marginTop: "16px" }}>
                {reviewSummary.reviews.map((rev, idx) => (
                  <div key={`${rev._id}-${idx}`} className="pp-review-card">
                    <div className="pp-rev-top">
                      <div>
                        <p className="pp-rev-name">{rev.patientName || rev.patientEmail?.split("@")[0] || "Patient"}</p>
                        <StarRow rating={rev.rating} />
                      </div>
                      <span className="pp-rev-date">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                    </div>
                    <p className="pp-rev-comment">{rev.comment || "No comment provided."}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="pp-no-reviews">No reviews yet. Be the first to review after your appointment.</p>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

