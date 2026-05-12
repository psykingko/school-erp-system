# EduDash | Modular School ERP Dashboard

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

> **Scalable frontend architecture for educational resource planning, featuring a backend-ready modular interface.**

EduDash is a modular, multi-role ERP interface designed for maintainable data management and seamless backend integration. The system is architected for scalability, providing a unified dashboard for student, parent, and administrative modules.

---

## 🌐 Live Deployment

**Production:** [https://school-erp-dashboard-beta.vercel.app/](https://school-erp-dashboard-beta.vercel.app/)  
**Staging/Preview:** Automatically generated per Pull Request via Vercel.

---

## ⚙️ Development Standards

To maintain code quality and architectural integrity, all contributors must adhere to the following standards:

- **Service Layer Abstraction**: No direct data fetching or dummy-data imports within page components. All data must flow through the `src/services/` layer.
- **Role-Aware Architecture**: Components must be built to handle role-based permissions (Student/Parent) via the `AuthContext`.
- **UI Consistency**: Every new dashboard module or widget must wrap its content in the `MainCard` component to ensure consistent spacing, layout, and shadow depth.
- **i18n Implementation**: All UI strings must be localized using the `LanguageContext`. Hardcoded text in components is prohibited.
- **Modular Styling**: Use Tailwind CSS utility classes exclusively. Avoid ad-hoc CSS unless strictly necessary for complex animations.

---

## 🏗️ Project Architecture

The repository follows a modular structure to ensure clear separation of concerns:

```text
src/
├── components/          # Reusable UI components (MainCard, Sidebar, etc.)
├── context/             # Global state (Auth, Language/i18n)
├── services/            # Backend abstraction layer (API calls)
├── pages/               # Functional views and module layouts
├── translations/        # Localization resource files (EN/HI)
├── data/                # Mock data for local development
├── utils/               # Pure helper functions and formatters
└── assets/              # Static media and global styles
```

---

## 🛠️ Core Modules

| Module | Description | Status |
| :--- | :--- | :--- |
| **Role-Based UI** | Dynamic interface switching based on user permissions. | Ready |
| **Weekly Timetable** | Interactive schedule tracking with subject time-blocks. | Ready |
| **Academic Analytics** | Attendance tracking and LMS progress visualization. | Ready |
| **Multilingual Support** | Full i18n implementation (English/Hindi). | Ready |
| **Finance Module** | Billing overview and payment history tracking. | Ready |
| **Mentor Support** | Anonymous support portal for student guidance. | Ready |
| **Transport System** | Route management and vehicle detail tracking. | Ready |

---

## 🔌 API & Backend Integration Guide

EduDash is designed to be backend-agnostic. The `src/services/` directory contains the blueprint for all data requirements.

### Integration Strategy
1. **Service Layer Implementation**: Replace the simulation logic in `src/services/api.js` with real HTTP clients (e.g., Axios).
2. **Authentication Flow**: The system expects a JWT-based authentication flow. 
   - **Login**: POST to `/auth/login` returning an access token and user role.
   - **Tokens**: Recommended implementation of Refresh Tokens for session persistence.
3. **Data Schemas**: Ensure backend responses match the structure defined in `src/data/dummyData.js`.

### API Architecture
| Endpoint | Method | Expected Response |
| :--- | :--- | :--- |
| `/api/auth/login` | POST | `{ token, refreshToken, user: { role, name, id } }` |
| `/api/student/profile`| GET | Detailed student profile and registration metadata |
| `/api/academic/schedule`| GET | Nested JSON representing the weekly timetable |
| `/api/finance/fees` | GET | Transaction history and pending dues array |

---

## 🗄️ Database Design Recommendations

### Entity Relationships
- **Users & Roles**: 1:1 relationship between User and Role. Parents should have a foreign key reference to one or more Student IDs.
- **Attendance**: Linked to both Student ID and Subject ID with a timestamp.
- **Examinations**: Linked to Class ID and Subject ID with nested grading records.

### Scaling Considerations
- **Normalization**: Ensure attendance and fee records are normalized to handle millions of entries across multiple academic years.
- **Caching**: Implement Redis or similar for frequently accessed data like the daily timetable and global notices.

---

## 🚢 Git Workflow & Branching

We follow a structured branching strategy to ensure stable deployments:

- **`main`**: The stable production branch. Only tested and approved features are merged here.
- **`dev`**: The active development branch. All feature branches should be merged into `dev` for integration testing.
- **Feature Branches**: Format: `feature/module-name` or `fix/issue-name`.

**Deployment Flow:**  
1. Feature developed in `feature/*`.  
2. PR submitted to `dev` branch.  
3. Merged into `dev` triggers a staging deployment.  
4. Successful staging tests lead to a PR from `dev` to `main` for production release.

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/ashish-singh-dev/school-erp-dashboard.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://api.edudash.com/v1
VITE_ENABLE_MOCK_DATA=true
```

---

## 🧪 Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 | Component logic |
| **Build Tool** | Vite | Optimization & HMR |
| **Styling** | Tailwind CSS | Responsive design |
| **Animations** | Framer Motion | Interface transitions |
| **State** | Context API | Global state management |
| **Testing** | Vitest | Unit testing |

---

## 🤝 Contributing

We maintain high standards for all code contributions.
1. **Branching**: Always branch off `dev`.
2. **PR Requirements**: All Pull Requests must include a description of changes and adhere to the project's naming conventions (CamelCase for components).
3. **Review Process**: Every PR requires a review from at least one maintainer.
4. **Consistency**: Ensure all new modules use the `MainCard` wrapper and localized strings.

---

## 👥 Maintainers

- **Ashish Singh** — Frontend Engineering & UI Architecture
