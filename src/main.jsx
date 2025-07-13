import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Imports global styles and Tailwind CSS

// Firebase initialization is done when firebase-config.js is imported.
// If you had an initializeFirebase() function to call, you'd do it here.
// import { initializeFirebase } from './firebase-config.js';
// initializeFirebase(); // Call if your firebase-config exports such a function to be called.

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Fatal Error: Root element not found. App cannot be rendered.");
  // Optionally, display a message to the user if the root element is missing.
  document.body.innerHTML = `<div style="color: red; text-align: center; padding-top: 50px;">
    <h1>Application Error</h1>
    <p>The application could not start because the root HTML element was not found.</p>
  </div>`;
}
