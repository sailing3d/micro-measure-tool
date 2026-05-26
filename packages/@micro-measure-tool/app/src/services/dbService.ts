const DB_NAME = "micro-measure-tool";
const DB_VERSION = 1;
const STORE_NAME = "projects";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLastProjectHandle(
  name: string,
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(name, "name");
    store.put(handle, "handle");
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getLastProject(): Promise<{
  name: string;
  handle: FileSystemDirectoryHandle;
} | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const nameReq = store.get("name");
    const handleReq = store.get("handle");
    let name: string | null = null;
    let handle: FileSystemDirectoryHandle | null = null;

    nameReq.onsuccess = () => { name = nameReq.result ?? null; };
    handleReq.onsuccess = () => { handle = handleReq.result ?? null; };
    tx.oncomplete = () => {
      db.close();
      if (name && handle) {
        resolve({ name, handle });
      } else {
        resolve(null);
      }
    };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function clearLastProject(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete("name");
    store.delete("handle");
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
