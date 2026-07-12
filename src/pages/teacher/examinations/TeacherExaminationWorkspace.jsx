import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import TeacherModuleHeader from "../../../components/teacher/TeacherModuleHeader";
import TeacherExaminationNav from "./components/TeacherExaminationNav";

// Tabs
import OverviewTab from "./tabs/OverviewTab";
import MarksExamsPage from "../MarksExamsPage";

const TeacherExaminationWorkspace = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 pb-12">
      <TeacherModuleHeader
        titleKey="teacherExaminations.title"
        descriptionKey="teacherExaminations.desc"
        helperContentEn="Manage your assigned examination tasks including marks entry and evaluation progress."
        helperContentHi="अंक प्रविष्टि और मूल्यांकन प्रगति सहित अपने निर्दिष्ट परीक्षा कार्यों का प्रबंधन करें।"
      />

      <TeacherExaminationNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-6">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "marks" && <MarksExamsPage isEmbedded={true} />}
      </div>
    </div>
  );
};

export default TeacherExaminationWorkspace;
