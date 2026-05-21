import api from '../conf/api.js'

export class VideoCallService {
  async generateLink(doctor_id, doctor_name, patient_email, patient_name, durationMinutes = 30) {
    const res = await fetch(`${api.apiBaseUrl}/video-call-links/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_id, doctor_name, patient_email, patient_name, durationMinutes })
    })
    if (!res.ok) throw new Error('Failed to generate link')
    return await res.json()
  }
}

export default new VideoCallService()

