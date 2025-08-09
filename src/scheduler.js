import cron from 'node-cron';
import Medicine from './models/Medicine.js';
import User from './models/User.js';
import nodemailer from 'nodemailer';
import webpush from 'web-push';
import PushSub from './models/PushSub.js';
import jwt from 'jsonwebtoken'; // <-- added

function makeTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

export function startScheduler() {
  // Web Push must use https:// or mailto: subject
  const subject = process.env.SITE_URL && (process.env.SITE_URL.startsWith('https://') || process.env.SITE_URL.startsWith('mailto:'))
    ? process.env.SITE_URL
    : 'mailto:no-reply@med-reminder.local';

  if (process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE) {
    webpush.setVapidDetails(subject, process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
  }

  const transporter = makeTransport();

  // run every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const due = await Medicine.find({ active: true, nextAt: { $lte: now } });

    for (const med of due) {
      // --- Web Push with signed action token ---
      try {
        if (process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE) {
          const subs = await PushSub.find({ userId: med.userId });

          // Create short-lived token so SW can call /api/meds/action without a session
          const actionToken = jwt.sign(
            { uid: String(med.userId), mid: String(med._id) },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
          );

          const defaultSnoozeMinutes = 10; // adjust if you want

          for (const sub of subs) {
            const payload = JSON.stringify({
              title: 'Time to take: ' + (med.name || 'your medicine'),
              body: med.dosage || '',
              medId: String(med._id),
              token: actionToken,
              minutes: defaultSnoozeMinutes
            });
            webpush
              .sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
              .catch(err => console.warn('Push error', err?.statusCode || err?.message));
          }
        }
      } catch (e) {
        console.error('Push failed', e.message);
      }

      // --- Email (optional, only if SMTP configured) ---
      try {
        const user = await User.findById(med.userId);
        console.log('Reminder:', user?.email, med.name, med.dosage);

        if (transporter && user?.email) {
          await transporter.sendMail({
            from: process.env.FROM_EMAIL || 'no-reply@med-reminder',
            to: user.email,
            subject: `Time to take: ${med.name}`,
            text: `Dosage: ${med.dosage || ''}`
          });
        }

        // --- Reschedule or deactivate ---
        if (med.repeatDays && med.repeatDays > 0) {
          const next = new Date((med.nextAt || now).getTime() + med.repeatDays * 24 * 60 * 60 * 1000);
          med.nextAt = next;
        } else {
          med.active = false;
        }
        await med.save();
      } catch (e) {
        console.error('Scheduler error:', e.message);
      }
    }
  });
}

