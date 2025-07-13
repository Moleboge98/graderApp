import React, { useState, useEffect, Suspense } from 'react';

// Firebase services (imported from our centralized config)
import { 
    auth, 
    db, 
    appIdFromHost,
    onAuthStateChanged,
    signOut,
    signInWithCustomToken, // For initial token if not handled in firebase-config.js
    // Other specific functions if needed directly here, though components usually import them
} from './firebase-config.js'; 
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; // Specific Firestore functions

// Components (consider lazy loading for larger ones)
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Spinner from './components/Spinner.jsx';
// Lazy load components for better initial performance
const Navbar = React.lazy(() => import('./components/Navbar.jsx'));
const AuthScreen = React.lazy(() => import('./components/AuthScreen.jsx'));
const RoleSelectionScreen = React.lazy(() => import('./components/RoleSelectionScreen.jsx'));
const StudentDashboard = React.lazy(() => import('./components/StudentDashboard.jsx'));
const GraderDashboard = React.lazy(() => import('./components/GraderDashboard.jsx'));


function App() {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false); // Tracks if initial auth check is done
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth || !db) {
            console.error("Firebase services not available in App useEffect.");
            setError("Essential services are not available. Please refresh.");
            setIsLoading(false);
            setIsAuthReady(true); // Mark auth as "checked" even if failed
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setIsLoading(true); // Set loading true while we process auth state
            if (currentUser) {
                setUser(currentUser);
                const currentUid = currentUser.uid;
                setUserId(currentUid);
                try {
                    // Path for user roles: artifacts/{appId}/public/data/user_roles/{userId}
                    const roleDocRef = doc(db, `artifacts/${appIdFromHost}/public/data/user_roles/${currentUid}`);
                    const roleDocSnap = await getDoc(roleDocRef);
                    if (roleDocSnap.exists()) {
                        setUserRole(roleDocSnap.data().role);
                    } else {
                        setUserRole(null); // No role set yet
                    }
                    setError(null); // Clear previous errors
                } catch (e) {
                    console.error("Error fetching user role:", e);
                    setError("Could not fetch user role information.");
                    setUserRole(null);
                }
            } else {
                setUser(null);
                setUserId(null);
                setUserRole(null);
            }
            setIsAuthReady(true); // Auth state has been checked
            setIsLoading(false); // Done processing
        }, (authError) => {
            console.error("Auth state change error:", authError);
            setError("Authentication error. Please refresh the page.");
            setIsAuthReady(true); // Mark auth as "checked"
            setIsLoading(false);
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, [appIdFromHost]); // Re-run if appIdFromHost changes (though unlikely)

    const handleRoleSelect = async (role) => {
        if (!user || !userId || !db) {
            setError("User not authenticated or database service unavailable.");
            return;
        }
        setIsLoading(true);
        try {
            const roleDocRef = doc(db, `artifacts/${appIdFromHost}/public/data/user_roles/${userId}`);
            await setDoc(roleDocRef, {
                role: role,
                userId: userId,
                email: user.email || `${userId}@example.com`, // Fallback email if not available
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp()
            });
            setUserRole(role);
            setError(null); // Clear previous errors
        } catch (e) {
            console.error("Error setting user role:", e);
            setError("Failed to set your role. Please try again.");
        }
        setIsLoading(false);
    };

    const handleLogout = async () => {
        if (!auth) {
            setError("Authentication service unavailable for logout.");
            return;
        }
        setIsLoading(true);
        try {
            await signOut(auth);
            // State will be updated by onAuthStateChanged listener
        } catch (e) {
            console.error("Error signing out:", e);
            setError("Logout failed. Please try again.");
            setIsLoading(false); // Only set loading false on error, success is handled by onAuthStateChanged
        }
    };

    // Loading state for initial auth check
    if (!isAuthReady) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
                <Spinner size={48} />
                <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">Initializing Authentication...</p>
            </div>
        );
    }
    
    // General loading state (after auth check, during role fetch etc.)
    if (isLoading) {
         return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
                <Spinner size={48} />
                <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">Loading data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-lg max-w-md w-full">
                    <strong className="font-bold block mb-2 text-lg">Application Error</strong>
                    <p className="text-sm">{error}</p>
                </div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all"
                    aria-label="Refresh application page"
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    // Main application routing based on auth state and user role
    return (
        <ErrorBoundary>
            <Suspense fallback={
                <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
                    <Spinner size={48} /><p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">Loading Application...</p>
                </div>
            }>
                {!user ? (
                    <AuthScreen />
                ) : !userRole ? (
                    <RoleSelectionScreen onSelectRole={handleRoleSelect} isLoading={isLoading} />
                ) : (
                    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                        <Navbar userRole={userRole} userId={userId} onLogout={handleLogout} />
                        <main className="container mx-auto p-4 md:p-6 lg:p-8">
                            {userRole === 'student' && <StudentDashboard userId={userId} userEmail={user.email || `${userId}@example.com`} isAuthReady={isAuthReady} />}
                            {userRole === 'grader' && <GraderDashboard userId={userId} userEmail={user.email} isAuthReady={isAuthReady} />}
                        </main>
                    </div>
                )}
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
