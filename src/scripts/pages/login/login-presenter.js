import { login } from '../../data/api.js';
import { setAuth } from '../../utils/auth.js';

export default class LoginPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
    this.#init();
  }

  #init() {
    this.#view.bindFormSubmit(({ email, password }) => this.#handleLogin(email, password));
  }

  async #handleLogin(email, password) {
    this.#view.clearAlert();
    let valid = true;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.#view.showFieldError('email', true);
      valid = false;
    } else {
      this.#view.showFieldError('email', false);
    }

    if (!password) {
      this.#view.showFieldError('password', true);
      valid = false;
    } else {
      this.#view.showFieldError('password', false);
    }

    if (!valid) return;

    this.#view.showLoading(true);
    try {
      const result = await login(email, password);
      setAuth(result.loginResult);
      window.location.hash = '#/';
    } catch (error) {
      this.#view.showAlert(error.message || 'Email atau kata sandi salah.', 'error');
    } finally {
      this.#view.showLoading(false);
    }
  }
}
