/* ==========================================================================
   FITUP - Firebase Cloud Firestore Setup & Config
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// FITUP Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyFITUP-DemoKey9030118909Snehith",
    authDomain: "fitup-gym-pt.firebaseapp.com",
    projectId: "fitup-gym-pt",
    storageBucket: "fitup-gym-pt.appspot.com",
    messagingSenderId: "903011890900",
    appId: "1:903011890900:web:fitup020777"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
    db, 
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
