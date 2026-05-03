import routes from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser.js';
import { isLoggedIn, removeAuth, getUser } from '../utils/auth.js';
import {
  requestPermission,
  subscribePush,
  unsubscribePush,
  getSubscription,
} from '../utils/notification.js';
import Swal from 'sweetalert2';

const PROTECTED_ROUTES = ['/', '/add', '/stories/:id'];
const AUTH_ROUTES = ['/login', '/register'];

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupPWA();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', String(isOpen));
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  #updateNavigation() {
    const loggedIn = isLoggedIn();
    const user = getUser();

    document.querySelectorAll('.nav-auth-only').forEach((el) => {
      el.style.display = loggedIn ? '' : 'none';
    });

    const navLoginLi = document.getElementById('nav-login-li');
    if (navLoginLi) navLoginLi.style.display = loggedIn ? 'none' : '';

    const userBtn = document.getElementById('nav-user-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (userBtn && loggedIn && user) {
      userBtn.title = `${user.name}`;
      
      userBtn.onclick = (e) => {
        e.stopPropagation();
        const isVisible = userDropdown.style.display === 'block';
        userDropdown.style.display = isVisible ? 'none' : 'block';
        userBtn.setAttribute('aria-expanded', String(!isVisible));
      };

      
      document.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.style.display = 'none';
          userBtn.setAttribute('aria-expanded', 'false');
        }
      }, { once: true });
    }

    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        const result = await Swal.fire({
          title: 'Konfirmasi',
          text: 'Yakin ingin keluar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya, keluar',
          cancelButtonText: 'Batal'
        });
        
        if (result.isConfirmed) {
          removeAuth();
          window.location.hash = '#/login';
        }
      };
    }

    const notifBtn = document.getElementById('nav-notif');
    if (notifBtn && loggedIn) {
      getSubscription().then((sub) => {
        notifBtn.title = sub ? 'Matikan notifikasi' : 'Aktifkan notifikasi';
        notifBtn.textContent = sub ? '🔕' : '🔔';
      });

      notifBtn.onclick = async () => {
        const sub = await getSubscription();
        const granted = await requestPermission();
        if (!granted) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Izin notifikasi ditolak.'
          });
          return;
        }
        if (sub) {
          await unsubscribePush();
          notifBtn.textContent = '🔔';
          notifBtn.title = 'Aktifkan notifikasi';
        } else {
          await subscribePush();
          notifBtn.textContent = '🔕';
          notifBtn.title = 'Matikan notifikasi';
        }
      };
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    
    if (!page) {
      this.#content.innerHTML = `
        <section class="container">
          <div class="empty-state">
            <p>Halaman tidak ditemukan.</p>
            <a href="#/" class="btn btn-primary">Ke Beranda</a>
          </div>
        </section>`;
      return;
    }


    if (PROTECTED_ROUTES.includes(url) && !isLoggedIn()) {
      window.location.hash = '#/login';
      return;
    }

    if (AUTH_ROUTES.includes(url) && isLoggedIn()) {
      window.location.hash = '#/';
      return;
    }

    this.#updateNavigation();

    const renderContent = async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.#content.focus();
    };

    if (document.startViewTransition) {
      await document.startViewTransition(renderContent).finished;
    } else {
      await renderContent();
    }
  }

  #setupPWA() {
    const installBtn = document.getElementById('install-app-btn');
    if (!installBtn) return;

    const showButton = () => {
      installBtn.style.display = 'block';
    };

    if (window.deferredPrompt) {
      showButton();
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      showButton();
    });

    installBtn.addEventListener('click', async () => {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        window.deferredPrompt = null;
        installBtn.style.display = 'none';
      }
    });

    window.addEventListener('appinstalled', () => {
      installBtn.style.display = 'none';
      window.deferredPrompt = null;
    });
  }
}

export default App;
