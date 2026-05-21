import api from "../conf/api.js";

export class ReviewServices {
  async createReview({ doctorId, patientId, patientName, patientEmail, rating, comment }) {
    const res = await fetch(`${api.apiBaseUrl}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        patientId: patientId || "",
        patientName: patientName || "",
        patientEmail,
        rating,
        comment: comment || "",
      }),
    });

    if (!res.ok) {
      let parsed = null;
      try {
        parsed = await res.json();
      } catch (e) {}
      const msg = parsed?.message || "Failed to create review";
      throw new Error(msg);
    }

    return res.json();
  }

  async getDoctorReviewSummary(doctorId) {
    const res = await fetch(
      `${api.apiBaseUrl}/reviews/doctor/${doctorId}/summary`,
    );
    if (!res.ok) throw new Error("Failed to fetch doctor review summary");
    return res.json();
  }

  async getPatientReview(doctorId, patientEmail) {
    if (!patientEmail) return { review: null };
    const url = new URL(
      `${api.apiBaseUrl}/reviews/doctor/${doctorId}/patient`,
    );
    url.searchParams.append("patientEmail", patientEmail);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch patient review");
    return res.json();
  }
}

const reviewServices = new ReviewServices();
export default reviewServices;


