import { openDB } from 'idb';

const DB_NAME = 'stained-glass-db';
const STORE_NAME = 'app-data';
const APP_ID_KEY = 'app-id';

/**
 * Generate a new anonymous app ID (UUID v4)
 */
function generateAppId(): string {
  return crypto.randomUUID();
}

/**
 * Get or create anonymous app ID from IndexedDB
 */
export async function getOrCreateAppId(): Promise<string> {
  try {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });

    // Try to get existing app ID
    const existingId = await db.get(STORE_NAME, APP_ID_KEY);
    if (existingId) {
      return existingId as string;
    }

    // Generate new app ID
    const newId = generateAppId();
    await db.put(STORE_NAME, newId, APP_ID_KEY);
    return newId;
  } catch (error) {
    // Fallback to localStorage if IndexedDB fails
    console.warn('IndexedDB not available, using localStorage', error);
    const existingId = localStorage.getItem(APP_ID_KEY);
    if (existingId) {
      return existingId;
    }

    const newId = generateAppId();
    localStorage.setItem(APP_ID_KEY, newId);
    return newId;
  }
}

/**
 * Get app ID synchronously (from localStorage cache)
 * This is a fallback for cases where async is not possible
 */
export function getAppIdSync(): string | null {
  return localStorage.getItem(APP_ID_KEY);
}

