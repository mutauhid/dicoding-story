import { formatDate } from '../../utils/index.js';
import Swal from 'sweetalert2';

export default class HomePage {
  async render() {
    return `
      <section class="container" aria-labelledby="home-heading">
        <div class="page-header">
          <h1 id="home-heading">Cerita Terbaru</h1>
        </div>

        <div id="home-alert" role="alert" aria-live="polite"></div>

        <p class="section-title">Peta Lokasi Cerita</p>
        <div id="story-map" class="map-container" role="region" aria-label="Peta lokasi cerita"></div>

        <p class="section-title" style="margin-top:28px">Daftar Cerita</p>
        <div id="story-loading" class="loading-spinner">
          <div class="spinner" role="status" aria-label="Memuat cerita..."></div>
        </div>
        <div id="story-list" class="story-list" aria-live="polite"></div>
      </section>
    `;
  }

  async afterRender() {
    const { default: HomePresenter } = await import('./home-presenter.js');
    new HomePresenter({ view: this });
  }

  showLoading(show) {
    const el = document.getElementById('story-loading');
    if (el) el.style.display = show ? 'flex' : 'none';
  }

  showAlert(message, type = 'error') {
    Swal.fire({
      icon: type === 'error' ? 'error' : (type === 'info' ? 'info' : 'success'),
      title: type === 'error' ? 'Oops...' : 'Info',
      text: message,
    });
  }

  renderStories(stories, onCardHover, onCardClick) {
    const container = document.getElementById('story-list');
    if (!container) return;

    if (!stories.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Belum ada cerita yang tersedia.</p>
          <a href="#/add" class="btn btn-primary">Tambah Cerita Pertama</a>
        </div>`;
      return;
    }

    container.innerHTML = stories
      .map(
        (story) => `
      <article class="story-card" data-id="${story.id}" tabindex="0" role="article"
               aria-label="Cerita oleh ${story.name}">
        <a href="#/stories/${story.id}" class="story-card__link" tabindex="-1" aria-hidden="true">
          <div class="story-card__image-wrapper">
            <img
              src="${story.photoUrl}"
              alt="Foto cerita oleh ${story.name}"
              loading="lazy"
              width="400"
              height="225"
            />
          </div>
        </a>
        <div class="story-card__body">
          <p class="story-card__author">${story.name}</p>
          <p class="story-card__description">${story.description}</p>
          <time class="story-card__date" datetime="${story.createdAt}">
            ${formatDate(story.createdAt)}
          </time>
        </div>
      </article>
    `,
      )
      .join('');

    container.querySelectorAll('.story-card').forEach((card) => {
      const id = card.dataset.id;
      card.addEventListener('mouseenter', () => onCardHover(id));
      card.addEventListener('focus', () => onCardHover(id));
      card.addEventListener('click', () => onCardClick(id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick(id);
        }
      });
    });
  }

  initMap(stories) {
    
    const L = window.L;
    const mapEl = document.getElementById('story-map');
    if (!mapEl || !L) return null;

    const map = L.map('story-map');

  
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    });

    const cartoDark = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      },
    );

    osm.addTo(map);


    L.control
      .layers({ 'OpenStreetMap': osm, 'Dark Mode': cartoDark }, {}, { collapsed: false })
      .addTo(map);

    return map;
  }

  renderMarkers(map, stories, onMarkerClick) {
    const L = window.L;
    if (!map || !L) return {};

    const markers = {};
    const validStories = stories.filter((s) => s.lat && s.lon);

    if (!validStories.length) return markers;

    const bounds = [];

    validStories.forEach((story) => {
      const marker = L.marker([story.lat, story.lon], {
        title: story.name,
        alt: `Lokasi cerita dari ${story.name}`,
      }).addTo(map);
      marker.bindPopup(`
        <strong>${story.name}</strong><br>
        <small>${story.description.substring(0, 80)}${story.description.length > 80 ? '…' : ''}</small><br>
        <a href="#/stories/${story.id}" style="color:#1a4f8a;font-size:0.8rem">Lihat detail</a>
      `);
      marker.on('click', () => onMarkerClick(story.id));
      markers[story.id] = marker;
      bounds.push([story.lat, story.lon]);
    });

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }

    return markers;
  }

  highlightMarker(markers, storyId) {
    
    Object.values(markers).forEach((m) => {
      m.setOpacity(0.6);
      if (m.getElement()) m.getElement().classList.remove('active-marker');
    });
   
    if (markers[storyId]) {
      markers[storyId].setOpacity(1);
      markers[storyId].openPopup();
      if (markers[storyId].getElement()) {
        markers[storyId].getElement().classList.add('active-marker');
      }
    }
  }

  scrollToCard(storyId) {
    const card = document.querySelector(`.story-card[data-id="${storyId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      card.focus();
    }
  }
}
