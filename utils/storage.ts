import { PlannerData } from '../types';

const DB_NAME = 'ZenithPlannerDB';
const DB_VERSION = 1;
const STORE_NAME = 'plannerState';
const DATA_KEY = 'main';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject('IndexedDB is not supported by this browser.');
        return;
      }
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }
  return dbPromise;
}

export async function savePlannerData(data: PlannerData): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(data, DATA_KEY);
    
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Failed to save data to IndexedDB', error);
    // Even if IndexedDB fails, we can try to fallback to localStorage.
    try {
        localStorage.setItem('zenithPlannerData_fallback', JSON.stringify(data));
    } catch (lsError) {
        console.error('Failed to save to localStorage fallback', lsError);
    }
  }
}

export async function loadPlannerData(): Promise<PlannerData | null> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(DATA_KEY);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load data from IndexedDB', error);
    // Fallback to localStorage if IndexedDB fails
    try {
        const fallbackData = localStorage.getItem('zenithPlannerData_fallback');
        if (fallbackData) {
            return JSON.parse(fallbackData);
        }
    } catch (lsError) {
        console.error('Failed to load from localStorage fallback', lsError);
    }
    return null;
  }
}
