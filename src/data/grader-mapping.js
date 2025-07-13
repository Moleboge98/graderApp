// src/data/grader-mapping.js

/**
 * A mapping of grader UIDs to human-readable names.
 * * Instructions:
 * 1. Replace the placeholder UIDs (e.g., 'UID_GRADER_1_PLACEHOLDER') with the
 * actual Firebase UIDs of your seven graders.
 * 2. You can change the names as needed.
 */
const graderNames = {
    'I2PqkG9SGHfmHNQyqYPZX39Fwx93': 'Narusha Isaacs',
    'rIlyMcacgpN30XuuodWNQnGi7HP2': 'Najam Hasan',
    '8n4OeTdv1uZUr4kOBcLUwKG81Dz2': 'Daniel Egbo',
    'ftW6ClmQoyV1TrTjY60TG3ZRvlz2': 'Sally McFarlane',
    'TzxMOwGFOVfq1YqVl5olxUf6tCV2': 'Aleksey Diachenko',
    '7pjepHNrM8VGVDogr8NNjDLq2Rg2': 'Priya Hasan',
    'N7P4b4XrLWVSs4DB2xKUmZdCeen2': 'Nikita Rawat'

};

/**
 * A helper function to get a grader's name from their UID.
 * If the UID is not found in the mapping, it gracefully falls back
 * to showing the UID itself, which is useful for debugging.
 * * @param {string} uid - The grader's UID from Firestore.
 * @returns {string} - The grader's name or the original UID if not found.
 */
export const getGraderName = (uid) => {
    if (!uid) return 'Not available';
    return graderNames[uid] || uid;
};

// You can also export the object directly if needed elsewhere
export default graderNames;
