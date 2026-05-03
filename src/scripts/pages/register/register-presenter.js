import { register } from '../../data/api.js';

export default class RegisterPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
    this.#init();
  }

  #init() {
    this.#view.bindFormSubmit(({ name, email, password }) =>
      this.#handleRegister(name, email, password),
    );
  }

  async #handleRegister(name, email, password) {
    this.#view.clearAlert();
    let valid = true;

    if (!name) {
      this.#view.showFieldError('name', true, 'Nama wajib diisi.');
      valid = false;
    } else {
      this.#view.showFieldError('name', false);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.#view.showFieldError('email', true, 'Email tidak valid.');
      valid = false;
    } else {
      this.#view.showFieldError('email', false);
    }

    if (!password || password.length < 8) {
      this.#view.showFieldError('password', true, 'Kata sandi minimal 8 karakter.');
      valid = false;
    } else {
      this.#view.showFieldError('password', false);
    }

    if (!valid) return;

    this.#view.showLoading(true);
    try {
      await register(name, email, password);
      this.#view.showAlert(
        'Akun berhasil dibuat! <a href="#/login">Masuk sekarang</a>',
        'success',
      );
      this.#view.resetForm();
    } catch (error) {
      this.#view.showAlert(error.message || 'Gagal mendaftar, coba lagi.', 'error');
    } finally {
      this.#view.showLoading(false);
    }
  }
}
