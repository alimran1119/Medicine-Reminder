// src/routes/medicines.js
import express from 'express';
import jwt from 'jsonwebtoken';
import Medicine from '../models/Medicine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/* --------- CRUD: reminders for the logged-in user --------- */

router.get('/', requireAuth, async (req, res) => {
  const meds = await Medicine.find({ userId: req.user.id }).sort({ nextAt: 1 });
  res.json(meds);
});

router.post('/', requireAuth, async (req, res) => {
  const { name, dosage, nextAt, repeatDays } = req.body || {};
  if (!name || !nextAt) return res.status(400).json({ error: 'name and nextAt are required' });

  const doc = await Medicine.create({
    userId: req.user.id,
    name: String(name),
    dosage: dosage ? String(dosage) : '',
    nextAt: new Date(nextAt),
    repeatDays: Number(repeatDays || 0),
    active: true
  });
  res.json(doc);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, dosage, nextAt, repeatDays, active } = req.body || {};

  const update = {};
  if (name !== undefined) update.name = String(name);
  if (dosage !== undefined) update.dosage = String(dosage);
  if (nextAt !== undefined) update.nextAt = new Date(nextAt);
  if (repeatDays !== undefined) update.repeatDays = Number(repeatDays);
  if (active !== undefined) update.active = Boolean(active);

  const med = await Medicine.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    update,
    { new: true }
  );
  if (!med) return res.status(404).json({ error: 'Reminder not found' });
  res.json(med);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  await Medicine.deleteOne({ _id: id, userId: req.user.id });
  res.json({ ok: true });
});

/* --------- ACTIONS from notification (no session; signed token) --------- */
/* Body: { token, action: 'snooze' | 'stop' | 'skip', minutes?: number } */

router.post('/action', async (req, res) => {
  try {
    const { token, action, minutes } = req.body || {};
    if (!token || !action) return res.status(400).json({ error: 'Missing token or action' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { uid, mid } = decoded;
    const med = await Medicine.findOne({ _id: mid, userId: uid });
    if (!med) return res.status(404).json({ error: 'Reminder not found' });

    const now = new Date();

    if (action === 'snooze') {
      const mins = Number(minutes || 10);
      med.nextAt = new Date(now.getTime() + mins * 60 * 1000);
      med.active = true;
      await med.save();
      return res.json({ ok: true, action: 'snooze', nextAt: med.nextAt });
    }

    if (action === 'stop') {
      med.active = false;
      await med.save();
      return res.json({ ok: true, action: 'stop' });
    }

    if (action === 'skip') {
      if (med.repeatDays && Number(med.repeatDays) > 0) {
        const days = Number(med.repeatDays);
        med.nextAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        med.active = true;
      } else {
        med.active = false; // one-time → stop
      }
      await med.save();
      return res.json({ ok: true, action: 'skip', nextAt: med.nextAt || null });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error('meds/action error', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
