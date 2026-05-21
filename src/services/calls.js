import api from "../conf/api.js";

export async function ringCall(payload) {
  const preferredToken =
    payload.fromRole === "doctor"
      ? localStorage.getItem("doctor_token")
      : localStorage.getItem("token");
  const fallbackToken =
    payload.fromRole === "doctor"
      ? localStorage.getItem("token")
      : localStorage.getItem("doctor_token");
  const token = preferredToken || fallbackToken;
  if (!token) return;

  const res = await fetch(`${api.apiBaseUrl}/calls/ring`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      roomId: payload.roomId,
      targetDoctorId: payload.targetDoctorId,
      targetUserEmail: payload.targetUserEmail,
      fromName: payload.fromName,
      fromRole: payload.fromRole,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Ring failed");
  }
}


