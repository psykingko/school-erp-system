import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const translations = {
  en: {
    // Header
    "header.date": "Today",
    "header.notifications": "Notifications",
    "header.markRead": "Mark all as read",
    "header.unread": "unread",
    // View toggle
    "view.student": "Student View",
    "view.parent": "Parent View",
    // Hero
    "hero.welcome": "Welcome back",
    // Attendance
    "attendance.title": "Overall Attendance",
    "attendance.subjects": "Subject-wise Attendance",
    "attendance.excellent": "Excellent! Keep it up",
    "attendance.moderate": "Getting there! Push a bit more",
    "attendance.warning": "Attendance low! Attend more classes",
    "attendance.parentExcellent": "Your child is attending classes regularly.",
    "attendance.parentModerate":
      "Your child needs to attend a few more classes.",
    "attendance.parentWarning":
      "Your child may not be allowed to sit in exams.",
    "attendance.statusExcellent": "Excellent",
    "attendance.statusModerate": "Needs Attention",
    "attendance.statusWarning": "Risk Zone",
    // Fees
    "fees.title": "Fees Due",
    "fees.outstanding": "outstanding",
    "fees.due": "Due",
    "fees.paid": "Paid",
    "fees.total": "Total",
    "fees.actionNeeded": "Action needed",
    "fees.parentUnpaid": "Fees are pending this month. Please pay soon.",
    "fees.parentPaid": "Fees have been paid. No action needed.",
    "fees.parentOverdue": "Fees are overdue! Please pay immediately.",
    // Timetable
    "timetable.title": "Today's Classes",
    "timetable.classes": "classes",
    "timetable.live": "Live Now",
    "timetable.ended": "Ended",
    "timetable.upcoming": "Upcoming",
    "timetable.noClasses": "No classes scheduled for today.",
    // LMS
    "lms.title": "My LMS",
    "lms.subtitle": "Learning Dashboard",
    "lms.completion": "Course Completion",
    "lms.pending": "Pending",
    "lms.assignment": "Assignment",
    "lms.assignments": "Assignments",
    "lms.streak": "Streak",
    "lms.streakDays": "day streak",
    "lms.goToLms": "Go to LMS",
    "lms.parentSummary":
      "{pct}% of subjects are on track. {pending} assignments are pending this week.",
    // VC Message
    "vc.title": "Message from Vice Chancellor",
    // Notice Board
    "notice.title": "Notice Board",
    "notice.subtitle": "Stay up to date",
    "notice.tab.notices": "Notices",
    "notice.tab.exam": "Exam Notices",
    "notice.empty": "No notices available.",
    "notice.priority.high": "High",
    "notice.priority.medium": "Medium",
    "notice.priority.low": "Low",
    // Event Board
    "event.title": "Event Board",
    "event.subtitle": "Campus life & activities",
    "event.tab.happenings": "Happenings",
    "event.tab.upcoming": "Upcoming",
    "event.empty": "No events available.",
    "event.daysLeft": "days left",
    "event.dayLeft": "day left",
    // Widgets
    "widget.upcomingExam": "Upcoming Exam",
    "widget.attendanceWarning": "Attendance Warning",
    "widget.assignments": "Assignments",
    "widget.pending": "pending",
    "widget.submitReminder": "Don't forget to submit!",
    "widget.allCaughtUp": "All caught up!",
    "widget.attendHint": "Attend more classes to stay above 75%",
    // Helper popup
    "helper.close": "Close",
    "helper.whatIsThis": "What is this?",
    // Courses page
    "courses.title": "My Subjects",
    // Faculty page
    "faculty.title": "My Teachers",
    // Examination page
    "examination.title": "Examinations",
    // Calendar page
    "calendar.title": "School Calendar",
    // Action Needed section
    "action.title": "Action Needed",
    "action.summary": "Today's Summary",
    "action.tapHint": "Tap any item to go to that section",
    "action.allClear": "Everything looks good today 🟢",
    "action.allClearSub": "No urgent items. Keep up the great work!",
    "action.itemCount_one": "1 item",
    "action.itemCount_other": "{count} items",
    // Priority badges
    "action.badge.urgent": "Urgent",
    "action.badge.important": "Important",
    "action.badge.reminder": "Reminder",
    // Attendance item — student voice
    "action.attendance.title.student": "Chemistry attendance needs improvement",
    "action.attendance.desc.student":
      "{subject} is at {pct}% — aim for at least 75% to stay eligible for exams.",
    "action.attendance.title.student.multi":
      "Some subjects need more attendance",
    "action.attendance.desc.student.multi":
      "{subjects} — attendance is below the required 75% level.",
    // Attendance item — parent voice
    "action.attendance.title.parent":
      "Chemistry attendance is below safe level",
    "action.attendance.desc.parent":
      "{subject} attendance is at {pct}%. More class participation is recommended to avoid exam eligibility issues.",
    "action.attendance.title.parent.multi":
      "Attendance is low in some subjects",
    "action.attendance.desc.parent.multi":
      "{subjects} — attendance is below the required level and may affect exam eligibility.",
    // Fee item — student voice
    "action.fee.title.student.unpaid": "Fee payment is due by {date}",
    "action.fee.desc.student.unpaid":
      "{currency}{amount} is outstanding. Pay before {date} to avoid late charges.",
    "action.fee.title.student.overdue": "Fee payment is overdue",
    "action.fee.desc.student.overdue":
      "{currency}{amount} was due on {date}. Please pay immediately.",
    // Fee item — parent voice
    "action.fee.title.parent.unpaid": "Fee payment is pending for this month",
    "action.fee.desc.parent.unpaid":
      "{currency}{amount} is due by {date}. Please arrange payment soon to avoid late charges.",
    "action.fee.title.parent.overdue":
      "Fee payment is overdue — immediate action needed",
    "action.fee.desc.parent.overdue":
      "{currency}{amount} was due on {date}. Please pay immediately to avoid penalties.",
    // Exam item — student voice
    "action.exam.title.student": "{name} scheduled for {date}",
    "action.exam.desc.student":
      "Make sure you are well prepared. Check the exam hall and reporting time.",
    // Exam item — parent voice
    "action.exam.title.parent": "{name} is scheduled for {date}",
    "action.exam.desc.parent":
      "Preparation is recommended. Please ensure your child is ready for this exam.",
    // Assignments item — student voice
    "action.assignments.title.student_one":
      "1 assignment still needs submission",
    "action.assignments.title.student_other":
      "{count} assignments still need submission",
    "action.assignments.desc.student":
      "Submit your pending assignments in the learning portal before the deadline.",
    // Assignments item — parent voice
    "action.assignments.title.parent_one":
      "1 assignment is pending in the learning portal",
    "action.assignments.title.parent_other":
      "{count} assignments are still pending in the learning portal",
    "action.assignments.desc.parent":
      "Please remind your child to complete and submit the pending assignments.",
    // Sidebar nav (translated)
    "nav.home": "Home",
    "nav.timetable": "Timetable",
    "nav.courses": "My Subjects",
    "nav.faculty": "My Teachers",
    "nav.examination": "Examinations",
    "nav.calendar": "School Calendar",
    "nav.logout": "Logout",
  },
  hi: {
    // Header
    "header.date": "आज",
    "header.notifications": "सूचनाएं",
    "header.markRead": "सभी पढ़ा हुआ चिह्नित करें",
    "header.unread": "अपठित",
    // View toggle
    "view.student": "छात्र दृश्य",
    "view.parent": "अभिभावक दृश्य",
    // Hero
    "hero.welcome": "वापस स्वागत है",
    // Attendance
    "attendance.title": "कुल उपस्थिति",
    "attendance.subjects": "विषय-वार उपस्थिति",
    "attendance.excellent": "बहुत अच्छा! ऐसे ही जारी रखें",
    "attendance.moderate": "थोड़ा और प्रयास करें",
    "attendance.warning": "उपस्थिति कम है! अधिक कक्षाओं में जाएं",
    "attendance.parentExcellent":
      "आपका बच्चा नियमित रूप से कक्षाओं में जा रहा है।",
    "attendance.parentModerate": "आपके बच्चे को कुछ और कक्षाओं में जाना चाहिए।",
    "attendance.parentWarning":
      "आपके बच्चे को परीक्षा में बैठने की अनुमति नहीं मिल सकती।",
    "attendance.statusExcellent": "उत्कृष्ट",
    "attendance.statusModerate": "ध्यान चाहिए",
    "attendance.statusWarning": "जोखिम क्षेत्र",
    // Fees
    "fees.title": "फीस बकाया",
    "fees.outstanding": "बकाया",
    "fees.due": "देय तिथि",
    "fees.paid": "भुगतान किया",
    "fees.total": "कुल",
    "fees.actionNeeded": "कार्रवाई आवश्यक",
    "fees.parentUnpaid": "इस महीने फीस बकाया है। कृपया जल्द भुगतान करें।",
    "fees.parentPaid": "फीस का भुगतान हो गया है। कोई कार्रवाई आवश्यक नहीं।",
    "fees.parentOverdue":
      "फीस की अंतिम तिथि निकल गई है! कृपया तुरंत भुगतान करें।",
    // Timetable
    "timetable.title": "आज की कक्षाएं",
    "timetable.classes": "कक्षाएं",
    "timetable.live": "अभी चल रही है",
    "timetable.ended": "समाप्त",
    "timetable.upcoming": "आने वाली",
    "timetable.noClasses": "आज कोई कक्षा निर्धारित नहीं है।",
    // LMS
    "lms.title": "मेरा LMS",
    "lms.subtitle": "शिक्षण डैशबोर्ड",
    "lms.completion": "पाठ्यक्रम पूर्णता",
    "lms.pending": "बकाया",
    "lms.assignment": "असाइनमेंट",
    "lms.assignments": "असाइनमेंट",
    "lms.streak": "स्ट्रीक",
    "lms.streakDays": "दिन की स्ट्रीक",
    "lms.goToLms": "LMS पर जाएं",
    "lms.parentSummary":
      "{pct}% विषय सही दिशा में हैं। इस सप्ताह {pending} असाइनमेंट बकाया हैं।",
    // VC Message
    "vc.title": "कुलपति का संदेश",
    // Notice Board
    "notice.title": "सूचना पट्ट",
    "notice.subtitle": "अपडेट रहें",
    "notice.tab.notices": "सूचनाएं",
    "notice.tab.exam": "परीक्षा सूचनाएं",
    "notice.empty": "कोई सूचना उपलब्ध नहीं।",
    "notice.priority.high": "उच्च",
    "notice.priority.medium": "मध्यम",
    "notice.priority.low": "निम्न",
    // Event Board
    "event.title": "कार्यक्रम बोर्ड",
    "event.subtitle": "कैंपस जीवन और गतिविधियां",
    "event.tab.happenings": "चल रहे कार्यक्रम",
    "event.tab.upcoming": "आने वाले",
    "event.empty": "कोई कार्यक्रम उपलब्ध नहीं।",
    "event.daysLeft": "दिन बचे",
    "event.dayLeft": "दिन बचा",
    // Widgets
    "widget.upcomingExam": "आने वाली परीक्षा",
    "widget.attendanceWarning": "उपस्थिति चेतावनी",
    "widget.assignments": "असाइनमेंट",
    "widget.pending": "बकाया",
    "widget.submitReminder": "जमा करना न भूलें!",
    "widget.allCaughtUp": "सब पूरा हो गया!",
    "widget.attendHint": "75% से ऊपर रहने के लिए अधिक कक्षाओं में जाएं",
    // Helper popup
    "helper.close": "बंद करें",
    "helper.whatIsThis": "यह क्या है?",
    // Courses page
    "courses.title": "मेरे विषय",
    // Faculty page
    "faculty.title": "मेरे शिक्षक",
    // Examination page
    "examination.title": "परीक्षाएं",
    // Calendar page
    "calendar.title": "स्कूल कैलेंडर",
    // Action Needed section
    "action.title": "ध्यान देना जरूरी है",
    "action.summary": "आज का सारांश",
    "action.tapHint": "किसी भी आइटम पर टैप करें उस सेक्शन पर जाने के लिए",
    "action.allClear": "आज सब कुछ ठीक है 🟢",
    "action.allClearSub": "कोई जरूरी काम नहीं। बढ़िया काम जारी रखें!",
    "action.itemCount_one": "1 आइटम",
    "action.itemCount_other": "{count} आइटम",
    // Priority badges
    "action.badge.urgent": "तुरंत",
    "action.badge.important": "जरूरी",
    "action.badge.reminder": "याद दिलाएं",
    // Attendance item — student voice
    "action.attendance.title.student":
      "Chemistry की उपस्थिति में सुधार जरूरी है",
    "action.attendance.desc.student":
      "{subject} में उपस्थिति {pct}% है — परीक्षा के लिए कम से कम 75% जरूरी है।",
    "action.attendance.title.student.multi": "कुछ विषयों में उपस्थिति कम है",
    "action.attendance.desc.student.multi":
      "{subjects} — उपस्थिति आवश्यक 75% से कम है।",
    // Attendance item — parent voice
    "action.attendance.title.parent":
      "Chemistry की उपस्थिति सुरक्षित स्तर से नीचे है",
    "action.attendance.desc.parent":
      "{subject} में उपस्थिति {pct}% है। परीक्षा पात्रता के लिए अधिक कक्षाओं में भाग लेना जरूरी है।",
    "action.attendance.title.parent.multi": "कुछ विषयों में उपस्थिति कम है",
    "action.attendance.desc.parent.multi":
      "{subjects} — उपस्थिति आवश्यक स्तर से कम है और परीक्षा पात्रता प्रभावित हो सकती है।",
    // Fee item — student voice
    "action.fee.title.student.unpaid": "फीस {date} तक जमा करनी है",
    "action.fee.desc.student.unpaid":
      "{currency}{amount} बकाया है। देर से बचने के लिए {date} से पहले भुगतान करें।",
    "action.fee.title.student.overdue": "फीस की अंतिम तिथि निकल गई है",
    "action.fee.desc.student.overdue":
      "{currency}{amount} की देय तिथि {date} थी। कृपया तुरंत भुगतान करें।",
    // Fee item — parent voice
    "action.fee.title.parent.unpaid": "इस महीने की फीस बकाया है",
    "action.fee.desc.parent.unpaid":
      "{currency}{amount} की देय तिथि {date} है। देर से बचने के लिए जल्द भुगतान करें।",
    "action.fee.title.parent.overdue":
      "फीस की अंतिम तिथि निकल गई — तुरंत कार्रवाई जरूरी",
    "action.fee.desc.parent.overdue":
      "{currency}{amount} की देय तिथि {date} थी। जुर्माने से बचने के लिए तुरंत भुगतान करें।",
    // Exam item — student voice
    "action.exam.title.student": "{name} — {date} को निर्धारित है",
    "action.exam.desc.student":
      "अच्छी तैयारी करें। परीक्षा हॉल और रिपोर्टिंग समय जांचें।",
    // Exam item — parent voice
    "action.exam.title.parent": "{name} — {date} को निर्धारित है",
    "action.exam.desc.parent":
      "तैयारी की सिफारिश की जाती है। कृपया सुनिश्चित करें कि आपका बच्चा इस परीक्षा के लिए तैयार है।",
    // Assignments item — student voice
    "action.assignments.title.student_one": "1 असाइनमेंट अभी जमा करना बाकी है",
    "action.assignments.title.student_other":
      "{count} असाइनमेंट अभी जमा करने बाकी हैं",
    "action.assignments.desc.student":
      "समय सीमा से पहले लर्निंग पोर्टल में बकाया असाइनमेंट जमा करें।",
    // Assignments item — parent voice
    "action.assignments.title.parent_one":
      "लर्निंग पोर्टल में 1 असाइनमेंट बकाया है",
    "action.assignments.title.parent_other":
      "लर्निंग पोर्टल में {count} असाइनमेंट अभी बाकी हैं",
    "action.assignments.desc.parent":
      "कृपया अपने बच्चे को बकाया असाइनमेंट पूरे करने और जमा करने की याद दिलाएं।",
    // Sidebar nav
    "nav.home": "होम",
    "nav.timetable": "समय सारणी",
    "nav.courses": "मेरे विषय",
    "nav.faculty": "मेरे शिक्षक",
    "nav.examination": "परीक्षाएं",
    "nav.calendar": "स्कूल कैलेंडर",
    "nav.logout": "लॉग आउट",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  // FIX: useCallback so `t` has a stable reference — only changes when `lang` changes.
  // Previously `t` was a plain function recreated every render, causing every
  // useMemo that listed `t` as a dependency to rerun on every render.
  const t = useCallback(
    (key, vars) => {
      const dict = translations[lang] ?? translations.en;
      let str = dict[key] ?? translations.en[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return str;
    },
    [lang],
  );

  // FIX: memoize the context value so consumers only re-render when lang changes,
  // not on every parent render.
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
