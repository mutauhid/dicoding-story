importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded 🎉`);

  workbox.core.clientsClaim();
  workbox.core.skipWaiting();

  // Cache App Shell (HTML, CSS, JS, Images)
  workbox.routing.registerRoute(
    ({ request }) => ['document', 'script', 'style', 'image'].includes(request.destination),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'app-shell-cache',
    })
  );

  // Cache API GET requests
  workbox.routing.registerRoute(
    ({ url }) => url.href.includes('/stories') && !url.href.includes('guest'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'dicoding-stories-api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        }),
      ],
    })
  );

} else {
  console.log(`Workbox didn't load 😬`);
}

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-stories') {
    console.log('Syncing offline stories...');
    event.waitUntil(syncStories());
  }
});

async function syncStories() {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('dicoding-story-db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  
  const tx = db.transaction('sync-stories', 'readwrite');
  const store = tx.objectStore('sync-stories');
  const getAllReq = store.getAll();
  
  const stories = await new Promise((resolve, reject) => {
    getAllReq.onsuccess = () => resolve(getAllReq.result);
    getAllReq.onerror = () => reject(getAllReq.error);
  });

  if (!stories || stories.length === 0) return;

  const BASE_URL = 'https://story-api.dicoding.dev/v1';

  for (const story of stories) {
    const formData = new FormData();
    formData.append('description', story.description);
    formData.append('photo', story.photo);
    if (story.lat) formData.append('lat', story.lat);
    if (story.lon) formData.append('lon', story.lon);

    try {
      const response = await fetch(`${BASE_URL}/stories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${story.token}` },
        body: formData,
      });

      if (response.ok) {
        // Remove from IDB after success
        const deleteTx = db.transaction('sync-stories', 'readwrite');
        deleteTx.objectStore('sync-stories').delete(story.id);
        
        // Show notification
        if (Notification.permission === 'granted') {
          self.registration.showNotification('Cerita Berhasil Diunggah!', {
            body: 'Cerita offline Anda berhasil dikirim ke server.',
            icon: '/favicon.png',
          });
        }
      }
    } catch (err) {
      console.error('Failed to sync story:', err);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (Notification.permission !== 'granted') return;

  let data = {
    title: 'Dicoding Story',
    options: { body: 'Ada notifikasi baru!' },
  };

  if (event.data) {
    try {
    
      data = event.data.json();
    } catch {
      data.options = { body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Dicoding Story', {
      body: data.options?.body || '',
      icon: data.options?.icon || '/favicon.png',
      badge: '/favicon.png',
      data: {
        url: data.data?.id ? `/#/stories/${data.data.id}` : '/'
      }
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.navigate(targetUrl).then(c => c.focus());
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});
