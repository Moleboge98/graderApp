import React from 'react';

const StatusBadge = ({ status }) => {
    let bgClass, textClass, dotClass;
    const lowerStatus = status?.toLowerCase() || 'unknown';

    switch(lowerStatus) {
        case 'graded':
            bgClass = 'bg-green-100 dark:bg-green-900';
            textClass = 'text-green-700 dark:text-green-300';
            dotClass = 'bg-green-500 dark:bg-green-400';
            break;
        case 'submitted':
            bgClass = 'bg-yellow-100 dark:bg-yellow-900';
            textClass = 'text-yellow-700 dark:text-yellow-300';
            dotClass = 'bg-yellow-500 dark:bg-yellow-400';
            break;
        case 'in-progress': // Assuming 'in-progress' might be a status
            bgClass = 'bg-blue-100 dark:bg-blue-900';
            textClass = 'text-blue-700 dark:text-blue-300';
            dotClass = 'bg-blue-500 dark:bg-blue-400';
            break;
        default: // 'unknown' or any other status
            bgClass = 'bg-gray-200 dark:bg-gray-700';
            textClass = 'text-gray-700 dark:text-gray-300';
            dotClass = 'bg-gray-500 dark:bg-gray-400';
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${bgClass} ${textClass}`}>
            <span className={`w-2 h-2 mr-2 rounded-full ${dotClass}`}></span>
            {status?.toUpperCase() || 'UNKNOWN'}
        </span>
    );
};

export default StatusBadge;
