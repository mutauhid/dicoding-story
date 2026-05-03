import { formatDate } from '../../utils/index.js';
import Swal from 'sweetalert2';

export default class DetailPage {
  async render() {
    return `
      <section class="container" aria-labelledby="detail-heading">
        <div class="page-header">
          <a href="#/" class="btn btn-secondary" style="margin-bottom:12px;display:inline-block"
             aria-label="Kembali ke beranda">← Kembali</a>
          <h1 id="detail-heading" style="font-size:1.4rem;color:var(--color-primary)">Detail Cerita</h1>
        </div>

        <div id="detail-loading" class="loading-spinner">
          <div class="spinner" role="status" aria-label="Memuat detail cerita..."></div>
        </div>
        <div id="detail-alert" role="alert" aria-live="polite"></div>
        <div id="detail-content"></div>
      </section>
    `;
  }

  async afterRender() {
    const { default: DetailPresenter } = await import('./detail-presenter.js');
    new DetailPresenter({ view: this });
  }

  showLoading(show) {
    const el = document.getElementById('detail-loading');
    if (el) el.style.display = show ? 'flex' : 'none';
  }

  showAlert(message, type = 'error') {
    Swal.fire({
      icon: type === 'error' ? 'error' : (type === 'info' ? 'info' : 'success'),
      title: type === 'error' ? 'Oops...' : 'Info',
      text: message,
    });
  }

  renderDetail(story) {
    const container = document.getElementById('detail-content');
    if (!container) return;

    container.innerHTML = `
      <div class="story-detail">
        <div class="story-detail__image">
          <img
            src="${story.photoUrl}"
            alt="Foto cerita oleh ${story.name}"
            width="720"
            height="400"
            style="width:100%;object-fit:cover;max-height:400px;display:block"
          />
        </div>
        <div class="story-detail__body">
          <p class="story-detail__author">${story.name}</p>
          <time class="story-detail__date" datetime="${story.createdAt}">
            ${formatDate(story.createdAt)}
          </time>
          <p class="story-detail__description">${story.description}</p>

          ${story.lat && story.lon ? `
            <p class="section-title" style="margin-top:20px">Lokasi</p>
            <div id="detail-map" class="map-pick-container" style="height:260px;margin-top:8px"
                 role="region" aria-label="Peta lokasi cerita"></div>
          ` : ''}
          <button id="bookmark-btn" class="btn btn-secondary" style="margin-top: 20px; width: 100%;">
            🔖 Simpan ke Bookmark
          </button>
        </div>
      </div>
    `;

    if (story.lat && story.lon) {
      this.#initDetailMap(story);
    }
  }

  async #initDetailMap(story) {
    const L = await import('leaflet');
    const Lmap = L.default || L;
    const map = Lmap.map('detail-map').setView([story.lat, story.lon], 13);

    Lmap.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    Lmap.marker([story.lat, story.lon])
      .addTo(map)
      .bindPopup(`<strong>${story.name}</strong>`)
      .openPopup();
  }
}
