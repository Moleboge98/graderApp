// src/data/rubric.js

/**
 * Defines the grading rubric for Jupyter notebook submissions.
 * Each category contains multiple criteria with associated scores, labels, and descriptions.
 *
 * To use this in your project:
 * 1. Save this file as `rubric.js` inside a data or constants folder (e.g., `src/data/`).
 * 2. Import it into your React components: `import rubricData from './data/rubric.js';`
 */
const rubricData = [
    {
        category: 'Application of Concepts learnt',
        criteria: [
            { score: 1, label: '0-50%', description: 'Failed to apply the concepts learnt' },
            { score: 2, label: '50-75%', description: 'Fairly applied the concepts learnt' },
            { score: 3, label: '75-100', description: 'Used the concepts to a satisfactory levels' }
        ]
    },
    {
        category: 'Analysis',
        criteria: [
            { score: 1, label: '0-50%', description: 'Choice of analysis is overly simplistic or incomplete' },
            { score: 2, label: '50-75%', description: 'Analysis appropriate' },
            { score: 3, label: '75-100', description: 'Analysis appropriate, complete, advanced, and informative' }
        ]
    },
    {
        category: 'Results',
        criteria: [
            { score: 1, label: '0-50%', description: 'Conclusions are missing, incorrect, or not based on analysis. Inappropriate choice of plots; poorly labeled plots; plots missing' },
            { score: 2, label: '50-75%', description: 'Conclusions relevant, but partially correct or partially complete. Plots convey information but lack context for interpretation' },
            { score: 3, label: '75-100', description: 'Relevant conclusions explicitly tied to analysis and to context. Plots convey information correctly with adequate and appropriate reference information' }
        ]
    },
    {
        category: 'Readability',
        criteria: [
            { score: 1, label: '0-50%', description: 'Code is messy and poorly organized; unused or irrelevant code distracts when reading code. Variables and functions names do not help to understand code.' },
            { score: 2, label: '50-75%', description: 'Code is reasonably well organized. There is little unused or irrelevant code, or this code has been moved out of the main project files. Variable and function names generally meaningful and helpful for understanding.' },
            { score: 3, label: '75-100', description: 'Code very well organized. No irrelevant or distracting code. Variable and function names have clear relationship to their purpose in the code. Code is easy to read and understand.' }
        ]
    },
    {
        category: 'Presentation',
        criteria: [
            { score: 1, label: '0-50%', description: 'Verbal presentation is illogical, incorrect, or incoherent. Visual presentation is cluttered, disjoint, or illegible. Verbal and visual presentation unrelated' },
            { score: 2, label: '50-75%', description: 'Verbal presentation partially correct but incomplete or unconvincing. Visual presentation is readable and clear. Verbal and visual presentation related' },
            { score: 3, label: '75-100', description: 'Verbal presentation is correct, complete, and convincing. Visual presentation is appealing, informative, and crisp. Verbal and visual presentation clearly related' }
        ]
    },
    {
        category: 'Writing',
        criteria: [
            { score: 1, label: '0-50%', description: 'Explanation is illogical, incorrect, or incoherent' },
            { score: 2, label: '50-75%', description: 'Explanation is correct, complete, and convincing' },
            { score: 3, label: '75-100', description: 'Explanation is correct, complete, convincing, and elegant' }
        ]
    }
];

export default rubricData;
