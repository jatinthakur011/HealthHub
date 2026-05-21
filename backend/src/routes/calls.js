import { Router } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import CallInvite from '../models/CallInvite.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev'

function getBearerToken(req) {
  const auth = req.headers.authorization || ''
  return auth.startsWith('Bearer ') ? auth.slice(7) : null
}

function verifyToken(req) {
  const token = getBearerToken(req)
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

router.post('/ring', async (req, res) => {
  try {
    const payload = verifyToken(req)
    if (!payload) return res.status(401).json({ message: 'Unauthorized' })

    const { roomId, targetDoctorId, targetUserEmail, fromName, fromRole } = req.body
    if (!roomId || (!targetDoctorId && !targetUserEmail)) {
      return res.status(400).json({ message: 'roomId and targetDoctorId or targetUserEmail required' })
    }

    const invite = await CallInvite.create({
      roomId: String(roomId).slice(0, 300),
      fromName: String(fromName || 'Someone').slice(0, 120),
      fromRole: fromRole === 'doctor' ? 'doctor' : 'patient',
      targetDoctorId: targetDoctorId ? String(targetDoctorId) : undefined,
      targetUserEmail: targetUserEmail ? String(targetUserEmail).toLowerCase().trim() : undefined,
      expiresAt: new Date(Date.now() + 120 * 1000),
    })

    res.json({ ok: true, inviteId: invite._id })
  } catch (e) {
    console.error('calls/ring', e)
    res.status(500).json({ message: 'Failed to ring' })
  }
})

router.get('/incoming', async (req, res) => {
  try {
    const payload = verifyToken(req)
    if (!payload) return res.status(401).json({ message: 'Unauthorized' })

    const now = new Date()
    const base = { status: 'ringing', expiresAt: { $gt: now } }

    const isDoctor = payload.role === 'doctor' || payload.type === 'doctor'
    let query

    if (isDoctor) {
      query = { ...base, targetDoctorId: String(payload.sub) }
    } else {
      const User = mongoose.models.User
      if (!User) return res.json({ invite: null })
      const user = await User.findById(payload.sub).lean()
      if (!user?.email) return res.json({ invite: null })
      query = { ...base, targetUserEmail: user.email.toLowerCase() }
    }

    const invite = await CallInvite.findOne(query).sort({ createdAt: -1 }).lean()
    if (!invite) return res.json({ invite: null })

    res.json({
      invite: {
        id: invite._id,
        roomId: invite.roomId,
        fromName: invite.fromName,
        fromRole: invite.fromRole,
        createdAt: invite.createdAt,
      },
    })
  } catch (e) {
    console.error('calls/incoming', e)
    res.status(500).json({ message: 'Failed' })
  }
})

router.post('/dismiss/:id', async (req, res) => {
  try {
    const payload = verifyToken(req)
    if (!payload) return res.status(401).json({ message: 'Unauthorized' })

    await CallInvite.updateOne({ _id: req.params.id }, { $set: { status: 'ended' } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ message: 'Failed' })
  }
})

export default router

