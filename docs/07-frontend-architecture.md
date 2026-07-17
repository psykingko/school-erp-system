# 07 - Frontend Architecture

## Architecture Overview
EduDash follows a standard React SPA architecture layered by roles (Admin, Teacher, Student, Parent). 
Each role has an isolated portal to ensure clean navigation and security boundaries.

## Components
- **Dumb/Presentational**: Housed in `src/components/`, these handle UI exclusively.
- **Smart/Container**: Housed in `src/pages/`, these interface with the Service layer and pass data down as props.

## Contexts
We utilize React Context to manage global state:
- `AuthContext`: Manages the active user session across portals.
- `StudentContext`: Manages the active student focus (critical for the Parent portal where parents have multiple children).
- `LanguageContext`: Manages i18n placeholders.

## Services
Found in `src/services/`. This layer abstracts all data access. Currently, it interacts with the `MockDB`, but is written purely asynchronously to allow seamless swapping with `axios`/`fetch` calls during backend migration.

## Providers
Global wrappers located at the root of `App.jsx` to inject Context values deeply into the tree.

## Persistence
`src/persistence/storage.js` is the ONLY file that interfaces with the browser's `localStorage`. All other services and modules communicate with persistence through this wrapper to guarantee cache coherence.

## Routing
Managed by `react-router-dom`. Routes are deeply nested inside specific portals (`/admin/*`, `/teacher/*`, etc.) and are guarded by role-based `<ProtectedRoute>` wrappers.

## UI Standards
- **Styling**: Strict utility-first Tailwind CSS. No custom CSS files unless absolutely necessary.
- **Palette**: The standard brand colors (`#03045e`, `#0077b6`, `#00b4d8`, `#caf0f8`) must be strictly followed.
- **Animations**: `framer-motion` is used globally for page transitions and modal popups to maintain an enterprise-grade, smooth UX.

## Shared UI Platform (Identity Card Module)
The Identity Card module is a pure presentation component shared across Student360, Staff360, and Profile portals.
- **Component Architecture**: The `IDCard` entry component routes normalized data to `IDCardFront` and `IDCardBack`.
- **Variant System**: Relies on a `variant` prop (`student` or `staff`) to render context-appropriate layouts without business logic.
- **Preview & Print**: `IDCardPreviewModal` acts as an isolation wrapper, employing print-specific styling using `@media print` to optimize the browser's native print-to-PDF engine.

## Student Examination Architecture
The Student Portal ecosystem cleanly separates operational examination workflows from institutional academic records.
- **Examination Workspace (`ExaminationPage.jsx`)**: Acts as the operational hub for the examination lifecycle. Consumers dynamically navigate Exam Cycles to view Date Sheets, General Instructions, Exam-wise Results, and cycle-specific Progress Reports.
- **Academic Records Workspace (`AcademicResultsPage.jsx`)**: Acts as the institutional repository for finalizing the academic session, housing Final Academic Reports exclusively.
- **Shared Presentation**: Both workspaces embed the exact same `PrintableReportCard` component for report rendering, guaranteeing zero layout or printing logic duplication.
- **Service Boundaries**: `examService` exclusively owns exam logic, schedules, instructions, and raw results. `reportCardService` exclusively owns report generation, calculations, governance, and publication.
- **Synchronization**: The UI consumes `activeCycle.linkedResults` and `activeCycle.linkedReportCards` metadata dynamically, mapping perfectly to the admin state with zero manual refresh or mock data required.

## Academic Report Card Generation Architecture
The Academic Report Card Generator acts as the culmination of the Academic Pipeline, orchestrating data from Examinations and Assessment Governance.
- **Data Flow**: Admin triggers generation via `GenerationWizard`, which feeds into `reportCardService.js` (the Calculation Pipeline). The service applies Assessment Governance weightages and boundaries.
- **Generation Modes**: Supports two distinct modes: `Progress Report` (partial weightage, no validation) and `Final Academic Report` (requires 100% weightage validation).
- **Development Override**: If governance is incomplete for a Final Report, administrators can invoke a development override to proceed with generation.
- **Metadata Persistence**: The generator persists the chosen mode as `reportType` metadata to clearly present the report classification permanently across all portals.

## Academic Calendar Architecture
The Academic Calendar is a centralized, institution-wide subsystem.
- **Data Flow**: Admin owns all write operations via the Admin Portal. The data flows downstream to Student, Teacher, Parent, Dashboard, and Attendance portals as read-only.
- **Service Architecture**: `academicCalendarService` acts as the definitive engine for CRUD, holiday logic, and Working Day Overrides.
- **Attendance Synchronization**: The Attendance module routes all holiday checks (`getDayClassification`) through the centralized calendar service, ensuring complete alignment on working days across the ERP.

### Architecture Freeze
The Academic Calendar subsystem is considered stable and **frozen**. Future feature development must respect the following architectural decisions:
1. **Centralized Service**: `academicCalendarService` is the sole source of truth for calendar logic.
2. **Persistence**: `ACADEMIC_CALENDAR` (LocalStorage) is the only persistence key for calendar data.
3. **Admin Ownership**: Admin owns all calendar write operations.
4. **Read-Only Consumers**: Student, Teacher, Parent, Dashboard, and Attendance are strictly read-only consumers.
5. **Seed-Only Legacy**: `calendar.js` is strictly used for initial seed data and must not be used as a runtime dependency.
6. **Single Source of Truth**: LocalStorage remains the SSOT until backend migration.

## Teacher Academic Results Architecture
The Teacher Academic Results module provides a unified, read-only workspace for Class Teachers to review academic outcomes.
- **Role-Based Access**: The module natively filters access based on the `isClassTeacher` property of the authenticated user's `teacherScope`. Subject Teachers are restricted to an informational empty state.
- **Unified Workspace**: Features a seamless segmented view selector toggling between "Exam Results", "Progress Reports", and "Final Academic Reports".
- **Data Isolation**: 
  - **Exam Results Ledger**: Consumes raw `RESULTS` directly via `examService`, pivoting subjects dynamically into columns for the selected exam cycle.
  - **Progress Reports**: Consumes finalized `REPORT_CARDS` via `reportCardService` mapped to individual exam cycles.
  - **Final Academic Reports**: Consumes finalized `REPORT_CARDS` spanning the entire academic session.
- **Printable Integration**: Employs `PrintableReportCard` with bulk-printing capabilities for all report types.
- **Dynamic Scope Resolution**: The workspace dynamically derives the active class and active academic session natively from the teacher's profile and published exam cycles.
- **Service Integrity**: Business logic remains entirely inside the service layer. The module duplicates zero calculation logic, performing presentation mapping strictly on available data.

### Examination Outcome Architecture Freeze
The Examination Outcome subsystem is considered stable and **frozen**. Future feature development must respect the following architectural decisions:
1. **Centralized Services**: `examService` owns all exam operations; `reportCardService` owns all report and governance operations.
2. **Clear Separation**: Operational documents (Date Sheets, Progress Reports) remain tied to Exam Cycles. Institutional documents (Final Academic Reports) remain tied to Academic Sessions.
3. **Single Source of Truth**: `PrintableReportCard.jsx` is the sole rendering engine for all institutional academic documents. No duplicated layouts.
4. **Backend-Ready Presentation**: UI layers remain pure consumers. Zero calculations, duplicated synchronizations, or mock mapping should be introduced.


## Translation & Localization Architecture
EduDash employs a robust, centralized translation subsystem mapped primarily to the Parent and Student portals.
- **Translation Flow**: `LanguageProvider` -> `useLanguage()` hook -> `t()` lookup function -> Dictionary Module -> Optional Fallback rendering.
- **Dictionaries**: Found in `src/translations/`. Namespaces are assigned explicit dictionary ownership (e.g. `common.js`, `homepage.js`, `newSections.js`) to enforce a single source of truth and prevent key duplication.
- **Portals**: The Admin and Teacher portals intentionally remain English-only to preserve professional parity, while the Parent and Student portals support dynamic Hindi translations.
- **Component Safety**: Reusable UI elements consume translations via `t()` with safe fallback mechanisms (`t('key', {fallback: 'English Text'})`), eliminating any risk of undefined runtime errors.

### Translation Subsystem Freeze
The Translation Subsystem is considered stable and **frozen**. Future feature development must respect the following architectural decisions:
1. **Single Source of Truth**: The `LanguageProvider` context wrapper remains the exclusive engine for handling language state.
2. **Dictionary Ownership**: Namespaces must not be duplicated. Keys must be added to the dictionary that logically owns the respective namespace.
3. **English/Hindi Parity**: All dictionary entries must maintain 100% structural parity between the `en` and `hi` block definitions.
4. **Service Boundaries**: Translations are strictly a UI layer concern and must not be requested from or enforced by backend service boundaries.

## Student Onboarding Architecture
The Student Onboarding module acts as a robust, fully integrated administrative workflow that provisions new entities into the existing ecosystem.
- **Workflow Orchestration**: `StudentOnboardingEngine` acts as a pure UI orchestrator containing zero business logic. It handles form state, validation, and multi-step navigation.
- **Data Generation & Persistence**: `studentOnboardingService` governs the transaction. It validates the payload and invokes `studentService`, `parentService`, `authService`, and `financeService` sequentially to instantiate the Student, Parent, Authentication records, and Initial Invoice.
- **Dependency Inversion**: No generic "Compatibility Layer" or "Migration Engine" is used. The Onboarding service conforms perfectly to the existing academic schema (`classId`, `streamId`, `admissionNo`) so that all read-heavy downstream services (Attendance, Timetable, Clubs, Finance) automatically resolve runtime-created users without friction.
- **Demo & Authentication Flow**: Runtime-created students and parents naturally flow into the `AUTH_USERS` collection. The Login Page and Demo Account selectors automatically discover runtime users, maintaining 100% parity with seeded data behavior.

### Student Onboarding Architecture Freeze
The Student Onboarding subsystem is considered stable and **frozen**. Future feature development must respect the following architectural decisions:
1. **No Backend Simulation Patterns**: The system must NOT implement domain events, background jobs, CQRS, or synchronization adapters on the frontend. The `Service -> Provider -> LocalStorage` flow is final.
2. **Strict Component Isolation**: The Onboarding Wizard (`StudentOnboardingEngine`) remains strictly for presentation. All data transformations are owned by `studentOnboardingService`.
3. **Downward Compatibility**: Runtime objects must exactly mirror Seeded objects structurally to preserve zero-overhead compatibility with downstream modules.
4. **No Custom Routing**: Runtime-created users leverage standard authentication pipelines and identical role-based dashboard resolution.

