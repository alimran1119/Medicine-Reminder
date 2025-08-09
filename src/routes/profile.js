import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// configure multer to store uploads in /uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads'),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// GET /api/profile
// returns { email, name, phone, age, role, photo }
router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('email name phone age role photo');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT /api/profile
// multipart/form-data: fields name, phone, age, optional file field "photo"
router.put('/', requireAuth, upload.single('photo'), async (req, res) => {
  const { name, phone, age } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (name)  user.name  = name;
  if (phone) user.phone = phone;
  if (age)   user.age   = Number(age);

  if (req.file) {
    user.photo = `/uploads/${req.file.filename}`;
  }

  await user.save();
  // return the updated fields
  res.json({
    email: user.email,
    name:  user.name,
    phone: user.phone,
    age:   user.age,
    role:  user.role,
    photo: user.photo
  });
});

export default router;
