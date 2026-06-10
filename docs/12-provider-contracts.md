# Provider Contracts (Frontend Interface Freeze)

This document formalizes the exact Provider interface signatures. When we swap out `localProvider` with `apiProvider`, the API provider MUST implement exactly these methods and return the DTOs defined in the API contracts. The UI components must NEVER call `apiProvider` or `localProvider` directly; they call the generic `provider.*` facade.

## Core Design Principle
- **Consumer:** Frontend Service (`src/services/*`)
- **Implementer:** `apiProvider.js` (Future) / `localProvider.js` (Current)
- **Constraint:** All methods are asynchronous and return Promises wrapping their respective DTOs.

---

## 1. Auth Provider Interface

```javascript
/**
 * @interface AuthProvider
 */
export const AuthProviderContract = {
  /**
   * @param {Object} credentials - { username, password }
   * @returns {Promise<LoginResponseDTO>}
   */
  async login(credentials) {},

  /**
   * @returns {Promise<CurrentUserDTO>}
   */
  async getCurrentUser() {},

  /**
   * @returns {Promise<void>}
   */
  async logout() {}
};
```

---

## 2. Student Provider Interface

```javascript
/**
 * @interface StudentProvider
 */
export const StudentProviderContract = {
  /**
   * @param {string} id
   * @returns {Promise<StudentProfileDTO>}
   */
  async getStudentById(id) {},

  /**
   * @param {Object} filters - e.g. { classId: "class-10a" }
   * @returns {Promise<StudentProfileDTO[]>}
   */
  async getStudents(filters) {},

  /**
   * @param {string} id
   * @returns {Promise<StudentDashboardDTO>}
   */
  async getStudentDashboard(id) {}
};
```

---

## 3. Teacher Provider Interface

```javascript
/**
 * @interface TeacherProvider
 */
export const TeacherProviderContract = {
  /**
   * @param {string} id
   * @returns {Promise<TeacherProfileDTO>}
   */
  async getTeacherById(id) {},

  /**
   * @param {string} id
   * @returns {Promise<TeacherDashboardDTO>}
   */
  async getTeacherDashboard(id) {}
};
```

---

## 4. Academic Provider Interface

```javascript
/**
 * @interface AcademicProvider
 */
export const AcademicProviderContract = {
  // --- Question Papers ---

  /**
   * @param {QuestionPaperDTO} data
   * @returns {Promise<QuestionPaperDTO>}
   */
  async createQuestionPaper(data) {},

  /**
   * @param {string} teacherId
   * @returns {Promise<QuestionPaperDTO[]>}
   */
  async getTeacherQuestionPapers(teacherId) {},

  /**
   * @returns {Promise<QuestionPaperDTO[]>}
   */
  async getAdminPendingQuestionPapers() {},

  /**
   * @param {string} id
   * @param {Object} update - { status: "Approved", remarks: "" }
   * @returns {Promise<QuestionPaperDTO>}
   */
  async updateQuestionPaperStatus(id, update) {},

  // --- Assignments ---

  /**
   * @param {string} classId
   * @returns {Promise<AssignmentDTO[]>}
   */
  async getAssignments(classId) {},

  // --- Results ---

  /**
   * @param {string} examId
   * @param {string} studentId
   * @returns {Promise<ExamResultDTO>}
   */
  async getExamResult(examId, studentId) {}
};
```

---

## 5. Parent Provider Interface

```javascript
/**
 * @interface ParentProvider
 */
export const ParentProviderContract = {
  /**
   * @param {string} id
   * @returns {Promise<ParentProfileDTO>}
   */
  async getParentById(id) {}
};

---

## 6. Transport Provider Interface

```javascript
/**
 * @interface TransportProvider
 */
export const TransportProviderContract = {
  // --- Routes & Vehicles ---
  async getTransportRoutes() {},
  async getTransportRouteById(id) {},
  async createTransportRoute(data) {},
  
  async getTransportVehicles() {},
  async getTransportVehicleById(id) {},
  async createTransportVehicle(data) {},
  
  // --- Stops ---
  async getTransportStops() {},
  async getTransportStopsByRoute(routeId) {},
  async createTransportStop(data) {},
  async deleteTransportStop(id) {},
  
  // --- Allocations ---
  async getTransportAllocations() {},
  async getTransportAllocationsByRoute(routeId) {},
  async getTransportAssignmentByStudent(studentId) {},
  async createTransportAllocation(data) {},
  async deleteTransportAllocation(id) {},
  
  // --- Alerts ---
  async getTransportAlerts() {},
  async createTransportAlert(data) {},
  async deleteTransportAlert(id) {}
};
```
```
