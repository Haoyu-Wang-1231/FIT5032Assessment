import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDYt-kAsuR7QBHMdM8qFGij-lbTyU81gig",
  authDomain: "fit5032-assessment.firebaseapp.com",
  projectId: "fit5032-assessment",
  storageBucket: "fit5032-assessment.firebasestorage.app",
  messagingSenderId: "246039545869",
  appId: "1:246039545869:web:c3f4555897f17aa7c12d44",
  measurementId: "G-BPQVWCKFTZ"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)