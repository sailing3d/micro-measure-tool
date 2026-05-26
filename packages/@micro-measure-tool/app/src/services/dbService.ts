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

async function putVal(db: IDBDatabase, key: string, val: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(val, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getVal<T>(db: IDBDatabase, key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function delVal(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function saveProjectHandle(
  name: string,
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDB();
  await putVal(db, `last:name`, name);
  await putVal(db, `last:handle`, handle);
  await putVal(db, `proj:${name}:handle`, handle);
}

export async function getLastProject(): Promise<{
  name: string;
  handle: FileSystemDirectoryHandle;
} | null> {
  const db = await openDB();
  const name = await getVal<string>(db, "last:name");
  const handle = await getVal<FileSystemDirectoryHandle>(db, "last:handle");
  if (name && handle) return { name, handle };
  return null;
}

export async function getProjectHandle(
  name: string,
): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDB();
  return getVal<FileSystemDirectoryHandle>(db, `proj:${name}:handle`);
}

export async function clearLastProject(): Promise<void> {
  const db = await openDB();
  await delVal(db, "last:name");
  await delVal(db, "last:handle");
}
