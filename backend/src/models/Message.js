import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },

    doctorEmail: { type: String },

    user_id: { type: String },
    userEmail: { type: String },

    sender_id: { type: String },
    sender_role: { type: String },
    sender_name: { type: String },

    username: { type: String },
    body: { type: String },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model('Message', messageSchema)



