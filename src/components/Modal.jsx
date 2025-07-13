import React, { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef(null);
    const firstFocusableElementRef = useRef(null); // For focusing first element
    const lastFocusableElementRef = useRef(null); // For trapping focus

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => modalRef.current?.focus(), 0); // Focus the modal container itself
            // Or focus the first focusable element:
            // setTimeout(() => firstFocusableElementRef.current?.focus(), 0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Trap focus (basic example)
            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements && focusableElements.length > 0) {
                firstFocusableElementRef.current = focusableElements[0];
                lastFocusableElementRef.current = focusableElements[focusableElements.length - 1];
            }
        } else {
            document.removeEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // Focus trapping logic
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableElementRef.current) {
                    lastFocusableElementRef.current?.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableElementRef.current) {
                    firstFocusableElementRef.current?.focus();
                    e.preventDefault();
                }
            }
        }
    };


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={(e) => {
                // Close if backdrop is clicked
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onKeyDown={handleKeyDown} // Add keydown listener for focus trapping
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg transition-all max-h-[90vh] overflow-y-auto"
                tabIndex={-1} // Makes the div focusable
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 id="modal-title" className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl leading-none p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300"
                        aria-label="Close modal"
                        ref={lastFocusableElementRef} // Example: close button as last focusable
                    >
                        &times;
                    </button>
                </div>
                {/* Assign ref to first focusable element if needed, e.g., an input */}
                {children}
            </div>
        </div>
    );
};

export default Modal;
