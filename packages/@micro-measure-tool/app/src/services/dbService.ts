const DB_NAME = "micro-measure-tool";
const DB_VERSION = 1;
const STORE_NAME = "projects";

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { dbPromise = null; reject(req.error); };
  });
  return dbPromise;
}

async function putVal(key: string, val: unknown): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getVal<T>(key: string): Promise<T | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function delVal(key: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveProjectHandle(
  name: string,
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  await putVal(`last:name`, name);
  await putVal(`last:handle`, handle);
  await putVal(`proj:${name}:handle`, handle);
}

export async function getLastProject(): Promise<{
  name: string;
  handle: FileSystemDirectoryHandle;
} | null> {
  const name = await getVal<string>("last:name");
  const handle = await getVal<FileSystemDirectoryHandle>("last:handle");
  if (name && handle) return { name, handle };
  return null;
}

export async function getProjectHandle(
  name: string,
): Promise<FileSystemDirectoryHandle | null> {
  return getVal<FileSystemDirectoryHandle>(`proj:${name}:handle`);
}

export async function clearLastProject(): Promise<void> {
  await delVal("last:name");
  await delVal("last:handle");
}
