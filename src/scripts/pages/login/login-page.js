import Swal from 'sweetalert2';

export default class LoginPage {
  async render() {
    return `
      <section class="container auth-container" aria-labelledby="login-heading">
        <h1 id="login-heading">Masuk</h1>
        <p class="auth-subtitle">Masuk ke akun Dicoding Story Anda</p>

        <div id="login-alert" role="alert" aria-live="polite"></div>

        <div class="form-container">
          <form id="login-form" novalidate>
            <div class="form-group" id="fg-email">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                autocomplete="email"
                placeholder="contoh@email.com"
                required
                aria-required="true"
                aria-describedby="email-error"
              />
              <span class="field-error" id="email-error" aria-live="polite">Email tidak valid.</span>
            </div>

            <div class="form-group" id="fg-password">
              <label for="password">Kata Sandi</label>
              <input
                type="password"
                id="password"
                name="password"
                autocomplete="current-password"
                placeholder="Minimal 8 karakter"
                required
                aria-required="true"
                aria-describedby="password-error"
              />
              <span class="field-error" id="password-error" aria-live="polite">Kata sandi wajib diisi.</span>
            </div>

            <button type="submit" id="login-btn" class="btn btn-primary" style="width:100%">
              Masuk
            </button>
          </form>
        </div>

        <p class="auth-link">
          Belum punya akun? <a href="#/register">Daftar sekarang</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    const { default: LoginPresenter } = await import('./login-presenter.js');
    new LoginPresenter({ view: this });
  }

  bindFormSubmit(handler) {
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      handler({ email, password });
    });
  }

  showLoading(isLoading) {
    const btn = document.getElementById('login-btn');
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Memproses...' : 'Masuk';
  }

  showAlert(message, type = 'error') {
    Swal.fire({
      icon: type === 'error' ? 'error' : (type === 'info' ? 'info' : 'success'),
      title: type === 'error' ? 'Oops...' : 'Info',
      text: message,
    });
  }

  clearAlert() {
    // No-op for SweetAlert2
  }

  showFieldError(fieldId, show) {
    const group = document.getElementById(`fg-${fieldId}`);
    if (group) group.classList.toggle('has-error', show);
  }
}
