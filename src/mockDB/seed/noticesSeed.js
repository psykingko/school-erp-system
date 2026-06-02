/**
 * Notices Seed Data - FLATTENED Structure
 * 
 * Phase 8: Portal Population
 * - 20 notices for active portal feeds
 * - STATIC data only
 * - Mixed categories for visual variety
 */

export const noticesSeed = [
  // Academic Notices
  {
    noticeId: "notice-001",
    title: "Half-Yearly Examination Schedule Released",
    content: "The Half-Yearly Examination datesheet has been published. Exams commence from September 15th, 2025. Students are advised to collect their admit cards.",
    category: "academic",
    priority: "high",
    targetAudience: "students",
    targetClasses: ["10-A", "10-B", "10-C", "10-D", "11-A", "11-B", "11-C", "11-D"],
    publishDate: "2025-09-01",
    expiryDate: "2025-09-30",
    status: "active",
    author: "Academic Office",
  },
  {
    noticeId: "notice-002",
    title: "UT1 Results Declared",
    content: "Unit Test 1 results for all classes are now available. Parents can view results through the parent portal.",
    category: "academic",
    priority: "medium",
    targetAudience: "parents",
    targetClasses: ["10-A", "10-B", "10-C", "10-D", "11-A", "11-B", "11-C", "11-D"],
    publishDate: "2025-07-25",
    expiryDate: "2025-08-15",
    status: "active",
    author: "Examination Cell",
  },
  
  // Fee Notices
  {
    noticeId: "notice-003",
    title: "Quarterly Fee Due - July 2025",
    content: "This is a reminder that the tuition fee for Q2 (July-September) is due by July 15th, 2025. Late fees will apply after the due date.",
    category: "fees",
    priority: "high",
    targetAudience: "parents",
    targetClasses: ["10-A", "10-B", "10-C", "10-D", "11-A", "11-B", "11-C", "11-D"],
    publishDate: "2025-07-01",
    expiryDate: "2025-07-20",
    status: "active",
    author: "Accounts Office",
  },
  {
    noticeId: "notice-004",
    title: "Fee Concession Application Open",
    content: "Applications for fee concession for the academic year 2025-26 are now being accepted. Eligible students may apply before August 31st.",
    category: "fees",
    priority: "medium",
    targetAudience: "parents",
    targetClasses: ["10-A", "10-B", "10-C", "10-D", "11-A", "11-B", "11-C", "11-D"],
    publishDate: "2025-08-01",
    expiryDate: "2025-08-31",
    status: "active",
    author: "Accounts Office",
  },
  
  // Events & Activities
  {
    noticeId: "notice-005",
    title: "Annual Sports Day - September 20th",
    content: "The Annual Sports Day will be held on September 20th, 2025. All students are encouraged to participate. Registration closes on September 10th.",
    category: "event",
    priority: "medium",
    targetAudience: "all",
    targetClasses: ["10-A", "10-B", "10-C", "10-D", "11-A", "11-B", "11-C", "11-D"],
    publishDate: "2025-08-20",
    expiryDate: "2025-09-20",
    status: "active",
    author: "Sports Department",
  },
  {
    noticeId: "notice-018",
    title: "Math Olympiad Qualifiers",
    content: "Five students from Class 10 & 11 have qualified for the Regional Math Olympiad. Best wishes!",
    category: "achievement",
    priority: "medium",
    targetAudience: "students",
    targetClasses: ["10-A", "10-B", "10-C", "10-D", "11-A", "11-B", "11-C", "11-D"],
    publishDate: "2025-08-20",
    expiryDate: "2025-09-10",
    status: "active",
    author: "Mathematics Department",
  },
  
  // Holidays
  {
    noticeId: "notice-019",
    title: "Ganesh Chaturthi Holiday",
    content: "School will remain closed on September 7th for Ganesh Chaturthi.",
    category: "holiday",
    priority: "low",
    targetAudience: "all",
    targetClasses: [],
    publishDate: "2025-09-01",
    expiryDate: "2025-09-07",
    status: "expired",
    author: "Admin Office",
  },
  {
    noticeId: "notice-020",
    title: "Teacher's Day Celebration",
    content: "Special assembly on September 5th to celebrate Teacher's Day. Students may bring cards for their teachers.",
    category: "event",
    priority: "low",
    targetAudience: "students",
    targetClasses: ["10-A", "10-B", "10-C", "10-D", "11-A", "11-B", "11-C", "11-D"],
    publishDate: "2025-09-01",
    expiryDate: "2025-09-05",
    status: "expired",
    author: "Student Council",
  },
];

// ============================================================================
// QUICK LOOKUP HELPERS
// ============================================================================

export const getNoticesByAudience = (audience) => 
  noticesSeed.filter(n => n.targetAudience === audience || n.targetAudience === "all");

export const getNoticesByClass = (className) => 
  noticesSeed.filter(n => n.targetClasses.includes(className) || n.targetClasses.length === 0);

export const getActiveNotices = () => 
  noticesSeed.filter(n => n.status === "active");

export const getHighPriorityNotices = () => 
  noticesSeed.filter(n => n.priority === "high" && n.status === "active");

export default {
  noticesSeed,
  getNoticesByAudience,
  getNoticesByClass,
  getActiveNotices,
  getHighPriorityNotices,
};
