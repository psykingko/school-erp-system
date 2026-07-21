# 12 - Provider Contracts & Implementation Gap Analysis

This document maps the exact state of the Data Provider methods across the three critical layers:
1. `providerInterface.js` (The Formal Contract)
2. `src/services/*` (The Consumer)
3. `localProvider.js` (The Current Implementation)

When migrating to the backend, the future `apiProvider` MUST satisfy the **Implemented + Contracted** and **Implemented + Not Contracted** methods, or the frontend will break.

## Classification Legend
- 🟢 **Implemented + Contracted**: Exists in localProvider, used by Services, and explicitly defined in `providerInterface.js`.
- 🔴 **Implemented + Not Contracted**: Exists in localProvider, used by Services, but **MISSING** from `providerInterface.js`. (Architectural gap).
- ⚪ **Planned + Not Implemented**: Does not exist in localProvider or Services. Exists only as UI stubs or theoretical requirements.

---

## 1. Authentication & Users
| Method | Classification | Status |
|---|---|---|
| `login`, `logout` | 🟢 Implemented + Contracted | Active |
| `getCurrentUser` | 🟢 Implemented + Contracted | Active |
| `getAuthUsers`, `getAuthUserById`, `createAuthUser`, etc. | 🟢 Implemented + Contracted | Used by Onboarding and Seed Generators |

## 2. Students, Teachers & Parents
| Method | Classification | Status |
|---|---|---|
| `getStudents`, `getStudentById`, `addStudent`, `updateStudent` | 🟢 Implemented + Contracted | Active |
| `getTeachers`, `getTeacherById`, `updateTeacher` | 🟢 Implemented + Contracted | Active |
| `getParents`, `getParentById`, `createParent`, `updateParent` | 🟢 Implemented + Contracted | Active |
| `getEmployees` | 🔴 Implemented + Not Contracted | Used by `EmployeeDirectoryPage.jsx` directly |

## 3. Academics (Classes, Subjects, Timetable)
| Method | Classification | Status |
|---|---|---|
| `getClasses`, `getClassById` | 🟢 Implemented + Contracted | Active |
| `getSubjects`, `getStreams` | 🟢 Implemented + Contracted | Active |
| `getTimetables`, `setTimetables` | 🟢 Implemented + Contracted | Active |

## 4. Attendance
| Method | Classification | Status |
|---|---|---|
| `getDailyAttendance` | 🟢 Implemented + Contracted | Active |
| `markAttendance` | 🟢 Implemented + Contracted | Active |
| `getAttendanceSessions` | 🟢 Implemented + Contracted | Active |
| `getStaffDailyAttendance` | 🔴 Implemented + Not Contracted | Used by `staffAttendanceService.js` |
| `markStaffAttendance` | 🔴 Implemented + Not Contracted | Used by `staffAttendanceService.js` |
| `getInstitutionSettings` | 🔴 Implemented + Not Contracted | Used by Governance Services |
| `updateInstitutionSettings` | 🔴 Implemented + Not Contracted | Used by Governance Services |

## 5. Assignments & Exams
| Method | Classification | Status |
|---|---|---|
| `getAssignments`, `createAssignment` | 🟢 Implemented + Contracted | Active |
| `getSubmissions`, `updateSubmission` | 🟢 Implemented + Contracted | Active |
| `getExams`, `createExam` | 🟢 Implemented + Contracted | Active |
| `getResults`, `createResult` | 🟢 Implemented + Contracted | Active |

## 6. Finance
| Method | Classification | Status |
|---|---|---|
| `getFees`, `getFeesByStudent`, `updateFee`, `addFee` | 🟢 Implemented + Contracted | Active |
| `getInvoices`, `getReceipts`, `getInvoicesByStudent`, `getReceiptsByStudent` | 🟢 Implemented + Contracted | Active |
| `getFeeStructures`, `getFeeStructureById`, `updateFeeStructure` | 🟢 Implemented + Contracted | Active |
| `getFeeHeads`, `getFeeHeadById`, `createFeeHead`, `updateFeeHead`, `deleteFeeHead` | 🔴 Implemented + Not Contracted | Used heavily by `financeService.js` and `FeeManagementPage.jsx` |
| `getStudentFeeAdjustments`, `getStudentFeeAdjustmentById`, `createStudentFeeAdjustment`, `updateStudentFeeAdjustment`, `deleteStudentFeeAdjustment` | 🔴 Implemented + Not Contracted | Used heavily by `financeService.js` and `FeeManagementPage.jsx` |
| `getFeeConfiguration`, `updateFeeConfiguration` | 🔴 Implemented + Not Contracted | Used heavily by `financeService.js` and `FeeManagementPage.jsx` |

## 7. Transport
| Method | Classification | Status |
|---|---|---|
| `getTransportRoutes`, `getTransportVehicles` | 🟢 Implemented + Contracted | Active |
| `getTransportAlerts` | 🟢 Implemented + Contracted | Active |

## 8. Support Center
| Method | Classification | Status |
|---|---|---|
| `getSupportRequests` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |
| `createSupportRequest` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |
| `updateSupportRequest` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |
| `addSupportRemark` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |
| `getSupportSettings` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |

## 9. Student Duty Management
| Method | Classification | Status |
|---|---|---|
| `getStudentDutyRequests` | 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |
| `createStudentDutyRequest` | 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |
| `updateStudentDutyRequest` | 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |
| `cancelStudentDutyRequest` | 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |
| `completeStudentDutyRequest`| 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |

## 10. Clubs & Committees
| Method | Classification | Status |
|---|---|---|
| `getClubs`, `getClubById` | 🟢 Implemented + Contracted | Active |
| `getClubEnrollments` | 🟢 Implemented + Contracted | Active |
| `getClubAnnouncements` | 🔴 Implemented + Not Contracted | Used by `clubsService.js` |
| `getClubCreationProposals` | 🔴 Implemented + Not Contracted | Used by `clubsService.js` |
| `assignClubRole`, `demote` | 🔴 Implemented + Not Contracted | Used by `clubsService.js` |

## 11. Departments & Access Control
| Method | Classification | Status |
|---|---|---|
| `getDepartments`, `createDepartment`, `updateDepartment`, `deleteDepartment` | 🔴 Implemented + Not Contracted | Bypasses service layer, used by `ManageDepartmentsPage.jsx` directly |
| `getApprovalSettings`, `updateApprovalSetting` | 🔴 Implemented + Not Contracted | Bypasses service layer, used by `AccessControlPage.jsx` directly |
| `getCampaigns`, `createCampaign` | ⚪ Planned + Not Implemented | UI Stub Only in `CommunicationCenterPage.jsx` |

## 12. Assessment Governance
| Method | Classification | Status | Intent |
|---|---|---|---|
| `getAssessmentGovernance` | 🔴 Implemented + Not Contracted | Used by `assessmentGovernanceService.js` | Retrieve global categories, weightages, grade boundaries. |
| `saveAssessmentGovernance` | 🔴 Implemented + Not Contracted | Used by `assessmentGovernanceService.js` | Save updated governance configuration. |

## 13. Academic Report Cards
| Method | Classification | Status | Intent |
|---|---|---|---|
| `getReportCardsByClassAndSession` | 🔴 Implemented + Not Contracted | Used by `reportCardService.js` | Retrieve existing report cards. |
| `saveReportCards` | 🔴 Implemented + Not Contracted | Used by `reportCardService.js` | Bulk persist newly generated or updated report cards. |
| `freezeReportCards` | 🔴 Implemented + Not Contracted | Used by `reportCardService.js` | Lock report cards to prevent further modifications. |
| `publishReportCards` | 🔴 Implemented + Not Contracted | Used by `reportCardService.js` | Expose report cards to Student/Parent portals. |

## 14. Academic Calendar (LocalStorage Direct Storage)
Note: The Academic Calendar subsystem bypasses the DataProvider interface for its initial prototype architecture.
| Key | Classification | Status | Intent |
|---|---|---|---|
| `ACADEMIC_CALENDAR` | 🔴 Implemented + Direct Storage | Used by `academicCalendarService.js` | Single Source of Truth for the centralized institutional calendar. |

---

## Action Plan for Backend Migration
The backend team MUST ensure that the future `apiProvider.js` implements all 🟢 **and** 🔴 methods. Before backend work begins, the frontend team should backport all 🔴 methods into `providerInterface.js` to properly formally document the expected signatures. The `ACADEMIC_CALENDAR` key must also be migrated to a backend relational table.
