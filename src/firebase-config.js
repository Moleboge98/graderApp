import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    setPersistence, 
    browserLocalPersistence, 
    signInWithCustomToken, 
    signInAnonymously,
    onAuthStateChanged, // Keep if used directly here, otherwise App.jsx handles it
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { 
    getFirestore, 
    setLogLevel,
    doc, 
    setDoc, 
    getDoc, 
    addDoc, 
    collection, 
    query, 
    where, 
    onSnapshot, 
    updateDoc, 
    serverTimestamp 
} from 'firebase/firestore';

// Use environment variables for Firebase config, prefixed with VITE_
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


// Fallback for Canvas environment variables
const firebaseConfigFromHost = typeof __firebase_config !== 'undefined' && __firebase_config ? JSON.parse(__firebase_config) : null;
const finalFirebaseConfig = firebaseConfigFromHost || firebaseConfig;

let app;
let authInstance; // Renamed to avoid conflict with auth export
let dbInstance; // Renamed to avoid conflict with db export

try {
    app = initializeApp(finalFirebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    
    // Set log level (consider 'warn' or 'error' for production)
    setLogLevel(import.meta.env.VITE_FIREBASE_LOG_LEVEL || 'debug');

    // Set auth persistence
    setPersistence(authInstance, browserLocalPersistence)
      .catch((error) => {
        console.error("Error setting auth persistence:", error);
      });

} catch (error) {
    console.error("Firebase initialization failed:", error);
    // Display a user-friendly message on the UI if initialization fails
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.innerHTML = `<div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; text-align: center; background-color: #f3f4f6;">
            <div style="background-color: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; padding: 1.5rem 1rem; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); max-width: 28rem; width: 100%;">
                <strong style="font-weight: bold; display: block; margin-bottom: 0.5rem;">Initialization Error:</strong>
                <p>Could not connect to essential services. Please check your internet connection and try refreshing the page.</p>
            </div>
            <button onclick="window.location.reload()" style="margin-top: 1.5rem; background-color: #2563eb; color: white; font-weight: 600; padding: 0.625rem 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); transition: background-color 0.2s;">
                Refresh Page
            </button>
        </div>`;
    }
    throw new Error("Firebase initialization failed. App cannot start.");
}

// Handle initial auth token for Canvas environment
// This logic should ideally be in App.jsx's useEffect after authInstance is confirmed.
// However, if __initial_auth_token needs to be processed immediately:
if (authInstance) {
    const initialToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    if (initialToken) {
        signInWithCustomToken(authInstance, initialToken)
            .catch(e => {
                console.error("Error with custom token sign-in during init:", e);
                signInAnonymously(authInstance).catch(anonError => console.error("Anonymous sign-in failed during init fallback:", anonError));
            });
    } else {
        // If no initial token, and you require immediate sign-in (e.g. anonymous)
        // signInAnonymously(authInstance).catch(anonError => console.error("Anonymous sign-in failed during init:", anonError));
        // Often, onAuthStateChanged in App.jsx is better for handling the "no user" state.
    }
}


// Export the initialized instances
export { app, authInstance as auth, dbInstance as db };

// Export specific Firebase functions if you prefer to import them from this module
// This can help centralize Firebase imports for components.
export {
    onAuthStateChanged,
    signOut,
    signInWithCustomToken, // Keep if used elsewhere besides initial load
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    doc,
    setDoc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    serverTimestamp
};


export const appIdFromHost = typeof __app_id !== 'undefined' ? __app_id : (import.meta.env.VITE_APP_ID_FALLBACK || 'default-jupyter-platform');

// This function is kept for consistency with the guide, but initialization happens at module load.
export const initializeFirebase = () => {
    if (!app) console.error("Firebase not initialized prior to explicit call!");
};
