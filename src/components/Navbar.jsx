import React from 'react';
import StatusBadge from './StatusBadge.jsx'; // Ensure this path is correct

const Navbar = ({ userRole, userId, onLogout }) => (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                    <span className="font-bold text-xl md:text-2xl text-blue-600 dark:text-blue-400">
                        Notebook Grader
                    </span>
                </div>
                <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 hidden sm:flex items-center space-x-2">
                        <span>Role:</span> <StatusBadge status={userRole} />
                    </div>
                    {userId && (
                        <div className="hidden md:flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            <span>ID:</span>
                            <span className="font-mono" title={userId}>
                                {userId.substring(0, 8)}...
                            </span>
                        </div>
                    )}
                    <button
                        onClick={onLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        aria-label="Logout"
                    >
                        Logout
                    </button>
                </div>
            </div>
            {/* Mobile view for Role and UserID */}
            <div className="flex items-center justify-between pb-2 sm:hidden border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                 <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                    <span>Role:</span> <StatusBadge status={userRole} />
                </div>
                {userId && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>ID:</span>
                        <span className="font-mono" title={userId}>
                            {userId.substring(0, 8)}...
                        </span>
                    </div>
                )}
            </div>
        </div>
    </nav>
);

export default Navbar;
