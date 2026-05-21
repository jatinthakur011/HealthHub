import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    title: { type: String, required: true },
    degree: { type: String },
    licenseNumber: { type: String, unique: true, sparse: true },
    licenseDocument: { type: String },
    licenseTemplate: { type: String },
    description: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    user_id: { type: String },
    doctorImage: { type: String }, // URL or path
    availability: { type: String, default: 'Mon - Fri, 9:00 AM - 5:00 PM' }, // Doctor's own availability
    zone: { type: String, default: 'Online' }, // Doctor's zone/location
    requests: { type: [Object], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('Doctor', doctorSchema)



