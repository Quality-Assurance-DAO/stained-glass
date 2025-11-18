import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface StainedGlassDB extends DBSchema {
  appId: {
    key: string;
    value: string;
  };
  uploadQueue: {
    key: string;
    value: {
      id: string;
      submission: unknown;
      timestamp: number;
    };
  };
}

let db: IDBPDatabase<StainedGlassDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<StainedGlassDB>> {
  if (db) {
    return db;
  }

  db = await openDB<StainedGlassDB>('stained-glass-db', 1, {
    upgrade(database) {
      // App ID store
      if (!database.objectStoreNames.contains('appId')) {
        database.createObjectStore('appId');
      }

      // Upload queue store
      if (!database.objectStoreNames.contains('uploadQueue')) {
        database.createObjectStore('uploadQueue', { keyPath: 'id' });
      }
    },
  });

  return db;
}

export async function getAppId(): Promise<string | null> {
  const database = await initDB();
  return (await database.get('appId', 'current')) || null;
}

export async function setAppId(appId: string): Promise<void> {
  const database = await initDB();
  await database.put('appId', appId, 'current');
}

export async function addToUploadQueue(item: {
  id: string;
  submission: unknown;
  timestamp: number;
}): Promise<void> {
  const database = await initDB();
  await database.put('uploadQueue', item);
}

export async function getUploadQueue(): Promise<
  Array<{ id: string; submission: unknown; timestamp: number }>
> {
  const database = await initDB();
  return database.getAll('uploadQueue');
}

export async function removeFromUploadQueue(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('uploadQueue', id);
}

export async function clearUploadQueue(): Promise<void> {
  const database = await initDB();
  const tx = database.transaction('uploadQueue', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

