async function askNotificationPermission(){
  if(!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)){
    throw new Error('Browser does not support notifications');
  }
  const perm = await Notification.requestPermission();
  if(perm !== 'granted') throw new Error('Permission denied');
  const reg = await navigator.serviceWorker.register('/sw.js');
  const { publicKey } = await fetch('/api/notify/public-key').then(r=>r.json());
  if(!publicKey) throw new Error('Server missing VAPID public key');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });
  await App.api('/api/notify/subscribe', { method:'POST', body: JSON.stringify(sub) });
  return true;
}
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
window.askNotificationPermission = askNotificationPermission;
