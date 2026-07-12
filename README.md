# EduDash — Frontend-First School ERP Dashboard

EduDash is a modular, frontend-first School ERP prototype designed for Indian K–12 educational institutions.

## 📖 Project Overview

EduDash serves as an end-to-end management platform, streamlining operations across all major stakeholders: administrators, teachers, students, and parents. Currently executed as a robust frontend-only prototype, it models production-style ERP workflows using `localStorage` for persistence.

The project philosophy centers on clean architecture and strict business logic separation. By adopting a Service Layer Architecture, EduDash is backend-ready, designed to minimize frontend changes during backend integration.

## 🧠 Project Philosophy

- **UI First**
- **Backend Ready**
- **Service Layer**
- **No duplicated business logic**
- **Modular Architecture**

## 📐 Design Principles

- Simplicity over over-engineering
- Incremental implementation
- Reusable components
- Service-oriented architecture
- Backend-ready interfaces

## ✨ Key Features

EduDash implements realistic school workflows grouped by domain:

**Academic Management**
- Examination Management
- Assessment Governance
- Academic Report Cards
- Timetable
- Subjects

**Administration**
- Attendance
- Fees
- Student Exit
- School Completion

**Communication**
- Notices
- Events
- Clubs
- Mentor Support

**Portals**
- Admin
- Teacher
- Student
- Parent

## 🛠️ Technology Stack

**Frontend**
- React (v18)
- Vite
- Tailwind CSS (Utility-first styling)
- React Router (Role-gated navigation)
- Framer Motion (Micro-animations and transitions)

**State & Architecture**
- Context API (Session, Scope, and Language management)
- Service Layer Architecture

**Persistence**
- LocalStorage (In-browser data mocking)

**Development**
- JavaScript (ES6+)
- ESLint (Strict linting)

## 🏗️ Architecture Highlights

- **Backend-Ready:** Every data transaction routes through an asynchronous service layer, making it trivial to swap `localStorage` for real API calls.
- **Service Layer:** UI components are purely presentational or state-orchestrators. Complex business logic stays strictly within `services/`.
- **Provider Pattern:** Contexts (`AuthContext`, `StudentContext`) are injected securely at the root to maintain consistent scoped states across nested routes.
- **Modular Design:** Components and layouts are built to be reusable across various portals without polluting global state.

## 📂 Project Structure

```text
src/
├── components/      # Reusable UI components
├── context/         # React Providers (Auth, Student, Language)
├── contracts/       # Data contracts and interfaces
├── data/            # MockDB initialization and seeds
├── layouts/         # Role-specific layout wrappers (Admin, Teacher, etc.)
├── pages/           # Role-gated route components
├── persistence/     # Direct localStorage bridging
├── services/        # Backend-ready asynchronous service layer
├── shared/          # Shared utilities and helpers across domains
├── translations/    # Multi-language dictionaries
└── utils/           # Shared utility functions

docs/                # Detailed architectural documentation
```

## 🚀 Getting Started

Follow these steps to run the EduDash ERP locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### Development Server
Run the local Vite development server:
```bash
npm run dev
```

### Production Build
Create an optimized production bundle:
```bash
npm run build
```

## 📚 Documentation

Detailed architectural documentation is available under the `docs/` directory and should be considered the canonical technical reference for the project. Each document focuses on a single architectural concern, making the documentation easier to navigate and maintain.

*Highlights include:*
- **Frontend Architecture** (`07-frontend-architecture.md`)
- **Workflow Diagrams** (`03-workflow-diagrams.md`)
- **Module Inventory** (`09-module-inventory.md`)
- **Academic Governance & Planning Architecture** (`16-academic-governance-and-planning-architecture.md`)
- **Technical Reference & API Contracts** (`02-technical-reference.md`)

*Please refer to the `docs/` folder for any deep-dive structural questions rather than this README.*

## 📊 Current Status

The project is actively being developed. 

Recently completed:
- ✅ Examination Engine (Frozen)
- ✅ Assessment Governance (Frozen)
- ✅ Academic Report Cards
- ✅ Academic Calendar (Frozen)
- ✔ Student Examination Synchronization
- ✅ Translation Subsystem (Frozen)

## 🗺️ Roadmap

Future work includes (but is not limited to):
- Backend Integration (Node.js/Express or similar)
- Authentication Enhancements (JWT/OAuth)
- Notifications (Push Notifications / WebSockets)
- Performance Optimizations
- Mobile Responsiveness Improvements

## 📸 Screenshots

Project screenshots and workflow previews will be added in future updates.

## 🤝 Contributing

This project is currently being developed and maintained as part of a professional internship. As such, we are not accepting external contributions or pull requests at this time.

## 📄 License

License information will be added later.

## 👤 Author
 
Author information will be updated.
