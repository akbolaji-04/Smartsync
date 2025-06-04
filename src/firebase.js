import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
 apiKey: "AIzaSyASLkMgK8YJlSglFK2AXYTtocDRGhn8xhI",
  authDomain: "interactive-whiteboard-fce32.firebaseapp.com",
  projectId: "interactive-whiteboard-fce32",
  storageBucket: "interactive-whiteboard-fce32.firebasestorage.app",
  messagingSenderId: "976692464671",
  appId: "1:976692464671:web:6d2e12aa95e186c56f992a",
  measurementId: "G-480CRN2SN6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;