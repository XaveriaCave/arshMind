import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyAFzfvg24NxXyFd76H9QvB-UqhUdCE8aWM",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "arshmind2.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "arshmind2",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "arshmind2.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "883298184403",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:883298184403:web:8183d36820ed2905eb3826",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-HD2N8JNB1V",
};

const app = initializeApp(firebaseConfig);
const databaseId = metaEnv.VITE_FIREBASE_DATABASE_ID;

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { serverTimestamp };

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};
