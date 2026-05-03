export default class AboutPage {
  async render() {
    return `
      <section class="container" aria-labelledby="about-heading">
        <div class="page-header">
          <h1 id="about-heading">Tentang Aplikasi</h1>
        </div>
        <div class="form-container" style="max-width:640px">
          <p>
            <strong>Dicoding Story</strong> adalah aplikasi berbagi cerita seputar
            ekosistem Dicoding. Abadikan momen belajarmu dan bagikan kepada komunitas!
          </p>
          <ul style="margin:16px 0 0 20px;line-height:2">
            <li>📸 Bagikan foto dan cerita harianmu</li>
            <li>🗺️ Tandai lokasi ceritamu di peta</li>
            <li>🔔 Dapatkan notifikasi cerita terbaru</li>
          </ul>
        </div>
      </section>
    `;
  }

  async afterRender() {
    
  }
}
