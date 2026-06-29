# 16. Academic Analytics & Institutional Planning Architecture

## Executive Summary
This document covers the architectural approach and implementation details for the advanced academic, performance, and institutional planning modules within the EduDash ERP. These modules provide critical insights into student performance trajectories, workforce utilization, and departmental workflows.

## 1. Academic Analytics & Performance
**Target Portals:** Admin, Teacher

### Components
- **Admin**: `AcademicAnalyticsPage.jsx`, `AcademicPerformancePage.jsx`
- **Teacher**: `ReportsAnalyticsPage.jsx`, `StudentPerfPage.jsx`

### Implementation Strategy
These modules aggregate data from the underlying evaluation and examination services to produce visual performance reports.
- **Data Aggregation**: Aggregates grades, test scores, and attendance rates to establish performance baselines.
- **Visualization**: Relies on Recharts (or similar charting components) to render academic trajectories and skill distribution graphs.
- **State Management**: Consumes raw data arrays from `localStorage` mock APIs (`getResults`, `getStudentPerformance`), performing heavy client-side aggregation before rendering.
- **Future Integration**: The backend should provide pre-aggregated metrics via a dedicated Analytics API to reduce frontend computational overhead.

## 2. Institutional Planning & Workload
**Target Portals:** Admin

### Components
- **Admin**: `InstitutionalPlanningPage.jsx`, `WorkloadAnalyticsPage.jsx`

### Implementation Strategy
These tools help administrators balance teacher workload against institutional requirements and track long-term academic structure plans.
- **Workload Registry**: Calculates the total hours, assigned classes, and committee obligations per teacher. It visualizes over-allocation and under-utilization.
- **Persistence**: Workload parameters are derived from `assignedSubjects` and `timetable` records. Any modifications made during planning scenarios are intended to be staged and eventually merged into the live timetable and employee allocation stores.

## 3. Mentor Support & Guidance
**Target Portals:** Teacher

### Components
- **Teacher**: `MentorSupportPage.jsx`

### Implementation Strategy
Provides homeroom teachers and assigned mentors with deep dives into student emotional and academic well-being.
- **Workflow**: Mentors log guidance sessions, tag behavioral observations, and escalate severe issues to the Support Center workflow.
- **Integration**: Tightly integrated with the Support Center module, allowing mentors to track the resolution of student welfare tickets.

## 4. Document Management
**Target Portals:** Admin (and Shared)

### Components
- **Admin**: `DocumentsPage.jsx`

### Implementation Strategy
Centralized repository for institutional policies, circulars, and teacher lesson plans.
- **Storage**: Currently mocked as metadata records in `localStorage`.
- **Future Integration**: Will require integration with an S3-compatible blob storage service. The backend must enforce signed URLs and time-limited access tokens for sensitive documents (e.g., medical records, disciplinary actions).

## 5. Attendance Management
**Target Portals:** Admin, Teacher

### Components
- **Admin**: `AttendanceOverviewPage.jsx`
- **Teacher**: `AttendanceMgmtPage.jsx`

### Implementation Strategy
- **Teacher View**: Optimized for rapid data entry (e.g., "Mark All Present" toggle) with fallback to individual absentee marking.
- **Admin View**: Aggregates daily, weekly, and monthly attendance rates. Generates automated notices for chronic absenteeism via the Notification Engine.

## Conclusion
These modules represent the upper-tier value additions to the ERP, transforming it from a simple CRUD system into an intelligent administrative tool. Future backend development should prioritize exposing optimized, pre-aggregated endpoints to support these heavy analytics views.
