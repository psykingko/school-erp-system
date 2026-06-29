import { getDataProvider } from "../data/providers/providerFactory";
import { getAllStudents } from "./studentService";

export const dashboardAggregationService = {
  getAdminDashboardData: async () => {
    const provider = getDataProvider();

    const [
      students,
      teachers,
      leaves,
      fees,
      routes,
      classes,
      results,
    ] = await Promise.all([
      getAllStudents(),
      provider.getTeachers(),
      provider.getLeaveRequests(),
      provider.getFees(),
      provider.getTransportRoutes(),
      provider.getClasses(),
      provider.getResults(),
    ]);

    const studentCount = students.length;
    const teacherCount = teachers.length;
    const pendingLeaves = leaves.filter((l) => l.status === "PENDING" || l.status === "Pending").length;
    const feesDefaulters = fees.filter((f) => f.status !== "Paid").length;
    const routesCount = routes.length;

    // Build real class average scores from results
    const scoredClasses = classes.slice(0, 3).map((cls) => {
      const classResults = results.filter((r) => r.classId === cls.id);
      if (classResults.length === 0)
        return { name: cls.displayName || cls.name, averageGrade: "N/A" };
      
      const avg =
        classResults.reduce((sum, r) => sum + (r.marksObtained || 0), 0) /
        classResults.length;
      const maxMarks = classResults[0]?.maxMarks || 100;
      const pct = Math.round((avg / maxMarks) * 100);
      const grade =
        pct >= 90 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : "C";
      
      return {
        name: cls.displayName || cls.name,
        averageGrade: `${pct}% (${grade})`,
      };
    });

    const demoClassScores = scoredClasses.length > 0
      ? scoredClasses
      : [
          { name: "Class 11-A", averageGrade: "N/A" },
          { name: "Class 11-B", averageGrade: "N/A" },
          { name: "Class 12-A", averageGrade: "N/A" },
        ];

    return {
      studentCount,
      teacherCount,
      pendingLeaves,
      feesDefaulters,
      routesCount,
      teachers,
      classes,
      demoClassScores,
    };
  },

  resetSeedData: async () => {
    const provider = getDataProvider();
    if (typeof provider.resetSeedData === "function") {
      return await provider.resetSeedData();
    }
    return false;
  }
};

export default dashboardAggregationService;
