import { openDB } from 'idb';

const DATABASE_NAME = 'dicoding-story-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'bookmarks';
const SYNC_STORE_NAME = 'sync-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    }
    if (!database.objectStoreNames.contains(SYNC_STORE_NAME)) {
      database.createObjectStore(SYNC_STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
    }
  },
});

export const BookmarkIdb = {
  async getBookmark(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllBookmarks() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async putBookmark(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async deleteBookmark(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export const SyncIdb = {
  async addSyncStory(formDataObj) {
    return (await dbPromise).add(SYNC_STORE_NAME, formDataObj);
  },
  async getAllSyncStories() {
    return (await dbPromise).getAll(SYNC_STORE_NAME);
  },
  async deleteSyncStory(id) {
    return (await dbPromise).delete(SYNC_STORE_NAME, id);
  },
};
