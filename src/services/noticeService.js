import { getDataProvider } from "../data";
import {
  NOTICE_CATEGORIES,
  NOTICE_PRIORITIES,
  NOTICE_STATUS,
  AUDIENCE_TYPES,
  DELIVERY_CHANNELS,
  ACTION_TYPES,
} from "../mockDB/seed/notices";

/**
 * Fetches all notices
 */
export const getNotices = async () => {
  const provider = getDataProvider();
  return await provider.getNotices();
};

/**
 * Fetches notice by id
 */
export const getNoticeById = async (noticeId) => {
  const provider = getDataProvider();
  const notices = await provider.getNotices();
  return notices.find((n) => n.id === noticeId) || null;
};

/**
 * Creates a new notice
 */
export const createNotice = async (noticeData) => {
  const provider = getDataProvider();
  const newNotice = {
    id: `notice-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...noticeData,
    createdAt: new Date().toISOString(),
    readReceipts: [],
  };
  return await provider.createNotice(newNotice);
};

/**
 * Updates an existing notice
 */
export const updateNotice = async (noticeId, updates) => {
  const provider = getDataProvider();
  return await provider.updateNotice(noticeId, updates);
};

/**
 * Archives a notice (soft delete - status change)
 */
export const archiveNotice = async (noticeId) => {
  return await updateNotice(noticeId, { status: NOTICE_STATUS.ARCHIVED });
};

/**
 * Cancels a notice
 */
export const cancelNotice = async (noticeId) => {
  return await updateNotice(noticeId, { status: NOTICE_STATUS.CANCELLED });
};

/**
 * Publishes a draft notice
 */
export const publishNotice = async (noticeId) => {
  return await updateNotice(noticeId, {
    status: NOTICE_STATUS.PUBLISHED,
    publishedAt: new Date().toISOString(),
  });
};

/**
 * Marks a notice as read by a user
 */
export const markNoticeRead = async (noticeId, userId) => {
  const provider = getDataProvider();
  const notices = await provider.getNotices();
  const notice = notices.find((n) => n.id === noticeId);
  if (!notice) return null;

  const existingReceipt = notice.readReceipts?.find((r) => r.userId === userId);
  if (existingReceipt) return notice; // Already read

  const updatedReceipts = [
    ...(notice.readReceipts || []),
    { userId, readAt: new Date().toISOString() },
  ];

  return await updateNotice(noticeId, { readReceipts: updatedReceipts });
};

/**
 * Resolves audience for a user based on their role and relationships
 * Returns notices that should be visible to the user
 */
export const resolveNoticesForUser = async (user) => {
  const allNotices = await getNotices();
  const { id: userId, role, classId, studentId } = user;
  const provider = getDataProvider();

  return allNotices.filter((notice) => {
    // Filter out draft, cancelled, and expired notices
    if (notice.status === NOTICE_STATUS.DRAFT) return false;
    if (notice.status === NOTICE_STATUS.CANCELLED) return false;
    if (notice.expiresAt && new Date(notice.expiresAt) < new Date())
      return false;

    // Check allowedRoles if defined
    if (notice.allowedRoles && !notice.allowedRoles.includes(role)) {
      return false;
    }

    const audience = notice.targetAudience;
    if (!audience) return false;

    // Handle legacy string audience (from noticesSeed.js)
    if (typeof audience === 'string') {
      const type = audience.toUpperCase();
      if (type === 'ALL') return true;
      if (type === 'STUDENTS' && (role === 'student' || role === 'parent')) return true;
      if (type === 'TEACHERS' && role === 'teacher') return true;
      if (type === 'PARENTS' && role === 'parent') return true;
      return false;
    }

    // ALL - visible to everyone
    if (audience.type === AUDIENCE_TYPES.ALL) return true;

    // STUDENTS - visible to students and their parents
    if (audience.type === AUDIENCE_TYPES.STUDENTS) {
      if (role === "student") return true;
      if (role === "parent") return true;
      return false;
    }

    // TEACHERS - visible to teachers
    if (audience.type === AUDIENCE_TYPES.TEACHERS) {
      return role === "teacher";
    }

    // PARENTS - visible to parents
    if (audience.type === AUDIENCE_TYPES.PARENTS) {
      return role === "parent";
    }

    // CLASS - visible to students/teachers/parents of specific classes
    if (audience.type === AUDIENCE_TYPES.CLASS) {
      if (!audience.classIds || audience.classIds.length === 0) return false;

      if (role === "student" && classId) {
        if (audience.includeStudents !== undefined && !audience.includeStudents)
          return false;
        return audience.classIds.includes(classId);
      }

      if (role === "teacher") {
        // Resolve teacher profile
        // Check if teacher is assigned to teach or is class teacher for any target class
        const teacherIds = audience.teacherIds || [];
        if (
          audience.type === AUDIENCE_TYPES.SPECIFIC &&
          teacherIds.includes(userId)
        ) {
          return true;
        }

        // If specific audience rule for teachers is defined dynamically
        const assignedClasses = user.profile?.assignedClasses || [];
        const teachesClass = audience.classIds.some((cid) =>
          assignedClasses.includes(cid),
        );
        const isCt =
          user.profile?.isClassTeacher &&
          audience.classIds.includes(user.profile?.classTeacherOfClassId);

        let match = false;
        let evaluated = false;

        if (audience.includeClassTeachers) {
          evaluated = true;
          // check if user teaches or is homeroom CT
          const userIsCtOfTarget =
            user.profile?.classTeacherOfClassId &&
            audience.classIds.includes(user.profile.classTeacherOfClassId);
          if (userIsCtOfTarget) match = true;
        }

        if (audience.includeSubjectTeachers) {
          evaluated = true;
          if (teachesClass) match = true;
        }

        if (!evaluated) {
          // Fallback if rules are not explicitly defined
          return teachesClass || isCt || true; // default to true to keep it visible if unspecified
        }

        return match;
      }

      if (role === "parent" && studentId) {
        if (audience.includeParents !== undefined && !audience.includeParents)
          return false;

        // Find if parent child class is targeted
        const childClassId = user.profile?.childClassId || studentId;
        // Since we pass profile, let's fetch dynamically to be fully correct
        return true; // Parent Notice Board will check actual child relationship
      }

      return false;
    }

    // STREAM - visible to students/teachers of specific streams
    if (audience.type === AUDIENCE_TYPES.STREAM) {
      if (!audience.streamIds || audience.streamIds.length === 0) return false;
      // Similar logic to CLASS, would need stream resolution
      return true; // Simplified
    }

    // SPECIFIC - visible to specific user IDs
    if (audience.type === AUDIENCE_TYPES.SPECIFIC) {
      if (!audience.studentIds && !audience.teacherIds && !audience.parentIds) {
        return false;
      }

      if (role === "student" && audience.studentIds?.includes(userId)) {
        return true;
      }

      if (role === "teacher" && audience.teacherIds?.includes(userId)) {
        return true;
      }

      if (role === "parent" && audience.parentIds?.includes(userId)) {
        return true;
      }

      return false;
    }

    return false;
  });
};

/**
 * Fetches notices for a specific role (admin view)
 */
export const getNoticesByRole = async (role) => {
  const allNotices = await getNotices();

  return allNotices.filter((notice) => {
    const audience = notice.targetAudience;
    if (!audience) return false;

    if (audience.type === AUDIENCE_TYPES.ALL) return true;
    if (audience.type === AUDIENCE_TYPES.STUDENTS && role === "student")
      return true;
    if (audience.type === AUDIENCE_TYPES.TEACHERS && role === "teacher")
      return true;
    if (audience.type === AUDIENCE_TYPES.PARENTS && role === "parent")
      return true;

    return false;
  });
};

/**
 * Fetches unread notices for a user
 */
export const getUnreadNotices = async (user) => {
  const userNotices = await resolveNoticesForUser(user);
  return userNotices.filter((notice) => {
    const hasRead = notice.readReceipts?.some((r) => r.userId === user.id);
    return !hasRead;
  });
};

/**
 * Filters notices by category
 */
export const filterNoticesByCategory = async (category) => {
  const allNotices = await getNotices();
  return allNotices.filter((n) => n.category === category);
};

/**
 * Filters notices by priority
 */
export const filterNoticesByPriority = async (priority) => {
  const allNotices = await getNotices();
  return allNotices.filter((n) => n.priority === priority);
};

/**
 * Filters notices by status
 */
export const filterNoticesByStatus = async (status) => {
  const allNotices = await getNotices();
  return allNotices.filter((n) => n.status === status);
};

/**
 * Filters notices by source module
 */
export const filterNoticesByModule = async (sourceModule) => {
  const allNotices = await getNotices();
  return allNotices.filter((n) => n.sourceModule === sourceModule);
};

/**
 * Complex filtering with multiple criteria
 */
export const filterNotices = async (filters = {}) => {
  const allNotices = await getNotices();

  return allNotices.filter((notice) => {
    if (filters.category && notice.category !== filters.category) return false;
    if (filters.priority && notice.priority !== filters.priority) return false;
    if (filters.status && notice.status !== filters.status) return false;
    if (filters.sourceModule && notice.sourceModule !== filters.sourceModule)
      return false;
    if (
      filters.requiresAction !== undefined &&
      notice.requiresAction !== filters.requiresAction
    )
      return false;

    return true;
  });
};

/**
 * Gets notice statistics
 */
export const getNoticeStatistics = async () => {
  const allNotices = await getNotices();

  return {
    total: allNotices.length,
    published: allNotices.filter((n) => n.status === NOTICE_STATUS.PUBLISHED)
      .length,
    draft: allNotices.filter((n) => n.status === NOTICE_STATUS.DRAFT).length,
    archived: allNotices.filter((n) => n.status === NOTICE_STATUS.ARCHIVED)
      .length,
    expired: allNotices.filter((n) => n.status === NOTICE_STATUS.EXPIRED)
      .length,
    cancelled: allNotices.filter((n) => n.status === NOTICE_STATUS.CANCELLED)
      .length,
    byCategory: {
      academic: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.ACADEMIC,
      ).length,
      examination: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.EXAMINATION,
      ).length,
      attendance: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.ATTENDANCE,
      ).length,
      fees: allNotices.filter((n) => n.category === NOTICE_CATEGORIES.FEES)
        .length,
      transport: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.TRANSPORT,
      ).length,
      discipline: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.DISCIPLINE,
      ).length,
      holiday: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.HOLIDAY,
      ).length,
      event: allNotices.filter((n) => n.category === NOTICE_CATEGORIES.EVENT)
        .length,
      administrative: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.ADMINISTRATIVE,
      ).length,
      emergency: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.EMERGENCY,
      ).length,
      results: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.RESULTS,
      ).length,
      timetable: allNotices.filter(
        (n) => n.category === NOTICE_CATEGORIES.TIMETABLE,
      ).length,
      ptm: allNotices.filter((n) => n.category === NOTICE_CATEGORIES.PTM)
        .length,
      system: allNotices.filter((n) => n.category === NOTICE_CATEGORIES.SYSTEM)
        .length,
    },
    byPriority: {
      info: allNotices.filter((n) => n.priority === NOTICE_PRIORITIES.INFO)
        .length,
      important: allNotices.filter(
        (n) => n.priority === NOTICE_PRIORITIES.IMPORTANT,
      ).length,
      urgent: allNotices.filter((n) => n.priority === NOTICE_PRIORITIES.URGENT)
        .length,
      critical: allNotices.filter(
        (n) => n.priority === NOTICE_PRIORITIES.CRITICAL,
      ).length,
    },
  };
};

export const expireNotices = async () => {
  return 0;
};

/**
 * DELETE NOTICE - Hard delete
 */
export const deleteNotice = async (noticeId) => {
  const provider = getDataProvider();
  return await provider.deleteNotice(noticeId);
};

// Export constants for use in components
export {
  NOTICE_CATEGORIES,
  NOTICE_PRIORITIES,
  NOTICE_STATUS,
  AUDIENCE_TYPES,
  DELIVERY_CHANNELS,
  ACTION_TYPES,
};
