import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    message: { type: String, required: true, trim: true },
    userId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
    replies: [
      {
        senderRole: {
          type: String,
          enum: ['admin', 'patient'],
          required: true,
        },
        senderName: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema)

