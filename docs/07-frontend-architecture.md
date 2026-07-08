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
The Student Portal is a read-only consumer of the centralized Examination Module. It does not duplicate examination logic or state.
- **Data Flow**: Business logic remains entirely inside `examService.js`. The UI exclusively owns presentation state (such as the active tab or helper popups).
- **Component Hierarchy**: `ExaminationPage` → `CycleSelector` → `ScheduleSection` → `InstructionsSection`.
- **Synchronization**: `ExaminationPage` handles dynamic Exam Cycle navigation and synchronizes Date Sheets and General Instructions dynamically, perfectly matching the admin configurations with absolutely zero presentation-layer mock data.
