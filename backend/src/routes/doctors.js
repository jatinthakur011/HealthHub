import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';

const router = Router()


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const doc = await Doctor.findOne({ email })
    if (!doc) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, doc.password || '')
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ sub: doc._id, role: 'doctor', type: 'doctor' }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' })
    res.json({ token, doctor: { id: doc._id, name: doc.name, email: doc.email, role: 'doctor' } })
  } catch (e) {
    res.status(400).json({ message: 'Login failed' })
  }
})
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Unauthorized' })
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev')
    if (payload.role !== 'doctor') return res.status(403).json({ message: 'Forbidden' })
    const doc = await Doctor.findById(payload.sub)
    if (!doc) return res.status(401).json({ message: 'Unauthorized' })
    res.json(doc)
  } catch (e) {
    res.status(401).json({ message: 'Unauthorized' })
  }
})
router.get('/', async (req, res) => {
  try {
    const docs = await Doctor.find().sort({ createdAt: -1 })
    res.json({ documents: docs })
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch doctors' })
  }
})
router.get('/:id', async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json(doc)
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch' })
  }
})
router.get('/:id/manage', async (req, res) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Unauthorized' })
    
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev')
    if (payload.role !== 'doctor') return res.status(403).json({ message: 'Forbidden' })
    
    const doc = await Doctor.findById(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Not found' })
        if (payload.sub !== req.params.id) {
      return res.status(403).json({ message: 'You can only access your own booking management' })
    }
    
    res.json(doc)
  } catch (e) {
    res.status(401).json({ message: 'Unauthorized' })
  }
})
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      title,
      degree,
      description,
      status,
      user_id,
      doctorImage,
      gender,
      availability,
      zone,
    } = req.body
    if (!name || !email || !password || !title || !description) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const hash = await bcrypt.hash(password, 10)
    const created = await Doctor.create({
      name,
      email,
      password: hash,
      title,
      degree,
      description,
      status,
      user_id,
      doctorImage,
      gender: gender === 'female' ? 'female' : 'male',
      availability,
      zone,
    })
    res.status(201).json(created)
  } catch (e) {
    res.status(400).json({ message: 'Create failed' })
  }
})
router.put('/:id', async (req, res) => {
  try {
    if (req.body.status) {
      const auth = req.headers.authorization || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
      if (!token) return res.status(401).json({ message: 'Unauthorized - token required to update status' })
      
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev')
      if (payload.role !== 'doctor') return res.status(403).json({ message: 'Forbidden - only doctors can update status' })
      if (payload.sub !== req.params.id) return res.status(403).json({ message: 'Forbidden - can only update your own status' })
    }
    
    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ message: 'Not found' })
    res.json(updated)
  } catch (e) {
    res.status(400).json({ message: 'Update failed', error: e.message })
  }
})
router.put('/:id/requests', async (req, res) => {
  try {
    const { requests } = req.body
    const updated = await Doctor.findByIdAndUpdate(req.params.id, { requests }, { new: true })
    if (!updated) return res.status(404).json({ message: 'Not found' })
    res.json(updated)
  } catch (e) {
    res.status(400).json({ message: 'Update failed' })
  }
})
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Doctor.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Not found' })
    res.json({ success: true })
  } catch (e) {
    res.status(400).json({ message: 'Delete failed' })
  }
})

export default router



