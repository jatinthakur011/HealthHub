import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

import authRouter from './routes/auth.js'
import doctorsRouter from './routes/doctors.js'
import messagesRouter from './routes/messages.js'
import bloodRouter from './routes/blood.js'
import uploadsRouter from './routes/uploads.js'
import bookingRouter from './routes/booking.js'
import applicationsRouter from './routes/applications.js'
import videoCallLinksRouter from './routes/videoCallLinks.js'
import reviewsRouter from './routes/reviews.js'
import callsRouter from './routes/calls.js'
import complaintsRouter from './routes/complaints.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendRoot = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(backendRoot, '.env') })

const app = express()

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lifelink'
function isInvalidMongoUri(uri) {
  if (!uri) return true
  if (uri.indexOf('<') !== -1 || uri.indexOf('>') !== -1) return true
  if (/:\/\/[^:]+:@/.test(uri)) return true
  if (/mongodb(?:\+srv)?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/.+/.test(uri)) return false
  if (/mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@/.test(uri)) return false
  if (/mongodb(?:\+srv)?:\/\//.test(uri) && !/@/.test(uri)) return true
  return false
}

if (isInvalidMongoUri(MONGODB_URI)) {
  const sanitized = (MONGODB_URI || '').replace(/(:)([^@]+)(@)/, (_m, p1, _p2, p3) => p1 + '***' + p3)
  console.error('\nInvalid or placeholder `MONGODB_URI` detected in backend/.env.\n')
  console.error('Sanitized value:', sanitized)
  console.error('Please set a real connection string in backend/.env, for example:')
  console.error('MONGODB_URI="mongodb+srv://<db_user>:<password>@cluster0.XXXXXXXX.mongodb.net/lifelink?retryWrites=true&w=majority"\n')
  console.error('If your password contains special characters, URL-encode them (e.g. @ → %40).')
  process.exit(1)
}
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((url) => url.trim()).filter(Boolean)
  : ['http://localhost:5173']

function isOriginAllowed(origin) {
  if (!origin) return true
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true
  return CLIENT_ORIGIN.includes(origin)
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) return callback(null, true)
      return callback(new Error(`Not allowed by CORS: ${origin}`))
    },
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
const uploadsPath = path.join(backendRoot, 'uploads')
app.use('/uploads', express.static(uploadsPath))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRouter)
app.use('/api/doctors', doctorsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/blood', bloodRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/doctor-applications', applicationsRouter)
app.use('/api/video-call-links', videoCallLinksRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/calls', callsRouter)
app.use('/api/complaints', complaintsRouter)
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Backend running on :${PORT}`))
  })
  .catch((err) => {
    console.error('Mongo connection error', err)
    process.exit(1)
  })



