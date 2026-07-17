import { addStudent } from "./studentService";
import { createParent } from "./parentService";
import { addFee } from "./financeService";
import { getDataProvider } from "../data";

/**
 * Student Onboarding Service (Phase 2)
 * Coordinates persistence for new student onboarding.
 */
export const studentOnboardingService = {
  processOnboarding: async (payload) => {
    try {
      // 1. Persist Student
      const classId = `class-${payload.student.classLevel.toLowerCase()}${payload.student.section.toLowerCase()}`;
      const streamNameToId = {
        "Science Non-Medical": "SCIENCE_NON_MEDICAL",
        "Science Medical": "SCIENCE_MEDICAL",
        Commerce: "COMMERCE",
        Humanities: "HUMANITIES",
      };
      const streamId = payload.student.stream ? streamNameToId[payload.student.stream] : null;

      const studentData = {
        name: payload.student.name,
        gender: payload.student.gender,
        dob: payload.student.dob,
        admissionNo: payload.student.admissionNo,
        studentId: payload.student.admissionNo, // Important for relations
        phoneNumber: payload.student.phoneNumber,
        email: payload.student.email,
        address: payload.student.address,
        classLevel: payload.student.classLevel,
        section: payload.student.section,
        className: `${payload.student.classLevel}-${payload.student.section}`,
        classId,
        stream: payload.student.stream,
        streamId,
        isActive: true,
      };

      const newStudent = await addStudent(studentData);

      // 2. Persist Parent
      const parentData = {
        name: payload.parent.name,
        relationship: payload.parent.relationship,
        phoneNumber: payload.parent.phoneNumber,
        email: payload.parent.email,
        childIds: [newStudent.id], // Link to student's internal ID
      };

      const newParent = await createParent(parentData);

      // Update student with parentId back-reference (optional but good practice)
      const provider = getDataProvider();
      await provider.updateStudent(newStudent.id, { parentId: newParent.id });

      // 3. Create Student Authentication Record
      const studentAuthPayload = {
        username: payload.credentials.student.username,
        password: payload.credentials.student.password,
        role: "STUDENT",
        portalType: "STUDENT",
        status: "ACTIVE",
        active: true,
        linkedEntityId: newStudent.id,
        isSuperAdmin: false,
        manualOverrides: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      };
      await provider.createAuthUser(studentAuthPayload);

      // 4. Create Parent Authentication Record
      const parentAuthPayload = {
        username: payload.credentials.parent.username,
        password: payload.credentials.parent.password,
        role: "PARENT",
        portalType: "PARENT",
        status: "ACTIVE",
        active: true,
        linkedEntityId: newParent.id,
        isSuperAdmin: false,
        manualOverrides: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      };
      await provider.createAuthUser(parentAuthPayload);

      // 5. Generate Initial Finance Record (Minimum Invoice)
      const initialFee = {
        studentId: newStudent.id,
        amount: 25000,
        paidAmount: 0,
        billingMonth: "Admission",
        targetLabel: "Admission & Initial Fees",
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        invoiceNo: `INV-ADM-${Date.now()}`,
        status: "Pending",
        lineItems: [
          { label: "Admission Fee", amount: 10000, originalAmount: 10000 },
          { label: "Term 1 Tuition", amount: 15000, originalAmount: 15000 }
        ]
      };
      await addFee(initialFee);

      return {
        success: true,
        student: newStudent,
        parent: newParent
      };
    } catch (error) {
      console.error("Student Onboarding Error:", error);
      throw error;
    }
  }
};

export default studentOnboardingService;
