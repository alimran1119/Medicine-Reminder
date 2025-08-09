// src/models/CatalogItem.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const catalogSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  priceBdt:  { type: Number, required: true },
  photoUrl:  { type: String, default: '' }
}, { timestamps: true });

// If photoUrl is blank, derive it from the name
catalogSchema.pre('save', function(next) {
  if (!this.photoUrl) {
    const slug = slugify(this.name, { lower: true, strict: true });
    this.photoUrl = `/uploads/medicines/${slug}.png`;
  }
  next();
});

export default mongoose.model('CatalogItem', catalogSchema);
