// src/models/Reminder.js
import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  time: { type: String, required: true }, // e.g. "08:00 AM"
  repeat: { type: String, enum: ['daily', 'weekly', 'once'], default: 'daily' },
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Reminder', reminderSchema);
