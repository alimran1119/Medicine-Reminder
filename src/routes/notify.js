import express from 'express';
import webpush from 'web-push';
import PushSub from '../models/PushSub.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC || '' });
});

router.post('/subscribe', requireAuth, async (req, res) => {
  const sub = req.body; // { endpoint, keys:{p256dh,auth} }
  if(!sub?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  await PushSub.updateOne(
    { endpoint: sub.endpoint },
    { $set: { userId: req.user.id, endpoint: sub.endpoint, keys: sub.keys } },
    { upsert: true }
  );
  res.json({ ok: true });
});

export default router;
