# EduDash API Contracts (Frontend ↔ Backend)

This document formalizes the exact request/response boundaries that the frontend expects from the backend. The backend must strictly implement these boundaries.

## 1. Authentication
**Current State:** localProvider | **Future:** apiProvider
Endpoints governing user sessions and access control.

### `POST /api/v1/auth/login`
- **Request Body:** `{ username, password }`
- **Response Shape:** `LoginResponseDTO`
```json
{
  "token": "jwt-token-string",
  "refreshToken": "refresh-token-string",
  "user": {
    "id": "user-uuid",
    "role": "ADMIN|TEACHER|STUDENT|PARENT",
    "name": "Full Name",
    "email": "user@school.edu"
  },
  "permissions": ["MANAGE_USERS", "MANAGE_FEES"]
}
```

### `GET /api/v1/auth/me`
- **Response Shape:** `CurrentUserDTO`

---

## 2. Students
**Current State:** localProvider | **Future:** apiProvider
Endpoints governing student data.

### `GET /api/v1/students/:id`
- **Response Shape:** `StudentProfileDTO`
```json
{
  "id": "stud-123",
  "admissionNo": "2024001",
  "name": "John Doe",
  "classId": "class-10a",
  "className": "10-A",
  "streamId": null,
  "parentId": "parent-456"
}
```

### `GET /api/v1/students/:id/dashboard`
- **Response Shape:** `StudentDashboardDTO`

---

## 3. Teachers
**Current State:** localProvider | **Future:** apiProvider
Endpoints governing faculty operations.

### `GET /api/v1/teachers/:id`
- **Response Shape:** `TeacherProfileDTO`
```json
{
  "id": "teacher-001",
  "employeeId": "EMP2019",
  "name": "Jane Smith",
  "department": "Science",
  "subjects": ["sub-phy", "sub-chem"],
  "classesAssigned": ["class-11a", "class-11b"]
}
```

### `GET /api/v1/teachers/:id/dashboard`
- **Response Shape:** `TeacherDashboardDTO`

---

## 4. Academics
**Current State:** localProvider | **Future:** apiProvider
Endpoints for assignments, exams, and question papers.

### `POST /api/v1/academics/question-papers`
- **Request/Response Shape:** `QuestionPaperDTO`
```json
{
  "id": "qp-uuid",
  "title": "Midterm Physics",
  "classId": "class-11a",
  "section": "A",
  "subjectId": "sub-phy",
  "teacherId": "teacher-001",
  "status": "Draft",
  "content": "<p>Rich text question content...</p>",
  "uploadedFile": "url-to-pdf",
  "remarks": "",
  "createdAt": "2025-10-01T10:00:00Z",
  "updatedAt": "2025-10-01T10:00:00Z"
}
```

### `GET /api/v1/academics/assignments`
- **Response Shape:** `AssignmentDTO[]`

### `POST /api/v1/academics/assignments/:assignmentId/submissions`
- **Request Body:** `{ submissionText: string, attachment: AttachmentDTO }`
- **Response Shape:** `SubmissionDTO`

### `GET /api/v1/academics/exams/:examId/results/:studentId`
- **Response Shape:** `ExamResultDTO`
```json
{
  "examId": "exam-midterm-2025",
  "studentId": "stud-123",
  "aggregatePercentage": 85.5,
  "subjectMarks": [
    { "subjectId": "sub-phy", "marksObtained": 85, "maxMarks": 100 }
  ]
}
```

---

## 5. Parents
**Current State:** localProvider | **Future:** apiProvider
Endpoints for parent portal access.

### `GET /api/v1/parents/:id`
- **Response Shape:** `ParentProfileDTO`
```json
{
  "id": "parent-456",
  "name": "Robert Doe",
  "email": "robert@email.com",
  "phoneNumber": "+91 9876543210",
  "children": ["stud-123"]
}
```

## 6. Classes
**Current State:** localProvider | **Future:** apiProvider
### `GET /api/v1/classes`
- **Response Shape:** `ClassDTO[]`

## 7. Attendance
**Current State:** localProvider | **Future:** apiProvider
### `GET /api/v1/attendance`
- **Response Shape:** `AttendanceRecordDTO[]`
### `POST /api/v1/attendance/bulk`
- **Response Shape:** `AttendanceSessionDTO`

## 8. Fees
**Current State:** localProvider | **Future:** apiProvider
### `GET /api/v1/fees`
- **Response Shape:** `FeeLedgerDTO[]`
### `GET /api/v1/fees/invoices`
- **Response Shape:** `InvoiceDTO[]`

## 9. Transport
**Current State:** localProvider | **Future:** apiProvider
### `GET /api/v1/transport/routes`
- **Response Shape:** `TransportRouteDTO[]`

## 10. Notices
**Current State:** localProvider | **Future:** apiProvider
### `GET /api/v1/notices`
- **Response Shape:** `NoticeDTO[]`
### `POST /api/v1/notices`
- **Response Shape:** `NoticeDTO`

## 11. Leave Management
**Current State:** localProvider | **Future:** apiProvider
### `GET /api/v1/leaves`
- **Query Params:** `?requesterId=UUID`, `?status=Pending`
- **Response Shape:** `LeaveRequestDTO[]`
### `POST /api/v1/leaves`
- **Request Body:** `{ leaveType, fromDate, toDate, reason, attachment?: AttachmentDTO }`
- **Response Shape:** `LeaveRequestDTO`
### `PUT /api/v1/leaves/:id`
- **Request Body:** `{ status: "Approved" | "Rejected", adminRemarks: "String", decidedBy: "UUID" }`
- **Response Shape:** `LeaveRequestDTO`
### `GET /api/v1/leaves/portfolio/:userId`
- **Response Shape:** `LeavePortfolioDTO` (Dynamic structure with implicit balances for specific leave types based on gender and role)

## 12. Clubs
**Current State:** localProvider | **Future:** apiProvider
*(Note: Leadership/Proposals are Planned - Not Implemented in Contract)*
### `GET /api/v1/clubs`
- **Response Shape:** `ClubDTO[]`

## 13. Mentorship
**Current State:** Planned - Not Implemented | **Future:** apiProvider
### `GET /api/v1/mentorship/remarks`
- **Response Shape:** `MentorRemarkDTO[]`

## 14. Duty Management
**Current State:** Planned - Not Implemented | **Future:** apiProvider
### `GET /api/v1/duties`
- **Response Shape:** `DutyRequestDTO[]`

## 15. Employee Directory
**Current State:** Planned - Not Implemented | **Future:** apiProvider
### `GET /api/v1/employees`
- **Response Shape:** `EmployeeDTO[]`
