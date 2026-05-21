import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import VerifiedIcon from "@mui/icons-material/Verified";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InsightsIcon from "@mui/icons-material/Insights";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import docService from "../../services/doctors";
import reviewServices from "../../services/reviews";
import doc1Fallback from "../../assets/doc1.jpg";
import femaleDoctorFallback from "../../assets/femdoc.jpg";

const parseTimeToMinutes = (t) => {
  if (!t || typeof t !== "string") return null;
  const matched = t.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!matched) return null;
  let hh = parseInt(matched[1], 10);
  const mm = parseInt(matched[2], 10);
  const ampm = matched[3];
  if (ampm) {
    if (ampm.toUpperCase() === "PM" && hh < 12) hh += 12;
    if (ampm.toUpperCase() === "AM" && hh === 12) hh = 0;
  }
  return hh * 60 + mm;
};

const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const base = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  const mins = parseTimeToMinutes(timeStr);
  if (mins == null) return base;
  const d = new Date(base);
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return d;
};

const getImageUrl = (doctorImage, fallbackImage) => {
  if (!doctorImage) return fallbackImage;
  if (typeof doctorImage === "string") {
    if (doctorImage.startsWith("http") || doctorImage.startsWith("/")) return doctorImage;
    return docService.getFilePreview(doctorImage);
  }
  if (doctorImage?.url) return doctorImage.url;
  if (doctorImage?.fileId) return docService.getFilePreview(doctorImage.fileId);
  return fallbackImage;
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return "Date not set";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const formatTimeLabel = (timeStr) => {
  if (!timeStr) return "Time not set";
  const mins = parseTimeToMinutes(timeStr);
  if (mins == null) return timeStr;
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  const date = new Date();
  date.setHours(hh, mm, 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

const formatStatus = (status) => {
  const n = String(status || "").toLowerCase();
  if (n === "active") return "Available";
  if (n === "accepted") return "Accepted";
  if (n === "cancelled") return "Cancelled";
  return "Pending";
};

const getReviewTone = (rating) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Very Good";
  if (rating > 0) return "Good";
  return "No reviews yet";
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dh {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    color: #0d1b2a;
    background:
      radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 22%),
      radial-gradient(circle at top right, rgba(99,102,241,0.10), transparent 24%),
      linear-gradient(180deg, #f6fbff 0%, #eef5fb 45%, #f9fbff 100%);
  }

  .dh-spin {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid #dce8f5; border-top-color: #3d52c4;
    animation: dh-rotate 0.75s linear infinite; margin: 0 auto;
  }
  @keyframes dh-rotate { to { transform: rotate(360deg); } }

  @keyframes dh-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .dh-a0 { animation: dh-up 0.5s ease both; }
  .dh-a1 { animation: dh-up 0.5s 0.08s ease both; }
  .dh-a2 { animation: dh-up 0.5s 0.16s ease both; }
  .dh-a3 { animation: dh-up 0.5s 0.24s ease both; }

  .dh-hero {
    background:
      radial-gradient(circle at 78% 18%, rgba(96,165,250,0.18), transparent 24%),
      radial-gradient(circle at 20% 86%, rgba(34,211,238,0.14), transparent 20%),
      linear-gradient(155deg, #081a38 0%, #102754 38%, #133a68 100%);
    padding: 42px 34px 84px;
    position: relative;
    overflow: hidden;
    border-bottom-left-radius: 34px;
    border-bottom-right-radius: 34px;
  }
  .dh-hero::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,130,255,0.12) 0%, transparent 70%);
    top: -200px; right: -100px; pointer-events: none;
  }
  .dh-hero::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
    bottom: -100px; left: 15%; pointer-events: none;
  }
  .dh-hero-inner {
    max-width: 1200px; margin: 0 auto;
    position: relative; z-index: 1;
  }

  .dh-identity {
    display: flex; align-items: flex-start; gap: 28px; flex-wrap: wrap;
  }
  .dh-avatar-wrap {
    position: relative; flex-shrink: 0;
  }
  .dh-avatar {
    width: 120px; height: 136px; border-radius: 24px;
    object-fit: cover; display: block;
    border: 3px solid rgba(255,255,255,0.18);
    box-shadow: 0 14px 38px rgba(0,0,0,0.34);
  }
  .dh-online-dot {
    position: absolute; bottom: 8px; right: -5px;
    width: 16px; height: 16px; border-radius: 50%;
    background: #22d3a0; border: 2.5px solid #162754;
    box-shadow: 0 0 0 3px rgba(34,211,160,0.22);
  }

  .dh-info { flex: 1; min-width: 0; }
  .dh-verified {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 999px;
    font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    background: rgba(34,211,160,0.12); color: #6ee7b7;
    border: 1px solid rgba(34,211,160,0.22); margin-bottom: 10px;
  }
  .dh-name {
    font-size: clamp(26px, 4vw, 38px); font-weight: 800;
    color: #fff; line-height: 1.1; letter-spacing: -0.02em;
  }
  .dh-title {
    font-size: 16px; color: #93c5fd; font-weight: 500; margin-top: 6px;
  }
  .dh-desc {
    font-size: 13.5px; color: #bfd0e4; line-height: 1.75;
    margin-top: 10px; max-width: 500px;
  }
  .dh-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .dh-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 13px; border-radius: 999px; font-size: 12px; font-weight: 600;
    background: rgba(255,255,255,0.08); color: #d7e2f0;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .dh-tag-green { background: rgba(34,211,160,0.10); color: #6ee7b7; border-color: rgba(34,211,160,0.20); }

  .dh-next-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 24px; padding: 22px 24px;
    min-width: 250px; max-width: 300px;
    flex-shrink: 0; align-self: flex-start;
    box-shadow: 0 22px 50px -28px rgba(14,165,233,0.55);
  }
  .dh-next-kicker {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #93c5fd; margin-bottom: 12px;
  }
  .dh-next-mini {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 16px;
  }
  .dh-next-stat {
    background: rgba(255,255,255,0.06); border-radius: 12px;
    padding: 10px 8px; text-align: center;
  }
  .dh-next-stat-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; display: block; margin-bottom: 5px;
  }
  .dh-next-stat-val {
    font-size: 20px; font-weight: 800; color: #fff; display: block;
  }

  .dh-actions-wrap {
    max-width: 1200px; margin: -52px auto 0;
    padding: 0 32px; position: relative; z-index: 10;
  }
  .dh-actions-panel {
    background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(246,250,255,0.98) 100%);
    border-radius: 26px;
    border: 1px solid #d9e8f8;
    box-shadow: 0 26px 60px -24px rgba(13,27,62,0.22);
    padding: 22px 24px;
    display: flex; flex-wrap: wrap; gap: 10px; align-items: stretch;
    backdrop-filter: blur(14px);
  }
  .dh-actions-label {
    width: 100%; font-size: 10px; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase; color: #94a3b8;
    margin-bottom: 2px;
  }
  .dh-action-btn {
    flex: 1 1 130px; min-width: 0;
    display: flex; align-items: center; gap: 11px;
    padding: 14px 16px; border-radius: 18px;
    text-decoration: none; color: inherit;
    border: 1.5px solid #e3edf9;
    background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
    transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s, background 0.18s;
  }
  .dh-action-btn:hover {
    transform: translateY(-2px);
    border-color: #b7d0ff;
    background: linear-gradient(180deg, #ffffff 0%, #f1f7ff 100%);
    box-shadow: 0 18px 34px -18px rgba(61,82,196,0.34);
  }
  .dh-action-icon {
    width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #eef2ff 0%, #dcf4ff 100%); color: #3d52c4;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
  }
  .dh-action-label { font-size: 13.5px; font-weight: 700; color: #0d1b2a; }
  .dh-action-sub   { font-size: 11px; color: #64748b; margin-top: 1px; }

  .dh-body {
    max-width: 1380px; margin: 0 auto;
    padding: 42px 24px 78px;
  }

  .dh-stat-strip {
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px;
    margin-bottom: 28px;
  }
  .dh-stat {
    background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,250,255,0.98) 100%);
    border-radius: 20px;
    border: 1.5px solid #e5edf7;
    padding: 20px 21px;
    box-shadow: 0 14px 34px rgba(13,27,62,0.07);
    position: relative; overflow: hidden;
  }
  .dh-stat::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent);
  }
  .dh-stat-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--accent);
  }
  .dh-stat-value {
    font-size: 34px; font-weight: 800; color: #0d1b2a;
    line-height: 1; margin-top: 6px; letter-spacing: -0.02em;
  }
  .dh-stat-sub {
    font-size: 12px; color: #94a3b8; margin-top: 5px; font-weight: 500;
  }

  .dh-grid { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr); gap: 24px; }

  .dh-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,251,255,0.98) 100%);
    border-radius: 24px;
    border: 1.5px solid #e5edf7;
    box-shadow: 0 14px 34px rgba(13,27,62,0.07);
    overflow: hidden;
  }
  .dh-card-tall { min-height: 100%; }
  .dh-card-head {
    padding: 22px 22px 17px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .dh-card-kicker {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--kicker);
    margin-bottom: 5px;
  }
  .dh-card-title {
    font-size: 17px; font-weight: 800; color: #0d1b2a; letter-spacing: -0.01em;
  }
  .dh-card-badge {
    font-size: 11.5px; font-weight: 700; padding: 4px 12px;
    border-radius: 999px; background: var(--badge-bg); color: var(--badge-text);
    border: 1px solid var(--badge-border); flex-shrink: 0;
  }
  .dh-card-body { padding: 18px 22px 20px; }

  .dh-tl-row {
    display: flex; align-items: center; gap: 14px;
    padding: 13px 15px; border-radius: 16px;
    border: 1.5px solid #edf3fb; background: linear-gradient(180deg,#fbfdff 0%,#f8fbff 100%);
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .dh-tl-row + .dh-tl-row { margin-top: 9px; }
  .dh-tl-row:hover { border-color: #dde4f8; box-shadow: 0 4px 18px -8px rgba(61,82,196,0.14); }
  .dh-tl-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .dh-tl-name { font-size: 13.5px; font-weight: 700; color: #0d1b2a; }
  .dh-tl-meta { font-size: 11.5px; color: #64748b; margin-top: 2px; display: flex; align-items: center; gap: 4px; }
  .dh-tl-status {
    padding: 3px 11px; border-radius: 999px; font-size: 11.5px; font-weight: 700;
    background: var(--s-bg); color: var(--s-text); border: 1px solid var(--s-border);
    flex-shrink: 0;
  }
  .dh-empty {
    padding: 38px 20px; border: 1.5px dashed #d8e5f6; border-radius: 18px;
    text-align: center; font-size: 13px; color: #94a3b8; line-height: 1.6;
    background: linear-gradient(180deg,#fbfdff 0%,#f5f9ff 100%);
  }

  .dh-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
  .dh-info-tile {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px; border-radius: 14px;
    background: var(--tile-bg); border: 1.5px solid var(--tile-border);
  }
  .dh-info-tile-icon {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--tile-icon-bg);
  }
  .dh-info-tile-label { font-size: 10.5px; font-weight: 700; color: #64748b; letter-spacing: 0.06em; text-transform: uppercase; }
  .dh-info-tile-val   { font-size: 13px; font-weight: 600; color: #0d1b2a; margin-top: 3px; line-height: 1.45; }

  .dh-creds {
    display: flex; flex-wrap: wrap; gap: 12px;
    padding: 14px 16px; border-radius: 14px;
    background: #f8faff; border: 1px solid #e8edf6;
    margin-top: 12px;
  }
  .dh-cred {
    display: flex; align-items: center; gap: 10px; flex: 1 1 180px; min-width: 0;
  }
  .dh-cred-icon {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .dh-cred-sub { font-size: 10.5px; font-weight: 700; color: #94a3b8; letter-spacing: 0.06em; text-transform: uppercase; }
  .dh-cred-val { font-size: 13px; font-weight: 600; color: #0d1b2a; margin-top: 2px; word-break: break-word; }

  .dh-rating-hero {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
    border-radius: 16px; padding: 20px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; min-width: 90px;
    box-shadow: 0 12px 32px -16px rgba(49,46,129,0.55);
  }
  .dh-review-item {
    background: #fafbff; border-radius: 14px;
    border: 1.5px solid #eef2ff; padding: 14px 15px;
  }
  .dh-review-item + .dh-review-item { margin-top: 9px; }
  .dh-review-score {
    background: linear-gradient(135deg,#4338ca,#6d28d9);
    color: #fff; border-radius: 8px; padding: 2px 9px;
    font-size: 12px; font-weight: 800;
  }
  .dh-stars { display: flex; gap: 2px; margin-top: 5px; }

  .dh-ring { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
  .dh-ring svg { transform: rotate(-90deg); }
  .dh-ring-inner {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }

  .dh-pulse {
    border-radius: 24px; padding: 28px 30px;
    background:
      radial-gradient(circle at 82% 16%, rgba(125,211,252,0.16), transparent 22%),
      linear-gradient(150deg, #0d2045 0%, #0f3460 50%, #0a2a52 100%);
    position: relative; overflow: hidden;
    box-shadow: 0 24px 56px -22px rgba(13,32,69,0.52);
  }
  .dh-split-stack { display: flex; flex-direction: column; gap: 24px; }
  .dh-pulse::before {
    content: ''; position: absolute;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%);
    top: -100px; right: -80px; pointer-events: none;
  }
  .dh-pulse-inner { position: relative; z-index: 1; }
  .dh-pulse-stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px;
  }
  .dh-pulse-stat {
    background: rgba(255,255,255,0.07); border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.09);
    padding: 14px 14px 12px;
  }
  .dh-pulse-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #7dd3fc; }
  .dh-pulse-val { font-size: 26px; font-weight: 800; color: #fff; margin-top: 5px; letter-spacing: -0.02em; }
  .dh-pulse-sub { font-size: 11px; color: #7dd3fc; margin-top: 2px; }

  .dh-footer-strip {
    background:
      radial-gradient(circle at right top, rgba(96,165,250,0.16), transparent 25%),
      linear-gradient(130deg, #0d1b3e 0%, #162754 100%);
    border-radius: 24px; padding: 24px 30px;
    display: flex; flex-wrap: wrap; align-items: center; gap: 16px;
    justify-content: space-between; margin-top: 24px;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 20px 54px -24px rgba(13,27,62,0.42);
  }
  .dh-footer-cta {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 20px; border-radius: 12px;
    background: #fff; color: #0d1b2a;
    text-decoration: none; font-weight: 700; font-size: 14px;
    flex-shrink: 0; transition: box-shadow 0.18s, transform 0.14s;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }
  .dh-footer-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.28); }

  @media (max-width: 920px) {
    .dh-stat-strip { grid-template-columns: 1fr 1fr; }
    .dh-grid        { grid-template-columns: 1fr; }
    .dh-hero        { padding: 28px 20px 68px; }
    .dh-actions-wrap { padding: 0 20px; }
    .dh-body        { padding: 28px 20px 56px; max-width: 100%; }
    .dh-next-card   { max-width: 100%; min-width: unset; }
  }
  @media (max-width: 580px) {
    .dh-stat-strip { grid-template-columns: 1fr; }
    .dh-info-grid  { grid-template-columns: 1fr; }
    .dh-action-btn { flex: 1 1 100%; }
    .dh-pulse-stats { grid-template-columns: 1fr; }
  }
`;


function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const cfg = {
    accepted: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
    cancelled: { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", dot: "#f43f5e" },
    pending:   { bg: "#fffbeb", text: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  }[s] || { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" };
  return (
    <span
      className="dh-tl-status"
      style={{ "--s-bg": cfg.bg, "--s-text": cfg.text, "--s-border": cfg.border }}
    >
      {formatStatus(status)}
    </span>
  );
}

function TimelineRow({ item, index }) {
  const s = (item?.status || "").toLowerCase();
  const dotColor = { accepted: "#22c55e", cancelled: "#f43f5e", pending: "#f59e0b" }[s] || "#94a3b8";
  return (
    <div className="dh-tl-row" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="dh-tl-dot" style={{ background: dotColor }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dh-tl-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item?.patientName || "Patient consultation"}
        </div>
        <div className="dh-tl-meta">
          <CalendarMonthIcon sx={{ fontSize: 11.5 }} />
          {formatDateLabel(item?.appointment?.date)} · {formatTimeLabel(item?.appointment?.time)}
        </div>
      </div>
      <StatusBadge status={item?.status} />
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="dh-review-item">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0d1b2a" }}>
            {review?.patientName || "Patient"}
          </div>
          <div className="dh-stars">
            {[1,2,3,4,5].map(s => (
              <StarIcon key={s} sx={{ fontSize: 13.5 }} style={{ color: s <= (review?.rating||0) ? "#f59e0b" : "#e2e8f0" }} />
            ))}
          </div>
        </div>
        <span className="dh-review-score">{review?.rating || 0}/5</span>
      </div>
      {review?.comment && (
        <p style={{ margin: "9px 0 0", fontSize: 12.5, color: "#475569", lineHeight: 1.65, fontStyle: "italic" }}>
          "{review.comment}"
        </p>
      )}
    </div>
  );
}

function ActionBtn({ to, icon: Icon, label, sub }) {
  return (
    <Link to={to} className="dh-action-btn">
      <span className="dh-action-icon"><Icon sx={{ fontSize: 20 }} /></span>
      <span style={{ minWidth: 0 }}>
        <div className="dh-action-label">{label}</div>
        <div className="dh-action-sub">{sub}</div>
      </span>
    </Link>
  );
}

export default function DoctorHome() {
  const authData = useSelector((s) => s.auth.userData);
  const [doctor, setDoctor]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [imgSrc, setImgSrc]           = useState("");
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [latestReviews, setLatestReviews] = useState([]);

  const fallback = String(doctor?.gender||"").toLowerCase() === "female" ? femaleDoctorFallback : doc1Fallback;

  useEffect(() => {
    setImgSrc(doctor ? getImageUrl(doctor?.doctorImage, fallback) : "");
  }, [doctor, fallback]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (authData?.doctorData) { setDoctor(authData.doctorData); return; }
        const me = await docService.getCurrentDoctor();
        if (me) setDoctor(me);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [authData]);

  useEffect(() => {
    const id = doctor?._id || doctor?.id;
    if (!id) return;
    (async () => {
      try {
        const s = await reviewServices.getDoctorReviewSummary(id);
        setReviewSummary({ averageRating: s?.averageRating || 0, reviewCount: s?.reviewCount || 0 });
        setLatestReviews(Array.isArray(s?.reviews) ? s.reviews : []);
      } catch (e) { console.error(e); }
    })();
  }, [doctor]);

  const requests  = Array.isArray(doctor?.requests) ? doctor.requests : [];
  const accepted  = useMemo(() => requests.filter(r => (r?.status||"").toLowerCase() === "accepted"), [requests]);
  const pending   = useMemo(() => requests.filter(r => (r?.status||"").toLowerCase() === "pending"),  [requests]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return accepted
      .map(r => ({ ...r, visitAt: parseDateTime(r?.appointment?.date, r?.appointment?.time) }))
      .filter(r => r.visitAt && r.visitAt > now)
      .sort((a,b) => a.visitAt - b.visitAt);
  }, [accepted]);

  const completedBookings = useMemo(() => {
    const now = new Date();
    const list = accepted
      .map(r => ({ ...r, visitAt: parseDateTime(r?.appointment?.date, r?.appointment?.time) }))
      .filter(r => r.visitAt && r.visitAt <= now);
    return list.length ? list : accepted;
  }, [accepted]);

  const nextBooking = upcomingBookings[0] || null;
  const satisfaction = reviewSummary.reviewCount
    ? Math.min(100, Math.round((reviewSummary.averageRating / 5) * 100)) : 0;

  const doctorId = doctor?._id || doctor?.id || "";
  const todayLabel = useMemo(() =>
    new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" }), []);

  const timeline = useMemo(() =>
    [...requests]
      .map(r => ({ ...r, visitAt: parseDateTime(r?.appointment?.date, r?.appointment?.time) }))
      .sort((a,b) => (b.visitAt?.getTime?.()||0) - (a.visitAt?.getTime?.()||0))
      .slice(0, 5),
  [requests]);

  const R = 36; const C = 2 * Math.PI * R;

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0f4f8" }}>
      <div style={{ textAlign:"center" }}>
        <div className="dh-spin" />
        <p style={{ marginTop:14, color:"#64748b", fontFamily:"'Outfit',sans-serif", fontSize:14 }}>Loading dashboard…</p>
      </div>
    </div>
  );

  if (!doctor) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#e11d48", fontFamily:"'Outfit',sans-serif" }}>Please login as a doctor.</p>
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className="dh">

        <div className="dh-hero dh-a0">
          <div className="dh-hero-inner">

              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:24 }}>
                <span style={{ padding:"5px 12px", borderRadius:"999px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.10)", fontSize:10.5, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#bfdbfe" }}>
                  Doctor Command Center
                </span>
                <span style={{ fontSize:13, fontWeight:600, color:"#93c5fd", letterSpacing:"0.02em" }}>
                  {getGreeting()}, Dr. {(doctor?.name||"Doctor").split(/\s+/)[0]}
                </span>
                <span style={{ width:4, height:4, borderRadius:"50%", background:"rgba(255,255,255,0.25)", display:"inline-block" }} />
                <span style={{ fontSize:12, color:"#64748b" }}>{todayLabel}</span>
            </div>

            <div style={{ display:"flex", gap:24, flexWrap:"wrap", alignItems:"flex-start", justifyContent:"space-between" }}>

              <div className="dh-identity" style={{ flex:1, minWidth:0 }}>
                <div className="dh-avatar-wrap">
                  <img
                    src={imgSrc} alt={doctor?.name||"Doctor"}
                    className="dh-avatar"
                    onError={() => setImgSrc(fallback)}
                  />
                  <div className="dh-online-dot" />
                </div>
                <div className="dh-info">
                  <div className="dh-verified">
                    <VerifiedIcon sx={{ fontSize:12 }} /> Verified Doctor
                  </div>
                  <h1 className="dh-name">Dr. {doctor?.name}</h1>
                  <p className="dh-title">{doctor?.title || "Specialist"}</p>
                  {doctor?.description && (
                    <p className="dh-desc">{doctor.description}</p>
                  )}
                  <div className="dh-tags">
                    <span className="dh-tag dh-tag-green">{formatStatus(doctor?.status)}</span>
                    <span className="dh-tag">
                      <AccessTimeIcon sx={{ fontSize:12 }} />
                      {doctor?.availability || "Hours not set"}
                    </span>
                    <span className="dh-tag">
                      <LocationOnIcon sx={{ fontSize:12 }} />
                      {doctor?.zone || "Online"}
                    </span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10, marginTop:18, maxWidth:520 }}>
                    {[
                      { label:"Requests", value: requests.length },
                      { label:"Accepted", value: accepted.length },
                      { label:"Rating", value: reviewSummary.reviewCount ? reviewSummary.averageRating.toFixed(1) : "—" },
                    ].map((item) => (
                      <div key={item.label} style={{ padding:"12px 14px", borderRadius:16, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.10)" }}>
                        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#93c5fd" }}>{item.label}</div>
                        <div style={{ marginTop:6, fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dh-next-card">
                <p className="dh-next-kicker">Next Consultation</p>
                {nextBooking ? (
                  <>
                    <p style={{ fontWeight:800, color:"#fff", fontSize:15, lineHeight:1.2 }}>
                      {nextBooking?.patientName || "Upcoming patient"}
                    </p>
                    <p style={{ fontSize:12.5, color:"#94a3b8", marginTop:6 }}>
                      {formatDateLabel(nextBooking?.appointment?.date)}<br/>
                      {formatTimeLabel(nextBooking?.appointment?.time)}
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize:13, color:"#64748b", lineHeight:1.65 }}>
                    No upcoming visits. Accepted bookings appear here.
                  </p>
                )}
                <div className="dh-next-mini">
                  {[
                    { label:"Pending",  val: pending.length,  color:"#fbbf24" },
                    { label:"Accepted", val: accepted.length, color:"#22d3a0" },
                    { label:"Rating",   val: reviewSummary.reviewCount ? reviewSummary.averageRating.toFixed(1) : "—", color:"#a78bfa" },
                  ].map(({ label, val, color }) => (
                    <div className="dh-next-stat" key={label}>
                      <span className="dh-next-stat-label" style={{ color }}>{label}</span>
                      <span className="dh-next-stat-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="dh-actions-wrap dh-a1">
          <div className="dh-actions-panel">
            <p className="dh-actions-label">Quick actions</p>
            <ActionBtn to={doctorId ? `/doc-ud/${doctorId}` : "/doctor-home"} icon={EditOutlinedIcon}      label="Edit Profile"  sub="Photo, hours & bio" />
            <ActionBtn to="/doctor-dashboard"                                  icon={DashboardOutlinedIcon} label="Requests"      sub="Review new cases"   />
            <ActionBtn to={doctorId ? `/doctor-email/${doctorId}` : "/doctor-home"} icon={MailOutlineIcon} label="Bookings"      sub="Manage appointments" />
            <ActionBtn to="/room"                                              icon={VideocamOutlinedIcon}  label="Consult Room"  sub="Chat and video care"  />
          </div>
        </div>

        <div className="dh-body">

          <div className="dh-stat-strip dh-a1">
            {[
              { label:"Total Requests", value: requests.length,          sub:"All time",          accent:"#3d52c4" },
              { label:"Accepted",       value: accepted.length,          sub:"Confirmed visits",  accent:"#0d9f6e" },
              { label:"Upcoming",       value: upcomingBookings.length,  sub:"Ahead of schedule", accent:"#0284c7" },
              { label:"Avg Rating",     value: reviewSummary.reviewCount ? reviewSummary.averageRating.toFixed(1) : "—",
                sub:`${reviewSummary.reviewCount} review${reviewSummary.reviewCount !== 1 ? "s" : ""}`, accent:"#7c3aed" },
            ].map(({ label, value, sub, accent }) => (
              <div className="dh-stat" key={label} style={{ "--accent": accent }}>
                <div className="dh-stat-label">{label}</div>
                <div className="dh-stat-value">{value}</div>
                <div className="dh-stat-sub">{sub}</div>
              </div>
            ))}
          </div>

          <div className="dh-grid dh-a2" style={{ marginBottom:24 }}>

            <div className="dh-pulse">
              <div className="dh-pulse-inner">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#7dd3fc", marginBottom:6 }}>
                      Practice Pulse
                    </p>
                    <h2 style={{ font:"800 20px/1.2 'Outfit',sans-serif", color:"#fff", letterSpacing:"-0.01em" }}>
                      Today's Snapshot
                    </h2>
                    <p style={{ fontSize:13, color:"#7dd3fc", marginTop:8, lineHeight:1.65, maxWidth:280 }}>
                      Consultation readiness, trust score, and request flow at a glance.
                    </p>
                  </div>
                  <div className="dh-ring">
                    <svg viewBox="0 0 80 80" width={80} height={80}>
                      <defs>
                        <linearGradient id="rGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22d3a0" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                      </defs>
                      <circle cx={40} cy={40} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={7} />
                      <circle
                        cx={40} cy={40} r={R} fill="none"
                        stroke="url(#rGrad)" strokeWidth={7} strokeLinecap="round"
                        strokeDasharray={`${C * satisfaction / 100} ${C}`}
                        transform="rotate(-90 40 40)"
                      />
                    </svg>
                    <div className="dh-ring-inner">
                      <span style={{ fontSize:16, fontWeight:800, color:"#fff" }}>
                        {reviewSummary.reviewCount ? `${satisfaction}%` : "—"}
                      </span>
                      <span style={{ fontSize:8.5, color:"#7dd3fc", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                        Satisf.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="dh-pulse-stats">
                  {[
                    { label:"Upcoming",     val: upcomingBookings.length,  sub:"Ahead" },
                    { label:"Completed",    val: completedBookings.length, sub:"Handled" },
                    { label:"All Requests", val: requests.length,          sub:"Total" },
                  ].map(({ label, val, sub }) => (
                    <div className="dh-pulse-stat" key={label}>
                      <div className="dh-pulse-label">{label}</div>
                      <div className="dh-pulse-val">{val}</div>
                      <div className="dh-pulse-sub">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dh-card dh-card-tall">
              <div className="dh-card-head" style={{ "--kicker":"#d97706", "--badge-bg":"#fffbeb", "--badge-text":"#b45309", "--badge-border":"#fde68a" }}>
                <div>
                  <p className="dh-card-kicker">Booking Activity</p>
                  <p className="dh-card-title">Recent Appointments</p>
                </div>
                <span className="dh-card-badge">{requests.length} total</span>
              </div>
              <div className="dh-card-body">
                {timeline.length ? (
                  timeline.map((item, i) => <TimelineRow key={item?._id || i} item={item} index={i} />)
                ) : (
                  <div className="dh-empty">Appointment activity will appear here once patients send requests.</div>
                )}
              </div>
            </div>

          </div>

          <div className="dh-grid dh-a3">

            <div className="dh-card dh-card-tall">
              <div className="dh-card-head" style={{ "--kicker":"#0284c7", "--badge-bg":"#f0f9ff", "--badge-text":"#0284c7", "--badge-border":"#bae6fd" }}>
                <div>
                  <p className="dh-card-kicker">Practice Information</p>
                  <p className="dh-card-title">Availability & Zone</p>
                </div>
                <span className="dh-card-badge">Essentials</span>
              </div>
              <div className="dh-card-body">
                <div className="dh-info-grid">
                  {[
                    { icon: AccessTimeIcon, label:"Availability", value: doctor?.availability||"Not set",
                      "--tile-bg":"#f0fdf4", "--tile-border":"#bbf7d0", "--tile-icon-bg":"#dcfce7", iconColor:"#16a34a" },
                    { icon: LocationOnIcon, label:"Zone", value: doctor?.zone||"Not set",
                      "--tile-bg":"#f5f3ff", "--tile-border":"#ddd6fe", "--tile-icon-bg":"#ede9fe", iconColor:"#7c3aed" },
                    { icon: VerifiedIcon, label:"Status", value: `${formatStatus(doctor?.status)} — visible to patients`,
                      "--tile-bg":"#eff6ff", "--tile-border":"#bfdbfe", "--tile-icon-bg":"#dbeafe", iconColor:"#1d4ed8" },
                    { icon: InsightsIcon, label:"Review Health", value: getReviewTone(reviewSummary.averageRating),
                      "--tile-bg":"#fffbeb", "--tile-border":"#fde68a", "--tile-icon-bg":"#fef3c7", iconColor:"#d97706" },
                  ].map(({ icon:Icon, label, value, iconColor, ...tileVars }) => (
                    <div className="dh-info-tile" key={label} style={tileVars}>
                      <div className="dh-info-tile-icon" style={{ background: tileVars["--tile-icon-bg"] }}>
                        <Icon sx={{ fontSize:17, color:iconColor }} />
                      </div>
                      <div>
                        <div className="dh-info-tile-label">{label}</div>
                        <div className="dh-info-tile-val">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {(doctor?.email || doctor?.degree) && (
                  <div className="dh-creds">
                    {doctor?.email && (
                      <div className="dh-cred">
                        <span className="dh-cred-icon" style={{ background:"#eef2ff" }}>
                          <EmailOutlinedIcon sx={{ fontSize:18, color:"#3d52c4" }} />
                        </span>
                        <div>
                          <div className="dh-cred-sub">Work Email</div>
                          <div className="dh-cred-val">{doctor.email}</div>
                        </div>
                      </div>
                    )}
                    {doctor?.degree && (
                      <div className="dh-cred">
                        <span className="dh-cred-icon" style={{ background:"#ede9fe" }}>
                          <SchoolOutlinedIcon sx={{ fontSize:18, color:"#7c3aed" }} />
                        </span>
                        <div>
                          <div className="dh-cred-sub">Qualification</div>
                          <div className="dh-cred-val">{doctor.degree}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="dh-split-stack">
            <div className="dh-card" style={{ background:"linear-gradient(180deg,#faf9ff 0%,#fff 100%)" }}>
              <div className="dh-card-head" style={{ "--kicker":"#7c3aed", "--badge-bg":"#f5f3ff", "--badge-text":"#7c3aed", "--badge-border":"#ddd6fe" }}>
                <div>
                  <p className="dh-card-kicker">Patient Reviews</p>
                  <p className="dh-card-title">Feedback Summary</p>
                </div>
                <span className="dh-card-badge">{reviewSummary.reviewCount} total</span>
              </div>
              <div className="dh-card-body">
                <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div className="dh-rating-hero">
                    <TrendingUpIcon sx={{ fontSize:18, color:"#c4b5fd", marginBottom:"6px" }} />
                    <span style={{ fontSize:28, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>
                      {reviewSummary.reviewCount ? reviewSummary.averageRating.toFixed(1) : "—"}
                    </span>
                    <span style={{ fontSize:9, color:"#c4b5fd", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:3, textAlign:"center", lineHeight:1.4 }}>
                      Avg<br/>Rating
                    </span>
                    <span style={{ fontSize:11, color:"#a78bfa", marginTop:8, fontWeight:600 }}>
                      {reviewSummary.reviewCount} review{reviewSummary.reviewCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    {latestReviews.length ? (
                      latestReviews.slice(0,3).map((rv, i) => <ReviewCard key={rv?._id||i} review={rv} />)
                    ) : (
                      <div className="dh-empty">Patient reviews will appear here after consultations.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="dh-card">
              <div className="dh-card-head" style={{ "--kicker":"#0f766e", "--badge-bg":"#ecfeff", "--badge-text":"#0f766e", "--badge-border":"#a5f3fc" }}>
                <div>
                  <p className="dh-card-kicker">Performance Notes</p>
                  <p className="dh-card-title">Growth Snapshot</p>
                </div>
                <span className="dh-card-badge">Live</span>
              </div>
              <div className="dh-card-body">
                <div style={{ display:"grid", gap:12 }}>
                  {[
                    {
                      label: "Conversion",
                      value: requests.length ? `${Math.round((accepted.length / requests.length) * 100)}%` : "0%",
                      sub: "Requests turning into confirmed consultations",
                    },
                    {
                      label: "Patient Trust",
                      value: reviewSummary.reviewCount ? getReviewTone(reviewSummary.averageRating) : "Building",
                      sub: "Based on review score and completed experiences",
                    },
                    {
                      label: "Schedule Readiness",
                      value: doctor?.availability || "Not set",
                      sub: "Keep this updated so patients book at the right time",
                    },
                  ].map((item) => (
                    <div key={item.label} style={{ padding:"15px 16px", borderRadius:16, border:"1.5px solid #e7eef8", background:"linear-gradient(180deg,#fbfdff 0%,#f5f9ff 100%)" }}>
                      <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:"#64748b" }}>{item.label}</div>
                      <div style={{ marginTop:8, fontSize:20, fontWeight:800, color:"#0d1b2a", letterSpacing:"-0.02em" }}>{item.value}</div>
                      <div style={{ marginTop:4, fontSize:12.5, lineHeight:1.6, color:"#64748b" }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>

          </div>

          <div className="dh-footer-strip dh-a3">
            <p style={{ fontSize:14, color:"#94a3b8", lineHeight:1.7, maxWidth:560 }}>
              <strong style={{ color:"#fff", fontWeight:700 }}>Stay visible to patients.</strong>{" "}
              Keep availability and zone accurate so bookings match your schedule. Respond to pending requests from{" "}
              <Link to="/doctor-dashboard" style={{ color:"#93c5fd", fontWeight:700 }}>Requests</Link>{" "}
              to grow your trust and rating over time.
            </p>
            <Link to={doctorId ? `/doc-ud/${doctorId}` : "/doctor-home"} className="dh-footer-cta">
              <EditOutlinedIcon sx={{ fontSize:18 }} />
              Update Profile
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

