/**
 * services/authService.js
 * Scalable Authentication Service for EduDash
 */

import { getDataProvider } from "../data";
import { ROLES } from "../auth/roles";
import { formatClassLevel } from "../utils/classIdentity";

/**
 * Authenticates a user with username and password.
 * This is designed to be easily swappable with a real backend API call.
 */
export const authenticate = async ({ role, username, password }) => {
  if (!role) {
    throw new Error("Please select a role to continue.");
  }

  const selectedRoleUpper = role.toUpperCase();
  const provider = getDataProvider();

  // 1. Find the user in the centralized auth users collection by username and role scope
  const authUser = await provider.getAuthUserByUsername(
    username,
    selectedRoleUpper,
  );

  if (!authUser) {
    const authUsers = await provider.getAuthUsers();
    const usernameExists = authUsers.some((u) => u.username === username);
    if (usernameExists) {
      throw new Error("Invalid credentials for selected role.");
    }
    throw new Error("Invalid username or password");
  }

  // 2. Validate password
  if (authUser.password !== password) {
    throw new Error("Invalid username or password");
  }

  if (!authUser.active) {
    throw new Error("User account is inactive");
  }

  // 3. Resolve the linked entity details
  let entity = null;
  let fullName = "Unknown User";

  if (authUser.role === ROLES.STUDENT) {
    const students = await provider.getStudents();
    entity = students.find((s) => s.id === authUser.linkedEntityId || s.studentId === authUser.linkedEntityId);
    fullName = entity?.name || "Student";
  } else if (authUser.role === ROLES.TEACHER) {
    const teachers = await provider.getTeachers();
    entity = teachers.find((t) => t.id === authUser.linkedEntityId || t.teacherId === authUser.linkedEntityId);
    fullName = entity?.teacherName || entity?.name || "Teacher";
  } else if (authUser.role === ROLES.PARENT) {
    const parents = await provider.getParents();
    entity = parents.find((p) => p.id === authUser.linkedEntityId || p.parentId === authUser.linkedEntityId);
    fullName = entity?.name || "Parent";
  } else if (authUser.role === ROLES.ADMIN) {
    fullName = "System Administrator";
  }

  // 3. Construct the normalized auth session object
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleColors = {
    [ROLES.STUDENT]: "#03045e",
    [ROLES.TEACHER]: "#0077b6",
    [ROLES.PARENT]: "#00b4d8",
    [ROLES.ADMIN]: "#7209b7",
  };

  return {
    isAuthenticated: true,
    authUserId: authUser.id,
    role: authUser.role,
    linkedEntityId: authUser.linkedEntityId,
    name: fullName,
    admissionNumber:
      entity?.admissionNo ||
      entity?.employeeId ||
      authUser.linkedEntityId ||
      "N/A",
    avatarInitials: initials || "?",
    avatarColor: roleColors[authUser.role] || "#03045e",
    profile: entity, // Full relational entity data for UI convenience
  };
};

/**
 * Validates session integrity (Simulated)
 */
export const validateSession = async (user) => {
  if (!user || !user.authUserId) return false;
  const provider = getDataProvider();
  const record = await provider.getAuthUserById(user.authUserId);
  return !!record && record.active;
};

/**
 * Retrieves demo accounts for the quick access credential loader.
 */
export const getDemoAccounts = async () => {
  const provider = getDataProvider();
  const users = await provider.getAuthUsers();
  const studentsList = await provider.getStudents();
  const teachersList = await provider.getTeachers();
  const parentsList = await provider.getParents();

  // Group by role
  const demoAccounts = {
    [ROLES.STUDENT]: [],
    [ROLES.TEACHER]: [],
    [ROLES.PARENT]: [],
    [ROLES.ADMIN]: [],
  };

  users.forEach((user) => {
    let displayName = user.username;
    let description = "";
    const extraMeta = {};

    if (user.role === ROLES.STUDENT) {
      const student = studentsList.find(
        (s) =>
          s.studentId === user.linkedEntityId || s.id === user.linkedEntityId,
      );
      displayName = student ? student.name : user.username;
      if (student) {
        description = `Adm No. ${student.studentId}`;
        // Use flattened classLevel and section directly
        if (student.classLevel) {
          const displayLevel = formatClassLevel(student.classLevel);
          description += ` · Class ${displayLevel}-${student.section}`;
          extraMeta.classLevel = student.classLevel.toLowerCase();
          extraMeta.section = student.section?.toUpperCase();
        }
      }
    } else if (user.role === ROLES.TEACHER) {
      const teacher = teachersList.find(
        (t) =>
          t.teacherId === user.linkedEntityId || t.id === user.linkedEntityId,
      );
      displayName = teacher
        ? teacher.teacherName || teacher.name || user.username
        : user.username;
      const designation = teacher?.designation || "";
      // Use flattened isClassTeacher field directly
      extraMeta.isClassTeacher = teacher?.isClassTeacher || false;
      extraMeta.classTeacherOfClassId = teacher?.className || null;
      extraMeta.assignedClassIds = teacher?.className
        ? [teacher.className]
        : [];
      description = extraMeta.isClassTeacher
        ? `Class Teacher · ${designation}`
        : designation || "Subject Teacher";
    } else if (user.role === ROLES.PARENT) {
      const parent = parentsList.find(
        (p) =>
          p.parentId === user.linkedEntityId || p.id === user.linkedEntityId,
      );
      displayName = parent ? parent.name : user.username;

      // Find children by parentId (using childIds or matching parentId)
      const children = studentsList.filter(
        (s) =>
          s.parentId === user.linkedEntityId || s.parentId === parent?.parentId,
      );
      if (children.length > 0) {
        const childInfo = children
          .map((c) => `${c.name} (${c.studentId})`)
          .join(" & ");
        description = `Parent of ${childInfo}`;
        if (children[0].classLevel) {
          extraMeta.childClassLevel = children[0].classLevel.toLowerCase();
          extraMeta.childSection = children[0].section?.toUpperCase();
        }
      }
    } else if (user.role === ROLES.ADMIN) {
      displayName = "Admin User";
      description = "System Administrator";
    }

    if (demoAccounts[user.role]) {
      demoAccounts[user.role].push({
        ...user,
        displayName,
        description,
        ...extraMeta,
      });
    }
  });

  return demoAccounts;
};
