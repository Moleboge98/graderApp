import React, { useState, useEffect } from 'react';
// Firebase services and specific functions
import { db, appIdFromHost, doc, updateDoc, serverTimestamp } from '../firebase-config.js';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';
// Import the rubric data
import rubricData from '../data/rubric.js';

const GradingModal = ({ isOpen, onClose, submission, graderId }) => {
    // State for the rubric, feedback, and calculated grade
    const [rubricScores, setRubricScores] = useState({});
    const [grade, setGrade] = useState(0);
    const [feedback, setFeedback] = useState('');

    // State for UI control and messaging
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Effect to initialize state when the submission changes
    useEffect(() => {
        if (submission) {
            // Set initial rubric scores from submission data, or default to an empty object
            setRubricScores(submission.rubricScores || {});
            setFeedback(submission.feedback || '');
        }
        // Reset messages when submission changes or modal opens/closes
        setError(null);
        setSuccessMessage(null);
    }, [submission, isOpen]);

    // Effect to calculate the grade automatically when rubric scores change
    useEffect(() => {
        const scores = Object.values(rubricScores);
        if (scores.length === 0) {
            setGrade(0);
            return;
        }
        // Calculate the total score from the selected rubric criteria
        const totalScore = scores.reduce((acc, score) => acc + score, 0);
        // Calculate the maximum possible score based on the rubric structure (e.g., 6 categories * 3 points max)
        const maxScore = rubricData.length * Math.max(...rubricData[0].criteria.map(c => c.score));
        const calculatedGrade = Math.round((totalScore / maxScore) * 100);
        setGrade(calculatedGrade);
    }, [rubricScores]);

    // Handler for selecting a score in a rubric category
    const handleRubricSelect = (category, score) => {
        setRubricScores(prev => ({ ...prev, [category]: score }));
    };
    
    // Handler to compile feedback from the selected rubric descriptions
    const handleCompileFeedback = () => {
        let compiledFeedback = "Rubric Feedback:\n";
        rubricData.forEach(item => {
            const selectedScore = rubricScores[item.category];
            if (selectedScore) {
                const criterion = item.criteria.find(c => c.score === selectedScore);
                if (criterion) {
                    compiledFeedback += `- ${item.category} (${criterion.label}): ${criterion.description}\n`;
                }
            }
        });
        // Append the compiled feedback to any existing feedback
        setFeedback(prev => `${prev}${prev ? '\n\n' : ''}${compiledFeedback}`);
    };


    const handleSaveGrade = async () => {
        setError(null);
        setSuccessMessage(null);

        // Validate that all rubric categories have been scored
        if (Object.keys(rubricScores).length < rubricData.length) {
            setError(`Please select a score for all ${rubricData.length} rubric categories.`);
            return;
        }

        if (!db || !submission || !submission.id) {
            setError("Database service or submission data is missing. Cannot save grade.");
            return;
        }

        setIsSaving(true);
        const certificateEligible = grade >= 50;

        try {
            const submissionRef = doc(db, `artifacts/${appIdFromHost}/public/data/submissions/${submission.id}`);
            await updateDoc(submissionRef, {
                grade: grade, // Save the calculated grade
                rubricScores: rubricScores, // Save the detailed rubric scores
                feedback: feedback.trim(),
                status: 'graded',
                gradedAt: serverTimestamp(),
                gradedBy: graderId,
                certificateEligible: certificateEligible,
            });

            let message = "Grade saved successfully!";
            message += certificateEligible ? ` The student is now eligible for a certificate.` : ` The student is NOT eligible for a certificate (Grade < 50).`;
            setSuccessMessage(message);
        } catch (err) {
            console.error("Error saving grade:", err);
            setError(`Failed to save grade: ${err.message}. Please try again.`);
        }
        setIsSaving(false);
    };

    const generateEmailPreview = () => {
        if (!submission) return "Submission data not available for preview.";
        const certEligible = grade >= 50;
        let emailBody = `To: ${submission.studentEmail || 'Student'}\n`;
        emailBody += `From: Notebook Grading Platform <noreply@example.com>\n`;
        emailBody += `Subject: Your Grade for "${submission.assignmentTitle}" is Available!\n\n`;
        emailBody += `Hi ${submission.fullNameForCertificate || 'Student'},\n\n`;
        emailBody += `Your submission for the assignment "${submission.assignmentTitle}" has been graded.\n\n`;
        emailBody += `Final Grade: ${grade}%\n\n`;
        emailBody += `Additional Feedback:\n${feedback.trim() || "No additional feedback was provided."}\n`;

        if (grade !== null) {
            if (certEligible) {
                emailBody += `\nCongratulations! Based on your grade, your certificate of completion is now available.\n`;
            } else {
                emailBody += `\nPlease review the detailed rubric breakdown and feedback on the platform to understand areas for improvement.\n`;
            }
        }
        emailBody += `\nBest regards,\nThe Grading Team`;
        return emailBody.trim();
    };

    if (!submission) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Grading: ${submission.assignmentTitle}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left side: Rubric */}
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-3">
                        <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg sticky top-0 z-10">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Grading Rubric</h4>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Final Grade</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{grade}%</p>
                            </div>
                        </div>
                        {rubricData.map(item => (
                            <div key={item.category} className="p-3 border dark:border-gray-700 rounded-lg">
                                <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{item.category}</h5>
                                <div className="space-y-2">
                                    {item.criteria.map(criterion => (
                                        <div
                                            key={criterion.score}
                                            onClick={() => handleRubricSelect(item.category, criterion.score)}
                                            className={`p-2.5 border rounded-md cursor-pointer transition-all duration-200 ${
                                                rubricScores[item.category] === criterion.score
                                                ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 dark:border-blue-500 ring-2 ring-blue-300 dark:ring-blue-600'
                                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{criterion.label}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{criterion.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right side: Feedback and Actions */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Additional Feedback
                            </label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows="8"
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                placeholder="Enter any additional comments here..."
                            ></textarea>
                             <button
                                type="button"
                                onClick={handleCompileFeedback}
                                className="mt-2 text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-1.5 px-3 rounded-md transition-colors"
                            >
                                Compile Feedback from Rubric
                            </button>
                        </div>
                        
                        {error && (
                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg" role="alert">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className={`text-sm p-3 rounded-lg ${grade >= 50 ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50' : 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50'}`} role="status">
                                {successMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Simulated Notification:</h4>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded shadow-sm max-h-48 overflow-auto">
                                    {generateEmailPreview()}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <button type="button" onClick={onClose} disabled={isSaving} className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg border border-gray-300 dark:border-gray-500 shadow-sm transition-colors disabled:opacity-50">
                        Close
                    </button>
                    <button type="button" onClick={handleSaveGrade} disabled={isSaving} className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed min-w-[180px] flex items-center justify-center">
                        {isSaving ? <Spinner /> : 'Save Grade'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default GradingModal;
