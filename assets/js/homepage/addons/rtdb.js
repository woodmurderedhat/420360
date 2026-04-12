/**
 * Lazy Firebase RTDB singleton for homepage addons.
 * Uses a named app 'homepage-addons' to avoid conflicts with the pixel-board.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhOspsUxX9f_ylCQrNDPfS40yeNykgvj8",
  authDomain: "project-6657144175400685165.firebaseapp.com",
  databaseURL: "https://project-6657144175400685165-default-rtdb.firebaseio.com",
  projectId: "project-6657144175400685165",
  storageBucket: "project-6657144175400685165.firebasestorage.app",
  messagingSenderId: "604138773261",
  appId: "1:604138773261:web:162f7ab4984c7a27d5ae44"
};

const FB_VERSION = "12.11.0";
const FB_BASE = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;

let _db = null;
let _initPromise = null;

export async function getDb() {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const [{ initializeApp, getApps, getApp }, { getDatabase }] = await Promise.all([
      import(`${FB_BASE}/firebase-app.js`),
      import(`${FB_BASE}/firebase-database.js`)
    ]);

    const existingApps = getApps();
    const existingApp = existingApps.find(a => a.name === 'homepage-addons');
    const app = existingApp || initializeApp(FIREBASE_CONFIG, 'homepage-addons');
    _db = getDatabase(app);
    return _db;
  })();

  return _initPromise;
}
