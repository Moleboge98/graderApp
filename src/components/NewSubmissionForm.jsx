import React, { useState, useEffect, useRef } from 'react';
// Firebase services and specific functions
import { db, appIdFromHost, addDoc, collection, serverTimestamp } from '../firebase-config.js';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';

const NewSubmissionForm = ({ userId, userEmail, onClose }) => {
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [notebookLink, setNotebookLink] = useState('');
    const [fullNameForCertificate, setFullNameForCertificate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const titleInputRef = useRef(null);

    useEffect(() => {
        // Focus the first input when the modal opens
        if (titleInputRef.current) {
            setTimeout(() => titleInputRef.current.focus(), 100); // Timeout for modal animation
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!assignmentTitle.trim()) {
            setError("Assignment title is required.");
            titleInputRef.current?.focus();
            return;
        }
        if (!notebookLink.trim()) {
            setError("Notebook link is required.");
            return;
        }
        if (!fullNameForCertificate.trim()) {
            setError("Full name for certificate is required. This name will appear on your certificate if you pass.");
            return;
        }
        try {
            // Basic URL validation
            new URL(notebookLink.trim());
        } catch (_) {
            setError("Please enter a valid URL for the notebook link (e.g., https://example.com).");
            return;
        }

        if (!userId || !db) {
            setError("User authentication or database service is currently unavailable. Please try again later.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Path: artifacts/{appId}/public/data/submissions
            await addDoc(collection(db, `artifacts/${appIdFromHost}/public/data/submissions`), {
                studentId: userId,
                studentEmail: userEmail || `${userId}@example.com`, // Fallback if email not present
                assignmentTitle: assignmentTitle.trim(),
                notebookLink: notebookLink.trim(),
                fullNameForCertificate: fullNameForCertificate.trim(),
                status: 'submitted', // Initial status
                submittedAt: serverTimestamp(),
                grade: null,
                feedback: null,
                certificateEligible: false, // Default to false, updated upon grading
                gradedAt: null,
                gradedBy: null,
            });
            setSuccessMessage("Notebook submitted successfully! You can close this form now.");
            // Clear form fields after successful submission
            setAssignmentTitle('');
            setNotebookLink('');
            setFullNameForCertificate('');
            // Optionally close modal after a delay
            setTimeout(() => {
                setSuccessMessage(null); // Clear success message
                onClose(); // Close the modal
            }, 3000);
        } catch (err) {
            console.error("Error submitting notebook:", err);
            setError(`Failed to submit notebook: ${err.message}. Please check your connection and try again.`);
        }
        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Submit New Notebook">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="assignmentTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assignment Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        ref={titleInputRef}
                        type="text"
                        id="assignmentTitle"
                        value={assignmentTitle}
                        onChange={(e) => setAssignmentTitle(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                        placeholder="e.g., Lab 1: Introduction to Data Analysis"
                        required
                        aria-required="true"
                    />
                </div>
                <div>
                    <label htmlFor="notebookLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notebook Link (URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        id="notebookLink"
                        value={notebookLink}
                        onChange={(e) => setNotebookLink(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                        placeholder="https://colab.research.google.com/..."
                        required
                        aria-required="true"
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Please ensure the link is publicly accessible or shared correctly for grading.
                    </p>
                </div>
                <div>
                    <label htmlFor="fullNameForCertificate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name for Certificate <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="fullNameForCertificate"
                        value={fullNameForCertificate}
                        onChange={(e) => setFullNameForCertificate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                        placeholder="e.g., Jane Amelia Doe"
                        required
                        aria-required="true"
                    />
                    <p className="mt-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                        <strong className="font-semibold">Important:</strong> This name will be used on your certificate if you meet the criteria. It cannot be changed after submission.
                    </p>
                </div>

                {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-3 rounded-lg shadow" role="alert">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 p-3 rounded-lg shadow" role="status">
                        {successMessage}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg border border-gray-300 dark:border-gray-500 shadow-sm transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed min-w-[150px] flex items-center justify-center"
                    >
                        {isSubmitting ? <Spinner size={20} color="border-white"/> : 'Submit Notebook'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default NewSubmissionForm;
