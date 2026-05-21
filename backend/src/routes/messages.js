import { Router } from 'express'
import Message from '../models/Message.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { doctor_id, user_id } = req.query
    let query = {}
    if (doctor_id) query.doctor_id = doctor_id
    if (user_id) {
      query.$or = [
        { user_id },
        { userEmail: user_id },
      ]
    }
    const docs = await Message.find(query).sort({ createdAt: -1 })
    res.json({ documents: docs })
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch messages' })
  }
})

router.post('/', async (req, res) => {
  try {
    const created = await Message.create(req.body)
    res.status(201).json(created)
  } catch (e) {
    res.status(400).json({ message: 'Create failed' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(400).json({ message: 'Delete failed' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { body } = req.body
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { body, edited: true, editedAt: new Date() },
      { new: true }
    )
    if (!updated) {
      return res.status(404).json({ message: 'Message not found' })
    }
    res.json(updated)
  } catch (e) {
    res.status(400).json({ message: 'Update failed' })
  }
})
router.delete('/clear/:doctorId/:userId', async (req, res) => {
  try {
    await Message.deleteMany({
      doctor_id: req.params.doctorId,
      user_id: req.params.userId
    })
    res.json({ success: true })
  } catch (e) {
    res.status(400).json({ message: 'Clear failed' })
  }
})
router.delete('/', async (req, res) => {
  try {
    const { doctor_id, user_id } = req.query

    if (!doctor_id || !user_id) {
      return res.status(400).json({ message: 'doctor_id and user_id are required' })
    }

    let doctorObjectId;
    try {
      doctorObjectId = mongoose.Types.ObjectId(doctor_id);
    } catch (e) {
      doctorObjectId = doctor_id;
    }

    const result = await Message.deleteMany({
      doctor_id: doctorObjectId,
      user_id: user_id
    })

    res.json({ success: true, message: 'Chat cleared', deletedCount: result.deletedCount })
  } catch (e) {
    console.error('Clear chat error:', e)
    res.status(400).json({ message: 'Clear chat failed' })
  }
})

export default router



