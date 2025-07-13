# Jupyter Notebook Grading Platform
A modern, web-based platform designed for educational settings to streamline the submission and grading of Jupyter notebooks. Built with React, Vite, and Firebase, this application provides a seamless experience for students, graders, and administrators.

# Features
Role-Based Access Control: Separate dashboards and functionalities for three distinct user roles:

Students: Can submit assignments (via notebook links), track their submission status, view grades, and see detailed rubric-based feedback.

Graders: Can view all submissions, grade them using an interactive rubric, provide custom feedback, and see their name associated with their grading work.

Admins: Have access to a placeholder dashboard, with the structure in place to build out administrative functions like user management.

Interactive Rubric Grading: Replaces simple numeric entry with a detailed, clickable rubric.

Grades are automatically calculated based on rubric selections.

Students can see a full breakdown of their performance against each rubric criterion.

AI-Powered Feedback (Gemini API): Graders can leverage the Gemini API to generate suggestions for additional feedback, making the grading process faster and more comprehensive.

Email/Password Authentication: Secure user registration and login system, including a "Forgot Password" feature.

Real-time Database: Utilizes Firebase Firestore for live updates. Changes in submission status or grades are reflected instantly without needing to refresh the page.

Dynamic Filtering & Stats: Graders can filter submissions by status (To Grade, Graded, All) and view key statistics about the submission queue.

Certificate Generation: Students who meet the grading threshold (e.g., >= 50%) can download a PDF certificate of completion directly from their dashboard.

# Tech Stack
Frontend: React (Vite)

Backend & Database: Firebase (Firestore, Authentication)

Styling: Tailwind CSS

AI Integration: Google Gemini API

# Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
Node.js (v18 or later recommended)

A Firebase project.

Installation
Clone the repository:
```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```
Install NPM packages:
```
npm install
```
**Set up environment variables:**

Create a file named .env in the root of your project.

Go to your Firebase project settings and find your web app's configuration object.

Add your Firebase config to the .env file. The keys must start with VITE_.
```
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```
Update Firebase Config File:

Open src/firebase-config.js.

Ensure it is set up to read the environment variables from your .env file.
```
// src/firebase-config.js
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```
Run the development server:
```
npm run dev
```
The application should now be running on http://localhost:5173 (or another port if 5173 is in use).

Firebase Setup
Authentication: In your Firebase console, go to the "Authentication" section and enable the "Email/Password" sign-in provider.

Firestore Database:

Create a Firestore database.

Go to the "Rules" tab and update your security rules to allow authenticated users to read and write data. For development, you can use the following rules. Note: These are not secure for production.
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allows any authenticated user to read/write to the public data
    match /artifacts/{appId}/public/data/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
How to Use
Sign Up: New users (students or graders) must first create an account using their email and password.

Role Selection: After signing up, users are prompted to select their role ('Student' or 'Grader'). This choice determines which dashboard they will see.

Admin Role: The 'Admin' role is not selectable upon signup. It must be assigned manually in the Firestore database by navigating to the user_roles collection and changing a user's role field from 'grader' or 'student' to 'admin'.

Grading: Graders can select a submission from their console, use the interactive rubric to score it, and add custom feedback. The final grade is calculated automatically.

Viewing Grades: Students can see their final grade, a detailed rubric breakdown, and any additional feedback on their dashboard.

Future Enhancements
Full-Fledged Admin Dashboard: Build out UI for admins to manage user roles, view platform-wide statistics, and oversee submissions.

Direct Notebook Uploads: Integrate Firebase Storage to allow students to upload .ipynb files directly instead of just providing links.

Automated Email Notifications: Use Firebase Cloud Functions to send real email notifications to students when their work is graded.

Advanced Filtering and Sorting: Add more options for graders to sort and filter the submission queue (e.g., by student name, date range).
