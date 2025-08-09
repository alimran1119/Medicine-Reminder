// public/sw.js
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data.json(); } catch {}
  const title = data.title || 'Medicine Reminder';
  const body = data.body || '';
  const icon = '/placeholder.png';
  const badge = '/placeholder.png';

  // We’ll need medId + token to call the server from the SW
  const notificationData = {
    medId: data.medId,
    token: data.token,
    minutes: data.minutes || 10 // default snooze minutes
  };

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: notificationData,
      actions: [
        { action: 'snooze', title: 'Remind me later' },
        { action: 'skip',   title: 'Skip' },
        { action: 'stop',   title: 'Stop' }
      ],
      requireInteraction: true // keep it visible until user acts
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const d = event.notification.data || {};
  const action = event.action || 'open';

  // If user clicked on the body (no action), just open the app
  if (action !== 'snooze' && action !== 'stop' && action !== 'skip') {
    event.waitUntil(clients.openWindow('/dashboard.html'));
    return;
  }

  // Perform the action by calling our signed-token endpoint
  const payload = { token: d.token, action, minutes: d.minutes || 10 };
  event.waitUntil(
    fetch('/api/meds/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(() => {
      // optional: open dashboard to show updated list
      return clients.openWindow('/dashboard.html');
    })
    .catch(() => clients.openWindow('/dashboard.html'))
  );
});
