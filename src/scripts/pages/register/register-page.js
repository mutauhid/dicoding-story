import Swal from 'sweetalert2';

export default class RegisterPage {
  async render() {
    return `
      <section class="container auth-container" aria-labelledby="register-heading">
        <h1 id="register-heading">Daftar Akun</h1>
        <p class="auth-subtitle">Buat akun baru untuk mulai berbagi cerita</p>

        <div id="register-alert" role="alert" aria-live="polite"></div>

        <div class="form-container">
          <form id="register-form" novalidate>
            <div class="form-group" id="fg-name">
              <label for="name">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                name="name"
                autocomplete="name"
                placeholder="Nama Anda"
                required
                aria-required="true"
                aria-describedby="name-error"
              />
              <span class="field-error" id="name-error" aria-live="polite">Nama wajib diisi.</span>
            </div>

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
                autocomplete="new-password"
                placeholder="Minimal 8 karakter"
                required
                aria-required="true"
                aria-describedby="password-error"
              />
              <span class="field-error" id="password-error" aria-live="polite">Kata sandi minimal 8 karakter.</span>
            </div>

            <button type="submit" id="register-btn" class="btn btn-primary" style="width:100%">
              Daftar
            </button>
          </form>
        </div>

        <p class="auth-link">
          Sudah punya akun? <a href="#/login">Masuk</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    const { default: RegisterPresenter } = await import('./register-presenter.js');
    new RegisterPresenter({ view: this });
  }

  bindFormSubmit(handler) {
    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      handler({ name, email, password });
    });
  }

  showLoading(isLoading) {
    const btn = document.getElementById('register-btn');
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Memproses...' : 'Daftar';
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

  showFieldError(fieldId, show, message) {
    const group = document.getElementById(`fg-${fieldId}`);
    if (!group) return;
    group.classList.toggle('has-error', show);
    if (message) {
      const errEl = document.getElementById(`${fieldId}-error`);
      if (errEl) errEl.textContent = message;
    }
  }

  resetForm() {
    const form = document.getElementById('register-form');
    if (form) form.reset();
  }
}
