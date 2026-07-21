# Institutional Academic Calendar Workflow

```mermaid
flowchart TD
    A[Admin] -->|Creates / Edits / Overrides| B[Centralized Academic Calendar]
    B -->|Provides Read-Only Data| C[Student Portal]
    B -->|Provides Read-Only Data| D[Teacher Portal]
    B -->|Provides Read-Only Data| E[Parent Portal]
    B -->|Syncs EventBoard| F[Dashboard]
    B -->|Determines Holidays & Overrides| G[Attendance Module]
```

# Student Module

```mermaid
flowchart LR
    A[Admin]
    B[Teacher]
    C[Student]
    D[Parent]

    A -->|Creates timetable| C
    A -->|Publishes notices| C
    A -->|Publishes exam results| C

    B -->|Uploads assignments| C
    B -->|Marks attendance| C
    B -->|Uploads study material| C

    D -->|Monitors progress| C

    C -->|Views timetable| E[Timetable]
    C -->|Submits assignments| F[Assignments]
    C -->|Views attendance| G[Attendance]
    C -->|Checks results| H[Examinations]
```


# Student Examination Consumption Workflow

```mermaid
flowchart LR
    A[Admin Examination Module]

    A --> B[Published Exam Cycles]

    B --> C[Student Examination Page]

    C --> D[Exam Cycle Selection]

    D --> E[Date Sheet]
    D --> F[General Instructions]
    D --> G[Exam Results]
    D --> H[Progress Report]
```

# Academic Results Consumption Workflow

```mermaid
flowchart LR
    A[Report Card Engine]

    A --> B[Published Session Results]

    B --> C[Academic Results Page]

    C --> D[Final Academic Report]
```

# Parent Module

```mermaid
flowchart LR
    A[Admin]
    B[Teacher]
    C[Parent]
    D[Student]

    A -->|Publishes notices| C
    A -->|Shares fee details| C
    A -->|Publishes results| C

    B -->|Marks attendance| C
    B -->|Uploads assignment status| C

    D -->|Academic activity| C

    C -->|Views child attendance| E[Attendance]
    C -->|Views fee details| F[Fees]
    C -->|Views timetable| G[Timetable]
    C -->|Tracks transport| H[Transport]
```


# Teacher Module

```mermaid
flowchart LR
    A[Admin]
    B[Teacher]
    C[Students]

    A -->|Assigns timetable| B
    A -->|Assigns subjects| B
    A -->|Publishes schedule| B

    B -->|Marks attendance| C
    B -->|Creates assignments| C
    B -->|Uploads marks| C
    B -->|Publishes resources| C

    B -->|Views my schedule| D[Teacher Schedule]
    B -->|Manages classes| E[Classroom Workflow]
```


# Admin Module

```mermaid
flowchart LR
    A[Admin]

    A --> B[Manage Students]
    A --> C[Manage Teachers]
    A --> D[Manage Timetable]
    A --> E[Manage Exams]
    A --> F[Manage Notices]
    A --> G[Manage Departments]
    A --> H[Roles & Permissions]
    A --> I[Communication Center]
    A --> J[Transport]
    A --> K[Fees]
```


# Timetable Workflow

```mermaid
flowchart LR
    A[Admin Creates Timetable]

    A --> B[Publish Timetable]

    B --> C[Student Portal]
    B --> D[Parent Portal]
    B --> E[Teacher My Schedule]

    E --> F[Subject Teachers]
    E --> G[Class Teachers]
    E --> H[Activity Teachers]
```


# Assignment Workflow

```mermaid
flowchart LR
    A[Teacher Creates Assignment]

    A --> B[Student Receives Assignment]

    B --> C[Student Uploads Work]

    C --> D[Teacher Reviews Submission]

    D --> E[Marks & Feedback Published]

    E --> F[Student Portal]
    E --> G[Parent Portal]
```


# Question Paper Management Workflow

```mermaid
flowchart LR
    A[Teacher Drafts Question Paper] --> B[Submits for Approval]
    B --> C[Admin Reviews]
    C -->|Approves| D[Paper Ready for Exam]
    C -->|Rejects with Remarks| A
```


# Examination Workflow

```mermaid
flowchart LR
    A[Admin Creates Exam]

    A --> B[Exam Schedule Published]

    B --> C[Students Attend Exam]

    C --> D[Teachers Upload Marks]

    D --> E[Results Published]

    E --> F[Student Portal]
    E --> G[Parent Portal]
```


# Communication Workflow

```mermaid
flowchart LR
    A[Admin]

    A --> B[Notice Management]
    A --> C[Communication Center]

    B --> D[Portal Notice Board]

    C --> E[Email]
    C --> F[SMS]
    C --> G[Push Notifications]

    E --> H[Students]
    E --> I[Parents]
    E --> J[Teachers]

    F --> H
    F --> I
    F --> J

    G --> H
    G --> I
    G --> J
```


# Roles & Permissions

```mermaid
flowchart LR
    A[Super Admin]

    A --> B[Admin Roles]
    A --> C[Teacher Roles]
    A --> D[Department Roles]

    B --> E[CRUD Permissions]
    C --> F[Academic Permissions]
    D --> G[Department Access]

    G --> H[Transport]
    G --> I[Examination]
    G --> J[Finance]
```


# Operational Timetable Override Workflow

```mermaid
flowchart LR
    A[Master Timetable]

    A --> B[Operational Override Engine]

    B --> C[Holiday]
    B --> D[Half Day]
    B --> E[Sports Day]
    B --> F[Exam Schedule]
    B --> G[Teacher Substitution]

    C --> H[Final Operational Schedule]
    D --> H
    E --> H
    F --> H
    G --> H
```


# Leave Application & Approval Workflow

```mermaid
flowchart LR
    A[Student or Teacher] -->|Applies for Leave| B[Leave Request Engine]
    B -->|Validates Dates & Reason| C[Pending Leave Request]
    C -->|Routed to| D[Class Teacher / Admin]
    D -->|Reviews Request| E{Decision}
    E -->|Approved| F[Approved Status]
    E -->|Rejected| G[Rejected Status]
    F -->|Synchronizes Attendance| H[Student marked as LEAVE in Daily Attendance]
    G -->|Reverts Attendance| I[Daily Attendance reset to UNMARKED]
```


# Fee Management & Payment Workflow

```mermaid
flowchart LR
    A[Admin / Finance] -->|Defines Base Structure| B[Fee Structures by Stages]
    A -->|Generates Monthly Demand| C[Invoices Generated]
    C -->|Vacation Adjustments: Summer/Winter| D[Final Calculated Invoice]
    D -->|Notified to| E[Parent & Student Portal]
    E -->|Views outstanding balances| F[Simulated Payment]
    F -->|Updates Ledger| G[Fee Ledger updated]
    G -->|Generates| H[Printable Tax Receipt & IT Exemption Certificate]
```


# Transport & Route Tracking Workflow

```mermaid
flowchart LR
    A[Admin] -->|Configures| B[Transport Routes & Stops]
    A -->|Registers| C[Vehicles, Drivers & Attendants]
    A -->|Assigns| D[Student Transport Allocations]
    D -->|Accesses| E[Transport Dashboard]
    E -->|Displays details| F[Pass ID, Designated Stop, Driver & Attendant Contact]
    E -->|Visualizes stop sequence| G[Live Stop Timeline & Active Direction: Pickup/Drop]
    E -->|Sends priority notices| H[Route Status Alerts: Delays/Breakdowns/Diversions]
```


# Co-curricular Clubs & Committees Workflow

```mermaid
flowchart LR
    A[Admin] -->|Creates Clubs| B[Extracurricular Clubs & Committees]
    A -->|Appoints Coordinator| C[Teacher Club Advisor]
    C -->|Manages| D[Schedules Club Events & Scope Notices]
    Student[Student] -->|Browses Clubs| E[Active Club Catalog]
    E -->|Enrolls: Limit Max 2 Active| F{Check Enrollment Capacity}
    F -->|Valid| G[Joined as Member / Leader]
    F -->|Invalid| H[Enrollment Limit Error]
    G -->|Accesses| I[Club Event Calendars & Scoped Announcements]
    G -->|Leaves Club| J[Membership Revoked & Request History Updated]
    Student -->|Proposes New Club| K[Club Creation Proposal]
    K -->|Admin Reviews| L{Approval}
    L -->|Approved| B
    L -->|Rejected| M[Proposal Declined]
```


# Mentorship & Session Management Workflow

```mermaid
flowchart LR
    A[Admin] -->|Assigns Mentees| B[Mentor Teacher / Class Teacher]
    Student[Student] -->|Schedules Session| C[Pending Session Request]
    C -->|Selects Topic, Time & Message| D{Mentor Action}
    D -->|Approve| E[Scheduled Session]
    D -->|Reject| F[Rejected Session]
    E -->|Conducted| G[Completed Session with Mentor Notes]
    G -->|Rendered chronologically| H[Mentorship History & Counseling Timeline]
    System[ERP System] -->|Analyzes metrics| I[Wellbeing Flags: Attendance Drop < 75% or Academic Drop < 65%]
    I -->|Trigger Dashboard alert| J[Parent & Student Dashboard Notification]
```


# Academic Architecture & Course Resolution Workflow

```mermaid
flowchart TD
    Profile[Student Profile] -->|Contains| Level[Class Level]
    Profile -->|Contains| Stream[Stream Selection: Class 11-12]
    Profile -->|Contains| Optional[Optional Subject: Class 11-12]
    
    Level --> Check{Class Level Check}
    Check -->|Nursery to Class 10| Fixed[Auto-resolve Fixed Grade-Level Subjects]
    Check -->|Class 11 & 12| StreamResolve[Resolve Core Stream Subjects]
    
    StreamResolve --> StreamJoin[Core Subjects: Physics, Chemistry, Math / Accountancy, etc.]
    Optional --> OptionalResolve[Single Selected Optional Subject: CS, PE, Art]
    
    Fixed --> Master[Master Course List: Student's Academic Subjects]
    StreamJoin --> Master
    OptionalResolve --> Master
    
    Master -->|Used by| Modules[Timetable, Assignments, Examination & Results]
    Master -->|Provides details for| Curriculum[Subject Curriculum: Objectives, Units, Textbooks & Outcomes]
```

# Support Center Workflow

```mermaid
flowchart LR
    A[Student / Parent / Teacher] -->|Submits Help/Feedback/Complaint| B[Support Center Hub]
    B -->|Logs Request| C[Pending Open Request]
    C -->|Monitored by| D[Designated Support Admin]
    D -->|Reviews Details| E{Action Taken}
    E -->|Updates Status| F[In Review]
    E -->|Adds Remarks| G[Resolution Details Appended]
    F -->|Solves Issue| H[Resolved]
    G --> H
    H -->|Closes Ticket| I[Closed]
    I -->|Visible to| A
```

# Student Duty Management Workflow

```mermaid
flowchart LR
    A[Admin] -->|Monitors| B[Duty Management Board]
    C[Teacher] -->|Creates| D[Duty Request]
    D -->|Assigns| E[Students]
    D -->|Specifies| F[Date, Time, Location & Instructions]
    E -->|Receives Assignment| G[Student Duty Dashboard]
    E -->|Parents Notified| H[Parent Duty Records]
    G -->|Student Performs Duty| I[Execution]
    C -->|Marks Completion| J[Status: Completed]
    C -->|Or Cancels| K[Status: Cancelled]
    J --> B
    K --> B
```

# Attendance Governance & Communication Workflow

```mermaid
flowchart LR
    A[Admin] -->|Monitors| B[Attendance Overview Dashboard]
    B -->|Separates Data| Z{Data Streams}

    Z -->|Student Data| C{Student Thresholds}
    C -->|< 85%| D[Notification Target]
    C -->|< 60%| E[Escalation Target]
    C -->|< 30%| F[Severe Action Target]
    C -->|> 95%| G[Appreciation Target]
    
    D & E & F & G -->|Selects Students| H[Redirect to Communication Center]
    H -->|Auto-generates Body| J[Contextual Message Template for Parents]

    Z -->|Staff Data| C2{Staff Thresholds}
    C2 -->|< 90%| D2[HR Notification Target]
    C2 -->|< 80%| E2[HR Escalation Target]
    C2 -->|< 70%| F2[Severe HR Action Target]
    C2 -->|> 98%| G2[Employee Appreciation]

    D2 & E2 & F2 & G2 -->|Selects Staff| H2[Redirect to Communication Center]
    H2 -->|Auto-generates Body| J2[Contextual Message Template for Employees / Admins]

    J & J2 -->|Admin Reviews & Dispatches| K[Notification Sent via Email/SMS/App]
```

# Identity Card Workflow

```mermaid
flowchart LR
    A[Student] -->|Opens Portal| B[Student360]
    B -->|Clicks View ID Card| C[Preview Modal]
    C -->|Browser Print| D[Print / Save as PDF]

    E[Admin / Teacher / HR] -->|Opens Portal| F[Staff360 / Profile]
    F -->|Clicks View ID Card| G[Preview Modal]
    G -->|Browser Print| H[Print / Save as PDF]
```

# End-to-End Academic Pipeline

```mermaid
flowchart TD
    subgraph "Phase 1: Teacher Marks Submission"
        A[Teacher] -->|Enters Marks & Grades| B[Draft Status]
        B -->|Submits| C[Submitted Status]
        C -.->|Locked for Teacher| D[Awaiting Admin Review]
    end

    subgraph "Phase 2: Admin Evaluation & Publication"
        D -->|Admin Reviews| E{Approval}
        E -->|Rejects| F[Returned to Teacher]
        F -->|Teacher Edits| B
        E -->|Approves| G[Evaluated Status]
        G -->|Admin Publishes| H[Published Status]
        H -.->|Student/Parent Visibility| I[Exam-wise Result Preview]
    end

    subgraph "Phase 3: Academic Governance"
        J[Admin] -->|Configures| K[Assessment Governance]
        K -->|Defines| L[Assessment Categories & Weightages]
        K -->|Defines| M[Grade Boundaries & Passing Rules]
    end

    subgraph "Phase 4: Academic Report Cards"
        N[Admin] -->|Selects Class & Session| O[Generation Wizard]
        O -->|Selects Mode: Progress or Final| O2[Mode Selection]
        O2 -->|Progress Report| P[Calculation Pipeline]
        O2 -->|Final Report| PV[Governance Validation]
        PV -->|Incomplete| PVD[Development Override Warning]
        PVD -->|Continue| P
        PV -->|Complete| P
        H -->|Aggregates Published Exams| P
        L --> P
        M --> P
        P --> Q[Generated Report Cards with reportType metadata]
        Q -->|Admin Freezes| R[Frozen Status]
        R -.->|Immutable| S[Final Records]
        Q -->|Admin Publishes| T[Published Academic Report Cards]
        T -.->|Student/Parent Visibility| U[Final Session Result]
        T -.->|Admin| V[Print Operations]
    end
```

# Teacher Academic Results Workflow

```mermaid
flowchart TD
    A[Teacher Academic Results Module] --> B{teacherScope.isClassTeacher?}
    
    B -->|No| C[Permission Restricted: Subject Teacher]
    C --> D[Display Shield Alert Empty State]
    
    B -->|Yes| E[Class Teacher Unified Workspace]
    E --> F[Segmented View Selector]
    
    F -->|Default: Exam Results| G[Exam-wise Result Ledger]
    G --> H[Exam Cycle Selector]
    H -->|Selects Published Exam| I[Consumes RESULTS dataset]
    I --> J[Displays Read-Only Student Ledger]
    
    F -->|Progress Reports| O[Progress Report Workspace]
    O --> P[Exam Cycle Selector]
    P --> Q[Consumes REPORT_CARDS dataset filtered by progress]
    Q --> M[Report Card Preview]
    Q --> N[Print / Bulk Print]

    F -->|Final Academic Reports| K[Final Report Card Workspace]
    K --> L[Consumes REPORT_CARDS dataset filtered by final]
    L --> M
    L --> N
```

## 7. Attendance Runtime Flow
```mermaid
graph TD
    subgraph "Student Attendance"
        S_UI[Teacher UI] --> S_Svc[attendanceService]
        S_Svc --> S_Prov[Provider]
        S_Prov --> S_LS[(LocalStorage)]
    end

    subgraph "Staff Attendance"
        St_UI[Admin UI] --> St_Svc[staffAttendanceService]
        St_Svc --> St_Prov[Provider]
        St_Prov --> St_LS[(LocalStorage)]
    end

    subgraph "Employee Self Attendance"
        E_UI[Employee UI] --> E_Svc[staffAttendanceService]
        E_Svc --> E_Prov[Provider]
        E_Prov --> E_LS[(LocalStorage)]
    end

    subgraph "Attendance Governance"
        G_UI[Attendance Overview] --> G_Svc[Governance Service]
        G_Svc --> G_Prov[Provider]
        G_Prov --> G_LS[(LocalStorage)]
    end

    S_UI -.->|Presentation Only| S_UI
    S_Svc -.->|Business Logic| S_Svc
    S_Prov -.->|Persistence Boundary| S_Prov
```