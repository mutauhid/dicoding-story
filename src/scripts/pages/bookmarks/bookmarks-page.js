class BookmarksPage {
  async render() {
    return `
      <section class="container page-header">
        <h1>Bookmark Stories</h1>
        <div class="filter-bar" style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
          <input type="text" id="search-bookmark" placeholder="Cari nama atau deskripsi..." style="padding:8px 12px; border:1px solid var(--color-border); border-radius:var(--radius); flex: 1; min-width: 200px;">
          <select id="sort-bookmark" style="padding:8px 12px; border:1px solid var(--color-border); border-radius:var(--radius);">
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
        </div>
      </section>
      <section class="container">
        <div id="loading" class="loading-spinner" style="display: none;">
          <div class="spinner"></div>
        </div>
        <div id="bookmarks-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const { default: BookmarksPresenter } = await import('./bookmarks-presenter.js');
    new BookmarksPresenter({ view: this });
  }

  showLoading(isLoading) {
    document.getElementById('loading').style.display = isLoading ? 'flex' : 'none';
  }

  renderBookmarks(bookmarks, onDeleteClick) {
    const listHtml = document.getElementById('bookmarks-list');
    listHtml.innerHTML = '';

    if (!bookmarks || bookmarks.length === 0) {
      listHtml.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>Belum ada cerita yang disimpan ke bookmark.</p>
        </div>
      `;
      return;
    }

    bookmarks.forEach((story) => {
      const card = document.createElement('div');
      card.className = 'story-card';
      
      const date = new Date(story.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      card.innerHTML = `
        <div class="story-card__image-wrapper">
          <img src="${story.photoUrl}" alt="Photo of ${story.name}" loading="lazy" />
        </div>
        <div class="story-card__body">
          <h2 class="story-card__author">${story.name}</h2>
          <p class="story-card__date">${date}</p>
          <p class="story-card__description">${story.description}</p>
          <div style="margin-top:auto; padding-top:12px; display:flex; gap:8px;">
            <a href="#/stories/${story.id}" class="btn btn-primary" style="flex:1; text-align:center; padding: 6px;">Detail</a>
            <button class="btn btn-danger btn-delete-bookmark" data-id="${story.id}" style="padding: 6px 12px;" aria-label="Hapus Bookmark">Hapus</button>
          </div>
        </div>
      `;
      listHtml.appendChild(card);
    });

    document.querySelectorAll('.btn-delete-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        onDeleteClick(e.target.dataset.id);
      });
    });
  }

  bindFilterSort(onFilterSort) {
    const searchInput = document.getElementById('search-bookmark');
    const sortSelect = document.getElementById('sort-bookmark');
    
    const trigger = () => {
      onFilterSort(searchInput.value, sortSelect.value);
    };

    searchInput.addEventListener('input', trigger);
    sortSelect.addEventListener('change', trigger);
  }
}

export default BookmarksPage;
