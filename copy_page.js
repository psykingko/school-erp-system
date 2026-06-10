const fs = require('fs');

let content = fs.readFileSync('src/pages/teacher/TeacherLeavePage.jsx', 'utf-8');

content = content.replaceAll('TeacherLeavePage', 'EmployeeLeavePage');
content = content.replaceAll('getTeacherLeaveRequests', 'getEmployeeLeaveRequests');
content = content.replaceAll('createTeacherLeaveRequest', 'createEmployeeLeaveRequest');
content = content.replaceAll('cancelTeacherLeaveRequest', 'cancelEmployeeLeaveRequest');
content = content.replaceAll('teacherId:', 'employeeId:');
content = content.replaceAll('teacherId', 'employeeId');
content = content.replaceAll('../../components/teacher/TeacherModuleHeader', '../../components/admin/AdminPageHeader');
content = content.replaceAll('TeacherModuleHeader', 'AdminPageHeader');

// Add fallback identity mapping logic for admin
// const { user } = useAuth();
const userMapping = `
  const { user } = useAuth();
  // Prototype Identity Mapping: Map admin to EMP-001 if they lack an employee ID
  const employeeId = user?.linkedEntityId || "EMP-001";
`;
content = content.replace('const { user } = useAuth(); // Has teacher id etc.', userMapping.trim());

// replace user?.linkedEntityId with employeeId everywhere except in AuthContext destructuring
content = content.replaceAll('user?.linkedEntityId', 'employeeId');

fs.writeFileSync('src/pages/admin/EmployeeLeavePage.jsx', content);
console.log('Successfully created EmployeeLeavePage.jsx');
