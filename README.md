# 🎓 EduDash | Enterprise School ERP Dashboard

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![i18n Ready](https://img.shields.io/badge/i18n-Ready-brightgreen?style=for-the-badge)](https://github.com/ashish-singh-dev)
[![API Ready](https://img.shields.io/badge/API-Abstraction_Layer-blue?style=for-the-badge)](https://github.com/ashish-singh-dev)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

> **Modern Scalable School ERP Dashboard built with React and frontend-first enterprise architecture.**

EduDash is a production-grade, multi-role school management interface designed for high-performance data visualization and seamless backend integration. Architected with scalability in mind, it provides a comprehensive suite of modules for students, parents, and administrative staff.

---

## 🌐 Live Demo
Experience the production build: **[EduDash Live Preview](https://school-erp-dashboard-beta.vercel.app/)**
*Status: Stable (v1.0.0)*

---

## 🚀 Project Overview

EduDash was engineered to bridge the gap between complex ERP data and intuitive user experiences. Unlike traditional static dashboards, EduDash utilizes a **Service-Oriented Frontend Architecture**, meaning every data point is abstracted through a dedicated service layer, making it "Plug-and-Play" for any REST or GraphQL backend.

### Target Personas
- **Students:** Centralized hub for attendance, grades, and schedules.
- **Parents:** Real-time monitoring of ward progress, fee payments, and notices.
- **Administrators:** (Roadmap) Fleet management, staff records, and examination control.

---

## 🛠️ Core Features

| Module | Description | Status |
| :--- | :--- | :--- |
| **🔐 Role-Based UI** | Dynamic interface switching between Student and Parent modes via `AuthContext`. | ✅ Production |
| **📅 Weekly Timetable** | High-fidelity interactive schedule with subject tracking and time-blocks. | ✅ Production |
| **📉 Analytics Cards** | Real-time attendance, fee status, and LMS progress visualizations. | ✅ Production |
| **🌍 Multilingual Support** | Full i18n implementation (English/Hindi) with centralized translation management. | ✅ Production |
| **💸 Fee Management** | Secure billing overview, payment history, and receipt downloads. | ✅ Production |
| **🩺 Mentor Support** | Anonymous academic and personal guidance portal for students. | ✅ Production |
| **🚌 Transport Tracking** | Route management and vehicle details with live-ready architecture. | ✅ Production |
| **🏆 Achievement Hub** | Digital repository for certifications, awards, and extracurricular records. | ✅ Production |
| **📢 Global Notice Board** | Multi-channel communication system for school-wide and exam-specific alerts. | ✅ Production |

---

## 🏗️ Project Architecture

The codebase follows a modular **Atomic-inspired structure** to ensure component reusability and clean separation of concerns.

```text
src/
├── components/          # Reusable UI components (Atoms & Molecules)
│   ├── MainCard.jsx     # Base wrapper for all dashboard widgets
│   ├── Sidebar.jsx      # Navigation logic & role-switching
│   ├── Header.jsx       # Global actions & notification center
│   └── ...              # Module-specific components
├── context/             # Global state management
│   ├── AuthContext.jsx  # User roles, auth state, & permissions
│   └── LanguageContext.js # i18n state & translation logic
├── services/            # Backend abstraction layer
│   ├── api.js           # Base service for data fetching
│   ├── clubService.js   # Module-specific API logic
│   └── ...              # Service-level helpers
├── pages/               # Functional views (Full-page modules)
│   ├── FeeDetailsPage.jsx
│   ├── ExaminationPage.jsx
│   └── ...
├── translations/        # i18n JSON/JS resource files
│   ├── en/              # English locale strings
│   └── hi/              # Hindi locale strings
├── data/                # Mock data & constants for development
├── utils/               # Pure helper functions & formatters
└── assets/              # Static media (Images, SVG, Fonts)
```

---

## 🧪 Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 | Component-based UI logic |
| **Build Tool** | Vite | Ultra-fast HMR and optimized bundling |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Animations** | Framer Motion | Fluid transitions and micro-interactions |
| **Icons** | Lucide React | Consistent enterprise iconography |
| **State** | Context API | Lightweight, predictable global state |
| **Testing** | Vitest | Unit and component testing suite |

---

## 🔌 API & Backend Integration Guide

EduDash is designed to be backend-agnostic. The `src/services/` directory contains the blueprint for all data requirements.

### Integration Strategy
1. **Service Layer:** Currently, `src/services/api.js` uses a `simulateNetwork` helper.
2. **Replacement:** Replace the return statements with `axios.get('/api/endpoint')`.
3. **Data Mapping:** Ensure your backend returns JSON matching the interfaces defined in `src/data/dummyData.js`.

### Recommended API Structure
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/auth/login` | POST | Returns JWT and User Role (Student/Parent) |
| `/api/student/profile` | GET | Basic info, attendance, and registration details |
| `/api/academic/timetable`| GET | Returns nested JSON for weekly schedule |
| `/api/finance/fees` | GET | Billing history and pending dues |

---

## 🗄️ Database Design Recommendations

For a full-scale integration, the following relational schema is recommended:

- **Users:** `id, email, password_hash, role_id, ward_id (for parents)`
- **Students:** `id, user_id, enrollment_no, class_id, transport_id`
- **Attendance:** `id, student_id, date, status (present/absent), subject_id`
- **Fees:** `id, student_id, amount, status, due_date, transaction_id`
- **Exams:** `id, subject_id, exam_type, date, max_marks`

---

## 🎨 UI System & Consistency

- **`MainCard.jsx`**: The standard layout wrapper. Use it for any new dashboard section to maintain consistent padding, borders, and shadows.
- **Color Palette**: 
  - Primary: `#00b4d8` (Deep Sky Blue)
  - Secondary: `#90e0ef` (Light Blue)
  - Background: `#caf0f8` (Soft Cyan)
- **Typography**: Responsive font scaling using Tailwind's `text-sm` through `text-2xl` for hierarchy.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps
```bash
# Clone the repository
git clone https://github.com/ashish-singh-dev/school-erp-dashboard.git

# Enter the directory
cd school-erp-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📝 Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.edudash.com/v1
VITE_AUTH_TOKEN_KEY=edudash_auth_token
VITE_ENABLE_MOCK_DATA=false
```

---

## 🚢 Deployment Guide

The project is optimized for **Vercel** but can be deployed to any static hosting provider.

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

**CI/CD Workflow:**
- `main` branch: Triggers production deployment.
- `dev` branch: Triggers preview/staging deployments.

---

## 🗺️ Future Roadmap

- [ ] **AI Assistant Integration:** Live chatbot for query handling using OpenAI/Gemini.
- [ ] **Real-time Notifications:** WebSocket integration for instant school alerts.
- [ ] **Admin Portal:** Comprehensive fleet and staff management dashboard.
- [ ] **Offline Mode:** PWA support for viewing schedules without internet.
- [ ] **Analytics Engine:** Visual grade trends and attendance forecasting.

---

## 🤝 Contributing

We welcome contributions from the community.
1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Follow the **CamelCase** naming convention for components.
4. Ensure all new components use `MainCard` for UI consistency.
5. Submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ashish Singh**
*MCA Student @ Amity University*

Specializing in **Scalable Frontend Architecture** and **AI-Driven Dashboards**.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ashish-singh-dev)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ashish-singh-dev)
