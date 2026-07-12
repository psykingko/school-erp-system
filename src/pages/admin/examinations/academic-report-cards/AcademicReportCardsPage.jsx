import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, CheckCircle, ShieldAlert, ArrowLeft, Save } from 'lucide-react';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import MainCard from '../../../../components/MainCard';
import Drawer from '../../../../components/common/Drawer';
import { getDataProvider } from '../../../../data';

import GenerationWizard from './components/GenerationWizard';
import StudentSummaryTable from './components/StudentSummaryTable';
import PrintableReportCard from './components/PrintableReportCard';

import { 
  previewReportCards, 
  commitGeneratedReportCards, 
  publishReportCards, 
  freezeReportCards, 
  getReportCardsForClass,
  validateGovernanceCompleteness
} from '../../../../services/reportCardService';

const AcademicReportCardsPage = () => {
  const [activeStep, setActiveStep] = useState('wizard'); // 'wizard' | 'preview' | 'published'
  const [generatedCards, setGeneratedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [institutionDetails, setInstitutionDetails] = useState({});

  useEffect(() => {
    const fetchInst = async () => {
      const provider = getDataProvider();
      const settings = await provider.getInstitutionSettings();
      setInstitutionDetails(settings);
    };
    fetchInst();
  }, []);

  const handleGenerate = async (classId, sessionId, selectedExamIds, reportType) => {
    if (reportType === 'final') {
      try {
        const validation = await validateGovernanceCompleteness(selectedExamIds);
        if (!validation.isComplete) {
          const missingList = validation.missingCategories.map(c => `• ${c}`).join('\n');
          const message = `Final Academic Report cannot be fully validated.\n\nAssessment Governance is incomplete.\n\nMissing Assessment Categories:\n${missingList}\n\nApplied Weightage:\n${validation.appliedWeightage}%\n\nRequired Weightage:\n${validation.requiredWeightage}%\n\nThis report may not represent the final institutional result.\n\nContinue anyway?`;
          
          if (!window.confirm(message)) {
            return;
          }
        }
      } catch (e) {
        alert(e.message);
        return;
      }
    }

    try {
      const preview = await previewReportCards(classId, sessionId, selectedExamIds, reportType);
      setGeneratedCards(preview);
      setActiveStep('preview');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCommit = async () => {
    if (!window.confirm("Are you sure you want to save these generated report cards? This will not publish them yet.")) return;
    try {
      await commitGeneratedReportCards(generatedCards, 'admin-001');
      alert("Report cards saved successfully!");
      // Refetch them to ensure we have the persisted state
      const { classId, sessionId } = generatedCards[0];
      const persisted = await getReportCardsForClass(classId, sessionId);
      setGeneratedCards(persisted);
      setActiveStep('published');
    } catch (e) {
      alert("Failed to save report cards: " + e.message);
    }
  };

  const handlePublishAll = async () => {
    if (!window.confirm("Publishing these report cards will make them visible to students, parents, and class teachers. Proceed?")) return;
    try {
      const ids = generatedCards.map(c => c.id);
      await publishReportCards(ids, 'admin-001');
      const { classId, sessionId } = generatedCards[0];
      const persisted = await getReportCardsForClass(classId, sessionId);
      setGeneratedCards(persisted);
      alert("Report cards published successfully.");
    } catch (e) {
      alert("Failed to publish: " + e.message);
    }
  };

  const handleFreezeAll = async () => {
    if (!window.confirm("Freezing report cards prevents them from being regenerated accidentally. Proceed?")) return;
    try {
      // Only allow freezing of published cards
      const idsToFreeze = generatedCards.filter(c => c.status === 'Published').map(c => c.id);
      if (idsToFreeze.length === 0) {
        alert("Only published report cards can be frozen.");
        return;
      }
      await freezeReportCards(idsToFreeze, 'admin-001');
      const { classId, sessionId } = generatedCards[0];
      const persisted = await getReportCardsForClass(classId, sessionId);
      setGeneratedCards(persisted);
      alert(`${idsToFreeze.length} report cards frozen successfully.`);
    } catch (e) {
      alert("Failed to freeze: " + e.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="print:hidden">
        <AdminPageHeader
          title="Academic Report Cards"
          description="Generate, publish, and print finalized academic session report cards."
          breadcrumbs={["Examinations", "Report Cards"]}
        />
      </div>

      <AnimatePresence mode="wait">
        {activeStep === 'wizard' && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GenerationWizard onGenerate={handleGenerate} />
          </motion.div>
        )}

        {(activeStep === 'preview' || activeStep === 'published') && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between print:hidden">
              <button 
                onClick={() => {
                  setActiveStep('wizard');
                  setGeneratedCards([]);
                }}
                className="text-gray-500 hover:text-blue-600 flex items-center gap-2 font-bold"
              >
                <ArrowLeft size={16} /> Back to Generation Wizard
              </button>
              
              <div className="flex items-center gap-3">
                {activeStep === 'preview' ? (
                  <button 
                    onClick={handleCommit}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-green-600/20"
                  >
                    <Save size={16} /> Save Generated Report Cards
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => window.print()}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors print:hidden"
                    >
                      <Printer size={16} /> Print All
                    </button>
                    <button 
                      onClick={handlePublishAll}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors print:hidden"
                    >
                      <CheckCircle size={16} /> Publish All
                    </button>
                    <button 
                      onClick={handleFreezeAll}
                      className="bg-[#03045e] hover:bg-[#0077b6] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors print:hidden"
                    >
                      <ShieldAlert size={16} /> Freeze All
                    </button>
                  </>
                )}
              </div>
            </div>

            <MainCard className="p-0 overflow-hidden print:hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-lg font-bold text-[#03045e]">
                    {activeStep === 'preview' ? 'Generation Preview' : 'Saved Report Cards'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {generatedCards.length} students processed for Class {generatedCards[0]?.classId}, Session {generatedCards[0]?.sessionId}.
                  </p>
                </div>
              </div>
              <StudentSummaryTable cards={generatedCards} onSelectCard={setSelectedCard} />
            </MainCard>
            
            {/* Print Area - Only visible when printing ALL */}
            <div className={`hidden ${!selectedCard ? 'print:block' : ''} space-y-12 print-isolate bg-white min-h-screen`}>
              {generatedCards.map((card, index) => (
                <div key={card.id} className={index > 0 ? "break-before-page" : ""}>
                  <PrintableReportCard card={card} institutionDetails={institutionDetails} />
                </div>
              ))}
            </div>

            {/* Print Area - Only visible when printing SINGLE */}
            {selectedCard && (
              <div className="hidden print:block print-isolate bg-white min-h-screen">
                <PrintableReportCard card={selectedCard} institutionDetails={institutionDetails} />
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      <Drawer
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title="Report Card Preview"
        size="lg"
      >
        {selectedCard && (
          <div className="p-6 bg-gray-100 min-h-full">
            <div className="flex justify-end mb-4 print:hidden">
               <button 
                 onClick={() => window.print()}
                 className="bg-[#03045e] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg"
               >
                 <Printer size={16} /> Print Single Card
               </button>
            </div>
            {/* The actual PrintableReportCard is rendered conditionally outside the Drawer for printing. 
                We just show a preview here inside the drawer for UI. */}
            <PrintableReportCard card={selectedCard} institutionDetails={institutionDetails} />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AcademicReportCardsPage;
