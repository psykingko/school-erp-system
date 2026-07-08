# 16. Academic Governance & Institutional Planning Architecture

## Executive Summary
This document serves as the canonical architectural reference for the EduDash academic pipeline. It covers the end-to-end flow from marks submission to report card generation, as well as institutional planning and academic analytics.

## 1. The Canonical Academic Pipeline
The academic lifecycle in EduDash follows a strict, sequential pipeline. This pipeline ensures data integrity, proper administrative oversight, and consistent application of governance rules before any student performance data is published.

1. **Exam Cycle & Date Sheet**: Administrators create and schedule an exam cycle, producing a published Date Sheet and Instructions.
2. **Student Examination Consumption**: The Student Portal is a read-only consumer of the centralized Examination Module. It allows students to dynamically navigate published Exam Cycles and view their synchronized Date Sheets.
3. **Teacher Marks Submission**: Teachers enter marks and grades for their assigned courses. The data remains in a `draft` state until explicitly `submitted`. Once submitted, it is locked for the teacher and awaits administrative review.
4. **Admin Evaluation & Publication**: Administrators review the submitted marks. They can either reject the submission (returning it to the teacher for correction) or approve and `publish` the marks.
5. **Academic Results Consumption**: Published marks become visible to students and parents as individual "Exam-wise Result Previews". However, this is not the final report card.
6. **Assessment Governance**: The system applies global, centralized academic policies configured by the administrator. This includes defining **Assessment Categories** (e.g., Formative, Summative), **Category Weightages** (how much each category contributes to the final grade), and **Grade Boundaries** (the percentage thresholds for letter grades like A+, B, etc.).
7. **Academic Report Card Generation**: At the end of a session, administrators use the Generation Wizard to aggregate all published exams for a class. The calculation pipeline applies the Assessment Governance weightages and grade boundaries to produce the final, aggregated Academic Report Cards.
8. **Final Report Card Consumption**: Once the generated report cards are reviewed, administrators `publish` them. Only then do they become visible in the student and parent portals as the final, official session result. Administrators may also `freeze` report cards to make them immutable.

## 2. Assessment Governance Details
**Target Portals:** Admin
- **Components**: `AssessmentGovernancePage.jsx`
- **Implementation Strategy**: A centralized configuration interface that persists rules to `assessment_governance`. It defines the grading scales and pass/fail criteria that the Report Card Generator relies on.

## 3. Academic Analytics & Performance
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

## 4. Institutional Planning & Workload
**Target Portals:** Admin

### Components
- **Admin**: `InstitutionalPlanningPage.jsx`, `WorkloadAnalyticsPage.jsx`

### Implementation Strategy
These tools help administrators balance teacher workload against institutional requirements and track long-term academic structure plans.
- **Workload Registry**: Calculates the total hours, assigned classes, and committee obligations per teacher. It visualizes over-allocation and under-utilization.
- **Persistence**: Workload parameters are derived from `assignedSubjects` and `timetable` records. Any modifications made during planning scenarios are intended to be staged and eventually merged into the live timetable and employee allocation stores.

## 5. Mentor Support & Guidance
**Target Portals:** Teacher

### Components
- **Teacher**: `MentorSupportPage.jsx`

### Implementation Strategy
Provides homeroom teachers and assigned mentors with deep dives into student emotional and academic well-being.
- **Workflow**: Mentors log guidance sessions, tag behavioral observations, and escalate severe issues to the Support Center workflow.
- **Integration**: Tightly integrated with the Support Center module, allowing mentors to track the resolution of student welfare tickets.

## 6. Document Management
**Target Portals:** Admin (and Shared)

### Components
- **Admin**: `DocumentsPage.jsx`

### Implementation Strategy
Centralized repository for institutional policies, circulars, and teacher lesson plans.
- **Storage**: Currently mocked as metadata records in `localStorage`.
- **Future Integration**: Will require integration with an S3-compatible blob storage service. The backend must enforce signed URLs and time-limited access tokens for sensitive documents (e.g., medical records, disciplinary actions).

## 7. Attendance Management
**Target Portals:** Admin, Teacher

### Components
- **Admin**: `AttendanceOverviewPage.jsx`
- **Teacher**: `AttendanceMgmtPage.jsx`

### Implementation Strategy
- **Teacher View**: Optimized for rapid data entry (e.g., "Mark All Present" toggle) with fallback to individual absentee marking.
- **Admin View**: Aggregates daily, weekly, and monthly attendance rates. Generates automated notices for chronic absenteeism via the Notification Engine.

## Conclusion
These modules represent the upper-tier value additions to the ERP, transforming it from a simple CRUD system into an intelligent administrative tool. Future backend development should prioritize exposing optimized, pre-aggregated endpoints to support these heavy analytics views.
