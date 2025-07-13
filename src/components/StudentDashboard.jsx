import React, { useState, useEffect } from 'react';
// Firebase services and specific functions
import { db, appIdFromHost, collection, query, where, onSnapshot } from '../firebase-config.js';
import { createPdfCertificate, downloadPdf } from '../utils/certificateGenerator.js'; // Ensure path is correct
import Spinner from './Spinner.jsx';
import StatusBadge from './StatusBadge.jsx';
import NewSubmissionForm from './NewSubmissionForm.jsx'; // Lazy load if it becomes complex

const StudentDashboard = ({ userId, userEmail, isAuthReady }) => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [stats, setStats] = useState({ total: 0, graded: 0, average: 0 });
    const [isGeneratingCert, setIsGeneratingCert] = useState(null); // Tracks which cert is being generated

    useEffect(() => {
        if (!isAuthReady || !db || !userId) {
            if (isAuthReady && (!db || !userId)) {
                setError("Database service or user information is unavailable. Cannot load submissions.");
                console.warn("StudentDashboard: db or userId not ready.", { isAuthReady, db, userId });
            }
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null); // Clear previous errors
        // Path: artifacts/{appId}/public/data/submissions
        const q = query(
            collection(db, `artifacts/${appIdFromHost}/public/data/submissions`),
            where("studentId", "==", userId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const subs = [];
            let gradedCount = 0;
            let sumOfGrades = 0;
            querySnapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                subs.push(data);
                if (data.status === 'graded' && data.grade !== null && !isNaN(parseFloat(data.grade))) {
                    gradedCount++;
                    sumOfGrades += parseFloat(data.grade);
                }
            });

            // Sort by submission date, newest first
            subs.sort((a, b) => (b.submittedAt?.toDate?.()?.getTime() || 0) - (a.submittedAt?.toDate?.()?.getTime() || 0));

            setSubmissions(subs);
            const totalSubmissions = subs.length;
            const averageGrade = gradedCount > 0 ? (sumOfGrades / gradedCount).toFixed(1) : '0';
            setStats({ total: totalSubmissions, graded: gradedCount, average: averageGrade });
            setIsLoading(false);
            setError(null);
        }, (err) => {
            console.error("Error fetching student submissions:", err);
            setError("Failed to load your submissions. Please try refreshing.");
            setIsLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [userId, isAuthReady, appIdFromHost]); // Rerun if userId, auth status, or appId changes

    const handleDownloadCertificate = async (submission) => {
        if (!submission.certificateEligible || !submission.fullNameForCertificate) {
            setError("Certificate is not available for this submission or your full name is missing.");
            // Consider a more user-friendly notification system than alert()
            // For example, update a state variable to show a message in the UI.
            console.warn("Certificate not available or name missing for submission:", submission.id);
            return;
        }
        setIsGeneratingCert(submission.id);
        setError(null);
        try {
            const gradeDate = submission.gradedAt?.toDate()
                ? new Date(submission.gradedAt.toDate()).toLocaleDateString()
                : new Date().toLocaleDateString();

            const pdfBytes = await createPdfCertificate(submission.fullNameForCertificate, gradeDate);
            downloadPdf(pdfBytes, `Certificate_${submission.fullNameForCertificate.replace(/\s+/g, '_')}_${submission.assignmentTitle.replace(/\s+/g, '_')}.pdf`);
        } catch (e) {
            console.error("Failed to generate or download certificate:", e);
            setError(`Error generating certificate: ${e.message}`);
        } finally {
            setIsGeneratingCert(null);
        }
    };

    if (!isAuthReady || !db) {
        return (
            <div className="text-center p-10 animate-fade-in">
                <div className="mb-4"><Spinner size={32} /></div>
                <p className="text-gray-600 dark:text-gray-300">Waiting for essential services to connect...</p>
            </div>
        );
    }
     if (isLoading) {
        return (
            <div className="text-center py-10 animate-fade-in">
                <Spinner size={32} />
                <p className="text-gray-600 dark:text-gray-300 mt-3">Loading your submissions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">My Submissions</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {stats.total} assignments submitted &bull; {stats.graded} graded &bull; Average Grade: {stats.average > 0 ? stats.average : 'N/A'}
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    aria-label="Submit New Notebook"
                >
                    + New Submission
                </button>
            </header>

            {isFormOpen && (
                <NewSubmissionForm
                    userId={userId}
                    userEmail={userEmail}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            {error && (
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-4 rounded-lg shadow text-center" role="alert">
                    {error}
                </div>
            )}

            {!isLoading && !error && submissions.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                    <div className="text-gray-400 dark:text-gray-500 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">No submissions yet!</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                        It looks like you haven't submitted any assignments. Click the "+ New Submission" button to get started.
                    </p>
                </div>
            )}

            {!isLoading && !error && submissions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assignment/Course</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Certificate</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {submissions.map(sub => (
                                <React.Fragment key={sub.id}>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-normal break-words"> {/* Allow wrapping */}
                                            <div className="font-semibold text-blue-600 dark:text-blue-400">{sub.assignmentTitle}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                <a href={sub.notebookLink} target="_blank" rel="noopener noreferrer" className="hover:underline" title={sub.notebookLink}>
                                                    {sub.notebookLink || "No link provided"}
                                                </a>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Name for Cert: {sub.fullNameForCertificate || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={sub.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sub.status === 'graded' && sub.grade !== null ? (
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{sub.grade}</p>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400">-</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {sub.submittedAt?.toDate() ? new Date(sub.submittedAt.toDate()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sub.certificateEligible && parseFloat(sub.grade) >= 50 ? (
                                                <button
                                                    onClick={() => handleDownloadCertificate(sub)}
                                                    disabled={isGeneratingCert === sub.id}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg text-xs shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                                                    aria-label={`Download certificate for ${sub.assignmentTitle}`}
                                                >
                                                    {isGeneratingCert === sub.id ? <Spinner size={16} color="border-white"/> : 'Download Cert'}
                                                </button>
                                            ) : (
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    {sub.status === 'graded' && parseFloat(sub.grade) < 50 ? 'Grade < 50' : 'Not eligible'}
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                    {sub.status === 'graded' && sub.feedback && (
                                        <tr className="bg-gray-50 dark:bg-gray-700/30">
                                            <td colSpan="5" className="px-6 py-3">
                                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Feedback:</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{sub.feedback}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
