import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyDYt-kAsuR7QBHMdM8qFGij-lbTyU81gig',
  authDomain: 'fit5032-assessment.firebaseapp.com',
  projectId: 'fit5032-assessment',
  storageBucket: 'fit5032-assessment.firebasestorage.app',
  messagingSenderId: '246039545869',
  appId: '1:246039545869:web:c3f4555897f17aa7c12d44',
  measurementId: 'G-BPQVWCKFTZ',
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
auth.setPersistence(browserLocalPersistence)

const db = getFirestore(app)
const functions = getFunctions(app, 'australia-southeast1')

const useEmu = import.meta.env.VITE_USE_EMULATORS === 'true'
if (useEmu) {
  const HOST = import.meta.env.VITE_EMU_AUTH_HOST || '127.0.0.1'
  connectAuthEmulator(auth, `http://${HOST}:${import.meta.env.VITE_EMU_AUTH_PORT || 9099}`, {
    disableWarnings: true,
  })
  connectFirestoreEmulator(db, HOST, Number(import.meta.env.VITE_EMU_FIRESTORE_PORT || 8080))
  connectFunctionsEmulator(functions, HOST, Number(import.meta.env.VITE_EMU_FUNCTIONS_PORT || 5001))
}

// export const firebaseApp = initializeApp(firebaseConfig);
// export const auth = getAuth(firebaseApp)
// export const db = getFirestore(firebaseApp)
export { app as firebaseApp, auth, db, functions }
