import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCUsfScdbAhkGfY67nuMeEm5l3sEpFKrXs",
  authDomain: "agricultural-cooperative.firebaseapp.com",
  projectId: "agricultural-cooperative",
  storageBucket: "agricultural-cooperative.firebasestorage.app",
  messagingSenderId: "85979345607",
  appId: "1:85979345607:web:2c66a4001135bde10604e2",
};

const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);

// Firestore Helpers
export { doc, getDoc, setDoc };

// Storage
export const storage = getStorage(app);

export default app;