import { getStoryDetail } from '../../data/api.js';
import { parseActivePathname } from '../../routes/url-parser.js';
import { BookmarkIdb } from '../../data/idb.js';
import Swal from 'sweetalert2';

export default class DetailPresenter {
  #view;
  #currentStory;

  constructor({ view }) {
    this.#view = view;
    this.#init();
  }

  async #init() {
    this.#view.showLoading(true);
    try {
      const { id } = parseActivePathname();
      if (!id) throw new Error('ID cerita tidak ditemukan.');

      const result = await getStoryDetail(id);
      this.#currentStory = result.story;
      this.#view.renderDetail(this.#currentStory);

      this.#setupBookmark();
    } catch (error) {
      this.#view.showAlert(`Gagal memuat cerita: ${error.message}`, 'error');
    } finally {
      this.#view.showLoading(false);
    }
  }

  async #setupBookmark() {
    const btn = document.getElementById('bookmark-btn');
    if (!btn) return;

    const existing = await BookmarkIdb.getBookmark(this.#currentStory.id);
    if (existing) {
      btn.textContent = 'Hapus dari Bookmark';
      btn.classList.add('btn-danger');
      btn.classList.remove('btn-secondary');
    }

    btn.addEventListener('click', async () => {
      const isExist = await BookmarkIdb.getBookmark(this.#currentStory.id);
      if (isExist) {
        await BookmarkIdb.deleteBookmark(this.#currentStory.id);
        btn.textContent = '🔖 Simpan ke Bookmark';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-secondary');
        Swal.fire({
          icon: 'success',
          title: 'Dihapus',
          text: 'Berhasil dihapus dari bookmark',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await BookmarkIdb.putBookmark(this.#currentStory);
        btn.textContent = 'Hapus dari Bookmark';
        btn.classList.add('btn-danger');
        btn.classList.remove('btn-secondary');
        Swal.fire({
          icon: 'success',
          title: 'Tersimpan',
          text: 'Berhasil disimpan ke bookmark',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }
}
