import { getStories } from '../../data/api.js';

export default class HomePresenter {
  #view;
  #map = null;
  #markers = {};
  #stories = [];

  constructor({ view }) {
    this.#view = view;
    this.#init();
  }

  async #init() {
    this.#view.showLoading(true);
    try {
      const result = await getStories({ location: 1 });
      this.#stories = result.listStory || [];

      
      await this.#waitForLeaflet();
      this.#map = this.#view.initMap(this.#stories);
      this.#markers = this.#view.renderMarkers(
        this.#map,
        this.#stories,
        (id) => this.#onMarkerClick(id),
      );

      this.#view.renderStories(
        this.#stories,
        (id) => this.#onCardHover(id),
        (id) => this.#onCardClick(id),
      );
    } catch (error) {
      this.#view.showAlert(
        `Gagal memuat cerita: ${error.message}. Pastikan Anda sudah login.`,
        'error',
      );
    } finally {
      this.#view.showLoading(false);
    }
  }

  #onCardHover(id) {
    this.#view.highlightMarker(this.#markers, id);
  }

  #onCardClick(id) {
    window.location.hash = `#/stories/${id}`;
  }

  #onMarkerClick(id) {
    this.#view.scrollToCard(id);
    this.#view.highlightMarker(this.#markers, id);
  }

  async #waitForLeaflet() {
    const { default: L } = await import('../../utils/leaflet-config.js');
    window.L = L;
  }
}
