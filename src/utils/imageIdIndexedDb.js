const DB_NAME = 'GalleryCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'ImageMetadata';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject(event.target.error);

    request.onsuccess = (event) => resolve(event.target.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveImagesToDB = async (images) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    images.forEach(image => {
      store.put(image);
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    console.error('Failed to save to IndexedDB:', error);
  }
};

export const getImagesFromDB = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    console.error('Failed to get from IndexedDB:', error);
    return [];
  }
};
