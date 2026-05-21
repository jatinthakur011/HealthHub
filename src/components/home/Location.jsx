import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RADIUS_OPTIONS = [
  { label: "2 km",  value: 2000  },
  { label: "5 km",  value: 5000  },
  { label: "10 km", value: 10000 },
  { label: "15 km", value: 15000 },
];
const SORT_OPTIONS = [
  { label: "Best Rated",    value: "rating"   },
  { label: "Nearest",       value: "distance" },
  { label: "Most Reviewed", value: "reviews"  },
];
const DEFAULT_LAT = 28.6139;
const DEFAULT_LNG = 77.2090;

const getPos = () => new Promise((res, rej) =>
  navigator.geolocation.getCurrentPosition(
    p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
    rej, { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
  )
);

const fetchHospitals = async (lat, lng, r) => {
  const query = `
  [out:json][timeout:25];
  (
    node["amenity"="hospital"](around:${r},${lat},${lng});
    way["amenity"="hospital"](around:${r},${lat},${lng});
    relation["amenity"="hospital"](around:${r},${lat},${lng});

    node["healthcare"="hospital"](around:${r},${lat},${lng});
    node["healthcare"="clinic"](around:${r},${lat},${lng});
    node["healthcare"="doctor"](around:${r},${lat},${lng});
  );
  out center;
  `;

  const res = await fetch(
    `https://overpass-api.de/api/interpreter?nocache=${Date.now()}`,
    {
      method: "POST",
      body: query
    }
  );

  const data = await res.json();

  return data.elements
    .filter(el => el.tags?.name)
    .map(el => {

      const eLat = el.lat || el.center?.lat;
      const eLng = el.lon || el.center?.lon;

      return {
        id: String(el.id),
        name: el.tags.name,
        type: el.tags.amenity || el.tags.healthcare || "hospital",
        address:
          el.tags["addr:full"] ||
          el.tags["addr:street"] ||
          "Address unavailable",

        lat: eLat,
        lng: eLng,
        distance: calcDist(lat, lng, eLat, eLng),
      };
    });
};

const calcDist = (a, b, c, d) => {
  const R = 6371000, dA = ((c-a)*Math.PI)/180, dB = ((d-b)*Math.PI)/180;
  const x = Math.sin(dA/2)**2 + Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dB/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
};
const fmtD  = m => m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(2)} km`;
const walk  = m => `${Math.ceil(m/80)} min`;
const drive = m => `${Math.ceil(m/500)} min`;

const RK = "nearcare_v3";
const allR   = () => { try { return JSON.parse(localStorage.getItem(RK)||"{}"); } catch { return {}; } };
const saveR  = (id, r) => { const a = allR(); a[id] = [r, ...(a[id]||[])]; localStorage.setItem(RK, JSON.stringify(a)); };
const getR   = id => (allR()[id] || []);
const avgR   = id => { const r = getR(id); return r.length ? r.reduce((s,x)=>s+x.rating,0)/r.length : 0; };

const typeInfo = t => ({
  hospital: { label:"Hospital", bg:"#fef3c7", fg:"#92400e", dot:"#f59e0b" },
  clinic:   { label:"Clinic",   bg:"#ede9fe", fg:"#5b21b6", dot:"#8b5cf6" },
  doctors:  { label:"Doctor",   bg:"#dbeafe", fg:"#1e40af", dot:"#3b82f6" },
  doctor:   { label:"Doctor",   bg:"#dbeafe", fg:"#1e40af", dot:"#3b82f6" },
}[t] || { label:"Medical", bg:"#d1fae5", fg:"#065f46", dot:"#10b981" });

function FallbackMap({ status }) {
  const roads = [
    "M0,190 Q150,170 300,190 T600,190",
    "M0,330 Q200,310 300,330 T600,330",
    "M0,470 Q100,455 300,470 T600,470",
    "M190,0 Q210,150 190,300 T190,600",
    "M390,0 Q410,200 390,300 T390,600",
    "M85,0  Q95,150 85,300  T85,600",
  ];
  const blocks = [
    [22,22,130,130],[205,22,148,100],[410,22,158,118],
    [22,205,118,88],[225,205,128,88],[425,205,138,78],
    [22,365,108,68],[215,365,138,78],[415,365,148,68],
    [22,495,118,88],[225,495,138,88],[425,495,148,88],
  ];
  const parks = [[202,132,136,58],[452,132,108,58],[222,293,126,48],[432,360,128,48]];

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", background:"#ecfdf5", overflow:"hidden" }}>
      <svg viewBox="0 0 600 600" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
        <rect width="600" height="600" fill="#ecfdf5"/>
        {Array.from({length:11},(_,i)=>[
          <line key={`h${i}`} x1="0" y1={i*60} x2="600" y2={i*60} stroke="#d1fae5" strokeWidth="1"/>,
          <line key={`v${i}`} x1={i*60} y1="0" x2={i*60} y2="600" stroke="#d1fae5" strokeWidth="1"/>
        ])}
        {blocks.map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#e8f5e9" stroke="#c8e6c9" strokeWidth="0.8"/>)}
        {parks.map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#bbf7d0" stroke="#86efac" strokeWidth="1"/>)}
        {roads.map((d,i)=><path key={i} d={d} stroke="#fff" strokeWidth={i<3?10:7} fill="none" strokeLinecap="round"/>)}
        {roads.map((d,i)=><path key={`c${i}`} d={d} stroke="#e2e8f0" strokeWidth={i<3?1:0.5} fill="none" strokeLinecap="round" strokeDasharray="6,4"/>)}
        <ellipse cx="530" cy="510" rx="68" ry="48" fill="#bfdbfe" opacity="0.65"/>
        <ellipse cx="525" cy="506" rx="60" ry="40" fill="#93c5fd" opacity="0.4"/>
        {[[150,140],[435,265],[122,385],[485,428],[282,485],[340,130],[60,270]].map(([x,y],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill="#ef4444" stroke="#fff" strokeWidth="2" opacity="0.9"/>
            <text x={x} y={y+4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900">+</text>
          </g>
        ))}
        <circle cx="300" cy="300" r="26" fill="rgba(22,163,74,0.1)">
          <animate attributeName="r" from="18" to="42" dur="2.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="2.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="300" cy="300" r="18" fill="rgba(22,163,74,0.18)">
          <animate attributeName="r" from="10" to="26" dur="2.2s" begin="0.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.7" to="0" dur="2.2s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="300" cy="300" r="9" fill="#16a34a" stroke="#fff" strokeWidth="3"/>
      </svg>

      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(236,253,245,0.78)", backdropFilter:"blur(6px)" }}>
        {status === "loading" ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:"54px", height:"54px", borderRadius:"50%", border:"3px solid #bbf7d0", borderTopColor:"#16a34a", animation:"spin 0.9s linear infinite", margin:"0 auto 18px" }}/>
            <p style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontSize:"17px", fontWeight:"700", color:"#166534" }}>Locating you…</p>
            <p style={{ margin:"7px 0 0", fontSize:"13px", color:"#64748b" }}>Please allow location access</p>
          </div>
        ) : status === "error" ? (
          <div style={{ textAlign:"center", padding:"0 28px" }}>
            <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"#fef2f2", border:"2px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", margin:"0 auto 16px" }}>📍</div>
            <p style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontSize:"18px", fontWeight:"800", color:"#991b1b" }}>Location Unavailable</p>
            <p style={{ margin:"9px 0 18px", fontSize:"13px", color:"#64748b", lineHeight:"1.6" }}>
              This is a preview map. Enable location access to find real hospitals near you.
            </p>
            <button onClick={()=>window.location.reload()} style={{ padding:"11px 28px", borderRadius:"28px", border:"none", background:"linear-gradient(135deg,#16a34a,#059669)", color:"#fff", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:"0 4px 14px rgba(22,163,74,0.35)" }}>
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StarPick({ value, onChange, size=30 }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display:"flex", gap:"6px" }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          style={{ cursor:"pointer", transform:`scale(${(hov||value)>=s?1.18:1})`, transition:"transform 0.12s" }}
          fill={(hov||value)>=s?"#f59e0b":"#e2e8f0"}
          onMouseEnter={()=>setHov(s)} onMouseLeave={()=>setHov(0)} onClick={()=>onChange(s)}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </div>
  );
}

function Stars({ rating, size=12 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"2px" }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={rating>0&&s<=Math.round(rating)?"#f59e0b":"#e2e8f0"}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
      <span style={{ fontSize:size+1+"px", color:"#94a3b8", marginLeft:"3px" }}>
        {rating>0 ? rating.toFixed(1) : "—"}
      </span>
    </div>
  );
}

function DistPanel({ hospital, userLoc, onClose, onReview }) {
  const [live, setLive]       = useState(hospital.distance);
  const [tracking, setTracking] = useState(false);
  const wRef = useRef(null);
  useEffect(() => () => { if(wRef.current) navigator.geolocation.clearWatch(wRef.current); }, []);

  const startT = () => {
    setTracking(true);
    wRef.current = navigator.geolocation.watchPosition(
      p => setLive(calcDist(p.coords.latitude, p.coords.longitude, hospital.lat, hospital.lng)),
      () => setTracking(false),
      { enableHighAccuracy:true, maximumAge:2000 }
    );
  };
  const stopT = () => { setTracking(false); if(wRef.current) navigator.geolocation.clearWatch(wRef.current); };

  const pct = Math.min(96, Math.max(4, (1 - live/15000)*100));
  const ti  = typeInfo(hospital.type);
  const avg = avgR(hospital.id);
  const rc  = getR(hospital.id).length;
  const bar = live<500 ? "#10b981" : live<3000 ? "#f59e0b" : "#ef4444";

  const bearing = () => {
    if (!userLoc) return 0;
    const dL = hospital.lng - userLoc.lng;
    const y = Math.sin(dL*Math.PI/180)*Math.cos(hospital.lat*Math.PI/180);
    const x = Math.cos(userLoc.lat*Math.PI/180)*Math.sin(hospital.lat*Math.PI/180)
            - Math.sin(userLoc.lat*Math.PI/180)*Math.cos(hospital.lat*Math.PI/180)*Math.cos(dL*Math.PI/180);
    return ((Math.atan2(y,x)*180/Math.PI)+360)%360;
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.52)",zIndex:9998,backdropFilter:"blur(5px)" }}/>
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"min(560px,100vw)",background:"#fff",borderRadius:"28px 28px 0 0",zIndex:9999,overflow:"hidden",boxShadow:"0 -14px 60px rgba(0,0,0,0.24)",animation:"slideUp 0.38s cubic-bezier(0.34,1.4,0.64,1)",fontFamily:"'Outfit',sans-serif" }}>
        <div style={{ display:"flex",justifyContent:"center",paddingTop:"13px" }}>
          <div style={{ width:"44px",height:"4px",borderRadius:"2px",background:"#e2e8f0" }}/>
        </div>

        <div style={{ background:"linear-gradient(145deg,#052e16 0%,#14532d 55%,#166534 100%)",padding:"20px 24px 24px",position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute",top:"16px",right:"16px",background:"rgba(255,255,255,0.14)",border:"none",borderRadius:"50%",width:"32px",height:"32px",color:"#fff",fontSize:"19px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>

          <div style={{ display:"flex",gap:"7px",marginBottom:"11px",flexWrap:"wrap" }}>
            <span style={{ fontSize:"11px",fontWeight:"700",background:ti.bg,color:ti.fg,borderRadius:"6px",padding:"2px 9px",letterSpacing:"0.3px" }}>{ti.label}</span>
            {hospital.emergency && <span style={{ fontSize:"11px",fontWeight:"700",background:"#fee2e2",color:"#b91c1c",borderRadius:"6px",padding:"2px 9px" }}>⚡ 24/7</span>}
            {tracking && <span style={{ fontSize:"11px",fontWeight:"700",background:"rgba(16,185,129,0.2)",color:"#6ee7b7",borderRadius:"6px",padding:"2px 9px",display:"flex",alignItems:"center",gap:"4px" }}><span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#10b981",display:"inline-block",animation:"pulse 1s infinite" }}/>Live</span>}
          </div>

          <h2 style={{ margin:"0 0 4px",fontSize:"22px",fontWeight:"900",color:"#fff",lineHeight:1.15,letterSpacing:"-0.3px" }}>{hospital.name}</h2>
          <p style={{ margin:"0 0 18px",fontSize:"13px",color:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",gap:"5px" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {hospital.address}
          </p>

          <div style={{ display:"grid",gridTemplateColumns:`repeat(${[hospital.phone,hospital.website,true,true].filter(Boolean).length},1fr)`,gap:"8px" }}>
            {hospital.phone && (
              <a href={`tel:${hospital.phone}`} style={{ background:"rgba(255,255,255,0.13)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"13px",padding:"11px 4px",textAlign:"center",color:"#fff",textDecoration:"none",fontSize:"12px",fontWeight:"600",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px" }}>
                <span style={{ fontSize:"20px" }}>📞</span>Call
              </a>
            )}
            {hospital.website && (
              <a href={hospital.website} target="_blank" rel="noreferrer" style={{ background:"rgba(255,255,255,0.13)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"13px",padding:"11px 4px",textAlign:"center",color:"#fff",textDecoration:"none",fontSize:"12px",fontWeight:"600",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px" }}>
                <span style={{ fontSize:"20px" }}>🌐</span>Web
              </a>
            )}
            <button onClick={onReview} style={{ background:"rgba(255,255,255,0.13)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"13px",padding:"11px 4px",color:"#fff",fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px" }}>
              <span style={{ fontSize:"20px" }}>⭐</span>{rc>0?`${rc} Reviews`:"Review"}
            </button>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`} target="_blank" rel="noreferrer"
              style={{ background:"#16a34a",border:"none",borderRadius:"13px",padding:"11px 4px",textAlign:"center",color:"#fff",textDecoration:"none",fontSize:"12px",fontWeight:"700",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px" }}>
              <span style={{ fontSize:"20px" }}>🗺️</span>Navigate
            </a>
          </div>
        </div>

        <div style={{ padding:"22px 24px 26px" }}>
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"18px" }}>
            <div>
              <p style={{ margin:"0 0 3px",fontSize:"11px",fontWeight:"700",color:tracking?"#16a34a":"#94a3b8",textTransform:"uppercase",letterSpacing:"0.7px",display:"flex",alignItems:"center",gap:"5px" }}>
                {tracking && <span style={{ width:"7px",height:"7px",borderRadius:"50%",background:"#16a34a",display:"inline-block",animation:"pulse 1s infinite" }}/>}
                {tracking ? "Live Distance" : "Distance from you"}
              </p>
              <div style={{ display:"flex",alignItems:"baseline",gap:"7px" }}>
                <span style={{ fontSize:"56px",fontWeight:"900",color:"#0f172a",lineHeight:1,letterSpacing:"-2.5px",transition:"all 0.4s ease",fontFamily:"'Outfit',sans-serif" }}>
                  {live<1000 ? Math.round(live) : (live/1000).toFixed(2)}
                </span>
                <span style={{ fontSize:"22px",fontWeight:"600",color:"#64748b" }}>{live<1000?"m":"km"}</span>
              </div>
            </div>
            <div style={{ position:"relative",width:"72px",height:"72px",flexShrink:0 }}>
              <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"linear-gradient(145deg,#f0fdf4,#dcfce7)",border:"2px solid #bbf7d0",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <div style={{ fontSize:"24px",transform:`rotate(${bearing()}deg)`,transition:"transform 0.7s ease",lineHeight:1 }}>➤</div>
              </div>
              {[["N","top","50%","translateX(-50%)","#16a34a"],["S","bottom","50%","translateX(-50%)","#94a3b8"],["W","left","50%","translateY(-50%)","#94a3b8"],["E","right","50%","translateY(-50%)","#94a3b8"]].map(([l,side,off,tr,c])=>(
                <div key={l} style={{ position:"absolute",[side]:"4px",left:["N","S"].includes(l)?off:undefined,top:["W","E"].includes(l)?off:undefined,transform:tr,fontSize:"8px",fontWeight:"900",color:c,letterSpacing:"0.5px" }}>{l}</div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:"18px" }}>
            <div style={{ height:"10px",background:"#f1f5f9",borderRadius:"5px",overflow:"hidden",position:"relative" }}>
              <div style={{ height:"100%",width:`${pct}%`,background:bar,borderRadius:"5px",transition:"width 0.7s ease,background 0.7s ease",boxShadow:`0 0 10px ${bar}70` }}/>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",marginTop:"5px" }}>
              <span style={{ fontSize:"10px",color:"#94a3b8",display:"flex",alignItems:"center",gap:"3px" }}>
                <span style={{ width:"7px",height:"7px",borderRadius:"50%",background:"#2563eb",display:"inline-block" }}/>You
              </span>
              <span style={{ fontSize:"10px",color:"#94a3b8",display:"flex",alignItems:"center",gap:"3px" }}>
                {hospital.name.split(" ")[0]}
                <span style={{ width:"7px",height:"7px",borderRadius:"50%",background:"#16a34a",display:"inline-block" }}/>
              </span>
            </div>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"20px" }}>
            {[
              { icon:"🚶", label:"Walk",  val:walk(live),  bg:"#f0fdf4", fg:"#166534", sub:"on foot" },
              { icon:"🚗", label:"Drive", val:drive(live), bg:"#eff6ff", fg:"#1e40af", sub:"by car"  },
              { icon:"📏", label:"Exact", val:fmtD(live),  bg:"#faf5ff", fg:"#6b21a8", sub:"direct"  },
            ].map(t => (
              <div key={t.label} style={{ background:t.bg, borderRadius:"16px", padding:"14px 10px", textAlign:"center", transition:"transform 0.2s" }}>
                <div style={{ fontSize:"24px", marginBottom:"5px" }}>{t.icon}</div>
                <div style={{ fontSize:"15px", fontWeight:"800", color:t.fg, letterSpacing:"-0.3px", fontFamily:"'Outfit',sans-serif" }}>{t.val}</div>
                <div style={{ fontSize:"10px", color:"#9ca3af", marginTop:"2px", fontWeight:"600" }}>{t.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <Stars rating={avg} size={15}/>
              <p style={{ margin:"3px 0 0", fontSize:"11px", color:"#9ca3af" }}>{rc} review{rc!==1?"s":""}</p>
            </div>
            <button onClick={tracking?stopT:startT} style={{ padding:"12px 22px", borderRadius:"30px", border:"none", background:tracking?"linear-gradient(135deg,#dc2626,#ef4444)":"linear-gradient(135deg,#16a34a,#059669)", color:"#fff", fontSize:"13.5px", fontWeight:"800", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", boxShadow:tracking?"0 5px 16px rgba(220,38,38,0.38)":"0 5px 16px rgba(22,163,74,0.38)", transition:"all 0.2s", fontFamily:"'Outfit',sans-serif" }}>
              {tracking
                ? <><span style={{ width:"9px",height:"9px",borderRadius:"50%",background:"#fff",animation:"pulse 1s infinite" }}/> Stop Live</>
                : <><span style={{ fontSize:"18px" }}>📡</span> Track Live</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ReviewModal({ hospital, onClose, onSaved }) {
  const [tab, setTab]         = useState("write");
  const [rating, setRating]   = useState(0);
  const [name, setName]       = useState("");
  const [comment, setComment] = useState("");
  const [err, setErr]         = useState("");
  const reviews = getR(hospital.id);
  const avg     = avgR(hospital.id);

  const submit = () => {
    if (!rating)        { setErr("Please pick a star rating."); return; }
    if (!name.trim())   { setErr("Please enter your name."); return; }
    if (!comment.trim()){ setErr("Please write a comment."); return; }
    setErr("");
    saveR(hospital.id, { rating, name:name.trim(), comment:comment.trim(), date:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) });
    onSaved(); setTab("read");
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.52)",zIndex:9998,backdropFilter:"blur(5px)" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#fff",borderRadius:"24px",width:"min(500px,95vw)",maxHeight:"88vh",display:"flex",flexDirection:"column",zIndex:9999,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.26)",fontFamily:"'Outfit',sans-serif",animation:"fadeIn 0.25s ease" }}>
        <div style={{ background:"linear-gradient(145deg,#052e16,#166534)",padding:"22px 22px 16px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div>
              <h2 style={{ margin:"0 0 5px",fontSize:"18px",fontWeight:"900",color:"#fff",letterSpacing:"-0.3px" }}>{hospital.name}</h2>
              <Stars rating={avg} size={13}/>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:"32px",height:"32px",color:"#fff",fontSize:"19px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
          </div>
          <div style={{ display:"flex",gap:"8px",marginTop:"16px" }}>
            {[{id:"write",label:"✍️ Write"},{id:"read",label:`📋 Reviews (${reviews.length})`}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"7px 18px",borderRadius:"22px",border:"none",background:tab===t.id?"#fff":"rgba(255,255,255,0.15)",color:tab===t.id?"#166534":"#fff",fontSize:"12.5px",fontWeight:"700",cursor:"pointer",transition:"all 0.15s",fontFamily:"'Outfit',sans-serif" }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ flex:1,overflowY:"auto",padding:"22px" }}>
          {tab==="write" && (
            <div style={{ display:"flex",flexDirection:"column",gap:"18px" }}>
              <div>
                <label style={{ fontSize:"11px",fontWeight:"800",color:"#374151",display:"block",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.6px" }}>Your Rating *</label>
                <StarPick value={rating} onChange={setRating} size={34}/>
                {rating>0&&<p style={{ margin:"8px 0 0",fontSize:"13px",color:"#16a34a",fontWeight:"700" }}>{["","Poor 😞","Fair 😐","Good 🙂","Great 😊","Excellent 🌟"][rating]}</p>}
              </div>
              <div>
                <label style={{ fontSize:"11px",fontWeight:"800",color:"#374151",display:"block",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.6px" }}>Your Name *</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={name} onChange={e=>setName(e.target.value)}
                  style={{ width:"100%",padding:"12px 14px",borderRadius:"12px",border:"1.5px solid #e2e8f0",fontSize:"14px",outline:"none",fontFamily:"'Outfit',sans-serif",boxSizing:"border-box",transition:"border 0.15s" }}
                  onFocus={e=>e.target.style.borderColor="#16a34a"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
              </div>
              <div>
                <label style={{ fontSize:"11px",fontWeight:"800",color:"#374151",display:"block",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.6px" }}>Your Review *</label>
                <textarea placeholder="Staff, wait time, cleanliness, facilities…" value={comment} onChange={e=>setComment(e.target.value)} rows={4}
                  style={{ width:"100%",padding:"12px 14px",borderRadius:"12px",border:"1.5px solid #e2e8f0",fontSize:"14px",outline:"none",resize:"vertical",fontFamily:"'Outfit',sans-serif",boxSizing:"border-box",lineHeight:"1.6",transition:"border 0.15s" }}
                  onFocus={e=>e.target.style.borderColor="#16a34a"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                <p style={{ margin:"4px 0 0",fontSize:"11px",color:"#9ca3af" }}>{comment.length}/500</p>
              </div>
              {err && <div style={{ background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"10px",padding:"11px 14px",fontSize:"13px",color:"#dc2626" }}>⚠️ {err}</div>}
              <button onClick={submit} style={{ padding:"14px",borderRadius:"14px",border:"none",background:"linear-gradient(135deg,#16a34a,#059669)",color:"#fff",fontSize:"15px",fontWeight:"800",cursor:"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:"0 5px 16px rgba(22,163,74,0.35)" }}>
                Submit Review ✓
              </button>
            </div>
          )}
          {tab==="read" && (
            reviews.length===0 ? (
              <div style={{ textAlign:"center",padding:"36px 0" }}>
                <div style={{ fontSize:"42px",marginBottom:"12px" }}>💬</div>
                <p style={{ color:"#94a3b8",fontSize:"14px",fontWeight:"500" }}>No reviews yet.</p>
                <button onClick={()=>setTab("write")} style={{ marginTop:"12px",padding:"10px 24px",borderRadius:"24px",border:"none",background:"#16a34a",color:"#fff",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"'Outfit',sans-serif" }}>Be the First</button>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
                <div style={{ background:"#f0fdf4",borderRadius:"14px",padding:"14px 16px",display:"flex",alignItems:"center",gap:"16px",border:"1px solid #bbf7d0" }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"36px",fontWeight:"900",color:"#16a34a",lineHeight:1,fontFamily:"'Outfit',sans-serif" }}>{avg.toFixed(1)}</div>
                    <Stars rating={avg} size={11}/>
                  </div>
                  <div>
                    <p style={{ margin:0,fontSize:"13px",fontWeight:"700",color:"#166534" }}>{reviews.length} patient review{reviews.length!==1?"s":""}</p>
                    <p style={{ margin:"2px 0 0",fontSize:"12px",color:"#6b7280" }}>NearCare community ratings</p>
                  </div>
                </div>
                {reviews.map((r,i)=>(
                  <div key={i} style={{ background:"#fff",border:"1.5px solid #f1f5f9",borderRadius:"14px",padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                        <div style={{ width:"38px",height:"38px",borderRadius:"50%",background:`hsl(${(r.name.charCodeAt(0)*41)%360},55%,60%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",fontWeight:"800",color:"#fff" }}>
                          {r.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin:0,fontSize:"14px",fontWeight:"700",color:"#0f172a" }}>{r.name}</p>
                          <Stars rating={r.rating} size={11}/>
                        </div>
                      </div>
                      <span style={{ fontSize:"11px",color:"#94a3b8" }}>{r.date}</span>
                    </div>
                    <p style={{ margin:0,fontSize:"13.5px",color:"#475569",lineHeight:"1.6",paddingTop:"10px",borderTop:"1px solid #f8fafc" }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

function HospCard({ h, selected, onClick, onDist, onReview }) {
  const ti  = typeInfo(h.type);
  const avg = avgR(h.id);
  const rc  = getR(h.id).length;

  return (
    <div onClick={onClick} style={{ background:selected?"linear-gradient(145deg,#f0fdf4,#fff)":"#fff", border:selected?"2px solid #16a34a":"1.5px solid #f1f5f9", borderRadius:"20px", padding:"15px 16px", marginBottom:"10px", cursor:"pointer", transition:"all 0.2s ease", boxShadow:selected?"0 8px 28px rgba(22,163,74,0.15)":"0 2px 8px rgba(0,0,0,0.04)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",left:0,top:"18px",bottom:"18px",width:"3px",background:selected?"#16a34a":"transparent",borderRadius:"0 2px 2px 0",transition:"background 0.2s" }}/>

      <div style={{ display:"flex",gap:"6px",marginBottom:"9px",flexWrap:"wrap" }}>
        <span style={{ fontSize:"10px",fontWeight:"800",padding:"2px 9px",borderRadius:"6px",background:ti.bg,color:ti.fg,letterSpacing:"0.3px" }}>{ti.label}</span>
        {h.emergency && <span style={{ fontSize:"10px",fontWeight:"800",background:"#fee2e2",color:"#b91c1c",borderRadius:"6px",padding:"2px 9px" }}>⚡ 24/7</span>}
      </div>

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"5px" }}>
        <h3 style={{ fontSize:"15px",fontWeight:"800",color:"#0f172a",margin:0,lineHeight:"1.3",fontFamily:"'Outfit',sans-serif",flex:1,letterSpacing:"-0.2px" }}>{h.name}</h3>
        <button onClick={e=>{e.stopPropagation();onDist();}} style={{ background:selected?"#16a34a":"#f0fdf4", border:`1.5px solid ${selected?"#16a34a":"#bbf7d0"}`, borderRadius:"24px", padding:"5px 12px", fontSize:"12px", fontWeight:"800", color:selected?"#fff":"#16a34a", whiteSpace:"nowrap", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", gap:"4px", transition:"all 0.15s", fontFamily:"'Outfit',sans-serif", boxShadow:selected?"0 3px 10px rgba(22,163,74,0.3)":"none" }}>
          📍 {(h.distance/1000).toFixed(1)} km
        </button>
      </div>

      <Stars rating={avg} size={12}/>

      <p style={{ fontSize:"12px",color:"#64748b",margin:"8px 0 10px",lineHeight:"1.5",display:"flex",alignItems:"flex-start",gap:"4px" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginTop:"2px",flexShrink:0 }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {h.address}
      </p>

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"10px",borderTop:"1px solid #f1f5f9" }}>
        <div style={{ display:"flex",gap:"12px",alignItems:"center" }}>
          <span style={{ fontSize:"11px",color:"#94a3b8",fontWeight:"600" }}>🚶 {walk(h.distance)}</span>
          <span style={{ width:"3px",height:"3px",borderRadius:"50%",background:"#e2e8f0",display:"inline-block" }}/>
          <span style={{ fontSize:"11px",color:"#94a3b8",fontWeight:"600" }}>🚗 {drive(h.distance)}</span>
        </div>
        <button onClick={e=>{e.stopPropagation();onReview();}} style={{ padding:"5px 12px",borderRadius:"22px",border:rc>0?"1px solid #bbf7d0":"none",background:rc>0?"#f0fdf4":"linear-gradient(135deg,#16a34a,#059669)",color:rc>0?"#16a34a":"#fff",fontSize:"11px",fontWeight:"800",cursor:"pointer",fontFamily:"'Outfit',sans-serif" }}>
          ⭐ {rc>0?`${rc} Review${rc!==1?"s":""}`:"Add Review"}
        </button>
      </div>
    </div>
  );
}

export default function NearCare() {
  const mapRef     = useRef(null);
  const mapInstRef = useRef(null);
  const markersRef = useRef({});
  const userLocRef = useRef(null);

  const [hospitals,   setHospitals]   = useState([]);
  const [radius,      setRadius]      = useState(5000);
  const [sortBy,      setSortBy]      = useState("distance");
  const [selId,       setSelId]       = useState(null);
  const [mapStatus,   setMapStatus]   = useState("loading");
  const [searchQ,     setSearchQ]     = useState("");
  const [hospLoading, setHospLoading] = useState(false);
  const [distPanel,   setDistPanel]   = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [rv,          setRv]          = useState(0);

  const filtered = useMemo(() => {
    const d = hospitals.filter(h => h.name.toLowerCase().includes(searchQ.toLowerCase()));
    if (sortBy==="rating")   return [...d].sort((a,b)=>avgR(b.id)-avgR(a.id));
    if (sortBy==="distance") return [...d].sort((a,b)=>a.distance-b.distance);
    if (sortBy==="reviews")  return [...d].sort((a,b)=>getR(b.id).length-getR(a.id).length);
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitals, sortBy, searchQ, rv]);

  const clearMarkers = () => {
    Object.values(markersRef.current).forEach(m => { if(mapInstRef.current) mapInstRef.current.removeLayer(m); });
    markersRef.current = {};
  };

  const makeIcon = (L, sel=false) => L.divIcon({
    className:"",
    html:`<div style="width:${sel?38:30}px;height:${sel?38:30}px;border-radius:50%;background:${sel?"#16a34a":"#ef4444"};border:3px solid #fff;box-shadow:0 ${sel?6:3}px ${sel?18:10}px rgba(0,0,0,${sel?0.4:0.25});display:flex;align-items:center;justify-content:center;font-size:${sel?17:14}px;font-weight:900;color:#fff;">+</div>`,
    iconSize:[sel?38:30,sel?38:30], iconAnchor:[sel?19:15,sel?19:15], popupAnchor:[0,-22],
  });

  const doSearch = async (center, r) => {
    if (!mapInstRef.current) return;
    setHospLoading(true); setHospitals([]); setSelId(null); clearMarkers();
    try {
      const results = await fetchHospitals(center.lat, center.lng, r);
      setHospitals(results);
      results.forEach(h => {
        const m = L.marker([h.lat,h.lng],{icon:makeIcon(L,false)}).addTo(mapInstRef.current)
          .bindPopup(`<div style="font-family:'Outfit',sans-serif;padding:4px"><strong style="font-size:14px">${h.name}</strong><br/><span style="font-size:12px;color:#64748b">${h.address}</span></div>`);
        m.on("click", () => setSelId(h.id));
        markersRef.current[h.id] = m;
      });
    } catch(e) { console.error(e); }
    finally { setHospLoading(false); }
  };

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id,m]) => m.setIcon(makeIcon(L, id===selId)));
  }, [selId]);

  useEffect(() => {

    if (mapInstRef.current) return;

    const init = async () => {
      try {

        const map = L.map(mapRef.current, {
          zoomControl: true,
        }).setView([DEFAULT_LAT, DEFAULT_LNG], 13);

        mapInstRef.current = map;

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { attribution: "© OpenStreetMap" }
        ).addTo(map);

        let pos;

        try {
          pos = await getPos();
        } catch {
          pos = { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
        }

        userLocRef.current = pos;

        map.setView([pos.lat, pos.lng], 14);

        L.marker([pos.lat, pos.lng])
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();

        setMapStatus("ready");

        doSearch(pos, radius);

      } catch (err) {
        console.error(err);
        setMapStatus("error");
      }
    };

    init();

  }, []);

  useEffect(() => {

    if (!userLocRef.current) return;
    if (!mapInstRef.current) return;

    doSearch(userLocRef.current, radius);

  }, [radius]);

  const handleRadius = r => { setRadius(r); };
  const handleCard   = h => {
    setSelId(h.id);
    if(mapInstRef.current) mapInstRef.current.setView([h.lat,h.lng],16,{animate:true,duration:0.7});
    const m = markersRef.current[h.id];
    if(m) setTimeout(()=>m.openPopup(), 500);
  };

  return (
    <div style={{ fontFamily:"'Outfit','Segoe UI',sans-serif", height:"100vh", display:"flex", flexDirection:"column", background:"#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1}50%{opacity:0.2} }
        @keyframes slideUp { from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translate(-50%,-46%)}to{opacity:1;transform:translate(-50%,-50%)} }
        @keyframes shimmer { 0%,100%{opacity:0.5}50%{opacity:1} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:10px}
        .leaflet-container{font-family:'Outfit',sans-serif!important}
        .leaflet-popup-content-wrapper{border-radius:14px!important;box-shadow:0 8px 30px rgba(0,0,0,0.14)!important;padding:4px!important}
        .leaflet-popup-content{margin:10px 14px!important}
      `}</style>

      {distPanel && (
        <DistPanel hospital={distPanel} userLoc={userLocRef.current}
          onClose={()=>setDistPanel(null)}
          onReview={()=>{ setReviewModal(distPanel); setDistPanel(null); }}
        />
      )}
      {reviewModal && (
        <ReviewModal hospital={reviewModal} onClose={()=>setReviewModal(null)} onSaved={()=>setRv(v=>v+1)}/>
      )}

      <div style={{ background:"#fff", borderBottom:"1px solid #f1f5f9", padding:"10px 20px", display:"flex", alignItems:"center", gap:"14px", flexWrap:"wrap", boxShadow:"0 2px 14px rgba(0,0,0,0.06)", zIndex:1000 }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px",flexShrink:0 }}>
          <div style={{ width:"38px",height:"38px",borderRadius:"11px",background:"linear-gradient(135deg,#052e16,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(22,163,74,0.35)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight:"900",fontSize:"20px",color:"#0f172a",letterSpacing:"-0.5px",lineHeight:1,fontFamily:"'Outfit',sans-serif" }}>NearCare</div>
            <div style={{ fontSize:"10px",fontWeight:"700",color:"#16a34a",letterSpacing:"0.3px",textTransform:"uppercase" }}>Find hospitals nearby</div>
          </div>
        </div>

        <div style={{ position:"relative",flex:"1",minWidth:"160px",maxWidth:"280px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search hospitals…" value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            style={{ width:"100%",paddingLeft:"34px",paddingRight:"12px",paddingTop:"9px",paddingBottom:"9px",borderRadius:"10px",border:"1.5px solid #e2e8f0",fontSize:"13px",outline:"none",background:"#f8fafc",boxSizing:"border-box",transition:"border 0.15s",fontFamily:"'Outfit',sans-serif" }}
            onFocus={e=>e.target.style.borderColor="#16a34a"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
        </div>

        <div style={{ display:"flex",alignItems:"center",gap:"6px" }}>
          <span style={{ fontSize:"11px",color:"#94a3b8",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.5px" }}>Radius</span>
          <div style={{ display:"flex",gap:"4px" }}>
            {RADIUS_OPTIONS.map(r=>(
              <button key={r.value} onClick={()=>handleRadius(r.value)} style={{ padding:"6px 12px",borderRadius:"24px",border:radius===r.value?"none":"1.5px solid #e2e8f0",background:radius===r.value?"linear-gradient(135deg,#16a34a,#059669)":"#fff",color:radius===r.value?"#fff":"#475569",fontSize:"12px",fontWeight:"700",cursor:"pointer",transition:"all 0.15s",boxShadow:radius===r.value?"0 3px 10px rgba(22,163,74,0.3)":"none",fontFamily:"'Outfit',sans-serif" }}>{r.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display:"flex",alignItems:"center",gap:"6px" }}>
          <span style={{ fontSize:"11px",color:"#94a3b8",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.5px" }}>Sort</span>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"7px 12px",borderRadius:"10px",border:"1.5px solid #e2e8f0",fontSize:"12px",fontWeight:"700",color:"#475569",background:"#fff",cursor:"pointer",outline:"none",fontFamily:"'Outfit',sans-serif" }}>
            {SORT_OPTIONS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display:"flex",flex:1,overflow:"hidden" }}>

        <div style={{ flex:1,position:"relative" }}>
          {mapStatus !== "ready" && (
            <div style={{ position:"absolute",inset:0,zIndex:2 }}>
              <FallbackMap status={mapStatus}/>
            </div>
          )}

          <div
            ref={mapRef}
            style={{
              width: "100%",
              height: "100vh",
              minHeight: "500px",
              zIndex: 1,
              opacity: mapStatus === "ready" ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          />

          {hospLoading && mapStatus==="ready" && (
            <div style={{ position:"absolute",top:"16px",left:"50%",transform:"translateX(-50%)",background:"rgba(255,255,255,0.96)",borderRadius:"28px",padding:"10px 20px",display:"flex",alignItems:"center",gap:"10px",zIndex:999,boxShadow:"0 4px 20px rgba(0,0,0,0.1)",backdropFilter:"blur(4px)" }}>
              <div style={{ width:"16px",height:"16px",borderRadius:"50%",border:"2px solid #bbf7d0",borderTopColor:"#16a34a",animation:"spin 0.8s linear infinite" }}/>
              <span style={{ fontSize:"13px",color:"#166534",fontWeight:"700",fontFamily:"'Outfit',sans-serif" }}>Finding hospitals…</span>
            </div>
          )}
        </div>

        <div style={{ width:"360px",flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden",background:"#f8fafc",borderLeft:"1px solid #f1f5f9" }}>

          <div style={{ background:"linear-gradient(145deg,#052e16,#14532d)",padding:"16px 18px 14px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px" }}>
              <p style={{ margin:0,fontSize:"16px",fontWeight:"900",color:"#fff",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:"8px",letterSpacing:"-0.2px" }}>
                <span style={{ background:"rgba(255,255,255,0.14)",borderRadius:"50%",width:"28px",height:"28px",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"13px" }}>
                  {hospLoading ? "⏳" : "🏥"}
                </span>
                {hospLoading ? "Searching…" : `${filtered.length} Found`}
              </p>
              {!hospLoading && (
                <span style={{ background:"rgba(255,255,255,0.14)",borderRadius:"22px",padding:"3px 11px",fontSize:"11px",color:"rgba(255,255,255,0.75)",fontWeight:"700" }}>
                  Within {radius/1000} km
                </span>
              )}
            </div>
            <p style={{ margin:0,fontSize:"12px",color:"rgba(255,255,255,0.45)",fontWeight:"500" }}>
              Tap 📍 distance pill for live tracking
            </p>
          </div>

          <div style={{ flex:1,overflowY:"auto",padding:"12px" }}>
            {!hospLoading && filtered.length===0 && mapStatus!=="loading" && (
              <div style={{ textAlign:"center",padding:"50px 20px",color:"#94a3b8" }}>
                <div style={{ fontSize:"52px",marginBottom:"14px" }}>🏥</div>
                <p style={{ fontSize:"15px",fontWeight:"800",color:"#475569",marginBottom:"6px",fontFamily:"'Outfit',sans-serif" }}>No hospitals found</p>
                <p style={{ fontSize:"13px",margin:0 }}>Try increasing the search radius.</p>
              </div>
            )}

            {hospLoading && [1,2,3].map(i=>(
              <div key={i} style={{ background:"#fff",borderRadius:"20px",padding:"16px",marginBottom:"10px",border:"1.5px solid #f1f5f9" }}>
                <div style={{ height:"11px",borderRadius:"6px",background:"#f1f5f9",marginBottom:"10px",width:"35%",animation:"shimmer 1.5s infinite" }}/>
                <div style={{ height:"17px",borderRadius:"6px",background:"#f1f5f9",marginBottom:"9px",width:"70%",animation:"shimmer 1.5s infinite" }}/>
                <div style={{ height:"11px",borderRadius:"6px",background:"#f1f5f9",width:"50%",animation:"shimmer 1.5s infinite" }}/>
              </div>
            ))}

            {filtered.map(h=>(
              <HospCard
                key={h.id+rv}
                h={h}
                selected={selId===h.id}
                onClick={()=>handleCard(h)}
                onDist={()=>{ setSelId(h.id); setDistPanel(h); }}
                onReview={()=>setReviewModal(h)}
              />
            ))}
          </div>

          <div style={{ padding:"9px 16px",borderTop:"1px solid #f1f5f9",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontSize:"11px",color:"#cbd5e1" }}>© <a href="https://openstreetmap.org" target="_blank" rel="noreferrer" style={{ color:"#94a3b8",textDecoration:"none" }}>OpenStreetMap</a></span>
            <span style={{ fontSize:"11px",color:"#cbd5e1" }}>Reviews stored locally</span>
          </div>
        </div>
      </div>
    </div>
  );
}
