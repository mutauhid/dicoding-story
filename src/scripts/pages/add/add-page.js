import Swal from 'sweetalert2';

export default class AddStoryPage {
  async render() {
    return `
      <section class="container" aria-labelledby="add-heading">
        <div class="page-header">
          <h1 id="add-heading">Tambah Cerita Baru</h1>
        </div>

        <div id="add-alert" role="alert" aria-live="polite"></div>

        <div class="form-container">
          <form id="add-form" novalidate>

            <!-- Description -->
            <div class="form-group" id="fg-description">
              <label for="description">Deskripsi <span aria-hidden="true">*</span></label>
              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Ceritakan sesuatu yang menarik..."
                required
                aria-required="true"
                aria-describedby="description-error"
              ></textarea>
              <span class="field-error" id="description-error" aria-live="polite">
                Deskripsi wajib diisi.
              </span>
            </div>

            <!-- Photo -->
            <div class="form-group" id="fg-photo">
              <label id="photo-group-label">Foto <span aria-hidden="true">*</span></label>
              <div class="photo-tabs" role="group" aria-labelledby="photo-group-label">
                <button type="button" id="tab-upload" class="photo-tab-btn active" aria-pressed="true">
                  Upload File
                </button>
                <button type="button" id="tab-camera" class="photo-tab-btn" aria-pressed="false">
                  Kamera
                </button>
              </div>

              <!-- Upload section -->
              <div id="upload-section" class="upload-section">
                <label for="photo-file" class="custom-file-label">Pilih file foto</label>
                <input
                  type="file"
                  id="photo-file"
                  name="photo"
                  accept="image/*"
                  aria-describedby="photo-error"
                />
                <div id="upload-preview" class="photo-preview-wrapper" aria-live="polite"></div>
              </div>

              <!-- Camera section -->
              <div id="camera-section" class="camera-section" aria-label="Kamera langsung">
                <video id="camera-preview" autoplay playsinline aria-label="Pratinjau kamera"></video>
                <canvas id="camera-canvas" aria-hidden="true" style="display:none"></canvas>
                <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
                  <button type="button" id="btn-start-camera" class="btn btn-secondary">
                    Nyalakan Kamera
                  </button>
                  <button type="button" id="btn-capture" class="btn btn-primary" disabled>
                    Ambil Foto
                  </button>
                  <button type="button" id="btn-retake" class="btn btn-secondary" style="display:none">
                    Ulangi
                  </button>
                </div>
                <div id="camera-preview-wrapper" class="photo-preview-wrapper" aria-live="polite"></div>
              </div>

              <span class="field-error" id="photo-error" aria-live="polite">
                Foto wajib dipilih atau diambil.
              </span>
            </div>

            <!-- Location -->
            <div class="form-group">
              <label id="location-label">Lokasi (opsional)</label>
              <p class="add-map-label">Klik peta untuk memilih lokasi cerita Anda.</p>
              <div id="add-map" class="map-pick-container" role="region" aria-labelledby="location-label"></div>
              <p class="coords-display" id="coords-display" aria-live="polite">
                Belum ada lokasi dipilih.
              </p>
              <input type="hidden" id="lat" name="lat" />
              <input type="hidden" id="lon" name="lon" />
            </div>

            <button type="submit" id="add-btn" class="btn btn-primary" style="width:100%;margin-top:8px">
              Kirim Cerita
            </button>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const { default: AddPresenter } = await import('./add-presenter.js');
    new AddPresenter({ view: this });
  }

  bindFormSubmit(handler) {
    document.getElementById('add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      handler();
    });
  }

  showLoading(isLoading) {
    const btn = document.getElementById('add-btn');
    if (btn) {
      btn.disabled = isLoading;
      btn.textContent = isLoading ? 'Mengirim...' : 'Kirim Cerita';
    }
  }

  showAlert(message, type = 'error') {
    Swal.fire({
      icon: type === 'error' ? 'error' : (type === 'info' ? 'info' : 'success'),
      title: type === 'error' ? 'Oops...' : (type === 'success' ? 'Berhasil' : 'Info'),
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

  getFormValues() {
    return {
      description: document.getElementById('description').value.trim(),
      lat: document.getElementById('lat').value || null,
      lon: document.getElementById('lon').value || null,
      photoFile: document.getElementById('photo-file').files[0] || null,
    };
  }

  resetForm() {
    document.getElementById('add-form').reset();
    document.getElementById('upload-preview').innerHTML = '';
    document.getElementById('coords-display').textContent = 'Belum ada lokasi dipilih.';
    document.getElementById('lat').value = '';
    document.getElementById('lon').value = '';
    this.resetCameraUI();
  }



  initMap(onMapClick) {
    const L = window.L;
    const container = document.getElementById('add-map');
    if (!container || !L) return null;

    const map = L.map('add-map').setView([-2.5, 117.5], 4);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    osm.addTo(map);

    const cartoDark = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; CARTO', maxZoom: 19 },
    );

    L.control
      .layers({ 'OpenStreetMap': osm, 'Dark Mode': cartoDark })
      .addTo(map);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.updateCoords(lat, lng);
      onMapClick(lat, lng);
    });

    return map;
  }

  updateCoords(lat, lon) {
    document.getElementById('lat').value = lat.toFixed(6);
    document.getElementById('lon').value = lon.toFixed(6);
    document.getElementById('coords-display').textContent =
      `Lokasi dipilih: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }

  bindPhotoTabs(onTabClick) {
    const tabUpload = document.getElementById('tab-upload');
    const tabCamera = document.getElementById('tab-camera');

    const handleTab = (mode) => {
      const isUpload = mode === 'upload';
      tabUpload.classList.toggle('active', isUpload);
      tabUpload.setAttribute('aria-pressed', isUpload);
      tabCamera.classList.toggle('active', !isUpload);
      tabCamera.setAttribute('aria-pressed', !isUpload);

      document.getElementById('upload-section').classList.toggle('hidden', !isUpload);
      document.getElementById('camera-section').classList.toggle('active', !isUpload);

      onTabClick(mode);
    };

    tabUpload.addEventListener('click', () => handleTab('upload'));
    tabCamera.addEventListener('click', () => handleTab('camera'));
  }

  bindFileChange(onFileChange) {
    const fileInput = document.getElementById('photo-file');
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        this.setUploadPreview(url);
        onFileChange(file);
      }
    });
  }

  setUploadPreview(url) {
    const preview = document.getElementById('upload-preview');
    preview.innerHTML = `<img src="${url}" alt="Pratinjau foto yang dipilih" />`;
  }

  bindCameraActions({ onStart, onCapture, onRetake }) {
    const startBtn = document.getElementById('btn-start-camera');
    const captureBtn = document.getElementById('btn-capture');
    const retakeBtn = document.getElementById('btn-retake');

    startBtn.addEventListener('click', onStart);
    captureBtn.addEventListener('click', onCapture);
    retakeBtn.addEventListener('click', onRetake);
  }

  setCameraStream(stream) {
    const video = document.getElementById('camera-preview');
    const startBtn = document.getElementById('btn-start-camera');
    const captureBtn = document.getElementById('btn-capture');

    if (video) video.srcObject = stream;
    if (startBtn) startBtn.disabled = !!stream;
    if (captureBtn) captureBtn.disabled = !stream;
  }

  async captureFromVideo(callback) {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const pw = document.getElementById('camera-preview-wrapper');
      pw.innerHTML = `<img src="${url}" alt="Foto yang diambil dari kamera" />`;
      
      document.getElementById('btn-retake').style.display = '';
      document.getElementById('btn-capture').disabled = true;
      
      callback(blob);
    }, 'image/jpeg');
  }

  resetCameraUI() {
    const pw = document.getElementById('camera-preview-wrapper');
    if (pw) pw.innerHTML = '';
    
    const retakeBtn = document.getElementById('btn-retake');
    if (retakeBtn) retakeBtn.style.display = 'none';
    
    const captureBtn = document.getElementById('btn-capture');
    if (captureBtn) captureBtn.disabled = false;
    
    const startBtn = document.getElementById('btn-start-camera');
    if (startBtn) startBtn.disabled = false;

    const video = document.getElementById('camera-preview');
    if (video) video.srcObject = null;
  }
}
