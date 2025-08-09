// server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

import authRoutes          from './src/routes/auth.js';
import medRoutes           from './src/routes/medicines.js';
import catalogRoutes       from './src/routes/catalog.js';
import notifyRoutes        from './src/routes/notify.js';
import metricsRoutes       from './src/routes/metrics.js';
import prescriptionsRoutes from './src/routes/prescriptions.js';
import profileRoutes       from './src/routes/profile.js';
import { startScheduler }  from './src/scheduler.js';

dotenv.config();

// Catalog seeding helper
async function ensureCatalogSeed() {
  const CatalogItem = (await import('./src/models/CatalogItem.js')).default;
  const count = await CatalogItem.countDocuments();
  if (count === 0) {
    const base = [
      "Paracetamol 500 mg","Ibuprofen 200 mg","Aspirin 75 mg","Cetirizine 10 mg","Loratadine 10 mg",
      "Azithromycin 500 mg","Amoxicillin 500 mg","Metformin 500 mg","Omeprazole 20 mg","Pantoprazole 40 mg",
      "Atorvastatin 10 mg","Rosuvastatin 10 mg","Losartan 50 mg","Amlodipine 5 mg","Metoprolol 50 mg",
      // …etc up to 120 items…
    ];
    while (base.length < 120) {
      base.push(`Generic Medicine ${base.length+1} 500 mg`);
    }
    const docs = base.map(name => ({
      name,
      priceBdt: Math.floor(30 + Math.random()*1200),
      photoUrl: ''
    }));
    await CatalogItem.insertMany(docs);
    console.log('Auto-seeded', docs.length, 'catalog items');
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api/auth',          authRoutes);
app.use('/api/meds',          medRoutes);
app.use('/api/catalog',       catalogRoutes);
app.use('/api/notify',        notifyRoutes);
app.use('/api/metrics',       metricsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/profile',       profileRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// Ensure env var
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not set in .env');
  process.exit(1);
}

// Connect to MongoDB, then seed, start scheduler, and listen
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');
    await ensureCatalogSeed();
    startScheduler();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

