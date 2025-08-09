import mongoose from 'mongoose';

export default mongoose.model('Prescription', new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: String,
  original: String,
  remark:   String,
  uploadedAt:{ type: Date, default: Date.now }
},{timestamps:true}));
