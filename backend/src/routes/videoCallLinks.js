import express from 'express'
import VideoCallLink from '../models/VideoCallLink.js'

const router = express.Router()

router.post('/generate', async (req, res) => {
  try {
    const { doctor_id, doctor_name, patient_email, patient_name, durationMinutes = 30 } = req.body
    if (!doctor_id || !patient_email) return res.status(400).json({ error: 'Missing required fields' })

    const linkData = VideoCallLink.schema.statics.generateLink(
      doctor_id,
      doctor_name,
      patient_email,
      patient_name,
      durationMinutes
    )

    const link = await VideoCallLink.create(linkData)
    const callUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/video-call/${link.token}`
    res.json({ token: link.token, url: callUrl, expiresAt: link.expiresAt })
  } catch (error) {
    console.error('Error generating link:', error)
    res.status(500).json({ error: 'Failed to generate link' })
  }
})

router.get('/validate/:token', async (req, res) => {
  try {
    const link = await VideoCallLink.findOne({ token: req.params.token })
    if (!link) return res.status(404).json({ error: 'Link not found' })
    if (!link.isValid()) return res.status(403).json({ error: 'Link expired or already used' })

    res.json({
      token: link.token,
      doctor_id: link.doctor_id,
      doctor_name: link.doctor_name,
      patient_email: link.patient_email,
      expiresAt: link.expiresAt
    })
  } catch (error) {
    console.error('Error validating link:', error)
    res.status(500).json({ error: 'Failed to validate link' })
  }
})

router.post('/start/:token', async (req, res) => {
  try {
    const link = await VideoCallLink.findOne({ token: req.params.token })
    if (!link) return res.status(404).json({ error: 'Link not found' })
    if (!link.isValid()) return res.status(403).json({ error: 'Link expired or already used' })

    link.status = 'active'
    link.usedAt = new Date()
    await link.save()

    res.json({ message: 'Call started', token: link.token })
  } catch (error) {
    console.error('Error starting call:', error)
    res.status(500).json({ error: 'Failed to start call' })
  }
})

router.post('/end/:token', async (req, res) => {
  try {
    const link = await VideoCallLink.findOne({ token: req.params.token })
    if (!link) return res.status(404).json({ error: 'Link not found' })

    link.status = 'completed'
    await link.save()

    res.json({ message: 'Call completed' })
  } catch (error) {
    console.error('Error ending call:', error)
    res.status(500).json({ error: 'Failed to end call' })
  }
})

export default router

