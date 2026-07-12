const fs = require('fs');

// 1. CredentialsCard.jsx
let cred = fs.readFileSync('src/components/CredentialsCard.jsx', 'utf8');
cred = cred.replace('{label}', '{t(label)}'); // First occurrence in CredentialField
cred = cred.replace('{title}', '{t(title)}'); // First occurrence in header
fs.writeFileSync('src/components/CredentialsCard.jsx', cred);

// 2. TimetableCard.jsx
let time = fs.readFileSync('src/components/TimetableCard.jsx', 'utf8');
time = time.replace('Live Updates', '{t(\"timetable.liveUpdates\", { fallback: \"Live Updates\" })}');
time = time.replace('Back to Today', '{t(\"timetable.backToToday\", { fallback: \"Back to Today\" })}');
time = time.replace('Timetable has not been set yet', '{t(\"timetable.notSet\", { fallback: \"Timetable has not been set yet\" })}');
fs.writeFileSync('src/components/TimetableCard.jsx', time);

// 3. AssignmentsSummaryCard.jsx
let assign = fs.readFileSync('src/components/AssignmentsSummaryCard.jsx', 'utf8');
assign = assign.replace('Assignments', '{t(\"assignments.title\", { fallback: \"Assignments\" })}');
assign = assign.replace('Academic Workflow', '{t(\"assignments.academicWorkflow\", { fallback: \"Academic Workflow\" })}');
assign = assign.replace('Weekly Completion', '{t(\"assignments.weeklyCompletion\", { fallback: \"Weekly Completion\" })}');
assign = assign.replace('>Overdue<', '>{t(\"assignments.overdue\", { fallback: \"Overdue\" })}<');
assign = assign.replace('>Pending<', '>{t(\"assignments.pending\", { fallback: \"Pending\" })}<');
assign = assign.replace('<span>Open Assignments Page</span>', '<span>{t(\"assignments.openAssignmentsPage\", { fallback: \"Open Assignments Page\" })}</span>');
assign = assign.replace('titleKey=\"Assignments Summary\"', 'titleKey=\"assignments.summaryCardHelper\"');
fs.writeFileSync('src/components/AssignmentsSummaryCard.jsx', assign);

// 4. AttendanceCard.jsx
let att = fs.readFileSync('src/components/AttendanceCard.jsx', 'utf8');
att = att.replace('>Attendance Overview<', '>{t(\"attendance.overview\", { fallback: \"Attendance Overview\" })}<');
att = att.replace('>Centralized ERP Insights<', '>{t(\"attendance.centralizedInsights\", { fallback: \"Centralized ERP Insights\" })}<');
att = att.replace('Attendance Status', '{t(\"attendance.statusTitle\", { fallback: \"Attendance Status\" })}');
att = att.replace('Present Days', '{t(\"attendance.presentDays\", { fallback: \"Present Days\" })}');
att = att.replace('/ classes', '/ {t(\"attendance.classes\", { fallback: \"classes\" })}');
att = att.replace('Daily History & Status', '{t(\"attendance.dailyHistoryStatus\", { fallback: \"Daily History & Status\" })}');
att = att.replace('>Verified Homeroom Attendance<', '>{t(\"attendance.verifiedHomeroom\", { fallback: \"Verified Homeroom Attendance\" })}<');
att = att.replace('>Marked Absent by Homeroom Teacher<', '>{t(\"attendance.markedAbsent\", { fallback: \"Marked Absent by Homeroom Teacher\" })}<');
att = att.replace('>Approved Institutional Leave<', '>{t(\"attendance.approvedLeave\", { fallback: \"Approved Institutional Leave\" })}<');
att = att.replace('>School Academic Calendar Break<', '>{t(\"attendance.schoolBreak\", { fallback: \"School Academic Calendar Break\" })}<');
att = att.replace('titleKey=\"attendance.title\"', 'titleKey=\"attendance.overviewHelper\"');
fs.writeFileSync('src/components/AttendanceCard.jsx', att);

console.log('JSX files patched.');
