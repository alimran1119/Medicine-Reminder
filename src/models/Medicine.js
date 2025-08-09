import mongoose from 'mongoose';

const medSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: String,
  nextAt: { type: Date, required: true },
  repeatDays: { type: Number, default: 0 }, // 0 = one-time
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Medicine', medSchema);
