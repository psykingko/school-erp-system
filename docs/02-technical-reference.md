# EduDash School ERP — Complete Technical Reference

> **Audience**: Backend developers, database architects, and API integration engineers.  
> **Purpose**: Single source of truth for all data structures, workflows, service contracts, storage schemas, and pending integration points.  
> **Stack**: React 18 + Vite + Framer Motion + Tailwind CSS (utility-only), no backend, no database — everything is localStorage-based mock.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Bootstrap & Data Initialization](#3-application-bootstrap--data-initialization)
4. [Persistence Layer — The "Database"](#4-persistence-layer--the-database)
5. [Storage Schema — All Collections](#5-storage-schema--all-collections)
6. [Entity Schemas (Field-Level Detail)](#6-entity-schemas-field-level-detail)
7. [MockDB Query Engine](#7-mockdb-query-engine)
8. [Authentication System](#8-authentication-system)
9. [Service Layer — All Services](#9-service-layer--all-services)
10. [Notice & Workflow Orchestration System](#10-notice--workflow-orchestration-system)
11. [Portal Structure & Route Map](#11-portal-structure--route-map)
12. [Module Inventory — Implemented vs Pending](#12-module-inventory--implemented-vs-pending)
13. [Data Flow Diagrams](#13-data-flow-diagrams)
14. [ID & Key Naming Conventions](#14-id--key-naming-conventions)
15. [Known Gaps, Stub Areas & Backend Integration Points](#15-known-gaps-stub-areas--backend-integration-points)

---

## 1. System Architecture Overview

```
Browser
  │
  ├── React App (Vite SPA)
  │     ├── AuthContext        → Session management (localStorage-persisted)
  │     ├── StudentContext     → Active student scope for parent portal
  │     ├── LanguageContext    → i18n (English/Hindi stubs)
  │     │
  │     ├── Layouts (AdminLayout / StudentLayout / TeacherLayout / ParentLayout)
  │     │     └── AdminSidebar → Navigation driven by ADMIN_SECTIONS config
  │     │
  │     └── Pages (lazy-loaded, role-gated)
  │           └── → Call Service Layer
  │
  ├── Service Layer (/src/services/)
  │     └── → Call MockDB (data provider)
  │
  ├── MockDB (/src/mockDB/)
  │     ├── index.js (Facade — collection accessors + mutation methods)
  │     └── core/engine.js (Query engine — where/findOne/findById/resolveMany)
  │
  └── Persistence Layer (/src/persistence/)
        ├── storage.js    → localStorage wrapper with in-memory cache
        └── storageKeys.js → All ~45 localStorage key constants
```

**Key architectural rule**: The app has **zero real network calls**. Every service method reads/writes browser `localStorage`. The service layer is intentionally written with `async/await` patterns so every function signature is API-ready — replace the `localStorage` call with an `axios` / `fetch` call and the component code needs zero changes.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 18 | Vite dev server |
| Routing | React Router v6 | Lazy-loaded pages, nested routes |
| Animation | Framer Motion | Used on every page transition and modal |
| Styling | Tailwind CSS (utility) | Custom palette: `#03045e`, `#0077b6`, `#00b4d8`, `#caf0f8` |
| Icons | Lucide React | ~100 icons used across modules |
| State | React Context API | AuthContext, StudentContext, LanguageContext |
| Persistence | localStorage | ~45 keys, JSON stringified |
| Build | Vite + Rollup | Code-split per page (lazy imports) |

---

## 3. Application Bootstrap & Data Initialization

### Startup Sequence

```
main.jsx
  └── <App />
        ├── useEffect → startNoticeScheduler()     // Background cron for notices
        ├── <BrowserRouter>
        │     ├── <AuthProvider>
        │     │     ├── <LanguageProvider>
        │     │     │     └── <StudentProvider>
        │     │     │           └── <AppContent />
        │     │     │                 └── Routes
```

### Database Initialization

Happens in `main.jsx` BEFORE React renders:

```js
// main.jsx (approximate)
ensureSeedData();        // from src/mockDB/seed/initialData.js
initializeStorage.ensureRequiredKeys();   // integrity check
```

**`ensureSeedData()`** — runs once on first load (checks if `erp_students` key exists; if not, populates everything):

1. Generates static seed: subjects, streams, classes, periods, rooms, academic calendar
2. Generates teachers (expanded from `expandedTeachers.js`)
3. Derives `teacherSubjectAssignments` (algorithmically, based on teacher specialization + class structure)
4. Derives `classTeacherMap` from assignments (English → Math → Science → Any priority)
5. Re-resolves `classes` with `classTeacherId` populated
6. Generates students (from `expandedStudents.js`) and parents (derived from students)
7. Builds fees (matched to fee structures per class level)
8. Generates exams, exam papers, results, assignments, submissions
9. Generates transport data (routes, vehicles, drivers, alerts, assignments)
10. Generates documents, achievements
11. Generates invoices + receipts from fee data
12. Generates notices, events, clubs, club enrollments
13. Generates auth users (one per student/teacher/parent + admin)
14. Generates daily attendance records
15. Generates leave requests
16. Generates mentor remarks + sessions
17. Generates class updates
18. Writes all 35+ collections to localStorage

**`initializeStorage.ensureRequiredKeys()`** — runs after seed, validates all known keys exist and are valid JSON. Repairs corrupted keys to `[]`.

---

## 4. Persistence Layer — The "Database"

### `src/persistence/storage.js`

The **only file** that touches `localStorage` directly. All other code goes through this layer.

| Function | Signature | Description |
|---|---|---|
| `getItem(key, default)` | `(string, any) → any` | Reads + parses JSON; uses in-memory cache |
| `setItem(key, value)` | `(string, any) → bool` | Stringifies + writes; updates cache |
| `removeItem(key)` | `(string) → bool` | Removes from localStorage + cache |
| `hasKey(key)` | `(string) → bool` | Checks existence |
| `clearAllData()` | `() → bool` | Clears all ERP keys EXCEPT `edudash_auth_state` |
| `clearAuth()` | `() → bool` | Clears only auth state |
| `setItems(items)` | `(Object) → bool` | Batch write |

**In-memory cache**: A `Map` is kept in module scope. On first read, data is loaded from localStorage and cached. Writes update both localStorage and cache. Deep-cloned on read to prevent mutation.

### `src/persistence/storageKeys.js`

Single file defining all 45+ key constants. **Never hardcode a key string elsewhere.** Prefix convention: all ERP data keys start with `erp_`, auth state uses `edudash_` prefix.

---

## 5. Storage Schema — All Collections

All values are stored as JSON arrays (or objects). Below is the complete key registry:

### Authentication
| Key | Constant | Type | Description |
|---|---|---|---|
| `edudash_auth_state` | `AUTH_STATE` | Object | Active session: `{ user, isAuthenticated }` |

### Core Entities
| Key | Constant | Type | Description |
|---|---|---|---|
| `erp_students` | `STUDENTS` | Array | Student records |
| `erp_teachers` | `TEACHERS` | Array | Teacher records |
| `erp_parents` | `PARENTS` | Array | Parent records |
| `erp_authUsers` | `AUTH_USERS` | Array | Credentials linked to entities |
| `erp_classes` | `CLASSES` | Array | Class-section records |
| `erp_subjects` | `SUBJECTS` | Array | Subject catalog |
| `erp_streams` | `STREAMS` | Array | Academic streams (Sci/Com/Arts) |

### Academic
| Key | Constant | Type | Description |
|---|---|---|---|
| `erp_teacherSubjectAssignments` | `TEACHER_SUBJECT_ASSIGNMENTS` | Array | Which teacher teaches what subject to which class |
| `erp_dailyAttendance` | `DAILY_ATTENDANCE` | Array | Per-student per-day attendance |
| `erp_attendanceSessions` | `ATTENDANCE_SESSIONS` | Array | Per-class per-day session records |
| `erp_exams` | `EXAMS` | Array | Exam cycles / exam events |
| `erp_exam_papers` | `EXAM_PAPERS` | Array | Per-subject paper metadata |
| `erp_results` | `RESULTS` | Array | Student exam results |
| `erp_assignments` | `ASSIGNMENTS` | Array | Assignments created by teachers |
| `erp_submissions` | `SUBMISSIONS` | Array | Student submission records |
| `erp_periods` | `PERIODS` | Array | Timetable period definitions |
| `erp_rooms` | `ROOMS` | Array | School room catalog |
| `erp_academicCalendar` | `ACADEMIC_CALENDAR` | Object | Academic calendar structure |

### Finance
| Key | Constant | Type | Description |
|---|---|---|---|
| `erp_fees` | `FEES` | Array | Student fee records (balance, paid) |
| `erp_invoices` | `INVOICES` | Array | Generated invoices per term |
| `erp_receipts` | `RECEIPTS` | Array | Payment receipts |
| `erp_fee_structures` | `FEE_STRUCTURES` | Array | Fee structure per class level |

### Transport
| Key | Constant | Type | Description |
|---|---|---|---|
| `erp_transportRoutes` | `TRANSPORT_ROUTES` | Array | Bus route definitions |
| `erp_transportVehicles` | `TRANSPORT_VEHICLES` | Array | Vehicle fleet |
| `erp_transportDrivers` | `TRANSPORT_DRIVERS` | Array | Driver records |
| `erp_transportAssignments` | `TRANSPORT_ASSIGNMENTS` | Array | Student-to-route assignments |
| `erp_transportAlerts` | `TRANSPORT_ALERTS` | Array | Active transport alerts |

### Documents
| Key | Constant | Type | Description |
|---|---|---|---|
| `erp_documents` | `DOCUMENTS` | Array | Student documents (TC, bonafide, etc.) |
| `erp_teacher_documents` | `TEACHER_DOCUMENTS` | Array | Teacher documents |

### Institutional
| Key | Constant | Type | Description |
|---|---|---|---|
| `erp_achievements` | `ACHIEVEMENTS` | Array | Student/institutional achievements |
| `erp_notices` | `NOTICES` | Array | Institutional notice board |
| `erp_events` | `EVENTS` | Array | School events / calendar entries |
| `erp_clubs` | `CLUBS` | Array | Club definitions |
| `erp_clubEnrollments` | `CLUB_ENROLLMENTS` | Array | Student-club memberships |
| `erp_clubActivities` | `CLUB_ACTIVITIES` | Array | Club activity records |
| `erp_clubCoordinators` | `CLUB_COORDINATORS` | Array | Teacher-club coordinator links |
| `erp_clubUpdates` | `CLUB_UPDATES` | Array | Club announcement/update posts |

### Mentorship
| Key | Constant | Type | Description |
|---|---|---|---|
| `erp_mentorRemarks` | `MENTOR_REMARKS` | Array | Teacher remarks on students |
| `erp_mentorAssignments` | `MENTOR_ASSIGNMENTS` | Array | Teacher-student mentor pairing |
| `erp_mentorSessions` | `MENTOR_SESSIONS` | Array | Scheduled mentorship sessions |

### Communication
| Key | Constant | Type | Description |
|---|---|---|---|
| `erp_classUpdates` | `CLASS_UPDATES` | Array | Teacher class announcements |
| `erp_leaveRequests` | `LEAVE_REQUESTS` | Array | Student/teacher leave applications |

### Schema Versioning
| Key | Current Version | Purpose |
|---|---|---|
| `erp_students_schema_version` | `v4` | Prevents re-seed on schema change |
| `erp_remarks_schema_version` | `v1` | — |
| `erp_leave_schema_version` | `v1` | — |

---

## 6. Entity Schemas (Field-Level Detail)

### Student

```js
{
  id: "stud-001",                    // PK: "stud-{NNN}"
  studentId: "stud-001",            // Alias for id
  admissionNo: "ADM2026001",        // Login username for student portal
  name: "Rohan Kumar",
  classId: "class-11a",             // FK → classes.id
  classLevel: "11",                 // "Nursery"|"LKG"|"UKG"|"1"–"12"
  section: "A",                     // A|B|C|D
  stream: "Science Non-Medical",    // null for classes 1-10
  streamId: "SCIENCE_NON_MEDICAL",  // FK → streams.id | null
  parentIds: ["parent-001"],        // FK[] → parents.id
  gender: "Male",
  dob: "2008-04-12",                // ISO date
  admissionDate: "2024-04-05",
  nationality: "Indian",
  category: "General",              // General|OBC|SC|ST
  aadhar: "4532-9812-7364",
  houseGroup: "Saturn (Blue)",
  phoneNumber: "+91 98765 43210",
  motherName: "Kiran Kumar",
  motherPhone: "+91 98765 99001",
  motherOccupation: "Home Maker",
  fatherOccupation: "Business Executive",
  fatherPhone: "+91 98765 88001",
  parentLinkage: {                  // Embedded parent info for quick access
    parentId: "parent-001",
    fatherName: "Rajesh Kumar",
    fatherPhone, fatherOccupation,
    motherName, motherPhone, motherOccupation
  },
  guardianLinkage: { name, relation, phone },
  emergencyContacts: [{ name, relation, phone }],
  siblingMetadata: [{
    studentId, name, admissionNo, relationship: "Sibling"
  }]
}
```

### Teacher

```js
{
  id: "teach-001",                  // PK
  teacherId: "teach-001",
  employeeId: "EMP001",            // Login: "teacher.{firstname}"
  name: "Dr. Sarah Wilson",
  metadata: {                       // Nested profile
    name, designation, department, phoneNumber,
    email, qualifications, experience
  },
  designation: "Senior Physics Teacher",
  department: "Science",
  homeroom: "class-11a",            // FK → classes.id (class teacher of)
  assignedClasses: ["class-11a"],   // FK[] → classes.id
  assignedClassIds: ["class-11a"],
  assignedSections: ["A"],
  specializationSubjectId: "sub-phy",  // FK → subjects.id
  subjectId: "sub-phy",
  email, phoneNumber,
  qualifications: [...],
  experience: "8 years"
}
```

### Parent

```js
{
  id: "parent-001",                 // PK
  name: "Rajesh Kumar",
  childIds: ["stud-001", "stud-006"],  // FK[] → students.id
  email, phone,
  occupation, address
}
```

### AuthUser

```js
{
  id: "auth_student_1",            // PK: "auth_{role}_{N}"
  username: "ADM2026001",          // Student = admissionNo; Teacher = "teacher.{firstname}"; Admin = "admin"
  password: "demo123",             // Plaintext (mock only — MUST be hashed in production)
  role: "STUDENT",                 // STUDENT | TEACHER | PARENT | ADMIN
  linkedEntityId: "stud-001",      // FK → students.id / teachers.id / parents.id
  active: true
}
```

### Class

```js
{
  id: "class-11a",                 // PK: "class-{level}{section}"
  name: "Class XI-A",
  level: "11",
  section: "A",
  streamId: "SCIENCE_NON_MEDICAL", // null for 1-10
  classTeacherId: "teach-001",     // FK → teachers.id (derived from assignments)
  capacity: 40,
  currentStrength: 38
}
```

### Subject

```js
{
  id: "sub-phy",                  // PK
  name: "Physics",
  code: "PHY",
  streamId: "SCIENCE_NON_MEDICAL", // null = core subject (all classes)
  type: "Core" | "Elective"
}
```

### TeacherSubjectAssignment

```js
{
  id: "tsa-001",
  teacherId: "teach-001",          // FK → teachers.id
  subjectId: "sub-phy",           // FK → subjects.id
  classId: "class-11a",           // FK → classes.id
  academicYear: "2025-26",
  isClassTeacher: true             // Whether this teacher is class teacher of this class
}
```

### DailyAttendance

```js
{
  id: "att_stud-001_2026-05-20",  // PK: "att_{studentId}_{date}"
  studentId: "stud-001",          // FK → students.id
  classId: "class-11a",           // FK → classes.id
  date: "2026-05-20",             // ISO date string
  status: "present",              // present | absent | late | excused
  markedBy: "teach-001",          // FK → teachers.id
  remarks: ""
}
```

### AttendanceSession

```js
{
  id: "sess_class-11a_2026-05-20",
  classId: "class-11a",           // FK → classes.id
  date: "2026-05-20",
  submittedBy: "teach-001",       // FK → teachers.id
  submittedAt: "2026-05-20T09:15:00Z",
  totalPresent: 35,
  totalAbsent: 3,
  status: "submitted"             // pending | submitted
}
```

### Exam

```js
{
  id: "exam-001",
  name: "Mid-Term Examinations 2025-26",
  type: "mid-term",               // mid-term | annual | unit-test | board
  academicYear: "2025-26",
  startDate: "2026-03-10",
  endDate: "2026-03-20",
  classIds: ["class-11a"],        // FK[] → classes.id
  status: "completed",            // planned | scheduled | ongoing | evaluation | completed
  createdBy: "admin-001",
  operationalState: "published"   // draft | evaluation_pending | published
}
```

### Question Paper

```js
{
  id: "qp-{timestamp}",
  title: "Mid-Term Physics Paper",
  teacherId: "teach-001",         // FK → teachers.id
  subjectId: "sub-phy",           // FK → subjects.id
  classSectionId: "class-11a",    // FK → classes.id
  status: "approved",             // draft | pending_approval | approved | rejected
  content: "...",                 // Text content or rich text
  uploadedFile: "url/to/pdf",     // URL to uploaded paper file
  approvedBy: "admin-001",        // FK → authUsers.id / admins.id
  approvedAt: "2026-03-01T10:00:00Z",
  remarks: "Approved for Mid-Terms",
  createdAt: "2026-02-28T14:30:00Z",
  updatedAt: "2026-03-01T10:00:00Z"
}
```

### Result

```js
{
  id: "res-{timestamp}-{random}",
  studentId: "stud-001",          // FK → students.id
  examId: "exam-001",             // FK → exams.id
  subjectId: "sub-phy",          // FK → subjects.id
  classId: "class-11a",          // FK → classes.id
  marksObtained: 78,
  maxMarks: 100,
  grade: "A",
  remarks: "Good performance",
  evaluatedBy: "teach-001"        // FK → teachers.id
}
```

### Assignment

```js
{
  id: "asgn-{timestamp}",
  title: "Newton's Laws Problem Set",
  description: "...",
  subjectId: "sub-phy",           // FK → subjects.id
  classId: "class-11a",          // FK → classes.id
  teacherId: "teach-001",         // FK → teachers.id
  dueDate: "2026-05-30",
  maxMarks: 20,
  status: "active",               // draft | active | closed
  createdAt: "2026-05-20T10:00:00Z"
}
```

### Submission

```js
{
  id: "subm-{timestamp}",
  assignmentId: "asgn-001",       // FK → assignments.id
  studentId: "stud-001",         // FK → students.id
  submittedAt: "2026-05-28T14:30:00Z",
  content: "...",
  status: "submitted",            // not_submitted | submitted | graded
  marksObtained: 17,              // null until graded
  feedback: ""
}
```

### Fee

```js
{
  id: "fee-001",
  studentId: "stud-001",          // FK → students.id
  classId: "class-11a",          // FK → classes.id
  academicYear: "2025-26",
  totalAmount: 85000,             // Derived from feeStructures
  paidAmount: 42500,
  balance: 42500,
  dueDate: "2026-04-30",
  status: "partial",              // paid | partial | unpaid | overdue
  lastPaymentDate: "2026-03-15"
}
```

### FeeStructure

```js
{
  id: "fs-senior",
  classLevel: "11",               // Applies to this level
  feeHeads: [
    { name: "Tuition Fee", annualAmount: 60000, termAmount: 20000 },
    { name: "Development Fee", annualAmount: 10000 },
    { name: "Lab Fee", annualAmount: 8000 },
    ...
  ]
}
```

### Notice

```js
{
  id: "notice-{timestamp}",
  title: "Exam Schedule Published",
  content: "...",
  date: "May 26, 2026",
  isPinned: false,
  status: "Published",            // draft | Published | scheduled | archived
  category: "examination",        // examination | attendance | finance | administrative | transport
  priority: "important",          // normal | important | urgent | critical
  icon: "GraduationCap",          // Lucide icon name
  allowedRoles: ["student", "parent", "teacher"],
  sourceModule: "examinations",
  sourceEntityId: "exam-001",     // FK to originating entity
  sourceEntityType: "exam_cycle",
  targetAudience: {
    type: "CLASS",                // ALL | CLASS | SPECIFIC
    classIds: ["class-11a"],
    includeStudents: true,
    includeParents: true,
    includeClassTeachers: false,
    includeSubjectTeachers: false
  },
  readReceipts: ["stud-001"],     // FK[] → students/teachers who read it
  createdBy: "system",
  createdAt: "2026-05-26T10:00:00Z",
  publishedAt: "2026-05-26T10:00:00Z",
  expiresAt: null,                // ISO datetime | null
  metadata: { operationalState, sourceEntityId, ... }
}
```

### LeaveRequest

```js
{
  id: "leave-{timestamp}",
  requesterId: "stud-001",        // FK → students.id or teachers.id
  requesterType: "student",       // student | teacher
  classId: "class-11a",          // FK → classes.id (for student)
  fromDate: "2026-05-28",
  toDate: "2026-05-29",
  reason: "Family function",
  status: "pending",              // pending | approved | rejected
  appliedAt: "2026-05-26T08:00:00Z",
  decidedBy: null,                // FK → teachers.id | admin id
  decidedAt: null,
  adminRemarks: ""
}
```

### MentorAssignment

```js
{
  id: "mase-001",
  mentorId: "teach-001",         // FK → teachers.id
  studentId: "stud-001",         // FK → students.id
  classId: "class-11a",         // FK → classes.id
  assignedAt: "2025-08-01",
  status: "active"
}
```

### MentorRemark

```js
{
  id: "rem-{timestamp}",
  mentorId: "teach-001",         // FK → teachers.id
  studentId: "stud-001",         // FK → students.id
  remark: "Consistent improvement observed...",
  category: "academic",          // academic | behavioral | attendance | general
  createdAt: "2026-05-20T09:00:00Z"
}
```

### Transport

```js
// TransportRoute
{ id: "route-01", name: "Route A – Sector 15", stops: [...], vehicleId, driverId }

// TransportVehicle
{ id: "veh-01", registrationNo: "HR 26 AB 1234", capacity: 50, type: "Bus" }

// TransportDriver
{ id: "drv-01", name: "Ram Lal", phone: "+91 98765 00001", licenseNo: "HR-12345" }

// TransportAssignment (student ↔ route)
{ id: "ta-001", studentId: "stud-001", routeId: "route-01", stopName: "Sector 15 Stop", pickupTime: "07:30" }

// TransportAlert
{ id: "alert-01", routeId: "route-01", message: "Bus delayed by 15 minutes", type: "delay", createdAt }
```

### Club & Enrollment

```js
// Club
{ id: "club-001", name: "Robotics Club", category: "STEM", coordinatorId: "teach-003", description, maxMembers }

// ClubEnrollment
{ id: "enroll-{timestamp}", studentId: "stud-001", clubId: "club-001", joinedAt, role: "member" | "captain" | "vice-captain" }

// ClubActivity
{ id: "act-{timestamp}", clubId, title, date, description, createdBy }
```

---

## 7. MockDB Query Engine

Located at `src/mockDB/core/engine.js`. Provides synchronous-equivalent (all async, resolve immediately) query operations:

| Method | Signature | SQL Equivalent |
|---|---|---|
| `engine.where(collection, query)` | `(Array, Object) → Promise<Array>` | `SELECT * WHERE key=val AND ...` |
| `engine.findOne(collection, query)` | `(Array, Object) → Promise<Object\|null>` | `SELECT * WHERE ... LIMIT 1` |
| `engine.findById(collection, id)` | `(Array, string) → Promise<Object\|null>` | `SELECT * WHERE id = ?` |
| `engine.resolveOne(item, localKey, target)` | `(Object, string, Array) → Object\|null` | LEFT JOIN (1:1) |
| `engine.resolveMany(item, localKey, target, fk)` | `(Object, string, Array, string) → Array` | LEFT JOIN (1:N) |

The `MockDB` facade in `src/mockDB/index.js` wraps the engine with per-collection accessors and mutation methods (insert, update, delete, upsert).

---

## 8. Authentication System

### Flow

```
LoginPage (UI)
  └── AuthContext.login(role, username, password)
        └── authService.authenticate({ role, username, password })
              ├── provider.getAuthUserByUsername(username, role)
              ├── validate password (plaintext comparison)
              ├── resolve linked entity (student/teacher/parent)
              └── return session object → stored in AuthContext state + localStorage
```

### Session Object (stored in `edudash_auth_state`)

```js
{
  isAuthenticated: true,
  authUserId: "auth_student_1",
  role: "STUDENT",                // STUDENT | TEACHER | PARENT | ADMIN
  linkedEntityId: "stud-001",     // FK to the actual entity
  name: "Rohan Kumar",
  admissionNumber: "ADM2026001",
  avatarInitials: "RK",
  avatarColor: "#03045e",
  profile: { ...full student/teacher/parent object }  // embedded on login
}
```

### Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Student | `ADM2026001` (admission number) | `demo123` |
| Teacher | `teacher.sarah` (teacher.{firstname}) | `demo123` |
| Parent | `ADM2026001` (first child's admission number) | `demo123` |

### Role Guards

`ProtectedRoute` component wraps role-specific route trees. The `AuthContext` exposes: `isStudent`, `isTeacher`, `isParent`, `isAdmin` boolean flags.

---

## 9. Service Layer — All Services

Every service is an `async` function that reads/writes through `MockDB`. Service files are at `src/services/`.

### `authService.js`
- `authenticate({ role, username, password })` → session object
- `validateSession(user)` → boolean
- `getDemoAccounts()` → grouped demo credentials for login UI

### `studentService.js`
- `getStudentProfile(studentId)` → student + resolved class + resolved parent
- `getAttendance(studentId)` → attendance records + computed percentage
- `getDocuments(studentId)` → student documents
- `updateStudentProfile(studentId, updates)` → mutates student record

### `teacherService.js`
- `getTeacherProfile(teacherId)` → teacher + class info + assigned subjects
- `getTeachersByDepartment(dept)` → filtered teachers
- `getTeacherWorkload(teacherId)` → assignment load + class count

### `teacherMappingService.js` (large: 35KB)
- `getTeacherForClass(classId, subjectId)` → resolves which teacher teaches what
- `getClassesForTeacher(teacherId)` → reverse map
- `getSubjectsForTeacher(teacherId)` → subject list
- `isClassTeacher(teacherId, classId)` → boolean
- Core dependency for timetable, attendance, and assignments

### `academicsService.js`
- `getTimetable(classId)` → timetable grid
- `getSubjects(classId)` → subjects for a class
- `getExamResults(studentId)` → all results for student
- `getClassResults(classId, examId)` → class-level result analytics
- `getAssignments(classId)` → assignments for a class

### `assignmentService.js`
- `getAssignmentsForStudent(studentId, classId)` → with submission status
- `getAssignmentsForTeacher(teacherId)` → assignments created by teacher
- `submitAssignment(assignmentId, studentId, content)` → creates submission
- `gradeSubmission(submissionId, marks, feedback)` → updates submission
- `createAssignment(data)` → inserts new assignment
- `deleteAssignment(id)` → removes assignment + cascades to submissions

### `attendanceService.js`
- `getAttendanceForClass(classId, date)` → per-student status for a date
- `markAttendance(classId, date, records, teacherId)` → upserts daily attendance + session
- `getAttendanceSummary(studentId)` → percentage + streak + absences
- `getAttendanceSession(classId, date)` → session record

### `examService.js` (large: 43KB)
- Full exam lifecycle:
  - `createExamCycle(data)` → create exam
  - `scheduleExam(examId, datesheet)` → update status
  - `startEvaluation(examId, classId)` → set to evaluation
  - `enterMarks(examId, classId, marksData)` → bulk insert results
  - `publishResults(examId, classIds)` → set published + emit RESULT_PUBLISHED event
- `getExamsByClass(classId)` → filtered exams
- `getResultsForStudent(studentId)` → full result history
- `getResultAnalytics(examId, classId)` → topper, average, weak areas

### `financeService.js`
- `getFeeDetails(studentId)` → fee record + fee structure + invoices
- `getPaymentHistory(studentId)` → receipts
- `getAllFees()` → admin: all fee records
- `getFeeDefaulters()` → students with overdue/partial status

### `leaveService.js`
- `applyForLeave(data)` → insert leave request
- `getLeaveRequests(requesterId)` → for student/teacher
- `getAllPendingLeaves()` → admin/teacher: all pending
- `approveLeave(leaveId, decidedBy)` → update status
- `rejectLeave(leaveId, decidedBy, remarks)` → update status

### `noticeService.js`
- `getNotices(filters)` → filtered notices with audience resolution
- `createNotice(notice)` → insert notice
- `updateNotice(id, updates)` → patch notice
- `markNoticeRead(noticeId, userId)` → append to readReceipts
- `getNoticesForRole(role, entityId)` → role-filtered notice feed

### `noticeActionService.js`
- `publishNotice(noticeId)`, `archiveNotice(noticeId)`, `scheduleNotice(noticeId, date)`
- Bulk actions: `bulkPublish`, `bulkArchive`, `bulkCancel`

### `noticeScheduler.js`
- Background interval (runs every minute) checking for `scheduled` notices whose `publishedAt` timestamp has passed
- Automatically publishes them (updates status to `Published`)
- Started in `App.jsx` via `startNoticeScheduler()`

### `transportService.js`
- `getStudentTransport(studentId)` → route + vehicle + driver + stop
- `getAllRoutes()` → full route list for admin
- `getActiveAlerts()` → current transport alerts

### `mentorshipService.js`
- `getMentorAssignments(teacherId)` → students assigned to teacher
- `addRemark(mentorId, studentId, remark)` → insert mentor remark
- `getStudentRemarks(studentId)` → all remarks for student
- `scheduleMentorSession(data)` → insert session
- `updateSessionStatus(sessionId, status)` → update session

### `classUpdatesService.js`
- `getUpdatesForStudent(classId)` → class announcements visible to student
- `getUpdatesForTeacher(teacherId)` → teacher's own updates
- `createUpdate(data)` → insert class update
- `deleteUpdate(id)` → remove

### `clubsService.js`
- `getClubsForStudent(studentId)` → enrolled clubs + details
- `getAllClubs()` → full club list
- `enrollStudent(studentId, clubId)` → insert enrollment
- `unenrollStudent(enrollmentId)` → delete enrollment

### `studentDashboardService.js`
- Aggregation service for student home page:
  - `getDashboardData(studentId)` → { attendance, assignments, notices, fees, exams }
  - Single call that parallelizes multiple service reads

### `teacherDashboardService.js`
- `getDashboardData(teacherId)` → { classes, assignments, attendance pending, leave requests }

### `studentPerformanceService.js`
- `getPerformanceReport(studentId)` → result history + subject-wise trend + rank in class

### `teacherActionCenterService.js`
- `getAttendanceAlerts(teacherId)` → list of students with critical attendance
- `getPendingLeaves(teacherId)` → leave requests needing approval
- `getMentorRequests(teacherId)` → mentorship session requests
- `getPendingGrading(teacherId)` → ungraded submissions

### `teacherScheduleService.js`
- `getTeacherWeeklySchedule(teacherId)` → full weekly timetable
- `getTeacherTodaySchedule(teacherId)` → today's periods only
- `getCurrentClass(teacherId)` → active class based on current time
- `getNextClass(teacherId)` → upcoming class period

### `workflowEvents.js` & `workflowEventBus.js`
- `WORKFLOW_EVENTS` → constants for all event types
- `emitEvent(eventType, payload)` → publishes event to in-memory bus
- `onEvent(eventType, callback)` → subscribes to event

### Timetable Services (`src/services/timetable/`)
- Architecture shifted to module-specific sub-services.
- `adminTimetableService.js` → `initializeTimetables()`, `saveTimetableSlot()`, `clearTimetableSlot()`
- `timetableValidationService.js` → `validateTimetables()` (conflict checking)
- `studentTimetableService.js` / `parentTimetableService.js` → scoped read accessors
- `timetableOverrideService.js` → handles temporary substitutions/cancellations

### `audienceResolver.js`
- Functions called by the Notice Orchestrator:
  - `resolveExamAudience(eventData)` → `{ type: "CLASS", classIds, includeStudents, includeParents }`
  - `resolveAttendanceAudience(eventData)` → specific student + parent
  - `resolveFeeAudience(eventData)` → fee defaulters / specific student
  - `resolvePTMAudience(eventData)` → class parents + teachers
  - `resolveTransportAudience(eventData)` → route-specific students/parents
  - `resolveResultAudience(eventData)` → class students/parents

---

## 10. Notice & Workflow Orchestration System

This is the most architecturally complex backend-relevant system in the app.

### Overview

```
Any Module (e.g., ExaminationsPage)
  └── emitEvent("RESULT_PUBLISHED", { examId, classIds })
        └── workflowEventEmitter.emit()   [in-memory pub/sub]
              └── noticeOrchestrator listeners (registered at app start via setupNoticeOrchestrator())
                    ├── resolveAudience(eventData)       → target: who gets the notice
                    ├── generateNoticeFromTemplate(key)  → notice content
                    └── createNotice(notice)             → persist to erp_notices
```

### Workflow Event Types (`WORKFLOW_EVENTS`)

34 event types across 8 categories:
- **Examination**: `EXAM_CREATED`, `EXAM_SCHEDULED`, `EXAM_CANCELLED`, `EXAM_RESCHEDULED`, `EXAM_DATESHEET_PUBLISHED`, `EXAM_CYCLE_CREATED`, `EVALUATION_STARTED`, `EVALUATION_COMPLETED`
- **Result**: `RESULT_PUBLISHED`, `RESULT_DECLARED`, `RESULT_PENDING`
- **Attendance**: `ATTENDANCE_LOW`, `ATTENDANCE_CRITICAL`, `ATTENDANCE_ABSENT`, `ATTENDANCE_MARKED`
- **Fee**: `FEE_DUE`, `FEE_OVERDUE`, `FEE_PAID`, `FEE_REMINDER`
- **PTM**: `PTM_SCHEDULED`, `PTM_CANCELLED`, `PTM_RESCHEDULED`
- **Assignment**: `ASSIGNMENT_CREATED`, `ASSIGNMENT_DUE`, `ASSIGNMENT_SUBMITTED`
- **Timetable**: `TIMETABLE_UPDATED`, `TIMETABLE_PUBLISHED`, `CLASS_CHANGED`
- **Transport**: `ROUTE_CHANGED`, `STOP_CHANGED`, `BUS_DELAYED`
- **Administrative**: `HOLIDAY_DECLARED`, `EVENT_ANNOUNCED`, `EMERGENCY_ALERT`, `GENERAL_NOTICE`
- **Discipline**: `DISCIPLINE_ISSUE`, `DISCIPLINE_WARNING`, `DISCIPLINE_ACTION`

### Notice Templates

`noticeTemplates.js` contains pre-built message templates for all event types. Templates use `{{placeholder}}` substitution for dynamic values (exam name, class, date, etc.).

### What Actually Triggers Automatically

Currently wired (emit → auto-notice):
- ✅ Exam creation, scheduling, cancellation, rescheduling
- ✅ Result publication (3 separate notices: students/parents, class teachers, subject teachers)
- ✅ General admin notices

Currently emitted but notice **may not** auto-generate (needs `autoGenerate !== false`):
- All other events listed above — the listeners exist but some events may not provide required data to satisfy the audience resolver

---

## 11. Portal Structure & Route Map

### Four Portals

| Portal | Base Route | Layout | Role |
|---|---|---|---|
| Student | `/student` | `StudentLayout` | `STUDENT` |
| Parent | `/parent` | `ParentLayout` | `PARENT` |
| Teacher | `/teacher` | `TeacherLayout` | `TEACHER` |
| Admin | `/admin` | `AdminLayout` | `ADMIN` |

### Admin Routes (all lazy-loaded)

| Path | Component | Description |
|---|---|---|
| `/admin/dashboard` | `AdminDashboard` | Stats overview |
| `/admin/students` | `StudentsPage` | Student CRUD |
| `/admin/teachers` | `TeachersPage` | Teacher management |
| `/admin/parents` | `ParentsPage` | Parent records |
| `/admin/admins` | `AdminsPage` | Admin user management |
| `/admin/classes` | `ClassesPage` | Class management |
| `/admin/academic-structure` | `AcademicStructurePage` | Classes, subjects, streams, timetable structure |
| `/admin/timetable` | `TimetablePage` | Timetable builder |
| `/admin/exams` | `ExaminationsPage` | Full exam lifecycle |
| `/admin/academic-performance` | `AcademicPerformancePage` | Analytics |
| `/admin/attendance` | `AttendanceOverviewPage` | Attendance summary |
| `/admin/leaves` | `LeaveApprovalsPage` | Leave approvals |
| `/admin/transport` | `TransportManagementPage` | Transport management |
| `/admin/fees` | `FeeManagementPage` | Fee management |
| `/admin/documents` | `DocumentsPage` | Document repository |
| `/admin/clubs` | `AdminClubsPage` | Clubs management |
| `/admin/achievements` | `AdminAchievementsPage` | Achievements |
| `/admin/calendar` | `AdminSchoolCalendarPage` | School calendar |
| `/admin/notices` | `NoticesPage` | Notice board management |
| `/admin/analytics-workload` | `WorkloadAnalyticsPage` | Teacher workload |
| `/admin/manage-departments` | `ManageDepartmentsPage` | Departments + members |
| `/admin/communication-center` | `CommunicationCenterPage` | Campaign/email/SMS manager |
| `/admin/access-control` | `AccessControlPage` | Role permissions |
| `/admin/profile` | `AdminProfilePage` | Admin profile |
| `/admin/school-settings` | `PortalInDevelopment` | ⚠️ Stub |

### Admin Sidebar Sections

```
Dashboard
User Management         → Students, Teachers, Parents, Admins
Academic Management     → Classes, Academic Structure, Timetable, Exams, Academic Performance
Operations              → Attendance, Leaves, Transport, Fees, Documents
Institutional Activities → Clubs, Achievements, Calendar, Notice Management
Analytics               → Teacher Workload
Institutional           → Manage Departments, Communication Center
Settings                → Profile, Access Control, School Settings
```

---

## 12. Module Inventory — Implemented vs Pending

### ✅ Fully Implemented (UI + Data Flow Working)

| Module | Portal(s) | CRUD | Notes |
|---|---|---|---|
| Authentication | All | Login/Logout | Demo credentials, session persistence |
| Student Dashboard | Student, Parent | R | Aggregated view with live data |
| Notice Board | All | R | Role-filtered, read receipts |
| Assignments | Student, Teacher | CRUD | Submission + grading |
| Timetable | Student, Teacher, Admin | R | Class + weekly views |
| Attendance | Student, Teacher | RW | Marking + summary |
| Exam Results | Student, Teacher, Admin | RW | Full lifecycle |
| Fee Details | Student, Parent | R | Invoice + receipt view |
| Transport | Student, Parent, Admin | R | Route + alert view |
| Documents | Student, Teacher, Admin | R | Document listing |
| Clubs & Committees | Student, Teacher, Admin | RW | Enrollment + activities |
| Mentorship | Student, Teacher | RW | Remarks + sessions |
| Achievements | Student, Admin | RW | Add/remove achievements |
| School Calendar | All | R | Event listing |
| Leave Management | Student, Teacher, Admin | RW | Apply + approve/reject |
| Class Updates | Student, Teacher | RW | Teacher posts, student reads |
| Notice Management | Admin | RW | Full admin notice CRUD |
| Exam Management | Admin | RW | Full lifecycle with auto-notice generation |
| Fee Management | Admin | R | Fee overview + defaulters |
| Academic Structure | Admin | RW | Classes, subjects, streams config |
| Teacher Workload | Admin | R | Analytics |
| Manage Departments | Admin | RW | Departments + member add/remove |
| Access Control | Admin | UI-only | Role permissions (mock data) |

### ⚠️ Partially Implemented / UI-Only

| Module | Missing |
|---|---|
| Communication Center | No real email/SMS. All state is local `useState`, not persisted to localStorage. |
| Notice Management | `NoticesPage` and `NoticeManagementPage` contain UI stubs/TODOs for bulk actions. |
| School Settings | Stub page (`PortalInDevelopment` component) |
| Report Generation | No PDF/export functionality anywhere |
| Analytics (Academic Performance) | Charts render but calculated from mock results only |
| Teacher Profile Settings | UI complete, some mutation paths incomplete |
| Parent Dashboard | Uses student data from StudentContext; child-scoping via `ChildScopeSwitcher` |

### ❌ Not Implemented (Backend Will Need to Build From Scratch)

| Feature | Notes |
|---|---|
| Push Notifications | `WORKFLOW_EVENTS.EMERGENCY_ALERT` emits but no real push |
| Email Delivery | Communication Center has UI only |
| SMS Gateway | Same as above |
| WhatsApp Integration | Same as above |
| File Uploads | Document upload UI exists; no real file storage |
| PDF Generation | Report cards, fee receipts — no PDF library integrated |
| Real-time Updates | No WebSocket/SSE; all data is poll-on-mount |
| Biometric Attendance | Not modeled |
| Payment Gateway | Fee payment marked manually, no real gateway |
| Multi-school/tenant | Single school, no tenancy |
| Audit Logs | No action logging system |
| Data Export (CSV/Excel) | Not implemented |
| Search (Global) | No global search; each page has local search |

---

## 13. Data Flow Diagrams

### Student Login Flow

```
User enters username + password
  → AuthContext.login(role, username, password)
  → authService.authenticate()
  → MockDB.authUsers.findOne({ username, role })
  → compare password
  → MockDB.students.findById(linkedEntityId)
  → build session object
  → setItem("edudash_auth_state", session)
  → navigate("/student/dashboard")
```

### Teacher Marks Attendance Flow

```
Teacher opens AttendanceMgmtPage
  → attendanceService.getAttendanceForClass(classId, date)
  → MockDB.dailyAttendance.find({ classId, date })
  → renders student list with status chips

Teacher submits attendance
  → attendanceService.markAttendance(classId, date, records, teacherId)
  → for each student: MockDB.dailyAttendance.insert(record)  [upsert by studentId+date+classId]
  → MockDB.attendanceSessions.insert(session)
  → emitEvent("ATTENDANCE_MARKED", { classId, date })
  → noticeOrchestrator picks up → auto-notice for absent students (if configured)
```

### Admin Publishes Exam Results Flow

```
Admin on ExaminationsPage → clicks "Publish Results"
  → examService.publishResults(examId, classIds)
  → MockDB.results.find({ examId })  [verify marks entered]
  → MockDB.exams.update(examId, { status: "completed", operationalState: "published" })
  → emitEvent("RESULT_PUBLISHED", { examId, classIds })
  → noticeOrchestrator.setupNoticeOrchestrator() listener fires:
      ├── createNotice({ ...student/parent notice })  → MockDB.notices.insert()
      ├── createNotice({ ...class teacher notice })   → MockDB.notices.insert()
      └── createNotice({ ...subject teacher notice }) → MockDB.notices.insert()
  → Student opens notice board → noticeService.getNoticesForRole("STUDENT", studentId)
  → Filters by: allowedRoles, targetAudience.classIds contains student.classId
  → Notice appears in feed
```

---

## 14. ID & Key Naming Conventions

| Entity | ID Pattern | Example |
|---|---|---|
| Student | `stud-{NNN}` | `stud-001` |
| Teacher | `teach-{NNN}` | `teach-001` |
| Parent | `parent-{NNN}` | `parent-001` |
| Class | `class-{level}{section}` | `class-11a`, `class-nurseryb` |
| Subject | `sub-{code}` | `sub-phy`, `sub-eng` |
| Stream | `{STREAM_CODE}` | `SCIENCE_NON_MEDICAL`, `COMMERCE`, `HUMANITIES` |
| AuthUser | `auth_{role}_{N}` | `auth_student_1`, `auth_admin_1` |
| TeacherSubjectAssignment | `tsa-{NNN}` | `tsa-001` |
| Attendance | `att_{studentId}_{date}` | `att_stud-001_2026-05-20` |
| AttendanceSession | `sess_{classId}_{date}` | `sess_class-11a_2026-05-20` |
| Result | `res-{timestamp}-{random}` | `res-1716720000000-abc123` |
| Assignment | `asgn-{timestamp}` | `asgn-1716720000000` |
| Submission | `subm-{timestamp}` | `subm-1716720000000` |
| Leave | `leave-{timestamp}` | `leave-1716720000000` |
| Notice | `notice-{timestamp}` | `notice-1716720000000` |
| Event | `eve-{timestamp}` | `eve-1716720000000` |
| Club | `club-{NNN}` | `club-001` |
| Enrollment | `enroll-{timestamp}` | `enroll-1716720000000` |
| Fee | `fee-{NNN}` | `fee-001` |
| Invoice | `inv-{NNN}` | `inv-001` |
| Receipt | `rec-{NNN}` | `rec-001` |
| Transport Route | `route-{NN}` | `route-01` |
| Transport Vehicle | `veh-{NN}` | `veh-01` |
| Transport Driver | `drv-{NN}` | `drv-01` |
| Transport Assignment | `ta-{NNN}` | `ta-001` |
| Mentor Assignment | `mase-{timestamp}` | `mase-1716720000000` |
| Mentor Remark | `rem-{timestamp}` | `rem-1716720000000` |
| Mentor Session | `sess-{timestamp}` | `sess-1716720000000` |

---

## 15. Known Gaps, Stub Areas & Backend Integration Points

### Critical API Contracts Backend Must Provide

The following are the exact service function signatures that need real API endpoints behind them:

#### Authentication
```
POST /api/auth/login          { role, username, password } → session object
POST /api/auth/logout         { authUserId }
GET  /api/auth/validate       { token } → { valid: bool }
```

#### Core Entity CRUD
```
GET  /api/students            → Student[]
GET  /api/students/:id        → Student
PUT  /api/students/:id        { ...updates } → Student
GET  /api/teachers            → Teacher[]
GET  /api/teachers/:id        → Teacher
GET  /api/parents             → Parent[]
GET  /api/parents/:id         → Parent
GET  /api/classes             → Class[]
GET  /api/subjects            → Subject[]
GET  /api/streams             → Stream[]
```

#### Attendance
```
GET  /api/attendance          { classId, date } → DailyAttendance[]
POST /api/attendance/bulk     { classId, date, records[], teacherId } → AttendanceSession
GET  /api/attendance/summary  { studentId } → { percentage, absences, sessions }
```

#### Assignments
```
GET  /api/assignments         { classId? | teacherId? } → Assignment[]
POST /api/assignments         Assignment → Assignment
PUT  /api/assignments/:id     { ...updates } → Assignment
DELETE /api/assignments/:id   → boolean
GET  /api/submissions         { assignmentId? | studentId? } → Submission[]
POST /api/submissions         Submission → Submission
PUT  /api/submissions/:id     { marksObtained, feedback, status } → Submission
```

#### Exams & Results
```
GET  /api/exams               { classId? } → Exam[]
POST /api/exams               Exam → Exam
PUT  /api/exams/:id           { ...updates } → Exam
POST /api/results/bulk        { examId, classId, results[] } → boolean
GET  /api/results             { studentId? | examId? | classId? } → Result[]
POST /api/results/publish     { examId, classIds[] } → { success, noticesGenerated }
```

#### Fees
```
GET  /api/fees                { studentId? } → Fee[]
GET  /api/fee-structures      { classLevel? } → FeeStructure[]
GET  /api/invoices            { studentId } → Invoice[]
GET  /api/receipts            { studentId } → Receipt[]
```

#### Notices
```
GET  /api/notices             { role, entityId, filters } → Notice[]
POST /api/notices             Notice → Notice
PUT  /api/notices/:id         { ...updates } → Notice
DELETE /api/notices/:id       → boolean
POST /api/notices/:id/read    { userId } → Notice (with updated readReceipts)
```

#### Leave
```
GET  /api/leaves              { requesterId? | status? } → LeaveRequest[]
POST /api/leaves              LeaveRequest → LeaveRequest
PUT  /api/leaves/:id          { status, decidedBy, adminRemarks } → LeaveRequest
```

#### Notifications / Workflow Events
```
POST /api/events/emit         { eventType, payload } → { noticesGenerated[] }
// This replaces the in-browser workflowEventEmitter with a server-side queue
```

#### Communication (new module — Communication Center)
```
GET  /api/campaigns           → Campaign[]
POST /api/campaigns           Campaign → Campaign (queued)
GET  /api/campaigns/:id       → Campaign + delivery stats
POST /api/campaigns/:id/send  → { status: "queued" }
GET  /api/templates           → Template[]
```

### Data Format Notes for Backend

1. **Dates**: All dates are ISO 8601 strings (`YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ssZ` for timestamps).
2. **IDs**: Frontend generates IDs as `{prefix}-{timestamp}` for user-created records. Backend should use UUIDs or auto-increment and return the canonical ID on creation.
3. **Passwords**: Currently **plaintext** in the mock. Backend **must** implement bcrypt/argon2 hashing.
4. **Tokens**: No JWT used currently. Backend should implement JWT/refresh token pattern. The `edudash_auth_state` localStorage key structure (session object) can be used as the JWT payload claim structure.
5. **Soft Deletes**: The mock does hard deletes. Backend should implement `deletedAt` soft deletes for audit trails.
6. **Pagination**: No pagination implemented in the mock (all records returned). All list endpoints need `page`, `limit`, `offset` parameters added.
7. **File Uploads**: Document upload UI exists but clicks go nowhere. Backend needs `multipart/form-data` upload endpoints with S3/Cloudinary integration.
8. **School Structure**: Single school. If multi-tenant, add `schoolId` FK to every entity.
9. **Academic Year**: Hardcoded as `"2025-26"` in most places. Backend should have a configurable `ACADEMIC_YEAR` setting.
10. **Class ID Convention**: The frontend uses `class-{level}{section}` (e.g., `class-11a`). Backend may use integer/UUID PKs — the frontend will need a `classCode` or `slug` field to maintain routing and display logic.

### Specific Frontend-to-Backend Handoff Checklist

- [ ] Replace `authService.authenticate()` body with `fetch('/api/auth/login')`
- [ ] Replace `MockDB.students.all()` with `fetch('/api/students')`
- [ ] Replace `workflowEventEmitter.emit()` with `POST /api/events/emit` (or keep in-browser and just persist to server)
- [ ] Replace `noticeScheduler.js` interval with a server-side cron job
- [ ] Replace `localStorage` session with `httpOnly` cookie + JWT refresh pattern
- [ ] Add `Authorization: Bearer {token}` header to all API calls (the service layer is the right place)
- [ ] Add error handling: the service layer currently throws raw `Error` objects; standardize to `{ code, message }` shape
- [ ] `Communication Center` campaigns need a real queue (e.g., BullMQ + Redis) — currently mock-only

---

*Document generated: 2026-05-26 | Project: EduDash School ERP | Version: 1.0*
