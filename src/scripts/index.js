
import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app.js';

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', reg.scope);
    } catch (err) {
      console.warn('Service Worker registration failed:', err);
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
