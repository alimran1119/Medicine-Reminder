import mongoose from 'mongoose';

const MetricSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ['bp', 'sugar'], required: true }, // 'bp' or 'sugar'
    systolic: Number,
    diastolic: Number,
    sugar: Number,            // mg/dL
    readingAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Metric', MetricSchema);


