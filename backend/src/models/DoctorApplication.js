import mongoose from 'mongoose'
const applicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String }, // hashed password provided by applicant
    title: { type: String },
    degree: { type: String },
    description: { type: String },
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    availability: { type: String },
    zone: { type: String },
    license: { type: String }, // could be a URL or text
    licenseTemplate: { type: String },
    licenseNumber: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    user_id: { type: String },
  },
  { timestamps: true }
)
export default mongoose.model('DoctorApplication', applicationSchema)

