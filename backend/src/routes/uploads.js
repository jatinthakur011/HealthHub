import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendRoot = path.resolve(__dirname, '..', '..')
const uploadDir = path.join(backendRoot, 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_')
    cb(null, `${base}_${Date.now()}${ext}`)
  },
})

const upload = multer({ storage })

router.get('/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(uploadDir, filename)
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' })
  }
  
  res.sendFile(filePath)
})

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }
  const fileUrl = `/uploads/${req.file.filename}`
  res.status(201).json({ fileId: req.file.filename, url: fileUrl, filename: req.file.filename })
})

export default router



