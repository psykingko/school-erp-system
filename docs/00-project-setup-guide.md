# 00 - Project Setup Guide

Welcome to the EduDash ERP project. This is a React 18 SPA built with Vite, Tailwind CSS, and Framer Motion.

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 💾 Mock Database & Seeding

The application currently runs entirely in the browser using `localStorage`. 
On the first load, the `initializeStorage.js` script will automatically populate the database with comprehensive seed data including Students, Teachers, Classes, Timetables, and Exams.

If you ever need to reset the database to a clean state:
- Clear your browser's local storage for `localhost`.
- Refresh the page, and the seed script will rebuild everything automatically.

## 🔐 Demo Credentials

Use these credentials to log in and explore different portals:

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |
| **Teacher** | `teacher.sarah` | `demo123` |
| **Student** | `ADM2026001` | `demo123` |
| **Parent** | `ADM2026001` | `demo123` |

*(Note: Parent login uses the eldest child's admission number).*
