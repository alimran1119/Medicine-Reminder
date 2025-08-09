// scripts/fillPhotoUrls.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import CatalogItem from '../src/models/CatalogItem.js';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  const items = await CatalogItem.find();
  for (let item of items) {
    if (!item.photoUrl) {
      const slug = slugify(item.name, { lower: true, strict: true });
      item.photoUrl = `/uploads/medicines/${slug}.png`;
      await item.save();
      console.log(`→ Set ${item.name} → ${item.photoUrl}`);
    }
  }
  console.log('All done');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
