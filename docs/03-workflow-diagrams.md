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

    B --> C[Student Class Filtering]

    C --> D[Student Examination Page]

    D --> E[Exam Cycle Selection]

    E --> F[Date Sheet]
    E --> G[General Instructions]
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
    B -->|Identifies At-Risk Students| C{Attendance Thresholds}
    C -->|< 75%| D[Low Attendance Target]
    C -->|< 50%| E[Critical Attendance Target]
    C -->|< 30%| F[Severe Action Target]
    C -->|> 95%| G[Appreciation Target]
    
    D & E & F & G -->|Selects Students| H[Redirect to Communication Center]
    H -->|Pre-fills Data| I[Campaign Subject & Delivery Channel]
    I -->|Auto-generates Body| J[Contextual Message Template based on Threshold]
    J -->|Admin Reviews & Dispatches| K[Notification Sent via Email/SMS/App]
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
        O -->|Applies Governance Rules| P[Calculation Pipeline]
        H -->|Aggregates Published Exams| P
        L --> P
        M --> P
        P --> Q[Generated Report Cards]
        Q -->|Admin Freezes| R[Frozen Status]
        R -.->|Immutable| S[Final Records]
        Q -->|Admin Publishes| T[Published Academic Report Cards]
        T -.->|Student/Parent Visibility| U[Final Session Result]
        T -.->|Admin| V[Print Operations]
    end
```