import { BookmarkIdb } from '../../data/idb.js';
import Swal from 'sweetalert2';

export default class BookmarksPresenter {
  #view;
  #allBookmarks = [];

  constructor({ view }) {
    this.#view = view;
    this.#init();
  }

  async #init() {
    this.#view.showLoading(true);
    try {
      this.#allBookmarks = await BookmarkIdb.getAllBookmarks();
      this.#view.renderBookmarks(this.#allBookmarks, (id) => this.#onDelete(id));
      this.#view.bindFilterSort((query, sort) => this.#onFilterSort(query, sort));
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Gagal memuat bookmarks.'
      });
    } finally {
      this.#view.showLoading(false);
    }
  }

  async #onDelete(id) {
    const result = await Swal.fire({
      title: 'Hapus Bookmark?',
      text: 'Yakin ingin menghapus dari bookmark?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      await BookmarkIdb.deleteBookmark(id);
      this.#allBookmarks = this.#allBookmarks.filter(b => b.id !== id);
      
      const searchInput = document.getElementById('search-bookmark');
      const sortSelect = document.getElementById('sort-bookmark');
      this.#onFilterSort(searchInput?.value || '', sortSelect?.value || 'newest');
      
      Swal.fire({
        icon: 'success',
        title: 'Terhapus',
        text: 'Bookmark berhasil dihapus',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  #onFilterSort(query, sort) {
    let filtered = [...this.#allBookmarks];

    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
      );
    }

    
    filtered.sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sort === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sort === 'az') {
        return a.name.localeCompare(b.name);
      } else if (sort === 'za') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    this.#view.renderBookmarks(filtered, (id) => this.#onDelete(id));
  }
}
