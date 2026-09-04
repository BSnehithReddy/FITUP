import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    orderBy 
} from "firebase/firestore";

// FITUP Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQSt5XTG6rCsjIis6XNDlkcmAs5lcOi7Y",
  authDomain: "fitup-ccb95.firebaseapp.com",
  projectId: "fitup-ccb95",
  storageBucket: "fitup-ccb95.firebasestorage.app",
  messagingSenderId: "1088485269551",
  appId: "1:1088485269551:web:68d02870e2a4ddb90666da",
  measurementId: "G-XVMNQT45MK"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Analytics safely (supporting web, SSR, and webviews)
let analytics = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("FITUP Firebase Analytics Initialized (ID: G-XVMNQT45MK)");
    }
  }).catch((err) => {
    console.warn("Analytics initialization skipped:", err.message);
  });
}

export { 
    app,
    db, 
    auth,
    analytics,
    firebaseConfig,
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    orderBy 
};
