import { Router } from 'express'
import DoctorApplication from '../models/DoctorApplication.js'
import Doctor from '../models/Doctor.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomInt } from 'crypto'
import fs from 'fs'
import { generateMedicalLicensePdf } from '../utils/licensePdf.js'
import { generateMedicalLicenseFromTemplate } from '../utils/templateLicensePdf.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendRoot = path.resolve(__dirname, '..', '..')
const uploadsDir = path.join(backendRoot, 'uploads')

function adminOnly(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev')
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    req.user = payload
    next()
  } catch (e) {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

const router = Router()

async function generateUniqueLicenseNumber() {
  while (true) {
    const year = new Date().getFullYear()
    const candidate = `HH-ML-${year}-${randomInt(100000, 999999)}`
    const existingApp = await DoctorApplication.exists({ licenseNumber: candidate })
    if (existingApp) continue
    const existingDoctor = await Doctor.exists({ licenseNumber: candidate })
    if (existingDoctor) continue
    return candidate
  }
}

router.post('/', async (req, res) => {
  try {
    const { name, email, title, degree, description, gender, user_id, password, availability, zone, licenseTemplate } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields (name, email, password)' })
    const existing = await DoctorApplication.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Application already exists for this email' })
    if (!title || !degree) return res.status(400).json({ message: 'Missing required fields (title, degree)' })
    
    const hashed = await bcrypt.hash(password, 10)
    const licenseNumber = await generateUniqueLicenseNumber()
    const pdfFilename = `medical_license_${licenseNumber}.pdf`
    const pdfPath = path.join(uploadsDir, pdfFilename)
    const templatePath = licenseTemplate ? path.join(uploadsDir, licenseTemplate) : null

    if (templatePath) {
      if (!fs.existsSync(templatePath)) {
        return res.status(400).json({ message: 'Uploaded PDF template was not found on the server' })
      }
      generateMedicalLicenseFromTemplate({
        templatePath,
        outputPath: pdfPath,
        name,
        email,
        title,
        degree,
        zone: zone || 'Online',
        licenseNumber,
      })
    } else {
      generateMedicalLicensePdf(
        {
          name,
          email,
          title,
          degree,
          zone: zone || 'Online',
          licenseNumber,
        },
        pdfPath,
      )
    }
    
    const created = await DoctorApplication.create({
      name,
      email,
      password: hashed,
      title,
      degree,
      description,
      gender: gender === 'female' ? 'female' : 'male',
      license: pdfFilename,
      licenseTemplate: licenseTemplate || '',
      licenseNumber,
      user_id,
      availability,
      zone,
    })
    res.status(201).json(created)
  } catch (e) {
    res.status(400).json({ message: 'Create failed', error: e.message })
  }
})

router.get('/', adminOnly, async (req, res) => {
  try {
    const docs = await DoctorApplication.find().sort({ createdAt: -1 })
    res.json({ documents: docs })
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch applications' })
  }
})

router.put('/:id/approve', adminOnly, async (req, res) => {
  try {
    const app = await DoctorApplication.findById(req.params.id)
    if (!app) return res.status(404).json({ message: 'Application not found' })

    if (app.status === 'approved') return res.status(400).json({ message: 'Already approved' })
        const doctor = await Doctor.create({
      name: app.name,
      email: app.email,
      password: app.password, 
      title: app.title || 'General',
      degree: app.degree || '',
      licenseNumber: app.licenseNumber || '',
      licenseDocument: app.license || '',
      licenseTemplate: app.licenseTemplate || '',
      description: app.description || '',
      gender: app.gender === 'female' ? 'female' : 'male',
      availability: app.availability || 'Mon - Fri, 9:00 AM - 5:00 PM',
      zone: app.zone || 'Online',
      status: 'active'
    })

    app.status = 'approved'
    await app.save()
    res.json({ success: true, doctor, message: 'Doctor approved and account activated' })
  } catch (e) {
    res.status(500).json({ message: 'Approve failed', error: e.message })
  }
})

router.put('/:id/reject', adminOnly, async (req, res) => {
  try {
    const app = await DoctorApplication.findById(req.params.id)
    if (!app) return res.status(404).json({ message: 'Application not found' })
    app.status = 'rejected'
    await app.save()
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ message: 'Reject failed', error: e.message })
  }
})

export default router

