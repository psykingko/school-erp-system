# EduDash ERP - Roles & Capabilities Map

This is an editable roles-and-features map. To make it extremely readable and clear, the visual flow maps are split **Module-Wise** to show exactly **who is doing what** and **who is viewing what** within each functional area.

---

## 🗺️ 1. Module-Wise Visual Flow Maps

These charts map user actions (Doing) and access levels (Viewing) for each major section.

### 📝 1.1 Attendance Logs Module
```mermaid
graph TD
    subgraph "Roles"
        Admin["👑 System Admin"]
        Teacher["👨‍🏫 Teacher"]
        Student["🎓 Student"]
        Parent["👪 Parent"]
    end

    subgraph "Module Data"
        M_Attendance["📝 Attendance Logs Database"]
    end

    Teacher -->|✍️ Takes & Edits Daily Logs| M_Attendance
    Admin -->|👁️ Views Global Reports / Audits| M_Attendance
    Student -->|👁️ Views Personal Presence Rate| M_Attendance
    Parent -->|👁️ Monitors Child Absence Records| M_Attendance

    style M_Attendance fill:#fef08a,stroke:#eab308,stroke-width:2px
```

---

### 📚 1.2 Assignments & Homework Module
```mermaid
graph TD
    subgraph "Roles"
        Teacher["👨‍🏫 Teacher"]
        Student["🎓 Student"]
        Parent["👪 Parent"]
    end

    subgraph "Module Data"
        M_Assignments["📚 Assignments Workspace"]
    end

    Teacher -->|✍️ Creates Homework & Grades Submissions| M_Assignments
    Student -->|💬 Uploads & Submits Finished Work| M_Assignments
    Parent -->|👁️ Monitors Child's Homework Progress| M_Assignments

    style M_Assignments fill:#bfdbfe,stroke:#3b82f6,stroke-width:2px
```

---

### 🎯 1.3 Exams & Results Publication Module
```mermaid
graph TD
    subgraph "Roles"
        Admin["👑 System Admin"]
        Teacher["👨‍🏫 Teacher"]
        Student["🎓 Student"]
        Parent["👪 Parent"]
    end

    subgraph "Module Data"
        M_Exams["🎯 Exams & Grading Database"]
    end

    Admin -->|✍️ Configures Lifecycle & Formally Publishes| M_Exams
    Teacher -->|✍️ Enters Course Marks & Grades| M_Exams
    Student -->|👁️ Views Published Grade Reports / Cards| M_Exams
    Parent -->|👁️ Monitors Child's Report Card| M_Exams

    style M_Exams fill:#fbcfe8,stroke:#ec4899,stroke-width:2px
```

---

### 📬 1.4 Leave Request System Module
```mermaid
graph TD
    subgraph "Roles"
        Admin["👑 System Admin"]
        Teacher["👨‍🏫 Teacher"]
        Student["🎓 Student"]
        Parent["👪 Parent"]
    end

    subgraph "Module Data"
        M_Leaves["📬 Leave Request System"]
    end

    Teacher -->|💬 Submits Personal Absence Request| M_Leaves
    Student -->|💬 Submits Personal Absence Request| M_Leaves
    Parent -->|💬 Submits Absence Request for Child| M_Leaves
    Admin -->|✍️ Approves / Rejects All Applications| M_Leaves

    style M_Leaves fill:#fed7aa,stroke:#f97316,stroke-width:2px
```

---

### 🏫 1.5 Academics, Classes & Timetables Module
```mermaid
graph TD
    subgraph "Roles"
        Admin["👑 System Admin"]
        Teacher["👨‍🏫 Teacher"]
        Student["🎓 Student"]
        Parent["👪 Parent"]
    end

    subgraph "Module Data"
        M_Academic["🏫 Academics & Schedules"]
    end

    Admin -->|✍️ Allocates Classes, Subjects & Schedules| M_Academic
    Teacher -->|👁️ Views Personalized Teaching periods| M_Academic
    Student -->|👁️ Views Personal Class Timetable| M_Academic
    Parent -->|👁️ Monitors Child's Weekly Timetable| M_Academic

    style M_Academic fill:#ddd6fe,stroke:#7c3aed,stroke-width:2px
```

---

### 💰 1.6 Fees & Finances Module
```mermaid
graph TD
    subgraph "Roles"
        Admin["👑 System Admin"]
        Student["🎓 Student"]
        Parent["👪 Parent"]
    end

    subgraph "Module Data"
        M_Finances["💰 Fees & Payments Ledger"]
    end

    Admin -->|✍️ Creates Collections & Records Ledger Payments| M_Finances
    Parent -->|💬 Reviews Bills & Pays Fees digitally| M_Finances
    Student -->|👁️ Views Outstanding Invoices & Balances| M_Finances

    style M_Finances fill:#bbf7d0,stroke:#22c55e,stroke-width:2px
```

---

### 📝 1.7 Question Paper Management Module
```mermaid
graph TD
    subgraph "Roles"
        Admin["👑 System Admin"]
        Teacher["👨‍🏫 Teacher"]
    end

    subgraph "Module Data"
        M_QuestionPapers["📝 Question Papers Workspace"]
    end

    Teacher -->|✍️ Drafts & Submits Papers| M_QuestionPapers
    Admin -->|✍️ Reviews & Approves Papers| M_QuestionPapers

    style M_QuestionPapers fill:#d1fae5,stroke:#10b981,stroke-width:2px
```

---

### 🚌 1.8 Transport & Logistics Module
```mermaid
graph TD
    subgraph "Roles"
        Admin["👑 System Admin"]
        Student["🎓 Student"]
        Parent["👪 Parent"]
    end

    subgraph "Module Data"
        M_Transport["🚌 Transport & Alerts Database"]
    end

    Admin -->|✍️ Manages Routes, Stops, Allocations & Pushes Alerts| M_Transport
    Student -->|👁️ Tracks Assigned Route & Reads Alerts| M_Transport
    Parent -->|👁️ Monitors Child's Route & Reads Alerts| M_Transport

    style M_Transport fill:#fef3c7,stroke:#d97706,stroke-width:2px
```

---

## 📊 2. Permissions Matrix Grid

This grid maps features to roles using permissions. You can easily add rows for new features or update cell symbols.

### Key to Actions:
* `✍️ Manage` : Full permissions (Create, Read, Update, Delete)
* `💬 Interact` : Limited write capability (e.g., submit a form, upload an assignment, send a message)
* `👁️ View` : Read-only capability (filtered by scope)
* `❌ None` : No access or hidden from sidebar

| Feature / Module | Admin (`ADMIN`) | Teacher (`TEACHER`) | Student (`STUDENT`) | Parent (`PARENT`) |
| :--- | :---: | :---: | :---: | :---: |
| **User Accounts Directory** | `✍️ Manage` | `👁️ View (Basic)` | `👁️ View (Self)` | `👁️ View (Child)` |
| **Academics, Classes & Timetables** | `✍️ Manage` | `👁️ View (Own)` | `👁️ View (Own)` | `👁️ View (Child)` |
| **Attendance Logs** | `👁️ View (Global)` | `✍️ Manage` | `👁️ View (Self)` | `👁️ View (Child)` |
| **Assignments & Homework** | `❌ None` | `✍️ Manage` | `💬 Interact` | `👁️ View` |
| **Exams & Grading** | `✍️ Manage (Lifecycle)` | `✍️ Manage (Marks)` | `👁️ View` | `👁️ View` |
| **Question Papers** | `✍️ Manage (Approve)` | `✍️ Manage (Draft)` | `❌ None` | `❌ None` |
| **Fees & Payments Ledger** | `✍️ Manage` | `❌ None` | `👁️ View` | `👁️ View` |
| **Transport & Routes** | `✍️ Manage` | `❌ None` | `👁️ View` | `👁️ View` |
| **Leave Request System** | `✍️ Manage (Approve)` | `💬 Interact (Self)` | `💬 Interact (Self)` | `💬 Interact (Child)` |
| **Clubs & Co-curricular** | `✍️ Manage` | `👁️ View` | `👁️ View` | `👁️ View` |
| **Notices & Announcements** | `✍️ Manage` | `✍️ Manage (Class)` | `👁️ View` | `👁️ View` |
| **Workload Analytics** | `👁️ View` | `❌ None` | `❌ None` | `❌ None` |
