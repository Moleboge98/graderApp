import React, { useState, useEffect, useRef } from 'react';
// Import Firebase auth functions from your firebase-config.js
import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from '../firebase-config.js';
import Spinner from './Spinner.jsx';

// SVG Icons for password visibility
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A4.99 4.99 0 0112 17c.532 0 1.05-.098 1.53-.284m-9.75-9.75L9.543 2m6.732 6.732l1.563 1.563m-5.858.908a3 3 0 114.243 4.243M9.879 16.121A4.99 4.99 0 0112 17c.532 0 1.05-.098 1.53-.284m-9.75-9.75L9.543 2m6.732 6.732l1.563 1.563" />
    </svg>
);


const AuthScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const emailInputRef = useRef(null);

    useEffect(() => {
        emailInputRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setLoading(true);
        setError(null);
        setResetEmailSent(false);

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            // onAuthStateChanged in App.jsx will handle navigation
        } catch (err) {
            console.error("Auth error:", err);
            let friendlyMessage = "An error occurred. Please try again.";
            if (err.code) {
                switch (err.code) {
                    case 'auth/invalid-email': friendlyMessage = "Please enter a valid email address."; break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential': // Common for wrong password/email
                        friendlyMessage = "Invalid email or password."; break;
                    case 'auth/email-already-in-use': friendlyMessage = "This email is already registered."; break;
                    case 'auth/weak-password': friendlyMessage = "Password should be at least 6 characters long."; break;
                    case 'auth/network-request-failed': friendlyMessage = "Network error. Please check your internet connection."; break;
                    case 'auth/operation-not-allowed': friendlyMessage = "This sign-in method is not enabled. Please contact support."; break;
                    default: friendlyMessage = err.message; // Fallback to Firebase's message
                }
            }
            setError(friendlyMessage);
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        setResetEmailSent(false);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // onAuthStateChanged in App.jsx will handle navigation
        } catch (err) {
            console.error("Google Sign-in error:", err);
            let friendlyMessage = "Could not sign in with Google. Please try again.";
            if (err.code === 'auth/popup-closed-by-user') {
                friendlyMessage = "Google sign-in window was closed before completion.";
            } else if (err.code === 'auth/cancelled-popup-request') {
                friendlyMessage = "Google sign-in was cancelled. Only one sign-in request can be active at a time.";
            } else if (err.code === 'auth/operation-not-allowed') {
                 friendlyMessage = "Google sign-in is not enabled for this app. Please contact support.";
            }
            setError(friendlyMessage);
        }
        setLoading(false);
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address to reset your password.");
            emailInputRef.current?.focus();
            return;
        }
        setLoading(true);
        setError(null);
        setResetEmailSent(false);
        try {
            await sendPasswordResetEmail(auth, email);
            setResetEmailSent(true);
            setError(null);
        } catch (err) {
            console.error("Password reset error:", err);
            let friendlyMessage = "Could not send password reset email. Please try again.";
            if (err.code === 'auth/invalid-email') {
                friendlyMessage = "The email address is not valid.";
            } else if (err.code === 'auth/user-not-found') {
                friendlyMessage = "No user found with this email address.";
            } else if (err.code === 'auth/operation-not-allowed') {
                friendlyMessage = "Password reset is not enabled for this app. Please contact support.";
            }
            setError(friendlyMessage);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900 flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                        <input
                            ref={emailInputRef}
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(null); setResetEmailSent(false); }}
                            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                            placeholder="your.email@example.com"
                            aria-invalid={!!error}
                            aria-describedby={error ? "auth-error" : undefined}
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            id="password"
                            name="password"
                            type={passwordVisible ? 'text' : 'password'}
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            required
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(null); }}
                            className="mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 pr-10 transition-colors"
                            placeholder="••••••••"
                            aria-invalid={!!error}
                            aria-describedby={error ? "auth-error" : undefined}
                        />
                        <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                            aria-label={passwordVisible ? "Hide password" : "Show password"}
                        >
                            {passwordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>

                    {error && <p id="auth-error" className="text-sm text-red-600 dark:text-red-400 -mt-3" role="alert">{error}</p>}
                    {resetEmailSent && <p className="text-sm text-green-600 dark:text-green-400 -mt-3">Password reset email sent! Check your inbox (and spam folder).</p>}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? <Spinner size={20} color="border-white" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-lg font-semibold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading && <span className="mr-2"><Spinner size={20} color="border-gray-700 dark:border-gray-100" /></span>}
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google G logo" className="h-6 w-6 mr-3" />
                        Sign {isSignUp ? 'Up' : 'In'} with Google
                    </button>
                </div>

                <div className="mt-6 text-center text-sm">
                    <button
                        type="button"
                        onClick={() => { setIsSignUp(!isSignUp); setError(null); setResetEmailSent(false); }}
                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-70"
                        disabled={loading}
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
                {!isSignUp && (
                    <div className="mt-4 text-center text-sm">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors disabled:opacity-70"
                            disabled={loading}
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthScreen;
