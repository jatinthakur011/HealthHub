import { Router } from 'express'
import jwt from 'jsonwebtoken'
import Complaint from '../models/Complaint.js'

function getPayloadFromRequest(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev')
  } catch (error) {
    return null
  }
}

function authRequired(req, res, next) {
  const payload = getPayloadFromRequest(req)
  if (!payload) return res.status(401).json({ message: 'Unauthorized' })
  req.user = payload
  next()
}

function adminOnly(req, res, next) {
  const payload = getPayloadFromRequest(req)
  if (!payload) return res.status(401).json({ message: 'Unauthorized' })
  if (payload.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
  req.user = payload
  next()
}

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, userId } = req.body || {}
    const payload = getPayloadFromRequest(req)

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and complaint message are required' })
    }

    const complaint = await Complaint.create({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || '').trim(),
      message: String(message).trim(),
      userId: String(userId || payload?.sub || '').trim(),
      replies: [],
    })

    return res.status(201).json({ success: true, complaint })
  } catch (error) {
    return res.status(400).json({ message: 'Failed to submit complaint', error: error.message })
  }
})

router.get('/', adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 })
    return res.json({ documents: complaints })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch complaints' })
  }
})

router.get('/my', authRequired, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      $or: [{ userId: String(req.user.sub) }, { email: req.user.email || '' }],
    }).sort({ updatedAt: -1, createdAt: -1 })

    return res.json({ documents: complaints })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch your complaints' })
  }
})

router.put('/:id/status', adminOnly, async (req, res) => {
  try {
    const nextStatus = req.body?.status === 'resolved' ? 'resolved' : 'open'
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: nextStatus },
      { new: true },
    )

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    return res.json({ success: true, complaint })
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update complaint status' })
  }
})

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    const isAdmin = req.user.role === 'admin'
    const isOwner =
      String(complaint.userId || '') === String(req.user.sub || '') ||
      String(complaint.email || '').toLowerCase() === String(req.user.email || '').toLowerCase()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    await Complaint.findByIdAndDelete(req.params.id)
    return res.json({ success: true })
  } catch (error) {
    return res.status(400).json({ message: 'Failed to delete complaint' })
  }
})

router.post('/:id/replies', authRequired, async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim()
    if (!message) {
      return res.status(400).json({ message: 'Reply message is required' })
    }

    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    const isAdmin = req.user.role === 'admin'
    const isOwner =
      String(complaint.userId || '') === String(req.user.sub || '') ||
      String(complaint.email || '').toLowerCase() === String(req.user.email || '').toLowerCase()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    complaint.replies.push({
      senderRole: isAdmin ? 'admin' : 'patient',
      senderName: req.body?.senderName || (isAdmin ? 'Admin' : 'Patient'),
      message,
      createdAt: new Date(),
    })

    if (complaint.status === 'resolved') {
      complaint.status = 'open'
    }

    await complaint.save()
    return res.json({ success: true, complaint })
  } catch (error) {
    return res.status(400).json({ message: 'Failed to send reply' })
  }
})

export default router

