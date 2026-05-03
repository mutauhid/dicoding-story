import { addStory } from '../../data/api.js';

export default class AddPresenter {
  #view;
  #cameraStream = null;
  #capturedBlob = null;
  #map = null;
  #marker = null;
  #mode = 'upload'; 

  constructor({ view }) {
    this.#view = view;
    this.#init();
  }

  async #init() {
    await this.#waitForLeaflet();
    this.#map = this.#view.initMap((lat, lng) => this.#onMapClick(lat, lng));
    this.#view.bindPhotoTabs((mode) => this.#onTabClick(mode));
    this.#view.bindFileChange((file) => this.#onFileChange(file));
    this.#view.bindCameraActions({
      onStart: () => this.#startCamera(),
      onCapture: () => this.#capturePhoto(),
      onRetake: () => this.#retakePhoto(),
    });
    this.#view.bindFormSubmit(() => this.#handleSubmit());
  }

  async #waitForLeaflet() {
    const { default: L } = await import('../../utils/leaflet-config.js');
    window.L = L;
  }

  #onMapClick(lat, lng) {
    const L = window.L;
    if (!this.#map || !L) return;

    if (this.#marker) {
      this.#marker.setLatLng([lat, lng]);
    } else {
      this.#marker = L.marker([lat, lng], {
        title: 'Lokasi terpilih',
        alt: 'Penanda lokasi yang Anda pilih untuk cerita ini',
      }).addTo(this.#map);

    }
  }

  #onTabClick(mode) {
    this.#mode = mode;
    this.#stopCamera();
  }

  #onFileChange(file) {
   
  }

  async #startCamera() {
    try {
      this.#cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.#view.setCameraStream(this.#cameraStream);
    } catch {
      this.#view.showAlert('Tidak dapat mengakses kamera.', 'error');
    }
  }

  #capturePhoto() {
    this.#view.captureFromVideo((blob) => {
      this.#capturedBlob = blob;
      this.#stopCamera();
    });
  }

  #retakePhoto() {
    this.#capturedBlob = null;
    this.#view.resetCameraUI();
  }

  #stopCamera() {
    if (this.#cameraStream) {
      this.#cameraStream.getTracks().forEach((t) => t.stop());
      this.#cameraStream = null;
    }
    this.#view.setCameraStream(null);
  }

  async #handleSubmit() {
    this.#view.clearAlert();
    const { description, lat, lon, photoFile: formPhotoFile } = this.#view.getFormValues();
    let hasError = false;

    if (!description) {
      this.#view.showFieldError('description', true);
      hasError = true;
    } else {
      this.#view.showFieldError('description', false);
    }

   
    let photoFile = null;
    if (this.#mode === 'upload') {
      photoFile = formPhotoFile;
    } else {
      photoFile = this.#capturedBlob
        ? new File([this.#capturedBlob], 'camera-photo.jpg', { type: 'image/jpeg' })
        : null;
    }

    if (!photoFile) {
      this.#view.showFieldError('photo', true);
      hasError = true;
    } else {
      this.#view.showFieldError('photo', false);
    }

    if (hasError) return;

    this.#view.showLoading(true);

    if (!navigator.onLine) {
      // Offline: Save to IndexedDB
      try {
        const { SyncIdb } = await import('../../data/idb.js');
        const { getToken } = await import('../../utils/auth.js');
        
        await SyncIdb.addSyncStory({ 
          description, 
          photo: photoFile, 
          lat, 
          lon, 
          token: getToken() 
        });
        
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const reg = await navigator.serviceWorker.ready;
          await reg.sync.register('sync-stories');
        }

        this.#stopCamera();
        this.#view.showAlert('⚠️ Anda sedang offline. Cerita disimpan sementara dan akan dikirim saat online!', 'info');
        this.#view.resetForm();
        this.#capturedBlob = null;
        setTimeout(() => {
          window.location.hash = '#/';
        }, 2000);
      } catch (error) {
        this.#view.showAlert(`Gagal menyimpan ke draft: ${error.message}`, 'error');
      } finally {
        this.#view.showLoading(false);
      }
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photoFile);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    try {
      await addStory(formData);
      this.#stopCamera();
      this.#view.showAlert('🎉 Cerita berhasil ditambahkan!', 'success');
      this.#view.resetForm();
      this.#capturedBlob = null;
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);
    } catch (error) {
      this.#view.showAlert(`Gagal mengirim cerita: ${error.message}`, 'error');
    } finally {
      this.#view.showLoading(false);
    }
  }
}

