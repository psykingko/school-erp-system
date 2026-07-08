# 09 - Module Inventory

This document tracks the completion status of all modules across the ERP portals.

## Status Legend
- ✔ **Complete**: UI built, wired to service layer, data flows properly.
- ⚠ **Partial**: UI built, but relies on hardcoded state or is missing features.
- 🚧 **Planned**: Not yet built.

## Admin Portal
├── 👨‍🎓 Students (✔ Complete)
├── 👨‍🏫 Teachers (✔ Complete)
├── 👥 Employee Directory (✔ Complete)
├── 🏢 Manage Departments (⚠ Partial/UI Stub)
├── 👪 Parents (✔ Complete)
├── 🏫 Classes (✔ Complete)
├── 📅 Timetable (✔ Complete)
├── 🎯 Examinations (✔ Complete)
│   ├── Exam Cycles (✔ Complete)
│   ├── Date Sheets (✔ Complete)
│   ├── Live Operations (✔ Complete)
│   ├── Evaluation Center (✔ Complete)
│   ├── Results Publication (✔ Complete)
│   ├── Assessment Governance (✔ Complete)
│   └── Report Card Generator (✔ Complete)
├── 📝 Question Papers (✔ Complete)
├── 💸 Fees (✔ Complete)
├── 🚌 Transport (✔ Complete)
├── 📬 Leave Approvals (✔ Complete)
├── 📢 Notice Board (✔ Complete)
├── 🏆 Achievements (✔ Complete)
├── 📊 Academic Analytics (✔ Complete)
├── 📈 Academic Performance (✔ Complete)
├── 📅 Attendance Management (✔ Complete)
├── 📄 Document Management (✔ Complete)
├── 🏢 Institutional Planning (✔ Complete)
├── 📅 School Calendar (✔ Complete)
├── 📚 Subjects Management (✔ Complete)
├── ⚖️ Workload Analytics (✔ Complete)
├── ⚙️ School Settings (🚧 Planned)
├── ✉️ Communication Center (⚠ Partial/UI Stub)
├── 🔒 Access Control (⚠ Partial/UI Stub)
├── 🎧 Support Management (✔ Complete)
├── 🎭 Clubs & Committees (✔ Complete)
└── 🛡️ Student Duty Management (✔ Complete)

## Teacher Portal
├── 📅 My Schedule (✔ Complete)
├── 📝 Mark Attendance (✔ Complete)
├── 📚 Assignments (✔ Complete)
├── 🎯 Marks Submission (Teacher ↔ Admin Sync) (✔ Complete)
├── 📢 Class Updates (✔ Complete)
├── 📬 Leaves (✔ Complete)
├── 📝 Question Papers (✔ Complete)
├── 🎧 Support Center (✔ Complete)
├── 🤝 Mentor Support (✔ Complete)
├── 📊 Reports & Analytics (✔ Complete)
├── 📈 Student Performance (✔ Complete)
├── 📅 Attendance Management (✔ Complete)
├── 🎭 Clubs & Activities (✔ Complete)
└── 🛡️ Student Duty Management (✔ Complete)

## Student & Parent Portals
├── 📊 Dashboard (✔ Complete)
├── 📅 Timetable (✔ Complete)
├── 📚 Assignments (✔ Complete)
├── 📚 Subjects (✔ Complete)
├── 🎯 Examinations
│   ├── Exam Cycle Navigation (✔ Complete)
│   ├── Dynamic Date Sheets (✔ Complete)
│   ├── General Instructions (✔ Complete)
│   ├── Empty States (✔ Complete)
│   └── Student Filtering (✔ Complete)
├── 🎯 Academic Results (✔ Complete)
├── 💸 Fees (✔ Complete)
├── 🚌 Transport (✔ Complete)
├── 📬 Leaves (✔ Complete)
├── 🎧 Support Center (✔ Complete)
└── 🛡️ Duty Records (✔ Complete)

## Shared UI Modules
├── 🪪 Identity Card (✔ Complete)
    - Purpose: Unified presentation component for Student/Staff ID rendering and printing.
    - Entry points: Profile settings, Student360, Staff360, Admin Profile.
    - Dependencies: Student Profile, Staff Profile, Shared IDCard Component, Browser Print API.
    - Future Scope: Digital verification, Server-side template generation, QR/RFID integration.
