import { Router } from 'express';
import Message from '../models/Message.js';
import Doctor from '../models/Doctor.js';

function parseTimeString(t) {
  if (!t) return null;
  const matched = t.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!matched) return null;
  let hh = parseInt(matched[1], 10);
  const mm = parseInt(matched[2], 10);
  const ampm = matched[3];
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hh < 12) hh += 12;
    if (ampm.toUpperCase() === 'AM' && hh === 12) hh = 0;
  }
  return hh * 60 + mm;
}

function parseDaysRange(str) {
  if (!str) return null;
  const daysMap = { mon:1, tue:2, wed:3, thu:4, fri:5, sat:6, sun:0 };
  const dayTokens = str.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(\s*-\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?/i);
  if (!dayTokens) return null;
  const start = dayTokens[1].slice(0,3).toLowerCase();
  const end = dayTokens[3] ? dayTokens[3].slice(0,3).toLowerCase() : null;
  const startIdx = daysMap[start];
  const endIdx = end ? daysMap[end] : startIdx;
  const days = [];
  for (let i = startIdx; ; ) {
    days.push(i);
    if (i === endIdx) break;
    i = (i + 1) % 7;
  }
  return days;
}

function parseAvailabilityString(str) {
  if (!str) return null;
  str = str.trim();
  if (/online/i.test(str) || (/available/i.test(str) && /online/i.test(str))) return { always: true };
  const timeMatch = str.match(/(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)/i);
  const daysMatch = str.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:\s*-\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?/i);
  const times = timeMatch ? { start: parseTimeString(timeMatch[1]), end: parseTimeString(timeMatch[2]) } : null;
  const days = daysMatch ? parseDaysRange(daysMatch[0]) : null;
  return { times, days };
}

function checkAvailability(availabilityStr, dateStr, timeStr) {
  if (!availabilityStr) return true;
  const parsed = parseAvailabilityString(availabilityStr);
  if (!parsed) return true;
  if (parsed.always) return true;
  const date = new Date(dateStr + 'T00:00:00');
  const dayIdx = date.getDay();
  if (parsed.days && parsed.days.length && !parsed.days.includes(dayIdx)) return false;
  const t = parseTimeString(timeStr);
  if (parsed.times && (t < parsed.times.start || t > parsed.times.end)) return false;
  return true;
}

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { doctorEmail, userName, userEmail, doctorName, appointmentDate, appointmentTime, userZone } = req.body;

    if (!doctorEmail || !userName || !userEmail || !doctorName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (String(doctor.status || '').toLowerCase() === 'inactive') {
      return res.status(403).json({ success: false, message: 'Doctor is currently unavailable' });
    }

    const existingDoctorForUser = await Doctor.findOne({ email: userEmail });
    if (existingDoctorForUser) {
      return res.status(403).json({ success: false, message: 'Doctors cannot create bookings' });
    }

    if (doctorEmail === userEmail) {
      return res.status(400).json({ success: false, message: 'Cannot book your own profile' });
    }

    if ((appointmentDate && appointmentTime) && !checkAvailability(doctor.availability, appointmentDate, appointmentTime)) {
      return res.status(400).json({ success: false, message: 'Selected appointment date/time is outside the doctor\'s availability' });
    }
    try {
      if (doctor.zone && userZone && !/online/i.test(doctor.zone) && doctor.zone.toLowerCase() !== userZone.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Doctor and patient zone do not match' });
      }
    } catch(e) {
    }
    const bodyText = `Booking request for Dr. ${doctorName} from ${userName} (${userEmail})` + (appointmentDate && appointmentTime ? ` on ${appointmentDate} at ${appointmentTime}` : '');
    const message = await Message.create({
      doctor_id: doctor._id,
      doctorEmail: doctor.email,
      user_id: userEmail,
      userEmail: userEmail,
      username: userName,
      body: bodyText,
    });

    let requestObj = null;
    try {
      requestObj = {
        name: userName,
        email: userEmail,
        userid: userEmail,
        status: 'pending',
        appointment: (appointmentDate && appointmentTime) ? { date: appointmentDate, time: appointmentTime } : null,
        createdAt: new Date()
      };
      doctor.requests = Array.isArray(doctor.requests) ? doctor.requests : [];
      doctor.requests.push(requestObj);
      await doctor.save();
    } catch (err2) {
      console.error('Failed to append request to doctor:', err2);
    }
    return res.status(201).json({ success: true, message, request: requestObj });
  } catch (err) {
    console.error('Booking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to store booking message', error: err.message || String(err) });
  }
});

export default router;

