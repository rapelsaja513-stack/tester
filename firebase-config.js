import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { getStorage } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6Vt_C-UM3BnvgBMnoitu5CBRHd3b_ikk",
  authDomain: "pakkom-ecotrack.firebaseapp.com",
  projectId: "pakkom-ecotrack",
  storageBucket: "pakkom-ecotrack.firebasestorage.app",
  messagingSenderId: "609321292317",
  appId: "1:609321292317:web:3bf4e7d0c8ea6e861d2cf4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
