import { Router } from 'express'
import BloodRequest from '../models/BloodRequest.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const docs = await BloodRequest.find().sort({ createdAt: -1 })
    res.json({ documents: docs })
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch blood requests' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const doc = await BloodRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    const response = {
      id: doc._id,
      name: doc.patientName || doc.name || "Anonymous",
      group: doc.bloodGroup || doc.group || "Unknown",
      location: doc.hospital || doc.location || "Unknown",
      phno: doc.contact || doc.phone || doc.phno || "",
      requiredUnits: doc.requiredUnits || 1,
      receivedUnits: doc.receivedUnits || 0,
      donations: doc.donations || [],
      status: doc.status || "pending",
      type: doc.type || "request",
      notes: doc.details || doc.notes || "",
    };

    res.json(response);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch" });
  }
});

router.post('/:id/donate', async (req, res) => {
  try {
    const { donorName, donorPhone, bloodGroup, units } = req.body;
    
    if (!donorName || !donorPhone || !units || units < 1) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    if (request.status === 'completed') {
      return res.status(400).json({ message: 'Blood request already completed' });
    }

    const remaining = request.requiredUnits - (request.receivedUnits || 0);
    const unitsRequested = parseInt(units);

    if (unitsRequested > remaining) {
      return res.status(400).json({ 
        message: `Cannot donate ${unitsRequested} units. Only ${remaining} units needed. Please donate ${remaining} units or less.` 
      });
    }

    if (unitsRequested <= 0) {
      return res.status(400).json({ message: 'Blood request already fulfilled' });
    }

    const donation = {
      donorName: donorName.trim(),
      donorPhone: donorPhone.trim(),
      bloodGroup: bloodGroup || request.bloodGroup,
      units: unitsRequested,
      donatedAt: new Date(),
    };

    request.donations = request.donations || [];
    request.donations.push(donation);

    request.receivedUnits = (request.receivedUnits || 0) + unitsRequested;

    if (request.receivedUnits >= request.requiredUnits) {
      await BloodRequest.findByIdAndDelete(req.params.id);
      
      return res.status(200).json({
        success: true,
        message: '🎉 Hurray! Blood donated successfully! Request fulfilled and removed.',
        donation: donation,
      });
    }

    const updated = await request.save();

    const response = {
      id: updated._id,
      name: updated.patientName || updated.name || "Anonymous",
      group: updated.bloodGroup || updated.group || "Unknown",
      location: updated.hospital || updated.location || "Unknown",
      phno: updated.contact || updated.phone || updated.phno || "",
      requiredUnits: updated.requiredUnits || 1,
      receivedUnits: updated.receivedUnits || 0,
      donations: updated.donations || [],
      status: updated.status || "pending",
      type: updated.type || "request",
      notes: updated.details || updated.notes || "",
    };

    res.status(200).json(response);
  } catch (e) {
    console.error('Donation error:', e);
    res.status(500).json({ message: 'Failed to record donation', error: e.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const body = req.body || {}
    
    const payload = {
      patientName: body.patientName || body.name || 'Anonymous',
      bloodGroup: body.bloodGroup || body.group,
      requiredUnits: body.requiredUnits ? parseInt(body.requiredUnits) : (body.units ? parseInt(body.units) : 1),
      receivedUnits: 0,
      donations: [],
      units: Number(body.units || 1),
      hospital: body.hospital || body.location || 'Unknown',
      contact: body.contact || body.phone || body.phno || '',
      details: body.details || body.notes || '',
      type: body.type || 'request',
      status: body.status || 'pending',
      user_id: body.user_id,
      phone: body.phone || body.phno,
      location: body.location,
      lastDonation: body.lastDonation,
      notes: body.notes,
      name: body.name,
      group: body.group,
      phno: body.phno,
    }

    if (!payload.bloodGroup || !payload.contact) {
      return res.status(400).json({ message: 'bloodGroup and contact are required' })
    }

    const created = await BloodRequest.create(payload)
    res.status(201).json(created)
  } catch (e) {
    res.status(400).json({ message: 'Create failed' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await BloodRequest.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(400).json({ message: 'Delete failed' })
  }
})

export default router



