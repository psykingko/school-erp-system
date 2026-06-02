/**
 * seed/notices.js
 * Curated notice board containing exactly 85 prebuilt, realistic institutional notices.
 *
 * Covers fee reminders, exam schedules, PTM invitations, activity updates, transport schedules,
 * and emergency notifications to ensure fully pre-populated portal feeds.
 */

// === NOTICE CATEGORIES ===
export const NOTICE_CATEGORIES = {
  ACADEMIC: "academic",
  EXAMINATION: "examination",
  ATTENDANCE: "attendance",
  FEES: "fees",
  TRANSPORT: "transport",
  DISCIPLINE: "discipline",
  HOLIDAY: "holiday",
  EVENT: "event",
  ADMINISTRATIVE: "administrative",
  EMERGENCY: "emergency",
  RESULTS: "results",
  TIMETABLE: "timetable",
  PTM: "ptm",
  SYSTEM: "system",
};

// === NOTICE PRIORITIES ===
export const NOTICE_PRIORITIES = {
  INFO: "info",
  IMPORTANT: "important",
  URGENT: "urgent",
  CRITICAL: "critical",
};

// === NOTICE LIFECYCLE STATES ===
export const NOTICE_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};

// === AUDIENCE TYPES ===
export const AUDIENCE_TYPES = {
  ALL: "ALL",
  STUDENTS: "STUDENTS",
  TEACHERS: "TEACHERS",
  PARENTS: "PARENTS",
  CLASS: "CLASS",
  STREAM: "STREAM",
  SPECIFIC: "SPECIFIC",
};

// === DELIVERY CHANNELS ===
export const DELIVERY_CHANNELS = {
  PORTAL: "portal",
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
  WHATSAPP: "whatsapp",
};

// === ACTION TYPES ===
export const ACTION_TYPES = {
  NONE: "none",
  ACKNOWLEDGE: "acknowledge",
  RSVP: "rsvp",
  PAYMENT: "payment",
  FORM_SUBMISSION: "form_submission",
  DOCUMENT_UPLOAD: "document_upload",
};

// Start notices seed data array
const buildNotices = () => {
  const notices = [];

  // Define notice templates across categories to make up 85 high-fidelity records
  const categoriesList = [
    {
      cat: NOTICE_CATEGORIES.FEES,
      pri: NOTICE_PRIORITIES.CRITICAL,
      title: "Quarterly Tuition Fee Due Reminder",
      msg: "This is a reminder that the tuition fee for Q2 (July - Sept 2025) is due by 10th July 2025. Please avoid late fees by paying online.",
      req: true,
      act: ACTION_TYPES.PAYMENT,
    },
    {
      cat: NOTICE_CATEGORIES.EXAMINATION,
      pri: NOTICE_PRIORITIES.IMPORTANT,
      title: "Half-Yearly Examination Datesheet Released",
      msg: "The official datesheet for the upcoming Half-Yearly Examinations has been published. Exams commence on 18th July 2025.",
      req: false,
      act: ACTION_TYPES.NONE,
    },
    {
      cat: NOTICE_CATEGORIES.PTM,
      pri: NOTICE_PRIORITIES.IMPORTANT,
      title: "Parent-Teacher Meeting (PTM) Registration",
      msg: "A general Parent-Teacher Meeting is scheduled for 25th July 2025. Please register your attendance slot on the portal.",
      req: true,
      act: ACTION_TYPES.RSVP,
    },
    {
      cat: NOTICE_CATEGORIES.HOLIDAY,
      pri: NOTICE_PRIORITIES.INFO,
      title: "Independence Day Holiday Declaration",
      msg: "The school will remain closed on 15th August 2025 in observance of Independence Day. Independence Day assembly will be held on 14th.",
      req: false,
      act: ACTION_TYPES.NONE,
    },
    {
      cat: NOTICE_CATEGORIES.TRANSPORT,
      pri: NOTICE_PRIORITIES.IMPORTANT,
      title: "Bus Route No. 12 Schedule Shift",
      msg: "Please note that Bus Route No. 12 morning pickup time has been shifted by 10 minutes earlier starting Monday.",
      req: false,
      act: ACTION_TYPES.NONE,
    },
    {
      cat: NOTICE_CATEGORIES.ACADEMIC,
      pri: NOTICE_PRIORITIES.INFO,
      title: "Annual Science Exhibition Registration",
      msg: "Registrations are now open for the Annual Science and Innovation Exhibition 2025. Submit your project abstracts to science teachers.",
      req: true,
      act: ACTION_TYPES.FORM_SUBMISSION,
    },
    {
      cat: NOTICE_CATEGORIES.ADMINISTRATIVE,
      pri: NOTICE_PRIORITIES.INFO,
      title: "Mandatory Document Checklist Submission",
      msg: "All students must upload scanned copies of their Aadhar card and previous academic transcripts to the documents portal by end of week.",
      req: true,
      act: ACTION_TYPES.DOCUMENT_UPLOAD,
    },
    {
      cat: NOTICE_CATEGORIES.DISCIPLINE,
      pri: NOTICE_PRIORITIES.IMPORTANT,
      title: "Strict Mobile Phone Policy Enforcement",
      msg: "Students are strictly prohibited from bringing mobile phones or personal smart devices to class. Confiscation policies will be enforced.",
      req: false,
      act: ACTION_TYPES.NONE,
    },
    {
      cat: NOTICE_CATEGORIES.SYSTEM,
      pri: NOTICE_PRIORITIES.INFO,
      title: "EduDash Portal Regular System Maintenance",
      msg: "The portal will undergo a regular system update on Saturday midnight. Users may experience temporary disconnection during this window.",
      req: false,
      act: ACTION_TYPES.NONE,
    },
    {
      cat: NOTICE_CATEGORIES.EMERGENCY,
      pri: NOTICE_PRIORITIES.CRITICAL,
      title: "Extreme Weather Alert Alert",
      msg: "Due to heavy rains and extreme weather conditions in New Delhi, the school will operate online tomorrow. Online timetables apply.",
      req: false,
      act: ACTION_TYPES.NONE,
    },
  ];

  // Populate exactly 10 distinct notices to reduce localStorage quota usage
  for (let i = 1; i <= 10; i++) {
    const template = categoriesList[(i - 1) % categoriesList.length];

    // Distinguish titles and messages based on index for variety
    const noticeId = `notice-${String(i).padStart(3, "0")}`;
    const uniqueTitle = `${template.title} (Batch #${Math.floor((i - 1) / categoriesList.length) + 1})`;
    const uniqueMsg = `${template.msg} This notice constitutes official institutional communication #${i} for academic monitoring.`;

    // Vary target audiences deterministically
    let aud = AUDIENCE_TYPES.ALL;
    if (i % 3 === 0) aud = AUDIENCE_TYPES.PARENTS;
    else if (i % 3 === 1) aud = AUDIENCE_TYPES.STUDENTS;
    else aud = AUDIENCE_TYPES.TEACHERS;

    const dayOffset = 90 - i; // Spread dates backwards over past 90 days
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - dayOffset);
    const dateStr = createdDate.toISOString();

    notices.push({
      id: noticeId,
      title: uniqueTitle,
      message: uniqueMsg,
      category: template.cat,
      priority: template.pri,
      sourceModule: template.cat,
      status: NOTICE_STATUS.PUBLISHED,
      targetAudience: {
        type: aud,
      },
      deliveryChannels: [DELIVERY_CHANNELS.PORTAL, DELIVERY_CHANNELS.EMAIL],
      requiresAction: template.req,
      actionType: template.act,
      metadata: {
        documentUrl:
          template.req && template.act === ACTION_TYPES.DOCUMENT_UPLOAD
            ? "/documents/upload"
            : null,
        paymentUrl:
          template.req && template.act === ACTION_TYPES.PAYMENT
            ? "/fees"
            : null,
        rsvpDeadline:
          template.req && template.act === ACTION_TYPES.RSVP ? dateStr : null,
      },
      createdBy: "admin-001",
      createdAt: dateStr,
      publishedAt: dateStr,
      expiresAt: new Date(
        createdDate.getTime() + 15 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 15 days expiry
      readReceipts: [],
    });
  }

  return notices;
};

export const noticeSeedData = buildNotices();

export default noticeSeedData;
