import React, { useState, useEffect } from 'react';
// Firebase services and specific functions
import { db, appIdFromHost, collection, query, where, onSnapshot } from '../firebase-config.js';
import { getGraderName } from '../data/grader-mapping.js'; 
import Spinner from './Spinner.jsx';
import StatusBadge from './StatusBadge.jsx';
import GradingModal from './GradingModal.jsx';

const GraderDashboard = ({ userId, isAuthReady }) => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('submitted'); // Default to 'submitted'
    const [stats, setStats] = useState({ total: 0, submitted: 0, graded: 0 });

    useEffect(() => {
        if (!isAuthReady || !db) {
            if (isAuthReady && !db) {
                 setError("Database service is unavailable. Cannot load submissions for grading.");
                 console.warn("GraderDashboard: db not ready.", { isAuthReady, db });
            }
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Listener for overall stats
        const allSubmissionsQuery = collection(db, `artifacts/${appIdFromHost}/public/data/submissions`);
        const unsubscribeStats = onSnapshot(allSubmissionsQuery, (allDocsSnapshot) => {
            let sCount = 0, gCount = 0;
            allDocsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'submitted') sCount++;
                if (data.status === 'graded') gCount++;
            });
            setStats({ total: allDocsSnapshot.size, submitted: sCount, graded: gCount });
        }, (err) => {
            console.error("Error fetching all submissions for stats:", err);
        });

        // Listener for filtered submissions
        let submissionsQuery;
        if (filterStatus === 'all') {
            submissionsQuery = collection(db, `artifacts/${appIdFromHost}/public/data/submissions`);
        } else {
            submissionsQuery = query(
                collection(db, `artifacts/${appIdFromHost}/public/data/submissions`),
                where("status", "==", filterStatus)
            );
        }

        const unsubscribeSubmissions = onSnapshot(submissionsQuery, (querySnapshot) => {
            const subs = [];
            querySnapshot.forEach((doc) => subs.push({ id: doc.id, ...doc.data() }));
            subs.sort((a, b) => (b.submittedAt?.toDate?.()?.getTime() || 0) - (a.submittedAt?.toDate?.()?.getTime() || 0));
            setSubmissions(subs);
            setIsLoading(false);
            setError(null);
        }, (err) => {
            console.error(`Error fetching ${filterStatus} submissions for grader:`, err);
            setError(`Failed to load ${filterStatus} submissions. Please try refreshing.`);
            setIsLoading(false);
        });

        return () => {
            unsubscribeStats();
            unsubscribeSubmissions();
        };
    }, [filterStatus, isAuthReady]);

    const openGradingModal = (submission) => {
        setSelectedSubmission(submission);
        setIsGradingModalOpen(true);
    };
    const closeGradingModal = () => {
        setSelectedSubmission(null);
        setIsGradingModalOpen(false);
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
                <p className="text-gray-600 dark:text-gray-300 mt-3">Loading submissions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Grading Console</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Viewing: <span className="font-semibold capitalize">{filterStatus}</span> submissions.
                        ({submissions.length} item{submissions.length !== 1 ? 's' : ''} shown)
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <label htmlFor="filterStatus" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        Filter by:
                    </label>
                    <select
                        id="filterStatus"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm transition-colors"
                    >
                        <option value="submitted">To Grade ({stats.submitted})</option>
                        <option value="graded">Graded ({stats.graded})</option>
                        <option value="all">All Submissions ({stats.total})</option>
                    </select>
                </div>
            </header>

            {error && (
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-4 rounded-lg shadow text-center" role="alert">
                    {error}
                </div>
            )}

            {!isLoading && !error && submissions.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                    <div className="text-gray-400 dark:text-gray-500 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        {filterStatus === 'graded' ? 'No graded submissions found.' :
                         filterStatus === 'submitted' ? 'All caught up! No submissions to grade.' :
                         'No submissions match the current filter.'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        {filterStatus === 'graded' ? 'Completed gradings will appear here.' :
                         filterStatus === 'submitted' ? 'New student submissions pending review will appear here.' :
                         'Try adjusting the filter or check back later.'}
                    </p>
                </div>
            )}

            {!isLoading && !error && submissions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {submissions.map(sub => (
                        <div key={sub.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-xl p-5 border border-gray-200 dark:border-gray-700 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-semibold text-lg text-indigo-600 dark:text-indigo-400 truncate" title={sub.assignmentTitle}>
                                        {sub.assignmentTitle}
                                    </h4>
                                    <StatusBadge status={sub.status} />
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate" title={sub.studentEmail || sub.studentId}>
                                    Student: <span className="font-medium">{sub.studentEmail || sub.studentId}</span>
                                </p>
                                {/* MODIFICATION START: Display Grader Name */}
                                {sub.status === 'graded' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" title={`Grader UID: ${sub.gradedBy}`}>
                                        Graded by: <span className="font-medium">{getGraderName(sub.gradedBy)}</span>
                                    </p>
                                )}
                                {/* MODIFICATION END */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Cert. Name: <span className="font-medium">{sub.fullNameForCertificate || 'N/A'}</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Submitted: {sub.submittedAt?.toDate() ? new Date(sub.submittedAt.toDate()).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'}) : 'N/A'}
                                </p>
                                {sub.gradedAt && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Graded: {sub.gradedAt?.toDate() ? new Date(sub.gradedAt.toDate()).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'}) : 'N/A'}
                                    </p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-2">
                                    <span className="font-medium">Link:</span>
                                    <a href={sub.notebookLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-300 hover:underline ml-1" title={sub.notebookLink}>
                                        View Notebook &rarr;
                                    </a>
                                </p>
                            </div>
                            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {sub.status === 'graded' ? (
                                    <div className="space-y-2">
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400 text-center">Grade: {sub.grade}%</p>
                                        {sub.certificateEligible && parseFloat(sub.grade) >= 50 && (
                                            <p className="text-xs text-center text-purple-600 dark:text-purple-400">Certificate Eligible</p>
                                        )}
                                        <button
                                            onClick={() => openGradingModal(sub)}
                                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-600"
                                            aria-label={`Edit Grade for ${sub.assignmentTitle}`}
                                        >
                                            View/Edit Grade
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => openGradingModal(sub)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600"
                                        aria-label={`Grade ${sub.assignmentTitle}`}
                                    >
                                        Grade Notebook
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedSubmission && (
                <GradingModal
                    isOpen={isGradingModalOpen}
                    onClose={closeGradingModal}
                    submission={selectedSubmission}
                    graderId={userId}
                />
            )}
        </div>
    );
};

export default GraderDashboard;
