import { getItem, setItem } from "../persistence/storage";
import { STORAGE_KEYS } from "../persistence/storageKeys";
import { clubsData } from "../data/clubs/clubs";
import { feesSeed } from "../mockDB/seed/feesSeed";
import { studentsSeed } from "../mockDB/seed/studentsSeed";
import { feeStructuresSeed, getFeeStructureForClass } from "../mockDB/seed/feeStructures";
import { classesSeed } from "../mockDB/seed/classes";

export const generateMissingMockData = () => {
  // 1. Seed Clubs
  const existingClubs = getItem(STORAGE_KEYS.CLUBS);
  if (!existingClubs || existingClubs.length === 0) {
    const allClubs = [...clubsData.joinedClubs, ...clubsData.availableClubs].map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      description: c.description || "A club for students to engage in extracurricular activities.",
      coordinator: c.coordinator || "Faculty Member",
      clubHeadTeacherId: "teach-001",
      logo: c.logo || "award",
    }));
    setItem(STORAGE_KEYS.CLUBS, allClubs);
    console.log(`[InitializationEngine] Generated and Seeded Clubs`);
  }

  // 2. Seed Club Enrollments (only for 'stud-001' to match the legacy 'joinedClubs')
  const existingEnrollments = getItem(STORAGE_KEYS.CLUB_ENROLLMENTS);
  if (!existingEnrollments || existingEnrollments.length === 0) {
    const enrollments = clubsData.joinedClubs.map(c => ({
      id: `enroll-${c.id}-stud-001`,
      studentId: "stud-001",
      clubId: c.id,
      role: c.role || "Member",
      joinedDate: "2024-07-20",
      status: "Active",
    }));
    setItem(STORAGE_KEYS.CLUB_ENROLLMENTS, enrollments);
    console.log(`[InitializationEngine] Generated and Seeded Club Enrollments`);
  }

  // 3. Seed Club Activities
  const existingActivities = getItem(STORAGE_KEYS.CLUB_ACTIVITIES);
  if (!existingActivities || existingActivities.length === 0) {
    const activities = clubsData.activities.map((a, i) => {
      // Find matching club id based on name
      const matchingClub = [...clubsData.joinedClubs, ...clubsData.availableClubs].find(c => c.name === a.club);
      return {
        id: a.id || `ev-${i}`,
        clubId: matchingClub ? matchingClub.id : "c1",
        title: a.title,
        description: "Join us for this exciting upcoming event.",
        date: "2025-05-25", // Hardcode future date
        time: a.time,
        venue: a.venue,
        type: a.type,
        status: "Upcoming",
        createdBy: "teach-001"
      };
    });
    setItem(STORAGE_KEYS.CLUB_ACTIVITIES, activities);
    console.log(`[InitializationEngine] Generated and Seeded Club Activities`);
  }

  // 4. Generate Invoices and Receipts from feesSeed and feeStructuresSeed
  const existingInvoices = getItem(STORAGE_KEYS.INVOICES);
  if (!existingInvoices || existingInvoices.length === 0) {
    const invoices = [];
    const receipts = [];
    
    // We'll generate 12 invoices for the current academic year for each student
    const months = [
      { month: "April", year: 2025 }, { month: "May", year: 2025 }, { month: "June", year: 2025 },
      { month: "July", year: 2025 }, { month: "August", year: 2025 }, { month: "September", year: 2025 },
      { month: "October", year: 2025 }, { month: "November", year: 2025 }, { month: "December", year: 2025 },
      { month: "January", year: 2026 }, { month: "February", year: 2026 }, { month: "March", year: 2026 }
    ];

    studentsSeed.forEach((student, index) => {
      const cls = classesSeed.find(c => c.id === student.classId);
      if (!cls) return;
      
      const structure = getFeeStructureForClass(feeStructuresSeed, cls);
      if (!structure) return;
      
      // Calculate monthly fee (just take annual / 12 for simplicity)
      const monthlyFee = structure.feeHeads.reduce((sum, h) => sum + ((h.annualAmount || 0) / 12), 0);
      
      // Look up feesSeed to see how much this student has paid
      const feeRecord = feesSeed.find(f => f.studentId === student.id) || { balance: monthlyFee * 12, paidAmount: 0 };
      
      let remainingPaid = feeRecord.paidAmount;
      
      months.forEach((m, mIndex) => {
        const invAmount = Math.round(monthlyFee);
        
        let invPaid = 0;
        let invStatus = "Pending";
        
        // Distribute the paid amount across invoices
        if (remainingPaid >= invAmount) {
          invPaid = invAmount;
          remainingPaid -= invAmount;
          invStatus = "Paid";
        } else if (remainingPaid > 0) {
          invPaid = remainingPaid;
          remainingPaid = 0;
          invStatus = "Partially Paid";
        }
        
        const monthNum = String(mIndex + 4 > 12 ? mIndex - 8 : mIndex + 4).padStart(2, "0");
        const invId = `inv-${student.id}-${m.month.toLowerCase()}`;
        
        invoices.push({
          id: invId,
          studentId: student.id,
          invoiceNo: `INV-${m.year}-${monthNum}-${String(index+1).padStart(3, "0")}`,
          amount: invAmount,
          paidAmount: invPaid,
          status: invStatus,
          dueDate: `${m.year}-${monthNum}-15`,
          billingMonth: `${m.month} ${m.year}`,
          targetLabel: `${m.month} ${m.year} Invoice`,
          isVacationMonth: false,
          lineItems: structure.feeHeads.map(h => ({
            label: h.label,
            amount: Math.round((h.annualAmount || 0) / 12)
          }))
        });
        
        if (invPaid > 0) {
          receipts.push({
            id: `rcp-${student.id}-${m.month.toLowerCase()}`,
            studentId: student.id,
            invoiceId: invId,
            receiptNo: `REC-${m.year}-${monthNum}-${String(index+1).padStart(3, "0")}`,
            amount: invPaid,
            date: `${m.year}-${monthNum}-10`,
            mode: "Online Payment",
            transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            targetLabel: `${m.month} ${m.year} Invoice`
          });
        }
      });
    });
    
    setItem(STORAGE_KEYS.INVOICES, invoices);
    setItem(STORAGE_KEYS.RECEIPTS, receipts);
    console.log(`[InitializationEngine] Generated and Seeded Invoices & Receipts`);
  }

  // 5. Seed School Events for the Event Board
  const existingEvents = getItem(STORAGE_KEYS.EVENTS);
  if (!existingEvents || existingEvents.length === 0) {
    const today = new Date();
    
    // Format date properly (e.g. "15 May 2025")
    const formatDate = (dateObj) => {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    };
    
    // Happening now (within next 3 days)
    const happeningDate = new Date(today);
    happeningDate.setDate(today.getDate() + 2);
    
    // Upcoming (within next 2 weeks)
    const upcomingDate1 = new Date(today);
    upcomingDate1.setDate(today.getDate() + 10);
    
    const upcomingDate2 = new Date(today);
    upcomingDate2.setDate(today.getDate() + 18);
    
    const events = [
      {
        id: "ev-001",
        name: "Annual Science Exhibition",
        category: "Academic",
        date: formatDate(happeningDate),
        status: "happening",
        daysLeft: 2,
        bgGradient: "linear-gradient(135deg, #03045e 0%, #0077b6 100%)",
        targetStreamId: null,
        targetClassId: null
      },
      {
        id: "ev-002",
        name: "Inter-School Debate Finals",
        category: "Cultural",
        date: formatDate(upcomingDate1),
        status: "upcoming",
        daysLeft: 10,
        bgGradient: "linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)",
        targetStreamId: null,
        targetClassId: null
      },
      {
        id: "ev-003",
        name: "Tech Innovators Hackathon",
        category: "Tech",
        date: formatDate(upcomingDate2),
        status: "upcoming",
        daysLeft: 18,
        bgGradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
        targetStreamId: null,
        targetClassId: null
      }
    ];
    
    setItem(STORAGE_KEYS.EVENTS, events);
    console.log(`[InitializationEngine] Generated and Seeded School Events`);
  }

  // 6. Seed Documents
  const existingDocs = getItem(STORAGE_KEYS.DOCUMENTS);
  if (!existingDocs || existingDocs.length === 0) {
    const documents = studentsSeed.flatMap((student) => [
      {
        id: `doc-1-${student.id}`,
        studentId: student.id,
        titleEn: "Aadhar Card",
        titleHi: "आधार कार्ड",
        category: "identity",
        status: "verified",
        icon: "IdCard",
        fileType: "PDF",
        fileSizeKb: 245,
        uploadDate: "2024-04-10",
        descriptionEn: "Official government ID proof.",
        descriptionHi: "आधिकारिक सरकारी आईडी प्रमाण।"
      },
      {
        id: `doc-2-${student.id}`,
        studentId: student.id,
        titleEn: "Previous Year Report Card",
        titleHi: "पिछले वर्ष का रिपोर्ट कार्ड",
        category: "academic",
        status: "pending",
        icon: "FileText",
        fileType: "JPG",
        fileSizeKb: 1250,
        uploadDate: "2024-04-12",
        descriptionEn: "Grade 9 final report card.",
        descriptionHi: "कक्षा 9 का अंतिम रिपोर्ट कार्ड।"
      },
      {
        id: `doc-3-${student.id}`,
        studentId: student.id,
        titleEn: "Medical Fitness Certificate",
        titleHi: "चिकित्सा फिटनेस प्रमाणपत्र",
        category: "medical",
        status: "missing",
        icon: "HeartPulse",
        descriptionEn: "Required for sports participation.",
        descriptionHi: "खेल भागीदारी के लिए आवश्यक।"
      }
    ]);
    setItem(STORAGE_KEYS.DOCUMENTS, documents);
    console.log(`[InitializationEngine] Generated and Seeded Documents`);
  }

  // 7. Seed Achievements
  const existingAchievements = getItem(STORAGE_KEYS.ACHIEVEMENTS);
  if (!existingAchievements || existingAchievements.length === 0) {
    const achievements = studentsSeed.flatMap((student) => [
      {
        id: `ach-1-${student.id}`,
        studentId: student.id,
        titleEn: "1st Prize in Science Exhibition",
        titleHi: "विज्ञान प्रदर्शनी में प्रथम पुरस्कार",
        category: "academic",
        rank: "gold",
        date: "2024-11-15",
        organizationEn: "EduDash School",
        organizationHi: "एडुडैश स्कूल",
        descriptionEn: "Awarded for the best physics working model.",
        descriptionHi: "सर्वश्रेष्ठ भौतिकी वर्किंग मॉडल के लिए सम्मानित।",
        hasCertificate: true,
        color: "#b45309",
        colorBg: "#fef3c7"
      },
      {
        id: `ach-2-${student.id}`,
        studentId: student.id,
        titleEn: "Inter-School Basketball Runner Up",
        titleHi: "अंतर-विद्यालय बास्केटबॉल उपविजेता",
        category: "sports",
        rank: "silver",
        date: "2024-12-05",
        organizationEn: "State Sports Authority",
        organizationHi: "राज्य खेल प्राधिकरण",
        descriptionEn: "Secured second place in the state level tournament.",
        descriptionHi: "राज्य स्तरीय टूर्नामेंट में दूसरा स्थान हासिल किया।",
        hasCertificate: true,
        color: "#475569",
        colorBg: "#f1f5f9"
      }
    ]);
    setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
    console.log(`[InitializationEngine] Generated and Seeded Achievements`);
  }

  // 8. Seed Transport Data
  const existingTransportAssignments = getItem(STORAGE_KEYS.TRANSPORT_ASSIGNMENTS);
  if (!existingTransportAssignments || existingTransportAssignments.length === 0) {
    const drivers = [
      { id: "dr-1", name: "Ramesh Chand", rating: 4.8, experience: "12 Years", emergencyContact: "+91 98765 43210", shift: "Morning Shift" }
    ];
    const vehicles = [
      {
        id: "vh-1", vehicleNo: "DL-1PB-4521", model: "Tata Starbus 40", type: "AC Bus",
        capacity: 40, fuelType: "CNG", zone: "North Zone", features: ["GPS", "CCTV", "First Aid"],
        coordinator: "Mr. Sharma (Transport Head)", driverId: "dr-1", attendantName: "Mr. Satish Mehra"
      }
    ];
    const routes = [
      {
        id: "rt-101", routeNo: "RT-101", activeDirection: "PICKUP_ROUTE", dropTime: "04:00 PM",
        stops: [
          { stopId: "st-1", stopName: "Green Park Extension", eta: "07:05 AM", afternoonEta: "04:30 PM" },
          { stopId: "st-2", stopName: "Main Road Square", eta: "07:15 AM", afternoonEta: "04:15 PM" },
          { stopId: "st-3", stopName: "Springdale Senior Secondary", isSchool: true, eta: "08:10 AM", afternoonEta: "04:00 PM" }
        ]
      }
    ];
    const assignments = studentsSeed.map((student) => (
      { studentId: student.id, assignedRouteId: "rt-101", assignedVehicleId: "vh-1", pickupStopId: "st-2", dropStopId: "st-2", status: "Active" }
    ));
    const alerts = [
      {
        alertId: "al-1", routeId: "rt-101", type: "delay", severity: "warning",
        messageEn: "Bus delayed by 10 mins due to moderate traffic.", messageHi: "मध्यम ट्रैफिक के कारण बस 10 मिनट देरी से चल रही है।"
      }
    ];

    setItem(STORAGE_KEYS.TRANSPORT_DRIVERS, drivers);
    setItem(STORAGE_KEYS.TRANSPORT_VEHICLES, vehicles);
    setItem(STORAGE_KEYS.TRANSPORT_ROUTES, routes);
    setItem(STORAGE_KEYS.TRANSPORT_ASSIGNMENTS, assignments);
    setItem(STORAGE_KEYS.TRANSPORT_ALERTS, alerts);
    console.log(`[InitializationEngine] Generated and Seeded Transport Data`);
  }

  // 9. Seed Mentor Support Data
  const existingMentorAssignments = getItem(STORAGE_KEYS.MENTOR_ASSIGNMENTS);
  if (!existingMentorAssignments || existingMentorAssignments.length === 0) {
    // No explicit overrides, so it uses class teacher as mentor
    const mentorAssignments = [];

    const mentorSessions = studentsSeed.flatMap((student) => {
      const classInfo = classesSeed.find(c => c.id === student.classId);
      const teacherId = classInfo ? classInfo.classTeacherId : "teach-001";
      
      return [
        {
          id: `ms-1-${student.id}`, studentId: student.id, studentName: student.name, classId: student.classId,
          mentorTeacherId: teacherId, mentorTeacherName: "Class Teacher", topic: "Academic Guidance",
          scheduledAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString(),
          message: "I need help planning my study schedule for the upcoming mid-terms.",
          status: "Approved", mentorNotes: ""
        },
        {
          id: `ms-2-${student.id}`, studentId: student.id, studentName: student.name, classId: student.classId,
          mentorTeacherId: teacherId, mentorTeacherName: "Class Teacher", topic: "Career Advice",
          scheduledAt: new Date(Date.now() - 86400000 * 5).toISOString(), createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          message: "Discussing options for stream selection after 10th grade.",
          status: "Completed", mentorNotes: "Student is inclined towards Science Medical. Shared some resources to read up on."
        }
      ];
    });

    setItem(STORAGE_KEYS.MENTOR_ASSIGNMENTS, mentorAssignments);
    setItem(STORAGE_KEYS.MENTOR_SESSIONS, mentorSessions);
    console.log(`[InitializationEngine] Generated and Seeded Mentor Data`);
  }

  // 10. Seed Exams and Results Data
  const existingResults = getItem(STORAGE_KEYS.RESULTS);
  if (!existingResults || existingResults.length === 0) {
    const mockExams = [
      { id: "exam-ut1", name: "Unit Test 1", type: "UNIT", status: "published", startDate: "2025-04-10", endDate: "2025-04-15", academicYear: "2025-2026" },
      { id: "exam-ut2", name: "Unit Test 2", type: "UNIT", status: "published", startDate: "2025-06-10", endDate: "2025-06-15", academicYear: "2025-2026" },
      { id: "exam-term1", name: "Term 1 Examination", type: "TERM", status: "published", startDate: "2025-09-18", endDate: "2025-09-28", academicYear: "2025-2026" },
      { id: "exam-ut3", name: "Unit Test 3", type: "UNIT", status: "scheduled", startDate: "2025-11-10", endDate: "2025-11-15", academicYear: "2025-2026" },
      { id: "exam-ut4", name: "Unit Test 4", type: "UNIT", status: "draft", startDate: "2026-01-10", endDate: "2026-01-15", academicYear: "2025-2026" },
      { id: "exam-term2", name: "Term 2 Examination", type: "TERM", status: "scheduled", startDate: "2026-03-01", endDate: "2026-03-15", academicYear: "2025-2026" }
    ];
    setItem(STORAGE_KEYS.EXAMS, mockExams);

    const mockResults = [];
    studentsSeed.forEach((student) => {
      // Common subjects
      const subjects = [
        { id: "sub-math", max: 100 },
        { id: "sub-sci", max: 100 },
        { id: "sub-eng", max: 100 },
        { id: "sub-sst", max: 100 },
        { id: "sub-hin", max: 100 }
      ];

      mockExams.forEach(exam => {
        // Only fill results for these past exams
        if (["exam-ut1", "exam-ut2", "exam-term1"].includes(exam.id)) {
          subjects.forEach((sub, i) => {
            const obtained = 60 + Math.floor(Math.random() * 30);
            const grade = obtained > 85 ? "A1" : obtained > 75 ? "A2" : obtained > 65 ? "B1" : "B2";
            const remarks = obtained > 85 ? "Outstanding performance!" : obtained > 75 ? "Very good." : "Keep working hard.";
            
            mockResults.push({
              id: `res-${student.id}-${exam.id}-${sub.id}`,
              studentId: student.id,
              examId: exam.id,
              subjectId: sub.id,
              marksObtained: obtained,
              maxMarks: sub.max,
              grade: grade,
              remarks: remarks,
              breakdown: {
                theory: { obtained: Math.floor(obtained * 0.7), max: 70 },
                practical: { obtained: Math.floor(obtained * 0.2), max: 20 },
                viva: { obtained: Math.floor(obtained * 0.1), max: 10 }
              }
            });
          });
        }
      });
    });

    setItem(STORAGE_KEYS.RESULTS, mockResults);
    console.log(`[InitializationEngine] Generated and Seeded Exams & Results Data`);
  }

  // 11. Seed Class Updates
  const existingClassUpdates = getItem(STORAGE_KEYS.CLASS_UPDATES);
  if (!existingClassUpdates || existingClassUpdates.length === 0) {
    const mockClassUpdates = [];
    
    classesSeed.forEach((cls, i) => {
      mockClassUpdates.push({
        id: `upd-${cls.id}-1`,
        teacherId: cls.classTeacherId || "teach-001",
        teacherName: "Class Teacher",
        classId: cls.id,
        className: cls.name,
        subjectId: "sub-math",
        subjectName: "Mathematics",
        title: "Upcoming Revision Plan",
        message: `Please bring your previous assignments to tomorrow's class for ${cls.name}.`,
        category: "academic",
        visibility: ["STUDENT", "PARENT"],
        priority: "medium",
        createdAt: new Date(Date.now() - (i * 3600000)).toISOString()
      });
      
      mockClassUpdates.push({
        id: `upd-${cls.id}-2`,
        teacherId: "teach-002",
        teacherName: "Subject Teacher",
        classId: cls.id,
        className: cls.name,
        subjectId: "sub-sci",
        subjectName: "Science",
        title: "Science Project Reminder",
        message: `Don't forget to submit your lab reports for ${cls.name} by this Friday.`,
        category: "academic",
        visibility: ["STUDENT"],
        priority: "high",
        createdAt: new Date(Date.now() - (i * 7200000 + 86400000)).toISOString()
      });
    });
    
    setItem(STORAGE_KEYS.CLASS_UPDATES, mockClassUpdates);
    console.log(`[InitializationEngine] Generated and Seeded Class Updates`);
  }

  // 12. Seed Leave Requests
  const existingLeaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS);
  if (!existingLeaves || existingLeaves.length === 0) {
    const mockLeaves = [];
    
    studentsSeed.forEach((student, i) => {
      const cls = classesSeed.find(c => c.id === student.classId);
      if (!cls) return;
      
      const teacherId = cls.classTeacherId || "teach-001";
      
      // Give every student one approved leave in the past
      mockLeaves.push({
        id: `leave-${student.id}-1`,
        studentId: student.id,
        classId: student.classId,
        appliedTo: teacherId,
        reason: "Family function",
        startDate: new Date(Date.now() - (86400000 * 15)).toISOString().split('T')[0],
        endDate: new Date(Date.now() - (86400000 * 13)).toISOString().split('T')[0],
        status: "APPROVED",
        appliedAt: new Date(Date.now() - (86400000 * 20)).toISOString(),
        reviewedAt: new Date(Date.now() - (86400000 * 19)).toISOString(),
        reviewedBy: teacherId
      });
      
      // Give every student one pending or rejected leave based on index
      if (i % 2 === 0) {
        mockLeaves.push({
          id: `leave-${student.id}-2`,
          studentId: student.id,
          classId: student.classId,
          appliedTo: teacherId,
          reason: "Viral Fever",
          startDate: new Date(Date.now() + (86400000 * 2)).toISOString().split('T')[0],
          endDate: new Date(Date.now() + (86400000 * 3)).toISOString().split('T')[0],
          status: "PENDING",
          appliedAt: new Date().toISOString()
        });
      } else {
        mockLeaves.push({
          id: `leave-${student.id}-3`,
          studentId: student.id,
          classId: student.classId,
          appliedTo: teacherId,
          reason: "Attending cousin's wedding out of station",
          startDate: new Date(Date.now() + (86400000 * 5)).toISOString().split('T')[0],
          endDate: new Date(Date.now() + (86400000 * 10)).toISOString().split('T')[0],
          status: "REJECTED",
          appliedAt: new Date(Date.now() - (86400000 * 2)).toISOString(),
          reviewedAt: new Date(Date.now() - (86400000 * 1)).toISOString(),
          reviewedBy: teacherId,
          teacherComment: "Leave cannot be granted during pre-board examination weeks. Please reschedule."
        });
      }
    });
    
    setItem(STORAGE_KEYS.LEAVE_REQUESTS, mockLeaves);
    console.log(`[InitializationEngine] Generated and Seeded Leave Requests`);
  }
};
