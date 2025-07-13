import React from 'react';
import Spinner from './Spinner.jsx';

const RoleSelectionScreen = ({ onSelectRole, isLoading }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-90 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl text-center max-w-lg w-full animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Welcome to Notebook Grader
            </h1>
            <p className="mb-8 text-base md:text-lg text-gray-700 dark:text-gray-300">
                Please select your role to continue:
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                <button
                    onClick={() => onSelectRole('student')}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    aria-label="Select Student Role"
                >
                    {isLoading ? <Spinner size={20} color="border-white"/> : 'I am a Student'}
                </button>
                <button
                    onClick={() => onSelectRole('grader')}
                    disabled
                    className="w-full sm:w-auto flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    aria-label="Select Grader Role"
                >
                    {isLoading ? <Spinner size={20} color="border-white"/> : 'I am a Grader'}
                </button>
            </div>
            <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
                Your role selection will determine your access and permissions within the platform.
            </p>
        </div>
    </div>
);

export default RoleSelectionScreen;
