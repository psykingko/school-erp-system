import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ShieldCheck, Scale, Ruler, FileCheck, CheckCircle2 } from "lucide-react";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import MainCard from "../../../../components/MainCard";
import { getAssessmentGovernance, saveAssessmentGovernance } from "../../../../services/assessmentGovernanceService";
import CategoriesSection from "./components/CategoriesSection";
import WeightageSection from "./components/WeightageSection";
import GradesSection from "./components/GradesSection";
import PassingRulesSection from "./components/PassingRulesSection";

const AssessmentGovernancePage = () => {
  const [governance, setGovernance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchGovernance();
  }, []);

  const fetchGovernance = async () => {
    setLoading(true);
    try {
      const data = await getAssessmentGovernance();
      setGovernance(data);
    } catch (error) {
      console.error("Failed to load governance configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates) => {
    try {
      const updated = await saveAssessmentGovernance(updates);
      setGovernance(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save governance configuration:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  if (loading || !governance) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03045e]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title="Assessment Governance"
        description="Define institutional academic policies, grading boundaries, and assessment categories."
        breadcrumbs={[
          "Admin Home",
          "Assessment Governance"
        ]}
      />

      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl flex items-center gap-3 font-bold text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Academic policy successfully updated.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-8">
        <CategoriesSection 
          governance={governance} 
          onUpdate={handleUpdate} 
        />
        
        <WeightageSection 
          governance={governance} 
          onUpdate={handleUpdate} 
        />

        <GradesSection 
          governance={governance} 
          onUpdate={handleUpdate} 
        />

        <PassingRulesSection 
          governance={governance} 
          onUpdate={handleUpdate} 
        />
      </div>
    </div>
  );
};

export default AssessmentGovernancePage;
