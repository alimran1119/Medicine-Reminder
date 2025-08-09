import express from 'express';
import multer from 'multer';
import path from 'path';
import CatalogItem from '../models/CatalogItem.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// local uploads (free): store images in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Public read (free)
router.get('/', async (req, res) => {
  const items = await CatalogItem.find({}).sort({ name: 1 });
  res.json(items);
});

// Admin create (free, local storage)
router.post('/', requireAdmin, upload.single('photo'), async (req, res) => {
  const { name, priceBdt } = req.body;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const item = await CatalogItem.create({ name, priceBdt: Number(priceBdt), photoUrl });
  res.json(item);
});

router.put('/:id', requireAdmin, upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const { name, priceBdt } = req.body;
  const update = { name, priceBdt: Number(priceBdt) };
  if (req.file) update.photoUrl = `/uploads/${req.file.filename}`;
  const item = await CatalogItem.findByIdAndUpdate(id, update, { new: true });
  res.json(item);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  await CatalogItem.findByIdAndDelete(id);
  res.json({ ok: true });
});

export default router;
