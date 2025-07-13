import React from 'react';

const Spinner = ({ size = 10, color = 'border-blue-600 dark:border-blue-400' }) => (
    <div className="flex justify-center items-center" role="status" aria-label="Loading...">
        <div
            className={`animate-spin rounded-full border-t-2 border-b-2 ${color}`}
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            <span className="sr-only">Loading...</span>
        </div>
    </div>
);

export default Spinner;
