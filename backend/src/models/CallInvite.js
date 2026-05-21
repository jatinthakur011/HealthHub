import mongoose from 'mongoose'

const callInviteSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    fromName: { type: String, default: 'Someone' },
    fromRole: { type: String, enum: ['doctor', 'patient'], default: 'patient' },
    targetDoctorId: { type: String, index: true },
    targetUserEmail: { type: String, lowercase: true, index: true },
    status: { type: String, enum: ['ringing', 'ended'], default: 'ringing' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

callInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('CallInvite', callInviteSchema)

