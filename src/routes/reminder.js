// src/routes/medicines.js
import express from 'express';
import mongoose from 'mongoose';
import Reminder from '../models/Reminder.js';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// GET all reminders for a user
router.get('/', verifyUser, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST: Create a new reminder
router.post('/', verifyUser, async (req, res) => {
  const { medicineName, dosage, time, repeat } = req.body;
  if (!medicineName || !dosage || !time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newReminder = new Reminder({
      user: req.user._id,
      medicineName,
      dosage,
      time,
      repeat,
    });

    const saved = await newReminder.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Error creating reminder' });
  }
});

// DELETE: Remove a reminder
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting reminder' });
  }
});

// PUT: Toggle enable/disable reminder
router.put('/:id/toggle', verifyUser, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });

    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

    reminder.enabled = !reminder.enabled;
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: 'Error toggling reminder' });
  }
});

export default router;
