import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Metric from '../models/Metric.js';

const router = express.Router();

/** Create a reading
 * Body examples:
 *  { kind:'bp', systolic:120, diastolic:80, readingAt:'2025-08-05T12:00:00Z' }
 *  { kind:'sugar', sugar:110, readingAt:'2025-08-05T12:00:00Z' }
 */
router.post('/', requireAuth, async (req, res) => {
  const { kind, systolic, diastolic, sugar, readingAt } = req.body || {};
  if (!kind || !readingAt) return res.status(400).json({ error: 'kind and readingAt required' });
  if (kind === 'bp' && (systolic == null || diastolic == null))
    return res.status(400).json({ error: 'systolic and diastolic required for bp' });
  if (kind === 'sugar' && sugar == null)
    return res.status(400).json({ error: 'sugar required for sugar' });

  const doc = await Metric.create({
    userId: req.user.id,
    kind,
    systolic: kind === 'bp' ? Number(systolic) : undefined,
    diastolic: kind === 'bp' ? Number(diastolic) : undefined,
    sugar: kind === 'sugar' ? Number(sugar) : undefined,
    readingAt: new Date(readingAt)
  });
  res.json(doc);
});

/** List readings
 * /api/metrics?kind=bp&limit=60
 * /api/metrics?kind=sugar&limit=10
 */
router.get('/', requireAuth, async (req, res) => {
  const { kind, limit } = req.query;
  const q = { userId: req.user.id };
  if (kind) q.kind = kind;
  const rows = await Metric.find(q)
    .sort({ readingAt: 1 }) // oldest -> newest
    .limit(Number(limit || 100));
  res.json(rows);
});

export default router;
