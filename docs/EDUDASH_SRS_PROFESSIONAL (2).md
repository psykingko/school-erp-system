EduDash – School ERP Management System 

# **EduDash – School ERP Management System** 

## Software Requirements Specification 

Prepared By: Ashish Singh 

Page 1 

EduDash – School ERP Management System 

|Table of Contents|
|---|



|Table of Contents......................................................................................................................................................2|
|---|
|Software Requirements Specification (SRS)............................................................................................................6|
|Project: EduDash - School ERP Management System.........................................................................................6|
|Developer System Architecture Guide.....................................................................................................................6|
|Section A – Repository Overview........................................................................................................................6|
|Section B – Technology Stack.............................................................................................................................6|
|Section C – Repository Structure.........................................................................................................................7|
|Section D – Layered Architecture........................................................................................................................7|
|Section E – Module Organization.........................................................................................................................7|
|Section F – Routing Architecture.........................................................................................................................8|
|Section G – Authentication Flow.........................................................................................................................8|
|Section H – Authorization Flow (Effective Access)............................................................................................8|
|Section I – State Management.............................................................................................................................. 9|
|Section J – Runtime Data Flow (Example: Assignments)....................................................................................9|
|Section K – Service Layer Standards...................................................................................................................9|
|Section L – Provider Layer...................................................................................................................................9|
|Section M – Persistence Layer...........................................................................................................................10|
|Section N – DTO & Contract Standards.............................................................................................................10|
|Section O – Error Handling................................................................................................................................ 10|
|Section P – Module Lifecycle (Example: Question Paper)................................................................................10|
|Section Q – Cross Module Dependencies...........................................................................................................11|
|Section R – Implementation Status.....................................................................................................................11|
|Section S – Development Guidelines.................................................................................................................11|
|Section T – Backend Migration Guide............................................................................................................... 12|
|1. Core System Specification..................................................................................................................................13|
|1.1 Introduction...................................................................................................................................................13|
|1.2 Scope............................................................................................................................................................ 13|
|1.3 Product Perspective.......................................................................................................................................13|
|1.4 Product Functions......................................................................................................................................... 13|
|1.5 User Classes..................................................................................................................................................14|
|1.6 Operating Environment.................................................................................................................................14|
|1.7 Assumptions..................................................................................................................................................14|
|1.8 Dependencies................................................................................................................................................14|
|2. System Architecture............................................................................................................................................15|
|2.1 Frontend Provider Architecture....................................................................................................................15|
|2.2 Current vs Future State Architecture............................................................................................................15|
|2.3 Governance Architecture.............................................................................................................................. 15|
|2.4 Identity & Security Architecture...................................................................................................................15|
|Phase 1A: Admin Portal Specification...................................................................................................................16|
|Overview.............................................................................................................................................................16|



Page 2 

EduDash – School ERP Management System 

|1. Governance & Departments Module..............................................................................................................16|
|---|
|2. System Administration Module......................................................................................................................17|
|3. Student Management......................................................................................................................................18|
|4. Teacher Management & Directory.................................................................................................................20|
|5. Employee Directory........................................................................................................................................21|
|6. Institutional Planning......................................................................................................................................22|
|7. Class & Subject Management.........................................................................................................................23|
|8. Timetable Management..................................................................................................................................24|
|9. Workload Analytics........................................................................................................................................ 25|
|10. Attendance Management (Overview)...........................................................................................................26|
|11. Leave Management System..........................................................................................................................28|
|12. Question Paper Management........................................................................................................................29|
|13. Examinations & Results...............................................................................................................................30|
|14. Fee Management & Transport Management................................................................................................31|
|15. Communication Center & Notices................................................................................................................32|
|16. Support Center..............................................................................................................................................33|
|17. Clubs & Committees.....................................................................................................................................34|
|18. Reports & Analytics.....................................................................................................................................36|
|Phase 1B: Teacher Portal Specification..................................................................................................................37|
|Overview.............................................................................................................................................................37|
|1. Academic Attendance Execution....................................................................................................................37|
|2. Assignment Distribution & Grading...............................................................................................................38|
|3. Question Paper Drafting.................................................................................................................................39|
|4. Results & Marks Entry...................................................................................................................................41|
|5. Teacher Leave Requests................................................................................................................................. 42|
|6. Timetable Viewer........................................................................................................................................... 43|
|7. Notices Viewer............................................................................................................................................... 44|
|8. Club Coordination (Limited).......................................................................................................................... 45|
|9. Student Mentorship & Wellbeing...................................................................................................................46|
|10. Student Performance Tracking.....................................................................................................................47|
|11. Student Duty Management...........................................................................................................................49|
|12. Reports & Analytics (Teacher Level)...........................................................................................................50|
|Phase 1C: Student Portal Specification...................................................................................................................51|
|Overview.............................................................................................................................................................51|
|1. Homework & Assignment Submission...........................................................................................................51|
|2. Student Leave Requests..................................................................................................................................52|
|3. Student Duty Board........................................................................................................................................54|
|4. Student Notices Viewer.................................................................................................................................. 55|
|5. Profile & Financial Ledger............................................................................................................................. 56|
|6. Examinations & Results Viewer.....................................................................................................................57|
|7. Timetable Viewer........................................................................................................................................... 58|
|8. Extracurricular Tracking (Clubs & Achievements)........................................................................................59|



Page 3 

EduDash – School ERP Management System 

|9. Support Center................................................................................................................................................60|
|---|
|Phase 1D: Parent Portal Specification....................................................................................................................61|
|Overview.............................................................................................................................................................61|
|1. Child Duty & Leave Monitor.........................................................................................................................62|
|2. Parent Notices Viewer.................................................................................................................................... 63|
|3. Child Financial Ledger & Profile...................................................................................................................64|
|4. Child Examinations & Results Viewer...........................................................................................................65|
|5. Child Timetable Viewer.................................................................................................................................66|
|6. Child Extracurricular Tracking.......................................................................................................................67|
|7. Support Center................................................................................................................................................69|
|Phase 1: Portal Codebase Validation Audit............................................................................................................70|
|Overview.............................................................................................................................................................70|
|1. Admin Portal Validation.................................................................................................................................70|
|2. Teacher Portal Validation............................................................................................................................... 71|
|3. Corrective Actions Required Before Proceeding............................................................................................72|
|Phase 1: Portal Crosscheck Matrix.........................................................................................................................73|
|Overview.............................................................................................................................................................73|
|1. Governance & Configuration Capabilities......................................................................................................73|
|2. Academic Execution Capabilities...................................................................................................................73|
|3. Operations & Logistics Capabilities............................................................................................................... 73|
|4. Analytical Capabilities....................................................................................................................................74|
|5. Architectural Findings & Validation Rules....................................................................................................74|
|Phase 2: Governance System Specification............................................................................................................74|
|Overview.............................................................................................................................................................74|
|1. Identity Separation Model..............................................................................................................................75|
|2. Core Base Identities........................................................................................................................................75|
|3. Department & Hierarchy Engine....................................................................................................................76|
|4. Effective Access Engine.................................................................................................................................76|
|5. Core Governance Principles...........................................................................................................................77|
|Phase 3: Functional Requirements (FR).................................................................................................................77|
|Overview.............................................................................................................................................................77|
|1. Identity & Governance (FR-GOV).................................................................................................................77|
|2. Student Management (FR-STU).....................................................................................................................78|
|3. Teacher Management (FR-TCH)....................................................................................................................78|
|4. Parent Management (FR-PAR).......................................................................................................................78|
|5. Academic Logistics (FR-ACA)...................................................................................................................... 79|
|6. Attendance Management (FR-ATT)...............................................................................................................79|
|7. Assignments & Homework (FR-HWK)......................................................................................................... 79|
|8. Examinations & Results (FR-EXM)...............................................................................................................79|
|9. Leave Management (FR-LVM)......................................................................................................................80|
|10. Institutional Communication (FR-COM).....................................................................................................80|
|11. Support Center (FR-SUP).............................................................................................................................80|



Page 4 

EduDash – School ERP Management System 

|12. Fee Management (FR-FEE)..........................................................................................................................81|
|---|
|13. Transport Management (FR-TRN)...............................................................................................................81|
|14. Document Center (FR-DOC)........................................................................................................................81|
|15. Analytics & Reporting (FR-ANL)................................................................................................................81|
|16. Extracurriculars & Duties (FR-EXT)...........................................................................................................81|
|17. Planned / Future Requirements (FR-FUTURE)...........................................................................................82|
|Phase 4: Use Cases (UC)........................................................................................................................................ 82|
|Overview.............................................................................................................................................................82|
|1. Governance & Access.....................................................................................................................................82|
|2. Maker-Checker Workflows............................................................................................................................82|
|3. Academic Execution.......................................................................................................................................83|
|4. Institutional Operations...................................................................................................................................84|
|Phase 5: Business Rules (BR).................................................................................................................................84|
|Overview.............................................................................................................................................................84|
|1. Governance & Identity Rules.........................................................................................................................85|
|2. Academic & Scheduling Constraints..............................................................................................................85|
|3. Operations & Logistics................................................................................................................................... 85|
|4. Academic Evaluation Rules............................................................................................................................86|
|5. System Communications & Support..............................................................................................................86|
|Phase 6: Data Model Specification.........................................................................................................................86|
|Overview.............................................................................................................................................................86|
|Part A: Core Identity & Governance Domain....................................................................................................86|
|Part B: Consumer Identity Domain....................................................................................................................87|
|Part C: Academic Execution Domain.................................................................................................................88|
|Part D: Operations & Logistics Domain.............................................................................................................89|
|Part E: Financial & Transport Domain...............................................................................................................90|
|Part F: Extracurricular Domain..........................................................................................................................91|
|Phase 7: Security & Non-Functional Requirements (NFR)...................................................................................91|
|Overview.............................................................................................................................................................91|
|1. Security Architecture...................................................................................................................................... 91|
|2. Non-Functional Requirements (NFR)............................................................................................................92|
|Phase 8: API Readiness & Backend Migration......................................................................................................93|
|Overview.............................................................................................................................................................93|
|1. The Service Layer Abstraction.......................................................................................................................93|
|2. Global API Contracts......................................................................................................................................93|
|3. RESTful Resource Mapping...........................................................................................................................94|
|4. Phased Backend Migration Strategy...............................................................................................................94|
|Phase 9: Requirements Traceability Matrix (RTM)...............................................................................................95|
|Overview.............................................................................................................................................................95|
|1. Governance & Identity Traceability...............................................................................................................96|
|2. Academic Execution Traceability...................................................................................................................96|
|3. Operations & Logistics Traceability...............................................................................................................96|



Page 5 

EduDash – School ERP Management System 

4. Planned Architecture (Future State)...............................................................................................................97 

Page 6 

EduDash – School ERP Management System 

## Software Requirements Specification (SRS) 

### Project: EduDash - School ERP Management System 

**Prepared By:** Ashish Singh **Status:** FINAL - APPROVED ARCHITECTURE 

## Developer System Architecture Guide 

### Section A – Repository Overview 

#### 1. Repository Purpose 

The EduDash repository is the comprehensive frontend codebase for a multi-tenant School ERP (Enterprise Resource Planning) platform. It provides role-based portals for Students, Parents, Teachers, and Administrators to manage academic execution, logistics, communication, and governance. 

#### 2. Development Philosophy 

- **Frontend-First Architecture:** The entire business logic, validation, and governance rule engine is currently built into the frontend layer. 

- **Backend-Ready Strategy:** While currently operating against a local persistent mock store (`localStorage`), the architecture employs strict `Service -> Provider` boundaries. This ensures that swapping to a live REST API backend requires zero changes to the UI components or the Service orchestrators. 

- **Role-Based Isolation:** Portals are strictly separated by role at the routing and layout levels, ensuring no cross-contamination of permissions. 

#### 3. High-Level Architecture 

EduDash employs a 6-tier architecture: 

- **Routing & Guards:** React Router + `ProtectedRoute` + `AdminRouteGuard` 

- **Contexts:** Global React state (Auth, Theme, Language) 

- **Pages & Components:** Presentation logic and React hooks 

- **Service Layer:** Business logic, DTO mapping, and error handling 

- **Provider Layer:** Data fetching abstraction (`providerFactory`) 

- **Persistence:** The actual data store (currently `localProvider` + `localStorage`) 

### Section B – Technology Stack 

_Derived from `package.json` and `vite.config.js`:_ 

- **Framework:** React 18.2.0 (DOM) 

- **Routing:** React Router v7.15.1 

Page 7 

EduDash – School ERP Management System 

- **State Management:** Native React Context API 

- **Styling:** Tailwind CSS v3.4.1 (with `autoprefixer` and `postcss`) 

- **Charts:** Recharts v3.8.1 

- **Animations:** Framer Motion v11.0.0 

- **Rich Text Editor:** Lexical v0.45.0 (React wrapper) 

- **Icons:** Lucide React v0.344.0 

- **OCR:** Tesseract.js v7.0.0 

- **Build Tools:** Vite v5.1.4 

- **Testing:** Vitest v1.3.1, Testing Library (React/DOM/UserEvent) 

- **Linting:** ESLint v8.56.0 

### Section C – Repository Structure 

##### **Responsibilities:** 

- `pages/` maps 1:1 with URLs. 

- `services/` contains all the "verbs" of the system (e.g., `getAttendance`, `submitLeave`). 

- `data/providers/` dictates _how_ data is fetched. 

- `layouts/` dictates the Sidebar and Header wrapper for a specific role. 

### Section D – Layered Architecture 

EduDash enforces a strict uni-directional dependency flow. 

- **Page (`src/pages`):** - Extracts URL parameters and Context state. - Calls the `Service` layer (often via the `useService` hook) to fetch data. - Passes data down as props to Components. 

- **Component (`src/components`):** - Pure presentation. - Triggers callbacks on user interaction (e.g., `onClick={() => handleSubmit()}`). 

- **Service (`src/services`):** - Implements business rules (e.g., "Cannot approve own document"). - Maps inputs to Data Transfer Objects (DTOs). - Calls the configured Provider via `getDataProvider()`. 

- **Provider (`src/data/providers/providerFactory`):** - Determines runtime target (Local vs API). - Enforces the `DataProviderInterface` contract. 

- **Persistence (`src/data/providers/localProvider`):** - (Current Implementation) Executes CRUD operations against simulated memory/storage. 

- **Storage (`src/persistence/storage.js`):** - The lowest level JSON serializer/deserializer to browser `localStorage`. 

### Section E – Module Organization 

Every feature in EduDash is implemented as a Vertical Slice (a Module). Example: **Attendance Module** 

- **Page:** `src/pages/teacher/AttendanceMgmtPage.jsx`, `src/pages/admin/AttendanceOverviewPage.jsx` 

- **Service:** `src/services/attendanceService.js`, `src/services/attendanceGovernanceService.js` 

- **Provider:** Managed by `localProvider` (e.g., `getAttendanceRecords`) 

- **Context:** None (relies purely on `AuthContext` for identity) 

Page 8 

EduDash – School ERP Management System 

- **Storage:** Persisted under `STORAGE_KEYS.ATTENDANCE` 

- **Dependencies:** Relies on `studentService.js` to map student IDs to names. 

This strict separation guarantees that altering the Attendance logic does not accidentally break Assignment logic. 

### Section F – Routing Architecture 

_(Current Implementation)_ 

EduDash utilizes `react-router-dom` in a nested layout structure, defined inside `src/App.jsx`. 

##### **Public Routes:** 

- `/login` → Renders `LoginPage` 

**Protected Routes (`<ProtectedRoute>`):** Requires valid Auth Context. Wraps all role layouts. 

##### **Layout Routing:** 

- `/student/*` → Renders `StudentLayout` (Sidebar + Header) 

- `/teacher/*` → Renders `TeacherLayout` 

- `/parent/*` → Renders `ParentLayout` 

- `/admin/*` → Renders `AdminLayout` 

**Route Guards:** For the Admin portal, `<AdminRouteGuard>` protects sensitive URLs by invoking the Effective Access Service. If an admin attempts to access `/admin/system` without the exact `admin_system` permission string, the guard redirects them to an unauthorized fallback or the dashboard. 

### Section G – Authentication Flow 

_(Current Implementation)_ 

- **User Action:** User submits credentials via `LoginPage.jsx`. 

- **Component:** Calls `login(role, username, password)` exposed by `useAuth()`. 

- **Auth Context:** Clears stale sessions. Calls `authenticate()` in `authService.js`. 

- **Service:** Queries the `providerFactory` → `localProvider` to validate credentials against seeded user arrays (`AUTH_USERS`). 

- **Context Update:** If successful, `AuthContext` updates `user` and `isAuthenticated: true`. 

- **Persistence:** `AuthContext` syncs the session to `localStorage` under `STORAGE_KEYS.AUTH_STATE`. 

- **Routing:** `NavigateToDashboard` component detects the `role` and routes to `/[role]/dashboard`. 

### Section H – Authorization Flow (Effective Access) 

The **Effective Access Engine** (`effectiveAccessService.js`) dynamically computes permissions for the Admin portal. 

Page 9 

EduDash – School ERP Management System 

### Section I – State Management 

EduDash minimizes global state, preferring localized component state or React Router DOM state. However, the following global Contexts exist: 

- **AuthContext (`src/context/AuthContext.jsx`)** - **Owner:** Top-level App wrapper. - **Responsibilities:** Tracking logged-in user, role, and authentication status. - **Consumers:** `ProtectedRoute`, all Layouts, `Sidebar`, and Services needing user identity. 

- **StudentContext (`src/context/StudentContext.jsx`)** - **Owner:** Top-level wrapper for Parent/Student portals. - **Responsibilities:** For Parents, tracks _which_ child is currently selected in the top-right switcher. - **Consumers:** `HomePage`, `AttendanceCard`, `FeeCard` (forces re-renders when active child switches). 

- **LanguageContext (`src/context/LanguageContext.jsx`)** - **Owner:** Top-level App wrapper. - **Responsibilities:** Provides `t()` translation function and current locale. 

### Section J – Runtime Data Flow (Example: Assignments) 

##### **Lifecycle of fetching assignments:** 

- **User Action:** Teacher navigates to `/teacher/assignments`. 

- **Component:** `AssignmentsManagementPage.jsx` mounts. 

- **Hook:** Calls `useService(assignmentService.getAssignmentsByTeacher, authUser.id)`. 

- **Service:** `assignmentService.js` constructs the query, logs the request, and asks `providerFactory.getDataProvider()`. 

- **Provider:** `providerFactory` routes to `localProvider`. 

- **Persistence:** `localProvider` reads `STORAGE_KEYS.ASSIGNMENTS` from `localStorage`, parses JSON, filters by `teacherId`, and returns the array. 

- **Service:** Sorts results by due date and returns the DTO array. 

- **Component:** `useService` hook flips `loading` to `false` and sets `data`. 

- **React Render:** `AssignmentsManagementPage` renders the table of assignments. 

### Section K – Service Layer Standards 

##### _(Current Implementation)_ 

All services in `src/services/` adhere to strict standards: 

- **Naming Convention:** Files are named `[domain]Service.js` (e.g., `financeService.js`). 

- **Provider Fetching:** Never import `localStorage` directly. Always use `import { getDataProvider } from "../data/providers/providerFactory";`. 

- **CRUD Pattern:** - `create[Entity](data)` - `get[Entity](filters)` - `update[Entity](id, data)` - `delete[Entity](id)` 

- **Error Handling:** Services `throw new Error("Reason")`. They do not show Toasts. 

- **Responsibilities:** Transforming UI states into storage payloads, calculating averages, enforcing business rules. 

### Section L – Provider Layer 

Page 10 

EduDash – School ERP Management System 

The core abstraction enabling Future API Migration. 

- **`providerFactory.js`** : Reads a configuration variable (e.g., `window.DATA_PROVIDER`) and returns either `localProvider` or `apiProvider`. 

- **`localProvider.js`** : Implements all `DataProviderInterface` methods using browser `localStorage` and synchronous JS filtering. 

- **`apiProvider.js`** : _(Planned Architecture)_ Will implement the exact same `DataProviderInterface` methods using `fetch()` or `axios` against the REST backend. 

**Selection Flow:** Services call `providerFactory.getDataProvider()`. The Service has absolutely no idea if the data came from memory, localStorage, or an AWS database. 

### Section M – Persistence Layer 

_(Current Implementation)_ 

- **Storage Wrapper:** `src/persistence/storage.js` provides `getItem(key)` and `setItem(key, value)` with `try/catch` JSON parsing to prevent corruption. 

- **Keys:** `src/persistence/storageKeys.js` centralizes all string keys (e.g., `STORAGE_KEYS.STUDENTS = 'edudash_students'`). 

- **Seed Loading:** `seedInitializer.js` fires on first app boot. If `STORAGE_KEYS.STUDENTS` is null, it hydrates the local storage with mock data from `src/data/mock/`. 

### Section N – DTO & Contract Standards 

Services return predictable Data Transfer Objects. _(Extracted from `leaveService.js` and `attendanceService.js` expectations)_ 

##### **Student DTO:** 

##### **Attendance DTO:** 

Do not alter these DTO shapes in the backend API without also modifying the Frontend Service mapping layer. 

### Section O – Error Handling 

- **Provider Errors:** Throws standard JS `Error` objects if network fails or local storage quota is exceeded. 

- **Service Errors:** Catches Provider errors, applies business logic ("Cannot delete published exam"), and throws user-friendly `Error` strings. 

- **UI Handling:** Components use `try/catch`. 

- **User Notifications:** On catch, the Component triggers a Toast notification (e.g., `<Toast type="error" message={err.message} />`) or renders an inline error boundary. 

### Section P – Module Lifecycle (Example: Question Paper) 

- **Drafting:** Teacher creates Question Paper (`status: 'DRAFT'`). 

- **Submission:** Teacher clicks Submit. Service updates `status: 'PENDING_APPROVAL'`. 

Page 11 

EduDash – School ERP Management System 

- **Review:** Department Head (Governance) reviews document. 

- **Approval/Rejection:** Head clicks Approve. Service updates `status: 'APPROVED'`. 

- **Publishing:** Head clicks Publish. Service sets `isPublished: true`. 

- **Visibility:** Only upon publishing does the Question Paper become visible to Student endpoints. 

### Section Q – Cross Module Dependencies 

Modules are loosely coupled but interact via data IDs. 

- **Leave → Attendance:** Approved Leave requests logically exempt students from Attendance penalties in the `dashboardAggregationService`. 

- **Department → Permissions:** Department Head assignments dictate Governance routing in `effectiveAccessService`. 

- **Exams → Results:** Exam schedules unlock the rendering of Result entry forms in the Teacher portal. 

### Section R – Implementation Status 

_(Reverse-Engineered from `src/pages` and `src/services`)_ 

|**Module**|**Status**|**Notes**|
|---|---|---|
|**Authentication**|Implemented|Local Provider Mock Auth|
|**Attendance**|Implemented|Full CRUD, Teacher & Admin|
|**Assignments**|Implemented|Teacher Creation, Student View|
|**Timetable**|Implemented|Read-only matrix views|
|**Leave Management**|Implemented|Student/Teacher Apply, Admin Approve|
|**Notices & Events**|Implemented|Admin Create, Global View|
|**Question Papers**|Implemented|Maker-Checker Governance Flow|
|**Departments**|Implemented|Core Governance Structure|
|**Student Duties**|Implemented|Full CRUD|
|**Fees**|Partial|Dashboard UI present; missing payment gateway|
|**Transport**|Partial|Admin UI shells present|



### Section S – Development Guidelines 

##### **How to add a new Module (e.g., "Library"):** 

- **Storage:** Add `LIBRARY_RECORDS = 'edudash_library'` to `storageKeys.js`. 

- **Provider:** Add `getLibraryRecords()` and `addLibraryRecord()` to `localProvider.js`. 

Page 12 

EduDash – School ERP Management System 

- **Service:** Create `libraryService.js`. Import `getDataProvider()`. Write business logic wrapper functions. 

- **Component:** Build UI in `src/pages/admin/LibraryPage.jsx`. 

- **Route:** Add `<Route path="library" element={<LibraryPage />} />` in `App.jsx`. 

- **Sidebar:** Add Library icon and path to `ROLE_NAVIGATION` in `auth/navigation.js`. 

- **Permissions:** If sensitive, add module UUID to `adminModuleCatalog.js` for Effective Access. 

### Section T – Backend Migration Guide 

When the live FastAPI/Node.js backend is ready: 

- **What changes:** - In `providerFactory.js`, change `currentProviderType = PROVIDER_TYPES.API`. - Implement the `DataProviderInterface` inside `apiProvider.js` using `fetch()` endpoints instead of `localStorage`. - Implement JWT extraction and Bearer token attachment in `apiProvider.js`. 

- **What remains unchanged:** - **ZERO** changes to `src/pages/`. - **ZERO** changes to `src/components/`. - **ZERO** changes to `src/services/` (assuming backend returns the exact agreed-upon DTOs). - **ZERO** changes to `App.jsx` routing. 

This architecture guarantees that the frontend investment is fully protected during backend development. 

Page 13 

EduDash – School ERP Management System 

## 1. Core System Specification 

### 1.1 Introduction 

The purpose of this Software Requirements Specification (SRS) is to comprehensively document the EduDash School ERP Management System. This specification provides a complete decomposition of the functional requirements, use cases, business rules, and technical architecture of the system. This document is intended for academic reviewers, system administrators, and software engineering teams tasked with maintaining or expanding the EduDash platform. 

### 1.2 Scope 

EduDash is a highly specialized, role-based educational resource planning web application. The primary objective of the system is to centralize and automate the day-to-day operations of an academic institution. It provides strict, isolated portals for four major user identities: Administrators, Teachers, Students, and Parents. The system encompasses academic execution, structural HR governance, financial monitoring, and parentstudent interaction. 

### 1.3 Product Perspective 

EduDash currently operates on a **Frontend-First Architecture** . Rather than relying on a live remote server for its initial MVP iterations, the system utilizes a robust Service and Provider layer that persists data locally. This design ensures immediate testability and decouples the UI from backend constraints, preparing the system for a seamless transition to a live API backend in the future. 

### 1.4 Product Functions 

At a high level, the system provides the following major modules: 

- Student Management 

- Teacher Management 

- Parent Management 

- Department Governance 

- Attendance 

- Assignments 

- Timetable 

- Examinations 

- Results 

- Leave Management 

- Fee Management & Ledger Tracking (Digital Fee Processing is a Planned Future Enhancement) 

- Transport Management 

- Communication Center 

- Document Center 

- Support Center 

- Clubs & Committees 

- Analytics & Reporting 

- System Administration 

Page 14 

EduDash – School ERP Management System 

### 1.5 User Classes 

The system recognizes primary physical actors alongside specialized governance roles: 

- **Super Admin:** The root-level technical integration account overriding all standard RBAC boundaries. 

- **Admin (Staff):** The institutional governance role responsible for HR, fees, and operations. 

- **Department Head:** A governance actor leading a department, granted module-ownership and approval capabilities over subordinate members. 

- **Department Member:** Standard staff operating within a department under a Head. 

- **Teacher:** The academic execution role responsible for delivering education, marking attendance, and grading. 

- **Student:** The academic consumer role. Consumes homework, attends classes, and tracks performance. 

- **Parent:** The observer role. A read-only account physically linked to one or more Student entities. 

### 1.6 Operating Environment 

- **Client Application:** Modern Web Browsers (Chrome 90+, Firefox 88+, Safari 14+) running a responsive React 18+ (Vite) Single Page Application (SPA). 

- **Current Persistence:** Client-side storage (`localStorage`) via mock providers. 

- **Future Persistence:** Relational database or NoSQL remote document store. 

### 1.7 Assumptions 

- All users possess basic digital literacy to navigate standard web application interfaces. 

- Parent accounts are meaningless without a hard-linked active Student account in the database. 

### 1.8 Dependencies 

- **React Context API:** The frontend strictly relies on the Context API for state propagation. 

- **Provider Interfaces:** UI components depend entirely on abstract Service layers rather than direct persistence calls. 

Page 15 

EduDash – School ERP Management System 

## 2. System Architecture 

### 2.1 Frontend Provider Architecture 

EduDash enforces a strict separation of concerns to allow backend hot-swapping. The application architecture flows linearly: 

### 2.2 Current vs Future State Architecture 

#### Current State 

- **Framework:** React + Vite 

- **State Management:** Context API 

- **Provider:** `localProvider.js` 

- **Persistence:** Browser `localStorage` 

#### Future State 

- **Framework:** React 

- **State Management:** Context API 

- **Provider:** `apiProvider.js` 

- **Backend:** FastAPI / Node.js API 

- **Persistence:** Relational Database (e.g., PostgreSQL) 

### 2.3 Governance Architecture 

EduDash separates purely academic concerns (Classes, Subjects) from structural HR concerns (Departments, Employees). Department Heads exist exclusively within the governance layer. **A teacher only becomes a governance participant if an overlapping Admin identity is explicitly provisioned.** 

The Effective Access engine evaluates user permissions linearly through the following governance flow: 

### 2.4 Identity & Security Architecture 

- **Authentication:** Currently resolved locally by the Provider layer (Mock Auth). Future migrations will rely on secure authenticated session credentials. 

- **Maker-Checker:** A user who drafts a sensitive document (e.g., a Teacher drafting a Question Paper) is explicitly denied the permission to approve their own document. It must be routed to the Governance layer. 

- **Client-Side RBAC:** Standard Admins are physically blocked from rendering sensitive modules (like System Administration) unless the Super Admin has explicitly granted their specific UUID override access. Route protection is enforced via `ProtectedRoute.jsx` and `AdminRouteGuard.jsx`. 

Page 16 

EduDash – School ERP Management System 

## Phase 1A: Admin Portal Specification 

### Overview 

The Admin Portal is the central execution hub for all institutional governance, academic planning, and logistical operations. It provides structural oversight and configuration for the entire ERP system based on the Effective Access and Department Ownership engine. 

### 1. Governance & Departments Module 

#### Purpose 

To orchestrate the institutional hierarchy by formally organizing staff into structured Departments and assigning leadership roles (Department Heads) that execute module-ownership capabilities. 

#### Governance Ownership 

- **Owned By:** Human Resources / Governance 

- **Approval Authority:** Super Admin 

- **Execution Authority:** HR Admin Staff 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** None. 

#### Actors 

- **Super Admin:** System-level overrides. 

- **Admin (Staff):** Standard operator creating the departments. 

#### Preconditions 

- The target employee must already have an active User account within the `Users` registry with an Admin/Staff base identity. 

#### Workflow 

- Admin navigates to the Department Management view. 

- Admin initiates the creation of a new Department (e.g., "HR Department"). 

- Admin selects a `Department Head` strictly from the active **Staff** directory. 

- Admin assigns `Department Members` (Staff) to the department. 

- The system commits the structural hierarchy. 

#### Inputs 

- Department Name, Department Code, Head UUID, Array of Member UUIDs. 

Page 17 

EduDash – School ERP Management System 

#### Outputs 

- An active Department entity that establishes governance rule propagation. 

#### Business Rules 

- A department must have exactly one active Head. 

- Academic Teachers cannot be assigned as a Department Head unless explicitly provisioned with an overlapping Admin/Staff governance identity. 

#### Access Rules 

- **View:** All Admins. 

- **Edit/Create:** Super Admin, or Admins with explicitly granted overrides. 

#### Screen Description 

- **`ManageDepartmentsPage.jsx`** : A data grid displaying all active departments with a modal for assigning Heads and Members. 

#### Future API Notes 

- `POST /api/v1/departments`: Strict validation required to ensure the Head UUID belongs to a valid Admin/Staff account. 

### 2. System Administration Module 

#### Purpose 

To define global security boundaries and grant explicit module overrides to specific Administrative accounts utilizing the Effective Access engine. 

#### Governance Ownership 

- **Owned By:** System Operations 

- **Approval Authority:** Super Admin 

- **Execution Authority:** Super Admin 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Automated logging of override grants. 

#### Actors 

- **Super Admin:** Exclusive access. 

Preconditions 

Page 18 

EduDash – School ERP Management System 

- The actor must be logged in with the immutable `SUPER_ADMIN` flag. 

#### Workflow 

- Super Admin navigates to the System Administration view. 

- The view displays a matrix of all Admin accounts against all available modules. 

- Super Admin toggles specific module overrides (e.g., granting access to "Leave Management"). 

- Changes are saved, updating the target's Effective Access profile. 

#### Inputs 

- Target User UUID, Module Identifier, Access Boolean (Grant/Deny). 

#### Outputs 

- Updated `Effective Access` resolution for the target user. 

#### Business Rules 

- Critical modules cannot be accessed by standard Admins without a Super Admin overriding the base scope. 

- Overrides bypass standard department-level ownership limits. 

#### Access Rules 

- **View/Edit:** Strictly `SUPER_ADMIN`. Blocked via `AdminRouteGuard.jsx` for all standard Admins. 

#### Screen Description 

- **`SystemAdministrationPage.jsx`** : A high-density permissions matrix. Rows represent Admin accounts; columns represent sensitive modules. 

#### Future API Notes 

- `PUT /api/v1/overrides/{userId}`: Strict token validation to ensure caller is `SUPER_ADMIN`. 

### 3. Student Management 

#### Purpose 

To maintain the definitive registry of all enrolled students, manage their demographic data, and handle their class cohort assignments. 

#### Governance Ownership 

- **Owned By:** Admissions / Registrar 

- **Approval Authority:** Registrar Head 

- **Execution Authority:** Admissions Admins 

Page 19 

EduDash – School ERP Management System 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED (Registry maintenance) 

- **Planned Enhancements:** PLANNED (Automatic student credential/portal provisioning via Phase 12.2 architecture). 

#### Actors 

- **Admin (Registrar):** Manages student records. 

#### Preconditions 

- Classes must exist to allow assignment. 

#### Workflow 

- Admin inputs the demographic data of a new student. 

- System generates a unique Student ID. 

- Admin assigns the student to an active academic Class. 

- Current State: Student record is created independently. 

#### Inputs 

- Student Name, DOB, Contact Info, Parent linkage (UUID), Assigned Class. 

#### Outputs 

- An active Student profile in the database. 

#### Business Rules 

- A student must belong to exactly one active Class cohort for a given academic term. 

#### Access Rules 

- **View:** All Admins. 

- **Edit:** Admissions Admins. 

#### Screen Description 

- **`StudentsPage.jsx`** : A master-detail view grid of all students showing academic history and parent linkages. 

#### Future API Notes 

- Future state API will trigger a Firebase Auth creation webhook simultaneously with the record creation. 

Page 20 

EduDash – School ERP Management System 

### 4. Teacher Management & Directory 

#### Purpose 

To view and manage the academic staff of the institution, separate from non-academic governance employees. 

#### Governance Ownership 

- **Owned By:** Academic Administration 

- **Approval Authority:** Principal / Academic Head 

- **Execution Authority:** Academic Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED (Directory maintenance) 

- **Planned Enhancements:** PLANNED (Automatic Teacher portal provisioning via Phase 12.2 architecture). 

#### Actors 

- **Admin:** Manages teacher records. 

#### Preconditions 

- None. 

#### Workflow 

- Admin enters teacher credentials and subject specializations. 

- Admin assigns the teacher to specific Subjects and Classes. 

- Current State: Teacher record is updated independently. 

#### Inputs 

- Teacher Name, Qualifications, Specializations, Employment Status. 

#### Outputs 

- An active Teacher profile. 

#### Business Rules 

- Teachers are purely academic execution actors and do not participate in HR governance workflows unless explicitly granted dual identities. 

#### Access Rules 

- **View:** All Admins. 

- **Edit:** Academic Admins. 

Page 21 

EduDash – School ERP Management System 

#### Screen Description 

- **`TeachersPage.jsx`** : A directory grid displaying teachers and their subject specializations. 

#### Future API Notes 

- Will require sync with identity provisioning endpoints in the future. 

### 5. Employee Directory 

#### Purpose 

To maintain the registry of all non-academic staff members who execute the day-to-day governance of the institution. 

#### Governance Ownership 

- **Owned By:** Human Resources 

- **Approval Authority:** HR Head 

- **Execution Authority:** HR Staff 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Automated offboarding workflows. 

#### Actors 

- **Admin (HR Staff):** Manages employee records. 

#### Preconditions 

- None. 

#### Workflow 

- HR Admin enters staff credentials. 

- System logs the staff member into the Employee repository. 

#### Inputs 

- Staff Name, Role, Contact details. 

#### Outputs 

- Active Staff profile ready for Department assignment. 

Business Rules 

Page 22 

EduDash – School ERP Management System 

- Staff profiles are distinct from Teacher profiles and form the basis of the Governance architecture. 

#### Access Rules 

- **Edit:** HR Admins. 

#### Screen Description 

- **`EmployeesPage.jsx`** : Data table of all governance actors. 

#### Future API Notes 

- CRUD endpoints for staff records. 

### 6. Institutional Planning 

#### Purpose 

To define the global academic calendar, high-level institutional milestones, and term boundaries. 

#### Governance Ownership 

- **Owned By:** Executive Administration 

- **Approval Authority:** Super Admin / Principal 

- **Execution Authority:** Executive Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Integration with automated Timetable constraint checking. 

#### Actors 

- **Admin:** Defines terms. 

#### Preconditions 

- System initialization. 

#### Workflow 

- Admin defines the start and end dates of Academic Terms. 

- Admin adds institutional holidays. 

#### Inputs 

- Term Dates, Holiday Dates. 

Page 23 

EduDash – School ERP Management System 

#### Outputs 

- Global Academic Calendar. 

#### Business Rules 

- Timetables and Exams cannot be scheduled outside of active Term boundaries. 

#### Access Rules 

- **Edit:** Executive Admins. 

#### Screen Description 

- **`InstitutionalPlanningPage.jsx`** : Calendar interface with term boundary configuration toggles. 

#### Future API Notes 

- `GET /api/v1/planning/calendar`: High-cache endpoint used by all other modules to validate dates. 

### 7. Class & Subject Management 

#### Purpose 

To define the baseline of the academic year by creating class cohorts and the subjects taught within them. 

#### Governance Ownership 

- **Owned By:** Academic Administration 

- **Approval Authority:** Academic Head 

- **Execution Authority:** Academic Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** None. 

#### Actors 

- **Admin:** Configures the academic structure. 

#### Preconditions 

- The academic term must be defined in Institutional Planning. 

#### Workflow 

- Admin creates a new Class. 

Page 24 

EduDash – School ERP Management System 

- Admin assigns a predefined list of Subjects to the Class. 

- Admin associates specific Teachers to teach those Subjects. 

#### Inputs 

- Class Name, Capacity, Array of Subjects, Assigned Teachers. 

#### Outputs 

- Core academic relational mapping. 

#### Business Rules 

- A class must have an active syllabus mapping before Timetable generation. 

#### Access Rules 

- **Edit:** Academic Admins. 

#### Screen Description 

- **`ClassesPage.jsx` / `SubjectsPage.jsx`** : Configuration panels for assignment of subjects and teachers. 

#### Future API Notes 

- Deleting a Subject must cascade constraints or gracefully fail if Timetables depend on it. 

### 8. Timetable Management 

#### Purpose 

To serve as the relational scheduling engine preventing conflicts and ensuring capacity limits. 

#### Governance Ownership 

- **Owned By:** Academic Administration 

- **Approval Authority:** Academic Head 

- **Execution Authority:** Academic Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** AI-assisted auto-generation. 

#### Actors 

- **Admin:** Manages schedules. 

Page 25 

EduDash – School ERP Management System 

#### Preconditions 

- Classes, Subjects, and Teachers must be mapped. 

#### Workflow 

- Admin selects a Class and a Day. 

- Admin assigns a Subject/Teacher to a Time Slot. 

- System validates constraints and commits. 

#### Inputs 

- Class UUID, Teacher UUID, Subject UUID, Day, Time Slot ID. 

#### Outputs 

- Locked Timetable Grid. 

#### Business Rules 

- Teacher cannot be double-booked across different classes at the exact same Time Slot. 

- Subject allocation must remain valid. 

#### Access Rules 

- **Edit:** Academic Admins. 

#### Screen Description 

- **`TimetablePage.jsx`** : Interactive 2D grid representing Days and Periods. 

#### Future API Notes 

- Requires a conflict-validation engine on the backend. 

### 9. Workload Analytics 

#### Purpose 

To monitor and balance the physical instructional hours assigned to Teachers. 

#### Governance Ownership 

- **Owned By:** Academic Administration 

- **Approval Authority:** Academic Head 

- **Execution Authority:** Academic Admins 

Page 26 

EduDash – School ERP Management System 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Predictive burnout warnings. 

#### Actors 

- **Admin:** Reviews loads. 

#### Preconditions 

- Timetables must be populated. 

#### Workflow 

- Admin views the workload dashboard. 

- System aggregates total assigned periods per teacher. 

#### Inputs 

- Teacher UUID. 

#### Outputs 

- Total weekly hours / periods assigned. 

#### Business Rules 

- Highlights teachers exceeding institutional maximum workload thresholds. 

#### Access Rules 

- **View:** Academic Admins. 

#### Screen Description 

- **`WorkloadAnalyticsPage.jsx`** : Bar charts and aggregated lists showing teacher allocations. 

#### Future API Notes 

- Derived entirely from complex Timetable SQL/NoSQL aggregations. 

### 10. Attendance Management (Overview) 

#### Purpose 

To provide global institutional monitoring of daily attendance across all classes. 

Page 27 

EduDash – School ERP Management System 

Governance Ownership 

- **Owned By:** Operations 

- **Approval Authority:** Operations Head 

- **Execution Authority:** Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Automated SMS dispatch to parents for absentees. 

#### Actors 

- **Admin:** Audits logs. 

#### Preconditions 

- Teachers submit daily logs. 

#### Workflow 

- Admin filters aggregated dashboard by Date. 

- Admin manually overrides a status if a dispute occurs. 

#### Inputs 

- Student UUID, Target Date, New Status. 

#### Outputs 

- Audited attendance record. 

#### Business Rules 

- Admin overrides take permanent precedence over Teacher submissions. 

#### Access Rules 

- **Edit Override:** Admins with Attendance Effective Access. 

#### Screen Description 

- **`AttendanceOverviewPage.jsx`** : Statistical dashboard and drill-down lists. 

#### Future API Notes 

- Fast-read aggregation endpoints required. 

Page 28 

EduDash – School ERP Management System 

### 11. Leave Management System 

#### Purpose 

To review, track, and approve formal absence requests from Teachers and Students. 

#### Governance Ownership 

- **Owned By:** Human Resources / Operations 

- **Approval Authority:** Department Head (for members) / HR Head 

- **Execution Authority:** Department Heads / HR Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Integration with payroll processing. 

#### Actors 

- **Admin / Dept Head:** Approves/Rejects requests. 

#### Preconditions 

- A request exists in the queue. 

#### Workflow 

- Approver views queue. 

- Approver reviews attached proofs and dates. 

- Approver clicks Approve or Reject. 

#### Inputs 

- Leave Request UUID, Decision, Notes. 

#### Outputs 

- Finalized Leave State. 

#### Business Rules 

- Leaves extending beyond 3 days require explicit HR override. 

- Department Members' leaves are routed strictly to their assigned Department Head. 

#### Access Rules 

- **Edit:** Department Heads (for their domains) and authorized Admins. 

Page 29 

EduDash – School ERP Management System 

#### Screen Description 

- **`LeaveApprovalPage.jsx`** : Kanban-style queue with secure attachment viewing. 

#### Future API Notes 

- Medical proofs must use signed, expiring URLs. 

### 12. Question Paper Management 

#### Purpose 

To secure the integrity of summative assessments through a strict Maker-Checker model. 

#### Governance Ownership 

- **Owned By:** Academic Departments 

- **Approval Authority:** Academic Department Head 

- **Execution Authority:** Department Head / Academic Admin 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Integration with automated grading for objective questions. 

#### Actors 

- **Dept Head / Admin:** Reviews and locks the paper. 

#### Preconditions 

- A Teacher drafts a paper. 

#### Workflow 

- Head views Draft pool. 

- Head reviews questions. 

- Head marks paper as "Approved" (locked) or "Rejected". 

#### Inputs 

- Question Paper UUID, Decision. 

#### Outputs 

- Locked exam paper. 

Page 30 

EduDash – School ERP Management System 

#### Business Rules 

- Teachers cannot approve their own drafted papers under any circumstances. 

#### Access Rules 

- **Edit:** Academic Department Heads. 

#### Screen Description 

- **`QuestionPapersAdminPage.jsx`** : Review dashboard for exam contents. 

#### Future API Notes 

- State machine protection on the backend to enforce the Review phase. 

### 13. Examinations & Results 

#### Purpose 

To manage the lifecycle of an exam and publish student report cards. 

#### Governance Ownership 

- **Owned By:** Examinations Department 

- **Approval Authority:** Examinations Head 

- **Execution Authority:** Examination Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Dynamic PDF report card generation. 

#### Actors 

- **Admin:** Orchestrates timelines and publishes. 

#### Preconditions 

- Teachers submit marks. 

#### Workflow 

- Admin defines Exam Term. 

- Admin clicks "Publish Results" after grading completes. 

#### Inputs 

Page 31 

EduDash – School ERP Management System 

- Exam Term, Publish Boolean. 

#### Outputs 

- Visible Report Cards for Students/Parents. 

#### Business Rules 

- Results remain completely hidden from consumer portals until the "Publish" flag is explicitly set by Governance. 

#### Access Rules 

- **Publish:** Examination Admins. 

#### Screen Description 

- **`ExaminationsPage.jsx` / `ResultsPage.jsx`** : Control panel for grading windows and ledger review. 

#### Future API Notes 

- Bulk update endpoints required for the Publish action. 

### 14. Fee Management & Transport Management 

#### Purpose 

Logistical routing and financial tracking of student ledgers. 

#### Governance Ownership 

- **Owned By:** Finance / Logistics Departments 

- **Approval Authority:** Finance Head 

- **Execution Authority:** Finance/Logistics Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED (Ledger tracking and Route mapping) 

- **Planned Enhancements:** PLANNED (Digital Fee Processing Gateway checkout). 

#### Actors 

- **Admin:** Monitors balances and assigns routes. 

#### Preconditions 

- Students must be enrolled. 

Page 32 

EduDash – School ERP Management System 

#### Workflow 

- Admin defines Bus Routes. 

- Admin allocates Student to Route, triggering a Fee Ledger update. 

- Admin logs manual offline payments. 

#### Inputs 

- Route Definitions, Offline Payment Receipts. 

#### Outputs 

- Transport manifests and updated ledgers. 

#### Business Rules 

- Ledger transactions must be strictly audited and immutable once committed. 

#### Access Rules 

- **Edit:** Finance / Logistics Admins. 

#### Screen Description 

- **`FeeManagementPage.jsx` / `TransportManagementPage.jsx`** : Financial ledgers and route assignments. 

#### Future API Notes 

- Digital fee processing will utilize a webhook endpoint for gateway callbacks. 

### 15. Communication Center & Notices 

#### Purpose 

To broadcast targeted messages scoped by specific roles or cohorts. 

#### Governance Ownership 

- **Owned By:** Operations / Communications 

- **Approval Authority:** Operations Head 

- **Execution Authority:** Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Push notifications to mobile devices. 

Page 33 

EduDash – School ERP Management System 

#### Actors 

- **Admin:** Broadcaster. 

#### Preconditions 

- None. 

#### Workflow 

- Admin drafts Notice. 

- Admin selects Target Audience (e.g., "All Parents"). 

- System publishes. 

#### Inputs 

- Notice Payload, Audience Scopes. 

#### Outputs 

- Live broadcast. 

#### Business Rules 

- Notices must only be readable by the explicitly targeted audience identities. 

#### Access Rules 

- **Create:** Admins. 

#### Screen Description 

- **`CommunicationCenterPage.jsx`** : Rich-text editor with audience multi-select. 

#### Future API Notes 

- Dynamic read-filters required on the `GET /notices` endpoint. 

### 16. Support Center 

#### Purpose 

To provide a centralized helpdesk allowing Admins to resolve tickets submitted by consumers. 

#### Governance Ownership 

- **Owned By:** IT / Operations 

- **Approval Authority:** Operations Head 

Page 34 

EduDash – School ERP Management System 

- **Execution Authority:** Support Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** SLA breach tracking. 

#### Actors 

- **Admin:** Resolves tickets. 

#### Preconditions 

- Ticket submitted by Teacher, Student, or Parent. 

#### Workflow 

- Admin reviews open ticket queue. 

- Admin adds resolution notes and closes ticket. 

#### Inputs 

- Ticket UUID, Resolution Notes, Status. 

#### Outputs 

- Closed Ticket. 

#### Business Rules 

- Only the creator or an Admin can view a specific ticket's details. 

#### Access Rules 

- **Edit:** Support Admins. 

#### Screen Description 

- **`SupportManagementPage.jsx`** : Ticket queue and messaging interface. 

#### Future API Notes 

- Standard CRUD with message threading. 

### 17. Clubs & Committees 

#### Purpose 

Page 35 

EduDash – School ERP Management System 

To manage extracurricular activities, track participation, and assign coordinators. 

#### Governance Ownership 

- **Owned By:** Student Affairs 

- **Approval Authority:** Student Affairs Head 

- **Execution Authority:** Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** None. 

#### Actors 

- **Admin:** Creates clubs. 

#### Preconditions 

- Teachers exist to act as coordinators. 

#### Workflow 

- Admin establishes Club. 

- Admin assigns Teacher Coordinator. 

#### Inputs 

- Club Name, Coordinator UUID. 

#### Outputs 

- Extracurricular roster. 

#### Business Rules 

- Teachers assigned as coordinators do not gain Admin governance rights; they only gain execution rights scoped strictly to the Club roster. 

#### Access Rules 

- **Edit:** Admins. 

#### Screen Description 

- **`ClubsPage.jsx` / `CommitteesPage.jsx`** : Card-based grid of active clubs. 

#### Future API Notes 

- Simple relational linking endpoints. 

Page 36 

EduDash – School ERP Management System 

### 18. Reports & Analytics 

#### Purpose 

To generate comprehensive statistical outputs regarding institutional health (Financials, Academics, Attendance). 

#### Governance Ownership 

- **Owned By:** Executive Administration 

- **Approval Authority:** Super Admin / Principal 

- **Execution Authority:** Executive Admins 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Custom report builder. 

#### Actors 

- **Admin:** Views metrics. 

#### Preconditions 

- Sufficient operational data exists. 

#### Workflow 

- Admin selects a report category. 

- System visualizes the aggregation. 

#### Inputs 

- Date Ranges, Category Filters. 

#### Outputs 

- CSV exports and visual charts. 

#### Business Rules 

- Financial analytics are restricted entirely to Finance Admins and Super Admins. 

#### Access Rules 

- **View:** Scoped strictly by the Admin's Effective Access grants. 

#### Screen Description 

Page 37 

EduDash – School ERP Management System 

- **`ReportsAnalyticsPage.jsx`** : Dashboard filled with Recharts visualization widgets. 

#### Future API Notes 

- Requires complex, read-optimized database views or data warehousing to prevent locking live transactional tables. 

## Phase 1B: Teacher Portal Specification 

### Overview 

The Teacher Portal is designed strictly for academic execution and student mentorship. It focuses entirely on delivering education, marking attendance, executing assessments, and monitoring assigned student cohorts. Teachers operate under the "maker-checker" paradigm, meaning sensitive actions (like finalizing question papers) require governance approval. 

### 1. Academic Attendance Execution 

#### Purpose 

To capture the daily or period-level physical presence of students within an assigned class cohort. 

#### Governance Ownership 

- **Owned By:** Operations Department 

- **Approval Authority:** Operations Head 

- **Execution Authority:** Teacher (Class Teacher / Subject Teacher) 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Biometric / RFID integration syncing. Hard-locking of attendance submission after 24 hours (Proposed Enforcement). 

#### Actors 

- **Teacher:** Executes the attendance marking. 

#### Preconditions 

- The teacher must be actively assigned to the target Class in the Timetable. 

#### Workflow 

- Teacher accesses the Attendance module. 

- System presents the roster of students for the currently scheduled Class. 

- Teacher toggles students between Present, Absent, and Late. 

Page 38 

EduDash – School ERP Management System 

- Teacher clicks "Submit Register". 

#### Inputs 

- Class UUID, Date, Array of Student Statuses (Present/Absent/Late). 

#### Outputs 

- Daily Attendance Log committed to the global institutional tracker. 

#### Business Rules 

- Attendance cannot be submitted for future dates. 

- **Proposed Rule:** Attendance should be submitted within 24 hours of the scheduled period. 

#### Access Rules 

- **Execute:** Teacher. 

- **Scope:** Restricted exclusively to the classes explicitly mapped to the Teacher's UUID. 

#### Screen Description 

- **`AttendanceMgmtPage.jsx`** : A streamlined roster list with quick-toggle buttons for rapid roll calls during class time. 

#### Future API Notes 

- `POST /api/v1/attendance/submit`: Expected to trigger a downstream notification service if a student is marked absent. 

### 2. Assignment Distribution & Grading 

#### Purpose 

To distribute homework, collect student submissions digitally, and execute grading. 

#### Governance Ownership 

- **Owned By:** Academic Department 

- **Approval Authority:** Academic Department Head (Auditing only) 

- **Execution Authority:** Teacher 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Plagiarism detection integration. 

Page 39 

EduDash – School ERP Management System 

#### Actors 

- **Teacher:** Distributes and grades. 

#### Preconditions 

- The teacher must be assigned to the Subject and Class. 

#### Workflow 

- Teacher creates a new Assignment specifying instructions and a strict Due Date. 

- System distributes the assignment to the target Student Portal feeds. 

- Teacher views the submissions list. 

- Teacher grades each submission and provides feedback. 

#### Inputs 

- Assignment Details, File Attachments, Grades. 

#### Outputs 

- Active Assignment task for students; Graded results in the student's ledger. 

#### Business Rules 

- Assignments cannot be modified by the Teacher after the Due Date has passed. 

- Grades are finalized immediately upon entry. 

#### Access Rules 

- **Execute:** Teacher. 

#### Screen Description 

- **`AssignmentsManagementPage.jsx`** : A dual-view interface for drafting assignments and reviewing student file submissions. 

#### Future API Notes 

- Pre-signed Cloud Storage URLs required for large attachments. 

### 3. Question Paper Drafting 

#### Purpose 

To securely author summative examination papers that will eventually be reviewed and locked by the Governance layer. 

Page 40 

EduDash – School ERP Management System 

#### Governance Ownership 

- **Owned By:** Academic Department 

- **Approval Authority:** Academic Department Head 

- **Execution Authority:** Teacher (Drafter) 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Question bank auto-generation features. 

#### Actors 

- **Teacher:** Drafter of the paper. 

#### Preconditions 

- An Exam Term must be active. 

#### Workflow 

- Teacher creates a Draft Question Paper. 

- Teacher inputs questions, marking schemes, and total marks. 

- Teacher submits the Draft to the "Review Pool". 

#### Inputs 

- Exam Reference, Subject UUID, Questions Payload. 

#### Outputs 

- Draft Question Paper record. 

#### Business Rules 

- **Maker-Checker Paradigm:** A Teacher explicitly cannot approve their own drafted paper. 

- Drafts cannot be edited once pushed to the Review Pool unless rejected by a Head. 

#### Access Rules 

- **Draft:** Teacher. 

#### Screen Description 

- **`QuestionPapersPage.jsx`** : A complex form array allowing teachers to dynamically add and reorder question types. 

#### Future API Notes 

Page 41 

EduDash – School ERP Management System 

- Strict state machine validation on the backend `PATCH` endpoint to prevent unauthorized transitions. 

### 4. Results & Marks Entry 

#### Purpose 

To log formal summative examination marks for students at the end of an academic term. 

#### Governance Ownership 

- **Owned By:** Academic Department 

- **Approval Authority:** Academic Head 

- **Execution Authority:** Teacher 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Automated rubric application. 

#### Actors 

- **Teacher:** Enters raw marks. 

#### Preconditions 

- An Exam must be in the "Grading Window" state as defined by the Admin. 

#### Workflow 

- Teacher selects an active Exam and assigned Class. 

- Teacher inputs raw marks against each student. 

- Teacher saves the ledger. 

#### Inputs 

- Exam UUID, Student UUID, Raw Marks. 

#### Outputs 

- Unpublished Result records. 

#### Business Rules 

- Teachers can only edit marks while the Admin-controlled "Grading Window" is open. 

- Teachers cannot formally "Publish" the results. 

#### Access Rules 

Page 42 

EduDash – School ERP Management System 

- **Execute:** Teacher. 

#### Screen Description 

- **`MarksExamsPage.jsx`** : A spreadsheet-like data grid optimized for rapid keyboard data entry. 

#### Future API Notes 

- Payload should support bulk array updates to minimize network requests. 

### 5. Teacher Leave Requests 

#### Purpose 

To allow academic staff to formally request time off, routing the request to the HR or Department Head layer. 

#### Governance Ownership 

- **Owned By:** Human Resources Department 

- **Approval Authority:** Academic Department Head / HR Admin 

- **Execution Authority:** Teacher (Requester) 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Auto-deduction of specific leave balances. 

#### Actors 

- **Teacher:** Submits the request. 

#### Preconditions 

- None. 

#### Workflow 

- Teacher selects a date range and leave type. 

- Teacher uploads supporting medical proof if required. 

- Teacher submits the request to the Governance queue. 

#### Inputs 

- Date Range, Leave Type, Reason, Attachments. 

#### Outputs 

Page 43 

EduDash – School ERP Management System 

- Pending Leave Request. 

#### Business Rules 

- Leave is not considered valid until explicitly approved by the Governance layer. 

#### Access Rules 

- **Create:** Teacher. 

#### Screen Description 

- **`TeacherLeavePage.jsx` / `LeaveMgmtPage.jsx`** : A simple form interface featuring historical request statuses. 

#### Future API Notes 

- Attachments require secure, isolated storage containers. 

### 6. Timetable Viewer 

#### Purpose 

To provide the teacher with their real-time daily and weekly class schedule. 

#### Governance Ownership 

- **Owned By:** Academic Department 

- **Approval Authority:** Academic Head 

- **Execution Authority:** Read-Only for Teachers 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** iCal/Google Calendar sync. 

#### Actors 

- **Teacher:** Consumer. 

#### Preconditions 

- Timetable must be generated by the Admin. 

#### Workflow 

- Teacher navigates to the Timetable view to see period allocations. 

Page 44 

EduDash – School ERP Management System 

#### Inputs 

- None. 

#### Outputs 

- Rendered Schedule. 

#### Business Rules 

- Teachers cannot alter their own timetables. 

#### Access Rules 

- **View:** Teacher. 

#### Screen Description 

- **`ClassTimetablePage.jsx`** : A clean, read-only 2D grid highlighting upcoming periods. 

#### Future API Notes 

- Scopes the timetable query strictly to the authenticated session credential. 

### 7. Notices Viewer 

#### Purpose 

To consume institutional broadcasts directed at the academic staff. 

#### Governance Ownership 

- **Owned By:** Operations Department 

- **Approval Authority:** Operations Head 

- **Execution Authority:** Read-Only for Teachers 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Acknowledgment tracking (Read receipts). 

#### Actors 

- **Teacher:** Consumer. 

#### Preconditions 

- An Admin must publish a notice targeting the Teacher audience. 

Page 45 

EduDash – School ERP Management System 

#### Workflow 

- Teacher logs in and reads the active notices. 

#### Inputs 

- None. 

#### Outputs 

- Notice Feed. 

#### Business Rules 

- Teachers cannot broadcast system-wide notices. 

#### Access Rules 

- **View:** Teacher. 

#### Screen Description 

- **`TeacherNoticesPage.jsx` / `AnnouncementsPage.jsx`** : A chronological feed of alert cards. 

#### Future API Notes 

- Standard paginated GET request. 

### 8. Club Coordination (Limited) 

#### Purpose 

To allow Teachers assigned as Club Coordinators to view their extracurricular rosters. 

#### Governance Ownership 

- **Owned By:** Student Affairs Department 

- **Approval Authority:** Student Affairs Head 

- **Execution Authority:** Teacher (Coordinator) 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** PARTIALLY IMPLEMENTED (Roster viewing and summary cards only). 

- **Planned Enhancements:** Full club event logging, extracurricular attendance tracking. 

#### Actors 

- **Teacher:** Coordinator. 

Page 46 

EduDash – School ERP Management System 

#### Preconditions 

- The Teacher must be explicitly linked to a Club. 

#### Workflow 

- Teacher views their assigned Club dashboard. 

- Teacher reviews the enrolled student roster. 

#### Inputs 

- None (Read-only currently). 

#### Outputs 

- Extracurricular membership list. 

#### Business Rules 

- Being a Club Coordinator does not grant the Teacher any Admin-level permissions. 

#### Access Rules 

- **View:** Teacher. 

#### Screen Description 

- **`ClubsActivitiesPage.jsx`** : A roster view detached from standard academic classes. 

#### Future API Notes 

- API must validate the `coordinator_uuid` against the authenticated session credential. 

### 9. Student Mentorship & Wellbeing 

#### Purpose 

To allow assigned mentors to track student wellbeing flags, view historical mentorship interactions, and add qualitative remarks. 

#### Governance Ownership 

- **Owned By:** Student Affairs Department 

- **Approval Authority:** Student Affairs Head 

- **Execution Authority:** Teacher (Assigned Mentor) 

#### Current Implementation Status & Planned Enhancements 

Page 47 

EduDash – School ERP Management System 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Automated risk flagging based on attendance patterns. 

#### Actors 

- **Teacher:** Mentor. 

#### Preconditions 

- Teacher must be formally linked as a Mentor to specific students. 

#### Workflow 

- Teacher reviews their assigned mentees. 

- Teacher views any wellbeing flags (e.g., poor recent grades, excessive absences). 

- Teacher adds a qualitative remark or interaction log. 

#### Inputs 

- Student UUID, Remark Text, Interaction Date. 

#### Outputs 

- Mentorship history log. 

#### Business Rules 

- Mentorship remarks are strictly confidential between the Mentor and the Governance layer (Parents cannot view internal remarks). 

#### Access Rules 

- **Execute:** Teacher. 

#### Screen Description 

- **`MentorSupportPage.jsx`** : Mentorship summary cards, wellbeing flags, and a timeline of recorded interactions. 

#### Future API Notes 

- High security serialization to prevent cross-mentee data leakage. 

### 10. Student Performance Tracking 

#### Purpose 

To provide Teachers with granular, cross-subject analytical tracking of individual student academic performance. 

Page 48 

EduDash – School ERP Management System 

#### Governance Ownership 

- **Owned By:** Academic Department 

- **Approval Authority:** Academic Head 

- **Execution Authority:** Teacher 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Parent portal data synchronization. 

#### Actors 

- **Teacher:** Evaluator. 

#### Preconditions 

- Student must have sufficient graded assignment/exam history. 

#### Workflow 

- Teacher selects a student. 

- System graphs the student's historical trajectory. 

#### Inputs 

- Student UUID. 

#### Outputs 

- Performance charts. 

#### Business Rules 

- Teachers can only view the detailed analytics of students actively enrolled in their assigned classes. 

#### Access Rules 

- **View:** Teacher. 

#### Screen Description 

- **`StudentPerfPage.jsx`** : Analytical dashboard focusing exclusively on student data visualization. 

#### Future API Notes 

- Read-only aggregation views. 

Page 49 

EduDash – School ERP Management System 

### 11. Student Duty Management 

#### Purpose 

To allow Teachers to assign and monitor specific responsibilities (e.g., Prefect duties, Hall Monitor) to students. 

#### Governance Ownership 

- **Owned By:** Student Affairs Department 

- **Approval Authority:** Student Affairs Head 

- **Execution Authority:** Teacher 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Gamification/Badge integration. 

#### Actors 

- **Teacher:** Duty Assigner. 

#### Preconditions 

- None. 

#### Workflow 

- Teacher creates a Duty record. 

- Teacher assigns a Student to the Duty. 

- Teacher logs the execution status. 

#### Inputs 

- Duty Title, Description, Student UUID, Execution Date. 

#### Outputs 

- Student Duty log. 

#### Business Rules 

- Duties assigned by Teachers appear on the Student Portal for acknowledgment. 

#### Access Rules 

- **Execute:** Teacher. 

#### Screen Description 

Page 50 

EduDash – School ERP Management System 

- **`StudentDutyManagementPage.jsx`** : Roster of duties and their completion statuses. 

#### Future API Notes 

- Basic CRUD operations mapped to the student identity. 

### 12. Reports & Analytics (Teacher Level) 

#### Purpose 

To provide the Teacher with statistical insights scoped purely to their own classes and workload. 

#### Governance Ownership 

- **Owned By:** Academic Department 

- **Approval Authority:** Academic Head 

- **Execution Authority:** Teacher 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Downloadable PDF summaries. 

#### Actors 

- **Teacher:** Viewer. 

#### Preconditions 

- Sufficient historical data. 

#### Workflow 

- Teacher opens the reporting dashboard to review pass rates and attendance averages. 

#### Inputs 

- None. 

#### Outputs 

- Statistical widgets. 

#### Business Rules 

- Data strictly scoped to the Teacher's assigned classes. Institutional global data is hidden. 

Page 51 

EduDash – School ERP Management System 

#### Access Rules 

- **View:** Teacher. 

#### Screen Description 

- **`ReportsAnalyticsPage.jsx`** : Summary metrics and charts for class-level performance. 

#### Future API Notes 

- Endpoint must enforce strict session-based data scoping. 

## Phase 1C: Student Portal Specification 

### Overview 

The Student Portal is designed exclusively for the consumers of the academic system. It provides a read-centric view of institutional data (Timetables, Fees, Results, Transport) while allowing limited write operations for critical interactions: submitting homework, acknowledging duties, creating IT support tickets, and applying for leave. 

### 1. Homework & Assignment Submission 

#### Purpose 

To provide students with a centralized hub for receiving teacher assignments and digitally submitting their completed homework files. 

#### Governance Ownership 

- **Owned By:** Academic Department 

- **Approval Authority:** Teacher (Grading) 

- **Execution Authority:** Student 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Strict 24-hour late submission penalties (Proposed Engine Rule). 

#### Actors 

- **Student:** Consumer and submitter. 

#### Preconditions 

- A Teacher must have distributed an active assignment to the Student's class cohort. 

Page 52 

EduDash – School ERP Management System 

#### Workflow 

- Student logs in and navigates to the Assignments board. 

- System categorizes assignments by status ('Pending', 'Submitted', 'Graded'). 

- Student clicks on a 'Pending' assignment, reads the instructions, and uploads their file. 

- Student clicks 'Submit'. 

- Once graded, the Student can view the Teacher's feedback and marks. 

#### Inputs 

- Assignment UUID, Uploaded File (PDF/Docs), Text Comments. 

#### Outputs 

- Submission timestamp and file record. 

#### Business Rules 

- Submissions logged past the Due Date are flagged automatically as "LATE". 

- Students cannot un-submit or modify a file after the Teacher has entered a grade. 

#### Access Rules 

- **Execute:** Student. 

- **Scope:** Restricted exclusively to the assignments explicitly mapped to the Student's class. 

#### Screen Description 

- **`AssignmentsPage.jsx`** : A card-based interface detailing upcoming deadlines with an intuitive dragand-drop file upload zone. 

#### Future API Notes 

- Submissions require secure, pre-signed URL generation to handle direct-to-cloud file uploads, bypassing server bandwidth constraints. 

### 2. Student Leave Requests 

#### Purpose 

To allow students (or their guardians) to formally request absence dates, routing the request to the Governance Leave Approval queue. 

#### Governance Ownership 

- **Owned By:** Operations Department 

- **Approval Authority:** HR / Operations Admin 

- **Execution Authority:** Student 

Page 53 

EduDash – School ERP Management System 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Mandatory counter-approval routing to the Parent Portal before reaching the Admin queue if the student is a minor. 

#### Actors 

- **Student:** Requester. 

#### Preconditions 

- None. 

#### Workflow 

- Student selects a date range and leave reason. 

- Student optionally attaches a medical note. 

- Student submits the request. 

- Student tracks the status (Pending -> Approved/Rejected). 

#### Inputs 

- Date Range, Reason, Attachments. 

#### Outputs 

- Pending Leave Request. 

#### Business Rules 

- Approved leave dates automatically override default attendance markings, preventing teachers from mistakenly marking the student as unexcused absent. 

#### Access Rules 

- **Create:** Student. 

#### Screen Description 

- **`LeavePage.jsx`** : A form interface with historical request tracking. 

#### Future API Notes 

- Minimal CRUD payload. 

Page 54 

EduDash – School ERP Management System 

### 3. Student Duty Board 

#### Purpose 

To allow students to view, acknowledge, and track institutional responsibilities assigned to them by Teachers or Admins (e.g., Prefect, Hall Monitor). 

#### Governance Ownership 

- **Owned By:** Student Affairs Department 

- **Approval Authority:** Student Affairs Head 

- **Execution Authority:** Student (Acknowledgment) 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Badge and point-based gamification for fulfilled duties. 

#### Actors 

- **Student:** Assigned participant. 

#### Preconditions 

- A Teacher or Admin must assign a duty to the Student UUID. 

#### Workflow 

- Student navigates to the Duty Board. 

- System displays active and historical duties. 

- Student clicks "Acknowledge" on new duties. 

#### Inputs 

- Acknowledgment Boolean. 

#### Outputs 

- Updated Duty Status log. 

#### Business Rules 

- Students cannot assign duties to themselves or other students. 

#### Access Rules 

- **Execute (Acknowledge):** Student. 

#### Screen Description 

Page 55 

EduDash – School ERP Management System 

- **`StudentDutyRecordsPage.jsx`** : A chronological timeline or list view showing assigned responsibilities and their statuses. 

#### Future API Notes 

- Simple `PATCH` endpoint to flip the acknowledgment boolean. 

### 4. Student Notices Viewer 

#### Purpose 

To consume institutional broadcasts directed at the student body or specific class cohorts. 

#### Governance Ownership 

- **Owned By:** Communications Department 

- **Approval Authority:** Operations Head 

- **Execution Authority:** Read-Only for Students 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** None. 

#### Actors 

- **Student:** Consumer. 

#### Preconditions 

- An Admin must publish a notice targeting the Student audience. 

#### Workflow 

- Student logs in. 

- The dashboard fetches active notices where the audience matches the Student role. 

#### Inputs 

- None. 

#### Outputs 

- Notice Feed. 

#### Business Rules 

- Students cannot broadcast or reply to system-wide notices. 

Page 56 

EduDash – School ERP Management System 

#### Access Rules 

- **View:** Student. 

#### Screen Description 

- **`StudentNoticesPage.jsx`** : A chronological feed of rich-text alert cards. 

#### Future API Notes 

- Standard paginated GET request. 

### 5. Profile & Financial Ledger 

#### Purpose 

To provide the student with read-only visibility into their demographic data, assigned transport routes, and outstanding fee ledgers. 

#### Governance Ownership 

- **Owned By:** Finance / Logistics Departments 

- **Approval Authority:** Finance Head 

- **Execution Authority:** Read-Only for Students 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** PLANNED (Digital Fee Processing Gateway checkout). 

#### Actors 

- **Student:** Viewer. 

#### Preconditions 

- None. 

#### Workflow 

- Student accesses Profile, Fees, or Transport views. 

- System pulls the respective static ledger data. 

#### Inputs 

- None. 

Outputs 

Page 57 

EduDash – School ERP Management System 

- Ledger tables and route maps. 

#### Business Rules 

- Students cannot alter their own demographic data or fee ledgers. Any discrepancies must be routed through the Support Center. 

#### Access Rules 

- **View:** Student. 

#### Screen Description 

- **`StudentProfilePage.jsx` / `FeeDetailsPage.jsx` / `TransportPage.jsx`** : Read-only static data sheets and financial ledger tables. 

#### Future API Notes 

- Read-only data aggregation endpoints. 

### 6. Examinations & Results Viewer 

#### Purpose 

To allow students to view published term results and upcoming examination timelines. 

#### Governance Ownership 

- **Owned By:** Examinations Department 

- **Approval Authority:** Examinations Head 

- **Execution Authority:** Read-Only for Students 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Dynamic PDF report card downloading. 

#### Actors 

- **Student:** Consumer. 

#### Preconditions 

- Admin must set the specific Exam to "Published". 

#### Workflow 

- Student navigates to the Examinations page. 

Page 58 

EduDash – School ERP Management System 

- System fetches all published results matching the Student UUID. 

#### Inputs 

- None. 

#### Outputs 

- Graded Report Cards. 

#### Business Rules 

- Results are strictly hidden and return `403/404` until the global "Publish" flag is activated by the Governance layer, regardless of whether a teacher has finished grading. 

#### Access Rules 

- **View:** Student. 

#### Screen Description 

- **`ExaminationPage.jsx`** : Formal report card layout displaying subject-wise marks, percentages, and teacher remarks. 

#### Future API Notes 

- Relies heavily on the Admin's state-machine toggle. 

### 7. Timetable Viewer 

#### Purpose 

To provide the student with their real-time daily and weekly class schedule. 

#### Governance Ownership 

- **Owned By:** Academic Department 

- **Approval Authority:** Academic Head 

- **Execution Authority:** Read-Only for Students 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** None. 

#### Actors 

- **Student:** Consumer. 

Page 59 

EduDash – School ERP Management System 

#### Preconditions 

- Timetable must be generated by the Admin. 

#### Workflow 

- Student navigates to the Timetable view to see class allocations. 

#### Inputs 

- None. 

#### Outputs 

- Rendered Schedule. 

#### Business Rules 

- Students cannot alter their own timetables. 

#### Access Rules 

- **View:** Student. 

#### Screen Description 

- **`WeeklyTimetablePage.jsx`** : A read-only 2D grid highlighting current and upcoming periods. 

#### Future API Notes 

- Scopes the timetable query strictly to the authenticated session credential. 

### 8. Extracurricular Tracking (Clubs & Achievements) 

#### Purpose 

To allow students to view their institutional achievements and active club memberships. 

#### Governance Ownership 

- **Owned By:** Student Affairs Department 

- **Approval Authority:** Student Affairs Head 

- **Execution Authority:** Read-Only for Students 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Club sign-up requests (Currently Admin-assigned only). 

Page 60 

EduDash – School ERP Management System 

#### Actors 

- **Student:** Viewer. 

#### Preconditions 

- Admin must assign the student to a Club or award an Achievement. 

#### Workflow 

- Student views their active clubs and historical awards. 

#### Inputs 

- None. 

#### Outputs 

- Roster views and award logs. 

#### Business Rules 

- Students cannot join a club autonomously; they must be registered by an Admin. 

#### Access Rules 

- **View:** Student. 

#### Screen Description 

- **`ClubsCommitteesPage.jsx` / `AchievementsPage.jsx`** : Card-based grids displaying extracurricular affiliations. 

#### Future API Notes 

- Simple relational linking endpoints. 

### 9. Support Center 

#### Purpose 

To allow Students to report technical or logistical issues (e.g., Portal login issues, Bus route queries) directly to the Operations Admins. 

#### Governance Ownership 

- **Owned By:** Operations Department 

- **Approval Authority:** Operations Head 

- **Execution Authority:** Student (Requester) 

Page 61 

EduDash – School ERP Management System 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** PARTIALLY IMPLEMENTED (Ticket creation planned, view implementation status uncertain). 

- **Planned Enhancements:** None. 

#### Actors 

- **Student:** Submits tickets. 

#### Preconditions 

- None. 

#### Workflow 

- Student creates a ticket detailing the issue. 

- Ticket enters the Admin Support Center queue. 

- Student views replies and resolution status. 

#### Inputs 

- Issue Title, Description, Priority. 

#### Outputs 

- Active Support Ticket. 

#### Business Rules 

- Students can only view tickets they have authored. 

#### Access Rules 

- **Create/View:** Student. 

#### Screen Description 

- **`SupportCenterPage.jsx`** : A messaging/thread interface showing ticket status (Open, In Progress, Closed). 

#### Future API Notes 

- Ticket threads should utilize sub-collections or relational foreign keys for reply messages. 

## Phase 1D: Parent Portal Specification 

### Overview 

Page 62 

EduDash – School ERP Management System 

The Parent Portal acts as a specialized proxy view. Parents are not direct participants in academic execution; rather, their accounts are strictly hard-linked to one or more `Student` records. The portal aggregates the linked child's data (Results, Fees, Attendance, Leave) into a read-only monitoring dashboard, while allowing limited interaction via the Support Center. 

### 1. Child Duty & Leave Monitor 

#### Purpose 

To provide parents with direct visibility into the institutional responsibilities assigned to their child, as well as the status of any leave requests their child has submitted. 

#### Governance Ownership 

- **Owned By:** Operations / Student Affairs Department 

- **Approval Authority:** Operations Head 

- **Execution Authority:** Read-Only for Parents 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Mandatory parent counter-approval for minor student leave requests (PLANNED). 

#### Actors 

- **Parent:** Viewer. 

#### Preconditions 

- The Parent UUID must be securely linked to an active Student UUID. 

#### Workflow 

- Parent logs in and selects the Child context (if multiple children are enrolled). 

- Parent views active Duty assignments and historical Leave Request statuses. 

#### Inputs 

- Target Child UUID (context switch). 

#### Outputs 

- Aggregated Duty and Leave state. 

#### Business Rules 

Page 63 

EduDash – School ERP Management System 

- Parents cannot create Leave Requests on behalf of the student; they can only monitor the status of requests submitted by the student portal. 

#### Access Rules 

- **View:** Parent (scoped exclusively to hard-linked children). 

#### Screen Description 

- **`ParentDutyRecordsPage.jsx`** : A merged chronological feed showing active duties and pending/approved absence requests. 

#### Future API Notes 

- API must strictly validate the `parent_id` against the `student.linked_parent_ids` array before returning any payload. 

### 2. Parent Notices Viewer 

#### Purpose 

To consume institutional broadcasts directed specifically at Parents (e.g., PTA meetings, Fee deadlines). 

#### Governance Ownership 

- **Owned By:** Communications Department 

- **Approval Authority:** Operations Head 

- **Execution Authority:** Read-Only for Parents 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Push notifications to parent mobile devices. 

#### Actors 

- **Parent:** Consumer. 

#### Preconditions 

- An Admin must publish a notice targeting the "Parent" audience. 

#### Workflow 

- Parent logs in. 

- Dashboard fetches active notices where the audience matches the Parent role. 

#### Inputs 

Page 64 

EduDash – School ERP Management System 

- None. 

#### Outputs 

- Notice Feed. 

#### Business Rules 

- Parents cannot broadcast system-wide notices. 

#### Access Rules 

- **View:** Parent. 

#### Screen Description 

- **`ParentNoticesPage.jsx`** : A chronological feed of rich-text alert cards. 

#### Future API Notes 

- Standard paginated GET request. 

### 3. Child Financial Ledger & Profile 

#### Purpose 

To provide the parent with visibility into their child's demographic data, assigned transport routes, and outstanding fee ledgers. 

#### Governance Ownership 

- **Owned By:** Finance / Logistics Departments 

- **Approval Authority:** Finance Head 

- **Execution Authority:** Read-Only for Parents 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** PLANNED (Digital Fee Processing Gateway checkout). 

#### Actors 

- **Parent:** Viewer (Future Payer). 

#### Preconditions 

- None. 

Page 65 

EduDash – School ERP Management System 

#### Workflow 

- Parent accesses the Fees or Transport views. 

- System pulls the respective static ledger data for the linked child. 

#### Inputs 

- None. 

#### Outputs 

- Ledger tables and route maps. 

#### Business Rules 

- Manual offline fee payments made at the school office are reflected here once logged by a Finance Admin. 

#### Access Rules 

- **View:** Parent. 

#### Screen Description 

- **`FeeDetailsPage.jsx` / `TransportPage.jsx`** : Read-only static data sheets and financial ledger tables. 

#### Future API Notes 

- Will eventually house the Stripe/Razorpay integration endpoints. 

### 4. Child Examinations & Results Viewer 

#### Purpose 

To allow parents to view published term results and upcoming examination timelines. 

#### Governance Ownership 

- **Owned By:** Examinations Department 

- **Approval Authority:** Examinations Head 

- **Execution Authority:** Read-Only for Parents 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Downloadable PDF report cards. 

Actors 

Page 66 

EduDash – School ERP Management System 

- **Parent:** Consumer. 

#### Preconditions 

- Admin must set the specific Exam to "Published". 

#### Workflow 

- Parent navigates to the Examinations page. 

- System fetches all published results matching the linked Child's UUID. 

#### Inputs 

- None. 

#### Outputs 

- Graded Report Cards. 

#### Business Rules 

- Results are strictly hidden until the global "Publish" flag is activated by the Governance layer. 

#### Access Rules 

- **View:** Parent. 

#### Screen Description 

- **`ExaminationPage.jsx`** : Formal report card layout displaying subject-wise marks, percentages, and teacher remarks. 

#### Future API Notes 

- Relies heavily on the Admin's state-machine toggle. 

### 5. Child Timetable Viewer 

#### Purpose 

To provide the parent with visibility into their child's daily and weekly class schedule. 

#### Governance Ownership 

- **Owned By:** Academic Department 

- **Approval Authority:** Academic Head 

- **Execution Authority:** Read-Only for Parents 

Page 67 

EduDash – School ERP Management System 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** None. 

#### Actors 

- **Parent:** Consumer. 

#### Preconditions 

- Timetable must be generated by the Admin. 

#### Workflow 

- Parent navigates to the Timetable view. 

#### Inputs 

- None. 

#### Outputs 

- Rendered Schedule. 

#### Business Rules 

- None. 

#### Access Rules 

- **View:** Parent. 

#### Screen Description 

- **`WeeklyTimetablePage.jsx`** : A read-only 2D grid highlighting current and upcoming periods. 

#### Future API Notes 

- Scopes the query strictly using the linked child context. 

### 6. Child Extracurricular Tracking 

#### Purpose 

To allow parents to view their child's institutional achievements and active club memberships. 

#### Governance Ownership 

Page 68 

EduDash – School ERP Management System 

- **Owned By:** Student Affairs Department 

- **Approval Authority:** Student Affairs Head 

- **Execution Authority:** Read-Only for Parents 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** IMPLEMENTED 

- **Planned Enhancements:** Digital Parental Consent signatures for high-risk clubs (e.g., Sports Teams). 

#### Actors 

- **Parent:** Viewer. 

#### Preconditions 

- Admin must assign the student to a Club. 

#### Workflow 

- Parent views their child's active clubs and historical awards. 

#### Inputs 

- None. 

#### Outputs 

- Roster views and award logs. 

#### Business Rules 

- Parents currently cannot opt their child in or out of a club autonomously. 

#### Access Rules 

- **View:** Parent. 

#### Screen Description 

- **`ClubsCommitteesPage.jsx` / `AchievementsPage.jsx`** : Card-based grids displaying extracurricular affiliations. 

#### Future API Notes 

- Future signature capabilities will require encrypted payload submissions. 

Page 69 

EduDash – School ERP Management System 

### 7. Support Center 

#### Purpose 

To allow Parents to report technical or logistical issues (e.g., Missing fee receipts, Transport delays) directly to the Operations Admins. 

#### Governance Ownership 

- **Owned By:** Operations Department 

- **Approval Authority:** Operations Head 

- **Execution Authority:** Parent (Requester) 

#### Current Implementation Status & Planned Enhancements 

- **Current Status:** PARTIALLY IMPLEMENTED (Ticket creation planned, view implementation status uncertain). 

- **Planned Enhancements:** None. 

#### Actors 

- **Parent:** Submits tickets. 

#### Preconditions 

- None. 

#### Workflow 

- Parent creates a ticket detailing the issue. 

- Ticket enters the Admin Support Center queue. 

- Parent views replies and resolution status. 

#### Inputs 

- Issue Title, Description, Priority. 

#### Outputs 

- Active Support Ticket. 

#### Business Rules 

- Parents can only view tickets they have authored. 

#### Access Rules 

- **Create/View:** Parent. 

Page 70 

EduDash – School ERP Management System 

Screen Description 

- **`SupportCenterPage.jsx`** : A messaging/thread interface showing ticket status (Open, In Progress, Closed). 

#### Future API Notes 

- Requires strict identity isolation to prevent viewing other parents' financial tickets. 

## Phase 1: Portal Codebase Validation Audit 

### Overview 

This audit serves as a strict verification pass to guarantee that the Professional SRS documents pure reality. Every module documented in Phase 1 (Portals) is directly mapped to a physical React component in the `src/pages` directory. Any workflow that cannot be physically verified is marked as PLANNED or PROPOSED. 

### 1. Admin Portal Validation 

|**Module Category**|**Associated React Component**|**Verification Status**|**Notes**|
|---|---|---|---|
|Governance &<br>Departments|`ManageDepartmentsPage.jsx`|IMPLEMENTED|Full CRUD for HR<br>governance.|
|System<br>Administration|`SystemAdministrationPage.jsx`,<br>`AdminProfilePage.jsx`|IMPLEMENTED|Overrides and<br>effective access<br>toggles verified.|
|Student<br>Management|`StudentsPage.jsx`,<br>`StudentDetailsPage.jsx`|IMPLEMENTED|Registry exists.<br>Auto-provisioning is<br>PLANNED.|
|Teacher<br>Management|`TeachersPage.jsx`|IMPLEMENTED|Registry exists.<br>Auto-provisioning is<br>PLANNED.|
|Employee<br>Directory|`EmployeeDirectoryPage.jsx`|IMPLEMENTED|Non-academic staff<br>registry exists.|
|Parent<br>Management|`ParentsPage.jsx`|IMPLEMENTED|Parent records and<br>student linkage<br>exists.|
|Class & Subject<br>Management|`ClassesPage.jsx`, `SubjectsPage.jsx`|IMPLEMENTED|Syllabus and cohort<br>definition exists.|
|Timetable<br>Management|`TimetablePage.jsx`|IMPLEMENTED|Relational grid<br>builder exists.|
|Attendance<br>Management|`AttendanceOverviewPage.jsx`|IMPLEMENTED|Dashboard exists.|



Page 71 

EduDash – School ERP Management System 

|Leave<br>Management<br>System|`LeaveApprovalPage.jsx`,<br>`EmployeeLeavePage.jsx`, etc.|IMPLEMENTED|Multi-page queue<br>system verified.|
|---|---|---|---|
|Question Paper<br>Management|`QuestionPapersAdminPage.jsx`|IMPLEMENTED|Maker-checker<br>review screen exists.|
|Examinations &<br>Results|`ExaminationsPage.jsx`,<br>`ResultsPage.jsx`|IMPLEMENTED|Timeline and<br>publishing screens<br>exist.|
|Fee Management|`FeeManagementPage.jsx`|PARTIALLY<br>IMPLEMENTED|Ledgers exist. Digital<br>Payments are<br>PLANNED.|
|Transport<br>Management|`TransportManagementPage.jsx`|IMPLEMENTED|Routes and<br>allocations exist.|
|Communication<br>Center|`CommunicationCenterPage.jsx`,<br>`NoticesPage.jsx`|IMPLEMENTED|Audience-scoped<br>noticeboard verified.|
|Document Center|`DocumentsPage.jsx`|IMPLEMENTED|Secure file vault<br>verified.|
|Support Center|`SupportManagementPage.jsx`|IMPLEMENTED|Centralized ticket<br>queue verified.|
|Clubs &<br>Committees|`ClubManagementCenterPage.jsx`,<br>`ClubsPage.jsx`|IMPLEMENTED|Rosters and<br>coordination verified.|
|Institutional<br>Planning|`InstitutionalPlanningPage.jsx`,<br>`SchoolCalendarPage.jsx`|IMPLEMENTED|Term configurations<br>exist.|
|Analytics &<br>Reporting|`AcademicAnalyticsPage.jsx`,<br>`AcademicPerformancePage.jsx`|IMPLEMENTED|Dashboards exist.|
|Workload<br>Analytics|`WorkloadAnalyticsPage.jsx`|IMPLEMENTED|Teacher load<br>tracking verified.|
|Student Duty<br>Management|`StudentDutyAdminPage.jsx`|IMPLEMENTED|Duty allocation and<br>auditing exists.|
|Achievements<br>Tracking|`AchievementsPage.jsx`|IMPLEMENTED|Institutional awards<br>and tracking exists.|



### 2. Teacher Portal Validation 

|**Module**|**Associated React Component**|**Verification Status**|**Notes**|
|---|---|---|---|
|**Category**||||
|Attendance<br>Execution|`AttendanceMgmtPage.jsx`|IMPLEMENTED|Roster exists.**Correction:**<br>The 24-hour lock is<br>PROPOSED, not<br>implemented in code.|
|Assignment<br>Distribution|`AssignmentsManagementPage.jsx`|IMPLEMENTED|Homework and grading exist.|



Page 72 

EduDash – School ERP Management System 

|Question<br>Paper<br>Drafting|`QuestionPapersPage.jsx`|IMPLEMENTED|Teacher draft submission<br>verified.|
|---|---|---|---|
|Marks &<br>Exams Entry|`MarksExamsPage.jsx`|IMPLEMENTED|Ledger entry exists.|
|Leave<br>Requests|`LeaveMgmtPage.jsx`,<br>`TeacherLeavePage.jsx`|IMPLEMENTED|Submitting requests exists.|
|Timetable<br>Viewer|`ClassTimetablePage.jsx`|IMPLEMENTED|Read-only grid verified.|
|Notices<br>Viewer|`TeacherNoticesPage.jsx`,<br>`AnnouncementsPage.jsx`|IMPLEMENTED|Read-only feeds exist.|
|Club<br>Coordination|`ClubsActivitiesPage.jsx`|PARTIALLY<br>IMPLEMENTED|Roster viewing exists. Heavy<br>attendance tracking is<br>PLANNED.|
|Support<br>Center|`MentorSupportPage.jsx`|**NOT**<br>**IMPLEMENTED**|Component is actually for<br>"Mentorship/Student<br>Wellbeing", not IT Support.<br>Teacher IT Support is<br>PLANNED.|
|Student<br>Mentorship|`MentorSupportPage.jsx`|IMPLEMENTED|Previously missed. Tracks<br>student wellbeing flags and<br>mentor remarks.|
|Student<br>Performance|`StudentPerfPage.jsx`|IMPLEMENTED|Previously missed. Granular<br>academic tracking per<br>student.|
|Student Duty<br>Board|`StudentDutyManagementPage.jsx`|IMPLEMENTED|Previously missed. Allows<br>teachers to manage assigned<br>student duties.|
|Reports &<br>Analytics|`ReportsAnalyticsPage.jsx`|IMPLEMENTED|Localized dashboard for<br>Teacher stats.|



### 3. Corrective Actions Required Before Proceeding 

Based on this audit, Phase 1B will be explicitly updated to reflect reality: 

- **Remove Support Ticket Submission** from the Teacher SRS (Move to PLANNED enhancements). 

- **Add Student Mentorship & Wellbeing** module. 

- **Add Student Performance Tracking** module. 

- **Add Student Duty Management** module. 

- **Downgrade Club Coordination** to partial (Roster viewing only; deep execution is planned). 

- **Re-classify Attendance 24-Hour Lock** as a Business Rule (Proposed / Planned Policy). 

- **Standardize Governance Ownership** across all modules to specific Departments (Academic Department, Operations Department, Human Resources Department, Student Affairs Department). 

Page 73 

EduDash – School ERP Management System 

## Phase 1: Portal Crosscheck Matrix 

### Overview 

This crosscheck matrix ensures structural consistency across all four institutional portals (Admin, Teacher, Student, Parent) before progressing to Use Case generation and Functional Requirements. It explicitly validates the boundaries of the Governance "Maker-Checker" paradigm. 

### 1. Governance & Configuration Capabilities 

|**Capability**|**Admin Portal**|**Teacher Portal**|**Student**<br>**Portal**|**Parent Portal**|
|---|---|---|---|---|
|**System Administration**<br>**(Overrides)**|Execute (Super<br>Admin)|None|None|None|
|**Department & Staff**<br>**Organization**|Manage|None|None|None|
|**Student Demographics /**<br>**Registry**|Manage|View (Roster<br>Only)|View (Self)|View (Linked<br>Child)|
|**Class & Subject Setup**|Manage|None|None|None|
|**Institutional Calendar Setup**|Manage|None|None|None|



### 2. Academic Execution Capabilities 

|**Capability**|**Admin Portal**|**Teacher Portal**|**Student Portal**|**Parent Portal**|
|---|---|---|---|---|
|**Timetable Generation**|Execute|View|View|View|
|**Academic Attendance**|Override / Audit|Execute (Mark)|View|View|
|**Assignments &**<br>**Homework**|None (Audit Mode)|Execute<br>(Create/Grade)|Execute (Submit)|View (Monitor)|
|**Question Papers**|Execute<br>(Approve/Lock)|Execute (Draft)|None|None|
|**Examinations &**<br>**Results**|Execute (Publish)|Execute (Enter<br>Marks)|View (When<br>Published)|View (When<br>Published)|
|**Student Mentorship**|View (Audit)|Execute (Add<br>Remarks)|None|None|
|**Student Performance**<br>**Analytics**|View (Institutional)|View (Class-level)|None|None|



### 3. Operations & Logistics Capabilities 

Page 74 

EduDash – School ERP Management System 

|**Capability**|**Admin Portal**|**Teacher Portal**|**Student Portal**|**Parent Portal**|
|---|---|---|---|---|
|**Leave Management**|Execute<br>(Approve)|Request|Request|View<br>(Monitor/Counter-Sign)|
|**Fee Ledgers &**<br>**Payments**|Manage|None|View|View (Future Payer)|
|**Transport Routes**|Manage|None|View|View|
|**Student Duty**<br>**Assignment**|Manage /<br>Assign|Assign|Execute<br>(Acknowledge)|View|
|**Extracurricular**<br>**Clubs**|Manage /<br>Assign|Coordinate<br>(Log)|View|View|
|**Communication /**<br>**Notices**|Create /<br>Broadcast|View|View|View|
|**Support Center**<br>**(Ticketing)**|Resolve<br>(Execute)|Submit<br>(PLANNED)|Submit<br>(PLANNED)|Submit (PLANNED)|



### 4. Analytical Capabilities 

|**Capability**|**Admin Portal**|**Teacher Portal**|**Student Portal**|**Parent Portal**|
|---|---|---|---|---|
|**Reports & Analytics**|View (Global Scope)|View (Class Scope)|None|None|
|**Workload Analytics**|View (Teacher Loads)|None|None|None|



### 5. Architectural Findings & Validation Rules 

By constructing this matrix, the following strict boundaries are formally codified for subsequent SRS generation: 

- **Isolation of Publish State:** Students and Parents can **never** view Examination Results until the Admin layer explicitly executes the `Publish` action, overriding the Teacher's grading actions. 

- **Isolation of Grading State:** Admins do not participate in Assignment Grading; the Teacher is the absolute authority for day-to-day homework. 

- **Isolation of Question Papers:** Teachers can never "Publish/Lock" a summative exam paper they have authored. An Admin/Department Head must execute the lock. 

- **Proxy Constraint:** The Parent Portal executes zero direct institutional writes; it relies entirely on the Student Portal actions, acting strictly as a monitoring pane (with future counter-signature capabilities planned for minor-level leave requests). 

## Phase 2: Governance System Specification 

### Overview 

The Governance System acts as the architectural backbone of the EduDash ERP. It abandons traditional roledriven inheritance in favor of a strict `Department Module Ownership` model. This structure dictates exactly 

Page 75 

EduDash – School ERP Management System 

who can execute institutional workflows and enforces an absolute separation of powers through the "Effective Access" engine and the "Maker-Checker" paradigm. 

### 1. Identity Separation Model 

EduDash strictly separates physical employment identity from digital system access. 

#### 1.1 `Staff` vs `Admin Account` 

- **Staff Entity:** A registry record of an employee (e.g., Driver, Receptionist, HR Officer). 

- **Admin Account:** A digital execution credential. 

- **Rule:** Not all Staff receive Admin Accounts. - _Example:_ A School Bus Driver is recorded as `Staff Only`. An HR Officer is recorded as `Staff` + `Admin Account`. 

#### 1.2 Teacher Overlay Identities 

- **Rule:** Teachers are purely academic execution actors. They cannot access governance modules unless a secondary `Admin Account` identity is explicitly overlaid onto their core Teacher account. 

### 2. Core Base Identities 

Every user in the system is assigned a Base Identity at the time of account creation. 

#### 2.1 `SUPER_ADMIN` 

- **Definition:** The foundational identity created during tenant initialization. 

- **Capabilities:** Possesses absolute execution rights over all modules. 

- **Restriction:** `SUPER_ADMIN` may intervene for system recovery, misconfiguration correction, or emergency administration. **Normal operational workflows remain strictly governed by the MakerChecker paradigm.** 

- **Constraint:** Cannot be deleted. Cannot be assigned to standard Teachers, Students, or Parents. 

#### 2.2 `ADMIN` 

- **Definition:** Operational staff granted digital system access. 

- **Capabilities:** Possesses zero access by default. Access is derived entirely from Department Assignment and Explicit Overrides. 

#### 2.3 `TEACHER` 

- **Definition:** Academic execution staff. 

- **Capabilities:** Limited strictly to the academic cohorts explicitly mapped to their UUID. 

#### 2.4 `STUDENT` & `PARENT` 

- **Definition:** Institutional consumers. 

Page 76 

EduDash – School ERP Management System 

- **Capabilities:** Strictly read-only proxies for institutional state. Zero capability to alter institutional ledgers. 

### 3. Department & Hierarchy Engine 

Departments are not just organizational groups; they are the fundamental owners of systemic modules. 

#### 3.1 Module Ownership Model 

Governance exists primarily to map Modules to Departments. 

- **Academic Department** → Question Papers, Examinations & Results, Timetable, Subjects 

- **Finance Department** → Fee Management 

- **Operations Department** → Attendance, Transport, Support Center 

- **Human Resources Department** → Employee Directory, Leave Management 

- **Student Affairs Department** → Clubs & Committees, Student Duties, Mentorship 

#### 3.2 Department Authority Matrix 

Execution power within an owned module depends on the member's hierarchy tier. 

|**Action**|**Department Head**|**Department Member**|
|---|---|---|
|**View**|✓|✓|
|**Create (Draft)**|✓|✓|
|**Edit**|✓|✓|
|**Delete**|✓|✗|
|**Approve**|✓|✗|
|**Publish / Lock**|✓|✗|



- **Department Head:** The definitive execution and approval authority for all modules owned by their department. 

- **Department Member:** Standard operator. Sensitive actions are restricted to "Drafts". 

### 4. Effective Access Engine 

The system abandons `Role -> Permissions` inheritance. Instead, "Effective Access" calculates exactly what a user can see and do at runtime based on module ownership. 

#### 4.1 The Calculation Formula 

`Effective Access = [Department Owned Modules] + [Manual Overrides]` 

#### 4.2 Governance Resolution Flow 

Page 77 

EduDash – School ERP Management System 

Every request in the Admin Portal follows this resolution chain: `Staff` → `Admin Account` → `Department Assignment (Head/Member)` → `Owned Modules` → **`Effective Access Resolved`** → `Sidebar Rendered` → `Route Guard Passed` → `Action Executed`. 

#### 4.3 Manual Override Boundaries 

- Overrides allow the `SUPER_ADMIN` to grant access to a specific module outside a user's department. 

- **Visibility Constraint:** Overrides grant _module visibility and creation capabilities_ , but they **do not automatically grant approval authority** . 

- _Example:_ A Finance Admin given a manual override to the "Leave Management" module can view leave records, but they cannot _Approve_ them; approval remains strictly bound to the HR Department Head. 

### 5. Core Governance Principles 

#### 5.1 The Maker-Checker Workflow 

The system guarantees that sensitive institutional state mutations are never executed unilaterally. 

- **DRAFT:** Initial payload created by a Maker (Member). Invisible to the global system. 

- **REVIEW_POOL:** Payload is locked from further editing by the Maker and routed to the Checker (Head). 

- **APPROVED (LOCKED):** Checker executes approval. Payload becomes globally visible and immutable. 

- **REJECTED:** Payload returned to the Maker. 

#### 5.2 Anti-Collusion Constraint 

- **`Maker UUID ≠ Checker UUID`** 

- The engine explicitly forbids the same user from acting as both the Maker and the Checker on a single payload, regardless of their Effective Access overrides. A Head cannot approve their own drafts. 

## Phase 3: Functional Requirements (FR) 

### Overview 

This document translates the workflows, portal limits, and governance constraints established in Phases 1 and 2 into formal, verifiable Functional Requirements (FRs). These requirements serve as the definitive criteria for system validation. The document encompasses approximately 80 requirements across 17 institutional domains. 

### 1. Identity & Governance (FR-GOV) 

- **FR-GOV-001 [Registry Maintenance]:** The system currently maintains physically separate database registries for Staff, Teachers, Students, and Parents. 

- **FR-GOV-002 [Admin Provisioning]:** The system shall require manual provisioning to link a digital `Admin Account` credential to a physical `Staff` registry record. 

Page 78 

EduDash – School ERP Management System 

- **FR-GOV-003 [Effective Access]:** The system shall resolve an Admin's module access dynamically by summing their `Department Owned Modules` and any `Manual Overrides` granted by the Super Admin. 

- **FR-GOV-004 [Override Visibility]:** The system shall ensure that `Manual Overrides` grant visibility and creation capabilities, but never grant `Approval` or `Publish` authority. 

- **FR-GOV-005 [Department Head Authority]:** The system shall restrict the `Approve`, `Publish`, and `Delete` actions exclusively to the `Department Head` of the module's owning department. 

- **FR-GOV-006 [Department Member Editing]:** The system shall allow Department Members to Create (Draft), Edit, and View records within their assigned modules. 

- **FR-GOV-007 [Department Member Constraint - No Approve]:** Department Members shall not be able to execute approval actions on any governance records. 

- **FR-GOV-008 [Department Member Constraint - No Publish]:** Department Members shall not be able to execute publish actions. 

- **FR-GOV-009 [Department Member Constraint - No Delete]:** Department Members shall not be able to execute hard-delete operations on governance records. 

- **FR-GOV-010 [Anti-Collusion]:** The system shall explicitly prevent the UUID that authored a `DRAFT` payload from acting as the `Checker` (Approver) for that same payload. 

- **FR-GOV-011 [Super Admin Constraint]:** The system shall prevent the deletion of the foundational `SUPER_ADMIN` account. 

### 2. Student Management (FR-STU) 

- **FR-STU-001 [Registry Creation]:** The system shall allow Admissions Admins to create new Student profile records including demographics. 

- **FR-STU-002 [Class Assignment]:** The system shall allow Admins to assign a Student to a specific active Class cohort. 

- **FR-STU-003 [Parent Linkage]:** The system shall strictly enforce linking a Student UUID to at least one valid Parent UUID. 

- **FR-STU-004 [Profile Isolation]:** The system shall ensure Students can only view their own demographic data. 

### 3. Teacher Management (FR-TCH) 

- **FR-TCH-001 [Registry Creation]:** The system shall allow Academic Admins to create new Teacher profile records. 

- **FR-TCH-002 [Subject Specialization]:** The system shall allow Admins to assign subject specializations to a Teacher record. 

- **FR-TCH-003 [Class Allocation]:** The system shall map Teachers to specific Classes based on the Timetable definitions. 

### 4. Parent Management (FR-PAR) 

- **FR-PAR-001 [Registry Creation]:** The system shall allow Admissions Admins to create Parent profile records. 

- **FR-PAR-002 [Child Linkage Enforcement]:** The system shall automatically aggregate data for all Student UUIDs linked to a specific Parent UUID. 

Page 79 

EduDash – School ERP Management System 

- **FR-PAR-003 [Multi-Child Context Switch]:** The system shall provide a UI context switcher for Parents linked to multiple enrolled Students. 

### 5. Academic Logistics (FR-ACA) 

- **FR-ACA-001 [Class Mapping]:** The system shall allow Academic Admins to create Class cohorts and associate an array of mandatory Subjects to them. 

- **FR-ACA-002 [Teacher Assignment]:** The system shall allow Academic Admins to assign a specific Teacher UUID to a Subject within a Class cohort. 

- **FR-ACA-003 [Timetable Generation]:** The system shall allow Academic Admins to map a Subject and Teacher to a specific Time Slot on a specific Day. 

- **FR-ACA-004 [Timetable Conflict Check]:** The system shall reject the generation of a Timetable slot if the assigned Teacher is already mapped to a different Class at that exact Time Slot. 

- **FR-ACA-005 [Workload Aggregation]:** The system shall calculate and display a Teacher's total assigned weekly periods. 

### 6. Attendance Management (FR-ATT) 

- **FR-ATT-001 [Teacher Roster Limit]:** The system shall restrict Teachers to viewing and marking attendance only for the Class/Period currently assigned to them in the Timetable. 

- **FR-ATT-002 [Future Date Lock]:** The system shall prevent the submission of attendance records for future dates. 

- **FR-ATT-003 [Admin Override]:** The system shall allow Operations Admins to permanently override a Teacher's submitted attendance record. 

- **FR-ATT-004 [Approved Leave Sync]:** The system shall automatically reflect formally approved student leave dates on the Teacher's daily attendance roster to prevent unexcused absences. 

### 7. Assignments & Homework (FR-HWK) 

- **FR-HWK-001 [Assignment Creation]:** The system shall allow a Teacher to create an Assignment with attachments and a specific Due Date. 

- **FR-HWK-002 [Student Submission]:** The system shall allow Students to upload digital files against an active Assignment. 

- **FR-HWK-003 [Late Flagging]:** The system shall automatically append a "LATE" status flag to any Student submission uploaded after the specified Due Date. 

- **FR-HWK-004 [Immutable Grades]:** The system shall explicitly lock a Student's submission file from deletion or replacement once the Teacher has committed a Grade. 

- **FR-HWK-005 [Parent Monitor]:** The system shall allow Parents to view the Grade and Submission Status of assignments assigned to their linked child. 

### 8. Examinations & Results (FR-EXM) 

- **FR-EXM-001 [Question Paper Drafting]:** The system shall allow Teachers to author Draft Question Papers containing varied question types and mark weights. 

- **FR-EXM-002 [Maker-Checker Exams]:** The system shall require a Draft Question Paper to be explicitly Approved (Locked) by an Academic Department Head before it is considered finalized. 

Page 80 

EduDash – School ERP Management System 

- **FR-EXM-003 [Grading Windows]:** The system shall allow Teachers to input raw examination marks against their assigned students only while the Admin-configured "Grading Window" is active. 

- **FR-EXM-004 [Publishing Results]:** The system shall allow Examination Admins to globally transition an Exam Term to a "Published" state. 

- **FR-EXM-005 [Absolute Result Isolation]:** The system shall reject any request from the Student or Parent portals to fetch examination results unless the parent Exam Term is explicitly marked as "Published". 

### 9. Leave Management (FR-LVM) 

- **FR-LVM-001 [Request Creation]:** The system shall allow Teachers and Students to submit Leave Requests containing date ranges and optional file proofs. 

- **FR-LVM-002 [Parent Monitoring]:** The system shall allow Parents to view the approval status of Leave Requests submitted by their linked child. 

- **FR-LVM-003 [Teacher Approval Routing]:** The system shall route Teacher Leave Requests exclusively to the HR Department Head for execution. 

- **FR-LVM-004 [Student Approval Routing]:** The system shall route Student Leave Requests to the Operations Department or Academic Department for execution. 

### 10. Institutional Communication (FR-COM) 

- **FR-COM-001 [Broadcast Creation]:** The system shall allow Operations Admins to draft and publish rich-text Notices. 

- **FR-COM-002 [Audience Scoping]:** The system shall allow the Notice creator to scope visibility to specific Base Identities (All, Teachers, Students, Parents). 

- **FR-COM-003 [Read-Only Consumption]:** The system shall restrict Students and Parents to readonly consumption of the Noticeboard. 

- **FR-COM-004 [Audience Selector Validation]:** The system shall prevent the publication of a notice if no valid target audience is selected. 

- **FR-COM-005 [Notice Audience Isolation]:** The system shall ensure a payload strictly limits notice retrieval based on the authenticated user's Base Identity. 

- **FR-COM-006 [Communication Audit Logging]:** The system shall record the author UUID and timestamp for every published notice. 

### 11. Support Center (FR-SUP) 

- **FR-SUP-001 [Create Ticket]:** The system shall allow Students and Parents to create Support Tickets containing a Title, Description, and Priority. 

- **FR-SUP-002 [Update Ticket Status]:** The system shall allow Operations Admins to update a ticket's status (Open, In Progress, Closed). 

- **FR-SUP-003 [Ticket Visibility Isolation]:** The system shall strictly isolate tickets so consumers can only view tickets authored by their own UUID. 

- **FR-SUP-004 [Admin Resolution Workflow]:** The system shall allow Operations Admins to append resolution notes/replies to an active ticket. 

Page 81 

EduDash – School ERP Management System 

### 12. Fee Management (FR-FEE) 

- **FR-FEE-001 [Ledger Definition]:** The system shall allow Finance Admins to define standard fee structures and apply them to Student ledgers. 

- **FR-FEE-002 [Offline Payment Logging]:** The system shall allow Finance Admins to manually log offline payments against a specific Student's ledger. 

- **FR-FEE-003 [Student Visibility]:** The system shall allow Students to view their outstanding balances and payment history in a read-only state. 

- **FR-FEE-004 [Parent Visibility]:** The system shall allow Parents to view the financial ledgers for their explicitly linked children. 

### 13. Transport Management (FR-TRN) 

- **FR-TRN-001 [Route Definition]:** The system shall allow Logistics Admins to define Bus Routes including stops and timings. 

- **FR-TRN-002 [Student Allocation]:** The system shall allow Logistics Admins to allocate a Student UUID to a specific Transport Route. 

- **FR-TRN-003 [Visibility Isolation]:** The system shall allow Students and Parents to view only their explicitly assigned Transport Route. 

### 14. Document Center (FR-DOC) 

- **FR-DOC-001 [Vault Storage]:** The system shall allow Admins to upload institutional documents to a centralized vault. 

- **FR-DOC-002 [Category Folders]:** The system shall support categorizing documents into distinct folders. 

- **FR-DOC-003 [Access Constraints]:** The system shall limit document viewing access based on the logged-in user's role and Effective Access. 

### 15. Analytics & Reporting (FR-ANL) 

- **FR-ANL-001 [Institutional Dashboards]:** The system shall provide Super Admins and Executive Admins with aggregate, cross-departmental analytics. 

- **FR-ANL-002 [Teacher Class Stats]:** The system shall restrict Teacher analytical dashboards to statistics strictly derived from their assigned class cohorts. 

### 16. Extracurriculars & Duties (FR-EXT) 

- **FR-EXT-001 [Club Creation]:** The system shall allow Student Affairs Admins to define Clubs and assign a Teacher as the Coordinator. 

- **FR-EXT-002 [Club Roster Constraint]:** The system shall grant the Teacher Coordinator execution capabilities strictly limited to the roster of students enrolled in that specific Club. 

- **FR-EXT-003 [Student Duty Assignment]:** The system shall allow Teachers and Admins to assign specific Duty records to a Student UUID. 

- **FR-EXT-004 [Duty Acknowledgment]:** The system shall allow Students to click an "Acknowledge" boolean on Duties assigned to them. 

Page 82 

EduDash – School ERP Management System 

### 17. Planned / Future Requirements (FR-FUTURE) 

_Functionality that is architecturally planned but not fully implemented in the current codebase._ 

- **FR-FUTURE-GOV-001 [Unified Staff Identity Consolidation]:** The system shall eventually consolidate separate Teacher and Staff records into a unified physical identity model (Phase 12.3 architectural roadmap). 

- **FR-FUTURE-GOV-002 [Teacher Overlay Administrative Access]:** The system shall support explicitly overlaying an Admin credential onto a Teacher identity. 

- **FR-FUTURE-ATT-001 [24-Hour Submission Lock]:** The system shall automatically lock Teacher attendance modification 24 hours after the scheduled period concludes. 

- **FR-FUTURE-FEE-001 [Digital Payment Gateway]:** The system shall support executing real-time digital payments via the Parent Portal. 

- **FR-FUTURE-COM-001 [Scheduled Notice Support]:** The system shall allow Admins to draft a notice and set a future timestamp for automated publishing. 

## Phase 4: Use Cases (UC) 

### Overview 

This document outlines the core functional interactions between Actors and the EduDash system. These use cases emphasize the Governance "Maker-Checker" workflows, absolute data isolation constraints, and the proxy nature of the Student and Parent portals defined in previous phases. 

### 1. Governance & Access 

#### UC-GOV-001: Manual Effective Access Override 

- **Primary Actor:** Super Admin 

- **Description:** The Super Admin grants specific module access to an Admin outside their normal Department Ownership. 

- **Preconditions:** The target user must possess an active `Admin Account`. 

- **Main Success Scenario:** 1. Super Admin navigates to the System Administration matrix. 2. Super Admin selects an Admin assigned to the Operations Department. 3. Super Admin toggles an explicit override granting access to "Fee Management". 4. System saves the override to the target user's identity payload. 5. Target Admin logs in; the Effective Access engine resolves the override and renders the Fee Management module on their sidebar. 

- **Alternative Flow (Visibility Constraint):** - The target Admin navigates to the Fee Management module but is prevented from executing `Delete` or `Approve` actions, as the override only grants visibility and drafting capabilities. 

### 2. Maker-Checker Workflows 

#### UC-MAK-001: Employee Leave Approval 

Page 83 

EduDash – School ERP Management System 

- **Primary Actor:** Teacher (Maker) 

- **Secondary Actor:** HR Department Head (Checker) 

- **Description:** A Teacher formally requests time off, which must be approved by Governance. 

- **Preconditions:** The Teacher is logged into the Teacher Portal. 

- **Main Success Scenario:** 1. Teacher navigates to Leave Management and drafts a Leave Request (Date range, reason). 2. Teacher submits the request. The payload state becomes `REVIEW_POOL` (Pending). 3. HR Department Head logs into the Admin Portal and views the Leave Approval queue. 4. HR Department Head selects the pending request and clicks "Approve". 5. Payload state transitions to `APPROVED (LOCKED)`. 6. The approved dates automatically sync to the global Attendance engine to prevent unexcused absence markings. 

- **Alternative Flow (Rejection):** - At Step 4, the Head clicks "Reject". The payload transitions to `REJECTED` and returns to the Teacher for modification or closure. 

#### UC-MAK-002: Question Paper Drafting & Publishing 

- **Primary Actor:** Teacher (Maker) 

- **Secondary Actor:** Academic Department Head (Checker) 

- **Description:** A Teacher creates an exam paper that must be audited before it is finalized. 

- **Preconditions:** An active Examination Term exists. 

- **Main Success Scenario:** 1. Teacher creates a Draft Question Paper, adding questions and mark schemes. 2. Teacher submits the draft. The payload leaves the Teacher's active edit view and enters the `REVIEW_POOL`. 3. Academic Department Head views the draft queue. 4. Academic Department Head verifies the questions and clicks "Publish & Lock". 5. The paper becomes immutable and available for the upcoming Examination event. 

- **Alternative Flow (Anti-Collusion Block):** - If the Academic Department Head drafts a paper for a class they personally teach, the system explicitly prevents them from clicking "Publish & Lock" on their own payload. A different Head or Super Admin must execute the lock. 

### 3. Academic Execution 

#### UC-ACA-001: Daily Attendance Submission 

- **Primary Actor:** Teacher 

- **Description:** A Teacher records the physical presence of their assigned class cohort. 

- **Preconditions:** The Teacher is assigned to the specific Class/Period in the Timetable. 

- **Main Success Scenario:** 1. Teacher accesses the Attendance roster for their current period. 2. Teacher toggles specific students to "Absent" or "Late" (default is Present). 3. Teacher clicks "Submit Register". 

   4. System records the data with a server timestamp. 

- **Alternative Flow (Admin Override):** - If 24 hours have passed (Proposed Engine Rule), or if a parent disputes an absence, an Operations Admin navigates to the Attendance module and permanently overrides the Teacher's log. 

#### UC-ACA-002: Assignment Distribution & Grading 

- **Primary Actor:** Teacher 

- **Secondary Actor:** Student 

- **Description:** Digital distribution, collection, and grading of homework. 

Page 84 

EduDash – School ERP Management System 

- **Main Success Scenario:** 1. Teacher creates an Assignment with a strictly defined Due Date. 2. Assignment appears on the Student's Kanban/List board. 3. Student uploads a file and clicks "Submit" before the Due Date. 4. Teacher reviews the submitted file and inputs a Grade. 5. Student file is locked; Student views the finalized grade. 

- **Alternative Flow (Late Submission):** - At Step 3, if the Student submits the file after the specified Due Date, the system automatically flags the submission as "LATE" for the Teacher's review. 

#### UC-ACA-003: Examination Results Publishing 

- **Primary Actor:** Teacher 

- **Secondary Actor:** Examination Admin, Student (Consumer) 

- **Description:** The absolute isolation of raw marks until global publication. 

- **Main Success Scenario:** 1. Teacher logs into the Teacher Portal during an active "Grading Window". 2. Teacher inputs raw marks for all students in their assigned class and clicks Save. 3. Students navigating to the Results viewer see `No Data Available`. 4. Examination Admin logs into the Admin Portal and transitions the Exam Term to `PUBLISHED`. 5. Students log in and successfully view their finalized, generated Report Cards. 

### 4. Institutional Operations 

#### UC-OPS-001: Support Ticket Resolution 

- **Primary Actor:** Parent (Requester) 

- **Secondary Actor:** Operations Admin (Resolver) 

- **Description:** Resolving a logistical inquiry securely. 

- **Main Success Scenario:** 1. Parent creates a Support Ticket (e.g., "Bus Route 4 Delayed") from the Parent Portal. 2. Ticket enters the Admin Support queue. 3. Operations Admin views the ticket, adds a resolution reply, and transitions the state to `CLOSED`. 4. Parent views the resolution reply. 

- **Alternative Flow (Visibility Isolation):** - A different Parent attempts to view the ticket via direct URL manipulation; the system rejects the request (`403 Forbidden`) as their UUID does not match the ticket author UUID. 

#### UC-OPS-002: Notice Broadcast with Audience Isolation 

- **Primary Actor:** Operations Admin 

- **Secondary Actor:** Teacher, Parent 

- **Description:** Broadcasting targeted alerts. 

- **Main Success Scenario:** 1. Operations Admin creates a rich-text Notice and selects `Parents Only` as the target audience. 2. Admin clicks Publish. 3. A logged-in Parent refreshes their Noticeboard and successfully views the Notice. 4. A logged-in Teacher refreshes their Noticeboard; the Notice does not appear, as their Base Identity does not match the audience payload. 

## Phase 5: Business Rules (BR) 

### Overview 

Page 85 

EduDash – School ERP Management System 

Business Rules dictate the unbreachable logical constraints, validation boundaries, and state transition requirements of the EduDash system. While Functional Requirements (FRs) define _what_ the system does, Business Rules (BRs) define the _absolute conditions_ under which those actions are considered valid. 

### 1. Governance & Identity Rules 

- **BR-GOV-001 [Anti-Collusion Enforcer]:** If the UUID of the authenticated user attempting to execute an `Approve`, `Lock`, or `Publish` action matches the `author_uuid` of the target payload, the system must abort the transaction and return a `403 Forbidden` exception, regardless of the user's Effective Access or Department Head status. 

- **BR-GOV-002 [Effective Access Resolution Priority]:** During runtime authorization, Explicit Overrides granted by a `SUPER_ADMIN` take absolute precedence over standard Department module ownership arrays. 

- **BR-GOV-003 [Immutable Super Admin]:** If a transaction attempts to modify the role, suspend, or delete an identity payload containing the immutable `is_super_admin: true` flag, the transaction must be aborted. 

- **BR-GOV-004 [Override Capability Boundary]:** If a user accesses a module solely via an Explicit Override, the UI and API must explicitly strip the `Approve`, `Delete`, and `Publish` execution vectors from that user's session payload. 

### 2. Academic & Scheduling Constraints 

- **BR-ACA-001 [Timetable Collision Matrix]:** The scheduling engine must reject any payload attempting to assign a `Teacher UUID` to a `Time Slot ID` if that Teacher is already mapped to a different `Class UUID` for that exact same `Time Slot ID`. 

- **BR-ACA-002 [Class Syllabus Prerequisite]:** A Timetable cannot be generated for a Class cohort unless an active `Subject Array` has been explicitly mapped to that Class. 

- **BR-ACA-003 [Teacher Boundary Isolation]:** A Teacher's dashboard must strictly filter academic datasets (Students, Subjects, Timetables) so that it only returns records explicitly joined to the Teacher's UUID in the global Timetable registry. 

### 3. Operations & Logistics 

- **BR-ATT-001 [Future Attendance Prevention]:** If a Teacher attempts to submit an attendance payload where the `target_date` is greater than the current server timestamp, the system must reject the payload. 

- **BR-ATT-002 [24-Hour Immutability Lock (PROPOSED)]:** If the elapsed time since the scheduled completion of an academic period exceeds 24 hours, the attendance payload for that period becomes immutable to the Teacher and requires an Operations Admin override. 

- **BR-ATT-003 [Approved Leave Supremacy]:** If a student possesses an `APPROVED` Leave Request spanning a specific date range, the Attendance engine must automatically mark the student as "Excused" for those dates, overriding any conflicting manual input from a Teacher. 

- **BR-LVM-001 [Minor Counter-Signature (PLANNED)]:** If a Student flagged as a minor submits a Leave Request, the payload state must transition to `PENDING_PARENTAL_CONSENT` and await a parent's cryptographic approval before entering the Admin `REVIEW_POOL`. 

Page 86 

EduDash – School ERP Management System 

### 4. Academic Evaluation Rules 

- **BR-HWK-001 [Due Date Adherence]:** If a Student's assignment file upload timestamp is greater than the parent Assignment's `due_date` timestamp, the system must permanently append a `LATE` boolean flag to the submission record. 

- **BR-HWK-002 [Grade Immutability Lock]:** Once a Teacher executes a `POST` or `PATCH` committing a grade payload to a Student's assignment submission, the Student's file payload is permanently locked against deletion, modification, or replacement. 

- **BR-EXM-001 [Strict Results Isolation]:** If an API request to fetch student marks originates from a `STUDENT` or `PARENT` base identity, the backend must return a `403/404` exception if the parent Examination Term's `is_published` flag is set to `false`. 

- **BR-EXM-002 [Grading Window Enforcement]:** Teachers can only mutate raw mark payloads if the active Examination Term's `grading_window_status` is `OPEN`. 

### 5. System Communications & Support 

- **BR-COM-001 [Audience Target Validation]:** The Communication engine must abort any Notice broadcast transaction if the `audience_array` payload is empty or contains an invalid Base Identity enum. 

- **BR-SUP-001 [Support Ticket Isolation]:** The Support Center querying engine must append a `WHERE author_uuid = [current_user_uuid]` clause to all fetch requests originating from a `STUDENT` or `PARENT` identity to prevent cross-tenant data leakage. 

## Phase 6: Data Model Specification 

### Overview 

This phase details the definitive architectural blueprint for the system's database schema. It maps directly to the Governance model and Functional Requirements established in prior phases. Every entity documents its lifecycle, relational boundaries, and Maker-Checker ownership constraints. 

### Part A: Core Identity & Governance Domain 

#### 1. Admin Account 

- **Purpose:** Represents the digital execution credential granted to governance actors. 

- **Attributes:** `uuid`, `staff_id` (foreign key), `base_role` (`ADMIN`, `SUPER_ADMIN`), `department_id`, `explicit_overrides` (array of module enums), `is_active` (boolean). 

- **Relationships:** 1:1 to `Staff`, M:1 to `Department`. 

- **Constraints:** Must be strictly tied to a physical Staff record. `SUPER_ADMIN` cannot be deleted. 

- **Ownership:** System Operations. 

- **Lifecycle:** Provisioned → Active → Revoked. 

- **Future API Contract:** `GET /api/v1/admins/me` returns the calculated Effective Access payload. 

#### 2. Staff 

- **Purpose:** Represents the physical employee record (HR registry) independent of system access. 

Page 87 

EduDash – School ERP Management System 

- **Attributes:** `uuid`, `first_name`, `last_name`, `job_title`, `contact_info`, `employment_status`. 

- **Relationships:** 1:0..1 to `Admin Account`. 

- **Constraints:** `employment_status` must be `ACTIVE` for an overlaid `Admin Account` to function. 

- **Ownership:** Human Resources Department. 

- **Lifecycle:** Onboarded → Active → Offboarded / Terminated. 

- **Future API Contract:** `GET /api/v1/staff` fetches aggregate HR demographic rosters. 

#### 3. Department 

- **Purpose:** The fundamental module-owning unit of the Governance Engine. 

- **Attributes:** `uuid`, `department_name`, `department_code`, `head_admin_id` (foreign key), `owned_modules` (array of enums). 

- **Relationships:** 1:1 to `Admin Account` (Head), 1:M to `Admin Accounts` (Members). 

- **Constraints:** Cannot enter `ACTIVE` state without exactly one assigned `Head`. 

- **Ownership:** System Operations / HR. 

- **Lifecycle:** Draft → Active → Archived. 

- **Future API Contract:** `PATCH /api/v1/departments/{id}` validates `head_admin_id` against the active Staff roster. 

#### 4. Teacher 

- **Purpose:** Represents the academic execution staff assigned to Class cohorts. 

- **Attributes:** `uuid`, `first_name`, `last_name`, `subject_specializations` (array). 

- **Relationships:** 1:0..1 to `Admin Account` (Overlay), M:N to `Classes`, M:N to `Subjects`. 

- **Constraints:** Cannot execute governance mutations unless explicitly overlaid with an `Admin Account`. 

- **Ownership:** Academic Department. 

- **Lifecycle:** Active → Offboarded. 

- **Future API Contract:** `GET /api/v1/teachers/me/schedule` scopes fetching solely to assigned classes. 

### Part B: Consumer Identity Domain 

#### 5. Student 

- **Purpose:** To record demographic and enrollment state of an institutional consumer. 

- **Attributes:** `uuid`, `first_name`, `last_name`, `dob`, `class_id`, `parent_ids` (array), `is_minor` (boolean). 

- **Relationships:** M:1 to `Class`, M:N to `Parents`, 1:M to `Results`, 1:M to `Leave Requests`. 

- **Constraints:** Must be mapped to exactly one active `Class` per academic session. Must link to at least one valid `Parent`. 

- **Ownership:** Admissions Department. 

- **Lifecycle:** Enrolled → Active → Graduated / Suspended. 

- **Future API Contract:** `GET /api/v1/students/{uuid}` returns aggregate demographic and class context. 

Page 88 

EduDash – School ERP Management System 

#### 6. Parent 

- **Purpose:** Represents the legal guardian or financial sponsor of a Student. 

- **Attributes:** `uuid`, `first_name`, `last_name`, `contact_info`, `linked_student_ids` (array). 

- **Relationships:** M:N to `Students`. 

- **Constraints:** Parents execute zero direct institutional writes. 

- **Ownership:** Admissions Department. 

- **Lifecycle:** Active → Archived (when all linked students graduate). 

- **Future API Contract:** `GET /api/v1/parents/me/children` fetches linked proxy data. 

### Part C: Academic Execution Domain 

#### 7. Assignment 

- **Purpose:** To manage digital homework distribution and grade logging. 

- **Attributes:** `uuid`, `teacher_id`, `class_id`, `subject_id`, `title`, `description`, `due_date`, `max_score`. 

- **Relationships:** M:1 to `Class`, 1:M to `Submissions`. 

- **Constraints:** Cannot be modified by the Teacher after `due_date` has elapsed. 

- **Ownership:** Academic Department. 

- **Lifecycle:** Draft → Published → Closed (Grading). 

- **Future API Contract:** `POST /api/v1/assignments` requires validation that the `teacher_id` matches the `class_id` in the timetable. 

#### 8. Exam (Question Paper) 

- **Purpose:** To define summative assessment structures enforcing the Maker-Checker paradigm. 

- **Attributes:** `uuid`, `term_name`, `subject_id`, `author_teacher_id`, `checker_admin_id`, `status` (`DRAFT`, `REVIEW_POOL`, `APPROVED`). 

- **Relationships:** M:1 to `Subject`, 1:M to `Results`. 

- **Constraints:** `checker_admin_id` cannot equal `author_teacher_id` (Anti-Collusion). 

- **Ownership:** Examinations Department. 

- **Lifecycle:** Draft → Review Pool → Approved (Locked). 

- **Future API Contract:** `PATCH /api/v1/exams/{id}/approve` strictly requires Department Head Effective Access. 

#### 9. Result (Ledger) 

- **Purpose:** To persist graded summative marks for a specific student. 

- **Attributes:** `uuid`, `exam_id`, `student_id`, `marks_obtained`, `teacher_remarks`, `is_published` (boolean). 

- **Relationships:** M:1 to `Exam`, M:1 to `Student`. 

- **Constraints:** Mutating the payload is restricted to the active grading window. Read access by consumers is blocked until `is_published == true`. 

- **Ownership:** Examinations Department. 

- **Lifecycle:** Pending → Graded → Published. 

Page 89 

EduDash – School ERP Management System 

- **Future API Contract:** `GET /api/v1/results` filters output strictly based on the `is_published` global state. 

#### 10. Attendance 

- **Purpose:** To track the physical presence log of a cohort. 

- **Attributes:** `uuid`, `class_id`, `date`, `teacher_id`, `records` (array of student statuses). 

- **Relationships:** M:1 to `Class`. 

- **Constraints:** `date` cannot be in the future. Modifications lock 24 hours post-submission. 

- **Ownership:** Operations Department. 

- **Lifecycle:** Unmarked → Submitted → Locked (Admin Override Only). 

- **Future API Contract:** `POST /api/v1/attendance` overrides manual input if overlapping approved student leave exists. 

### Part D: Operations & Logistics Domain 

#### 11. Leave Request 

- **Purpose:** To route formal absence requests through the governance approval pipeline. 

- **Attributes:** `uuid`, `requester_id`, `requester_role`, `start_date`, `end_date`, `reason_text`, `status` (`PENDING`, `APPROVED`, `REJECTED`). 

- **Relationships:** M:1 to `Requester UUID` (Teacher/Student/Admin). 

- **Constraints:** Execution is restricted to the owning Department Head. Minor students require parental counter-approval state transition. 

- **Ownership:** HR Department (Staff/Teacher) / Student Affairs (Student). 

- **Lifecycle:** Pending → (Pending Parent) → Approved / Rejected. 

- **Future API Contract:** `PATCH /api/v1/leave/{id}/approve` enforces Department Head check. 

#### 12. Notice (Broadcast) 

- **Purpose:** To distribute target-scoped rich text alerts. 

- **Attributes:** `uuid`, `author_id`, `title`, `content_body`, `target_audience` (enum: `ALL`, `PARENTS`, `STUDENTS`, `TEACHERS`). 

- **Relationships:** None (Global Broadcast). 

- **Constraints:** Must have a valid target audience. Consumers have read-only access. 

- **Ownership:** Communications / Operations Department. 

- **Lifecycle:** Draft → Published → Archived. 

- **Future API Contract:** `GET /api/v1/notices` dynamically filters payload based on requester's Base Identity. 

#### 13. Support Ticket (Event / Inquiry) 

- **Purpose:** To log logistical or technical issues securely. 

- **Attributes:** `uuid`, `author_id`, `priority`, `issue_description`, `resolution_notes`, `status` (`OPEN`, `CLOSED`). 

- **Relationships:** M:1 to `Author UUID`. 

- **Constraints:** Read access is strictly isolated to `author_id` and Operations Admins. 

Page 90 

EduDash – School ERP Management System 

- **Ownership:** Operations Department. 

- **Lifecycle:** Open → In Progress → Closed. 

- **Future API Contract:** `GET /api/v1/support` appends strict `WHERE author_id` clauses for consumer requests. 

### Part E: Financial & Transport Domain 

#### 14. Fee Ledger 

- **Purpose:** To track outstanding and fulfilled financial obligations. 

- **Attributes:** `uuid`, `student_id`, `fee_type`, `amount_due`, `amount_paid`, `due_date`. 

- **Relationships:** 1:1 or M:1 to `Student`. 

- **Constraints:** Parents/Students possess purely read-only visibility. Alterations restricted to Finance Admins. 

- **Ownership:** Finance Department. 

- **Lifecycle:** Invoiced → Partially Paid → Cleared. 

- **Future API Contract:** Will expose Webhook endpoints for future Digital Gateway (Stripe/Razorpay) integrations. 

#### 15. Transport Route 

- **Purpose:** To define static logistical bus routing points. 

- **Attributes:** `uuid`, `route_name`, `stops` (array of locations/times), `assigned_vehicle_id`. 

- **Relationships:** 1:1 to `Vehicle`, 1:M to `Students`. 

- **Constraints:** None. 

- **Ownership:** Operations / Logistics Department. 

- **Lifecycle:** Active → Suspended. 

- **Future API Contract:** Static read endpoints for Parent/Student dashboards. 

#### 16. Vehicle 

- **Purpose:** To track the physical fleet assets of the institution. 

- **Attributes:** `uuid`, `registration_number`, `capacity`, `driver_staff_id`. 

- **Relationships:** 1:1 to `Staff` (Driver), 1:M to `Transport Route`. 

- **Constraints:** Cannot be assigned a route if `capacity` is exceeded by mapped students. 

- **Ownership:** Operations / Logistics Department. 

- **Lifecycle:** Active → Maintenance → Retired. 

- **Future API Contract:** Administrative CRUD via Operations module. 

Page 91 

EduDash – School ERP Management System 

### Part F: Extracurricular Domain 

#### 17. Club 

- **Purpose:** To group students for extracurricular activities under a Teacher. 

- **Attributes:** `uuid`, `club_name`, `coordinator_teacher_id`, `enrolled_student_ids` (array). 

- **Relationships:** M:1 to `Teacher`, M:N to `Students`. 

- **Constraints:** Students cannot self-enroll; must be mapped by Admin. 

- **Ownership:** Student Affairs Department. 

- **Lifecycle:** Active → Disbanded. 

- **Future API Contract:** `GET /api/v1/clubs/{id}` grants execution access only if the requester matches `coordinator_teacher_id`. 

#### 18. Committee 

- **Purpose:** Administrative groupings for institutional governance or parent interaction (PTA). 

- **Attributes:** `uuid`, `committee_name`, `member_ids` (array of Parents/Teachers/Admins). 

- **Relationships:** M:N to `Base Identities`. 

- **Constraints:** purely structural organizational unit. 

- **Ownership:** Governance / Executive Administration. 

- **Lifecycle:** Active → Dissolved. 

- **Future API Contract:** Static relational mappings. 

## Phase 7: Security & Non-Functional Requirements (NFR) 

### Overview 

This phase outlines the rigid security boundaries and technical performance characteristics of the EduDash system. It formalizes how the system protects data, ensures high availability, and maintains accessibility across its diverse user base. 

### 1. Security Architecture 

#### 1.1 Authentication 

- **SEC-001 [Identity Verification]:** The system shall rely on an Identity Provider Agnostic Authentication mechanism to verify user credentials before issuing secure authenticated session credentials. 

- **SEC-002 [Session Management]:** The system shall securely store the active session state within secure browser session storage, automatically invalidating the session upon explicit logout or credential expiration. 

#### 1.2 Authorization & Effective Access 

- **SEC-003 [Effective Access Engine]:** The system shall calculate all execution capabilities strictly at runtime using the formula: `Effective Access = [Department Owned Modules] + [Manual Overrides]`. 

Page 92 

EduDash – School ERP Management System 

- **SEC-004 [Route Guards]:** The React frontend shall implement strict Route Guards (`AdminRouteGuard`, `TeacherRouteGuard`, etc.) that intercept unauthenticated or unauthorized navigation attempts, redirecting the user to a `403 Forbidden` or `Login` page. 

- **SEC-005 [Maker-Checker Anti-Collusion]:** The authorization engine shall explicitly forbid any `Checker` from executing an `Approve` or `Publish` action if their UUID matches the `author_uuid` of the target payload. 

- **SEC-010 [Department Head Authority Enforcement]:** The authorization engine must verify that the requesting user holds explicit `Department Head` status over the target module before allowing any `Approve`, `Publish`, or `Delete` transaction. 

- **SEC-011 [Manual Override Boundary Enforcement]:** Explicit manual overrides strictly grant module visibility and drafting rights; they never automatically grant Approval Authority. 

#### 1.3 Data Isolation 

- **SEC-006 [Consumer Isolation]:** The system shall enforce strict data isolation for `STUDENT` and `PARENT` identities. Query payloads must automatically append strict `WHERE author_id = [current_uuid]` or `WHERE linked_student_id = [current_uuid]` filters. 

- **SEC-007 [Teacher Roster Isolation]:** The system shall limit Teacher queries strictly to the students, classes, and subjects explicitly mapped to the Teacher's UUID within the Timetable. 

#### 1.4 Audit & Compliance 

- **SEC-008 [Audit Logging]:** The system shall append an `author_uuid` and `created_timestamp` to every significant institutional state mutation (e.g., creating a leave request, approving an exam, logging a fee payment). 

- **SEC-009 [Immutable Ledgers]:** Financial ledgers and approved academic marks shall be treated as immutable ledgers. Alterations must generate a distinct correction log rather than silently overwriting previous entries. 

- **SEC-012 [Immutable Audit Trail]:** Audit records and critical historical payloads cannot be hard deleted from the database under any circumstances. 

### 2. Non-Functional Requirements (NFR) 

#### 2.1 Performance 

- **NFR-001 [Response Time]:** The system shall load dashboard interfaces and execute standard API queries in under 1,500 milliseconds under normal operating conditions. 

- **NFR-002 [Lazy Loading]:** The frontend architecture shall implement code splitting and lazy loading for heavy analytical components (e.g., Recharts dashboards) to minimize initial bundle size and accelerate time-to-interactive (TTI). 

#### 2.2 Scalability & Availability 

- **NFR-003 [Scalable Backend Architecture]:** The system shall utilize a scalable backend architecture (e.g., Node.js, FastAPI, PostgreSQL, or Cloud Database) capable of automatically handling traffic spikes during peak academic events (e.g., Results Publishing day). 

- **NFR-004 [Uptime]:** The core institutional portals shall target a 99.9% uptime, leveraging global Content Delivery Networks (CDNs) for static asset distribution. 

#### 2.3 Maintainability & Future Readiness 

Page 93 

EduDash – School ERP Management System 

- **NFR-005 [Service Layer Abstraction]:** The codebase shall maintain a strict Service Layer architecture (e.g., `src/services/`). UI Components shall never execute direct database queries, ensuring frictionless migration to the future API provider backend in Phase 12 of the roadmap. 

- **NFR-006 [Component Reusability]:** The UI shall be built utilizing modular, reusable React components to enforce design consistency and reduce technical debt. 

#### 2.4 Accessibility & Localization 

- **NFR-007 [WCAG Compliance]:** The system shall aim to adhere to WCAG 2.1 AA standards, utilizing semantic HTML and appropriate ARIA attributes to support visually impaired users utilizing screen readers. 

- **NFR-008 [Multi-Language Support]:** The system shall utilize a centralized `LanguageContext` to support dynamic localization, allowing administrative staff and parents to interface with the system in their preferred language. 

#### 2.5 Browser Compatibility 

- **NFR-009 [Modern Browsers]:** The system shall be fully functional on the latest two stable versions of major modern browsers, including Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge. 

- **NFR-010 [Mobile Responsiveness]:** The frontend shall employ fluid grids and responsive CSS (e.g., Tailwind CSS breakpoints) to guarantee seamless operation across desktop, tablet, and mobile form factors, particularly for the Student and Parent portals. 

## Phase 8: API Readiness & Backend Migration 

### Overview 

EduDash currently operates with a robust frontend Service Layer abstraction, ensuring that UI components are completely decoupled from the underlying data storage mechanism. This architectural decision was made explicitly to guarantee a frictionless migration from the current prototype environment to a scalable, productiongrade backend (Phase 12 Roadmap). This document outlines the API specifications required for that future transition. 

### 1. The Service Layer Abstraction 

All current data interactions in EduDash flow through isolated service files (e.g., `authService.js`, `attendanceService.js`). 

- **Current State:** These services simulate network latency via Promises and perform CRUD operations against isolated browser storage. 

- **Future State (Migration):** The UI components will remain **100% unchanged** . The service files will simply drop their mock data generators and replace them with standard `fetch()` or `axios` calls pointing to the new REST API endpoints. 

### 2. Global API Contracts 

To ensure frontend compatibility, the future backend must adhere to the following strict payload contracts. 

#### 2.1 Standardized Response Wrapper 

Page 94 

EduDash – School ERP Management System 

Every API response (regardless of entity) must be wrapped in a standardized JSON envelope to allow the frontend interceptors to process errors uniformly. 

##### **Success Payload:** 

##### **Error Payload:** 

#### 2.2 Authorization Headers 

Every protected route must require an HTTP `Authorization` header containing the active session credential (e.g., `Bearer eyJhbGci...`). The backend will extract the `uuid` and calculate `Effective Access` server-side before processing the payload. 

### 3. RESTful Resource Mapping 

The backend must construct endpoints that map 1:1 with the defined Data Models from Phase 6. 

#### 3.1 Governance & Identity (`/api/v1/auth`, `/api/v1/governance`) 

- `POST /auth/login` → Authenticates credential, issues session token. 

- `GET /auth/me` → Returns user profile + calculated Effective Access array. 

- `GET /governance/departments` → Fetches department hierarchy. 

- `PATCH /governance/overrides/{uuid}` → Applies manual module visibility override (SUPER_ADMIN only). 

#### 3.2 User Registries (`/api/v1/users`) 

- `GET /users/students` → Returns paginated student demographic roster. 

- `GET /users/teachers` → Returns teacher registry. 

- `GET /users/parents/{uuid}/children` → Returns the bounded child proxy array for a specific Parent. 

#### 3.3 Academic Execution (`/api/v1/academic`) 

- `GET /academic/classes/{id}/timetable` → Fetches the scheduled matrix for a cohort. 

- `POST /academic/assignments` → Distributes digital homework. 

- `PATCH /academic/exams/{id}/approve` → Executes the Checker Approval action on a Question Paper. 

#### 3.4 Operations & Logistics (`/api/v1/operations`) 

- `POST /operations/attendance` → Logs daily physical presence. 

- `POST /operations/leave` → Submits a Draft Leave Request. 

- `GET /operations/support` → Fetches the isolated ticket thread. 

### 4. Phased Backend Migration Strategy 

Page 95 

EduDash – School ERP Management System 

When the backend architecture is finalized, the migration must occur in strict, isolated phases to prevent systemic failure. 

#### Phase A: Identity & Governance Integration 

- Migrate the Authentication provider. 

- Port the base users (`Admin`, `Staff`, `Teacher`, `Student`, `Parent`). 

- Port the Effective Access calculation engine to the server-side. 

- _Validation:_ Ensure logins, role routing, and sidebars render correctly using network responses. 

#### Phase B: Core Structural Data 

- Migrate Classes, Subjects, and the global Timetable. 

- Establish the M:N mappings between Students, Teachers, and Classes. 

- _Validation:_ Ensure Teacher dashboards correctly scope to their assigned cohorts. 

#### Phase C: Transactional Ledgers 

- Migrate Attendance logs, Leave Requests, and Assignments. 

- Migrate Examinations and Question Papers. 

- _Validation:_ Execute end-to-end testing of the Maker-Checker workflow (Draft → Approve → Lock) over the network. 

#### Phase D: Analytics & Financials 

- Migrate Fee Ledgers and Transport Routes. 

- Re-point the Recharts analytical dashboards to live aggregation endpoints. 

#### 2.3 API Versioning Policy 

All future endpoints shall strictly be exposed under /api/v1/. Any architectural breaks or deprecated payloads in the future will require incrementing to /api/v2/. This ensures enterprise-grade backward compatibility for legacy clients. 

#### 2.4 Frontend DTO Stability 

The backend data structures may evolve internally; however, all published API response payloads must remain strictly DTO-compatible with the frontend Service Layer. This prevents downstream cascading failures across React components. 

## Phase 9: Requirements Traceability Matrix (RTM) 

### Overview 

The Requirements Traceability Matrix validates that every Functional Requirement aligns with a tangible architectural capability (Use Case), enforces strict business logic (Business Rule), maps to a definitive database model (Entity), and manifests physically within the User Interface (Portal Module). This guarantees zero "orphaned" requirements. 

Page 96 

EduDash – School ERP Management System 

### 1. Governance & Identity Traceability 

|**Functional Req**|**Associated Use**<br>**Case**|**Enforcing Business**<br>**Rule**|**Target**<br>**Entity**|**Responsible UI Module**|
|---|---|---|---|---|
|**FR-GOV-003**<br>(Effective<br>Access)|UC-GOV-001<br>(Manual<br>Override)|BR-GOV-002<br>(Priority Resolution)|Admin<br>Account|`SystemAdministrationPage`|
|**FR-GOV-004**<br>(Visibility<br>Boundaries)|UC-GOV-001<br>(Manual<br>Override)|BR-GOV-004 (Strip<br>Approval Vectors)|Department|Global Route Guard Layer|
|**FR-GOV-010**<br>(Anti-Collusion)|UC-MAK-002<br>(Exam Drafting)|BR-GOV-001<br>(Maker≠Checker)|Exam|`ExaminationPage`|
|**FR-STU-003**<br>(Parent Linkage)|N/A|BR-PAR-001<br>(Isolation)|Student /<br>Parent|`StudentRegistryPage`|



### 2. Academic Execution Traceability 

|**Functional Req**|**Associated**<br>**Use Case**|**Enforcing Business**<br>**Rule**|**Target**<br>**Entity**|**Responsible UI**<br>**Module**|
|---|---|---|---|---|
|**FR-ACA-004**<br>(Conflict Checking)|N/A|BR-ACA-001<br>(Collision Matrix)|Timetable|`TimetableGenerator`|
|**FR-HWK-003**(Late<br>Flagging)|UC-ACA-002<br>(Assign. Grading)|BR-HWK-001 (Due<br>Date Checks)|Assignment|`AssignmentsPage`|
|**FR-HWK-004**<br>(Immutable Grades)|UC-ACA-002<br>(Assign. Grading)|BR-HWK-002<br>(Immutability Lock)|Assignment|`AssignmentsPage`|
|**FR-EXM-005**<br>(Result Isolation)|UC-ACA-003<br>(Publishing)|BR-EXM-001 (Strict<br>Isolation)|Result|`ExaminationPage`|



### 3. Operations & Logistics Traceability 

|**Functional Req**|**Associated Use**<br>**Case**|**Enforcing**<br>**Business Rule**|**Target**<br>**Entity**|**Responsible UI Module**|
|---|---|---|---|---|
|**FR-ATT-001**<br>(Roster Boundary)|UC-ACA-001<br>(Daily Register)|BR-ACA-003<br>(Teacher Isolation)|Attendance|`AttendancePage`|
|**FR-ATT-002**<br>(Future Date Lock)|UC-ACA-001<br>(Daily Register)|BR-ATT-001<br>(Time Validation)|Attendance|`AttendancePage`|
|**FR-LVM-003**<br>(Approval Routing)|UC-MAK-001<br>(Leave Approv.)|BR-GOV-001<br>(Maker-Checker)|Leave<br>Request|`LeaveManagementPage`|
|**FR-COM-005**<br>(Audience Isolation)|UC-OPS-002<br>(Notice Broadcast)|BR-COM-001<br>(Target Validity)|Notice|`ParentNoticesPage`|



Page 97 

EduDash – School ERP Management System 

|**FR-SUP-003**|UC-OPS-001|BR-SUP-001|Support|`SupportCenterPage`|
|---|---|---|---|---|
|(Ticket Isolation)|(Ticket Resolution)|(UUID Filtering)|Ticket||



### 4. Planned Architecture (Future State) 

|**Functional Req**|**Associated Use**<br>**Case**|**Enforcing Business**<br>**Rule**|**Target**<br>**Entity**|**Responsible UI**<br>**Module**|
|---|---|---|---|---|
|**FR-FUTURE-ATT**<br>(24-Hour Lock)|UC-ACA-001<br>(Override)|BR-ATT-002<br>(Immutability)|Attendance|`AttendancePage`|
|**FR-FUTURE-GOV**|N/A|N/A|Staff /|System|
|(Identity Merge)|||Teacher|Administration|



_Note: This matrix verifies that the 18 physical components from the Portal Audit correctly house the system's underlying capabilities, ensuring complete coverage across the ERP ecosystem._ 

Page 98 

