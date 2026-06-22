import React, { useState, useEffect } from "react";
import { Upload, X, CheckCircle, AlertCircle, RefreshCw, FileText, LayoutTemplate } from "lucide-react";
import { questionPaperOCRService } from "../../services/questionPaperOCRService";
import { questionPaperMigrationService } from "../../services/questionPaperMigrationService";
import QuestionPaperPreview from "../../modules/question-papers/QuestionPaperPreview";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const OCRImportPanel = ({ onInsert }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrError, setOcrError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("text"); // "text" or "preview"

  useEffect(() => {
    // Cleanup worker on unmount to prevent memory leaks
    return () => {
      questionPaperOCRService.terminateWorker();
    };
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      setOcrError("PDF files are not supported for OCR. Please upload an image (JPG, PNG, WEBP).");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setOcrError("Only image files are supported (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setOcrError("File size exceeds the 10MB limit. Please upload a smaller image.");
      return;
    }

    setOcrError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrText("");
    setOcrConfidence(null);
    setOcrProgress(0);
    setActiveTab("text");
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setOcrError("");
    setOcrProgress(0);
    setOcrConfidence(null);

    try {
      const result = await questionPaperOCRService.scanImage(selectedFile, (progress) => {
        setOcrProgress(Math.round(progress * 100));
      });

      setOcrText(result.text);
      setOcrConfidence(Math.round(result.confidence));
    } catch (err) {
      setOcrError("An error occurred during OCR scanning. Please try a different image.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCancelScan = async () => {
    setIsScanning(false);
    setOcrProgress(0);
    await questionPaperOCRService.terminateWorker();
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOcrText("");
    setOcrConfidence(null);
    setOcrError("");
    setOcrProgress(0);
  };

  const handleInsert = () => {
    if (onInsert && ocrText.trim()) {
      onInsert(ocrText);
    }
  };

  const renderConfidenceBadge = () => {
    if (ocrConfidence === null) return null;
    let bgColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
    let message = `Confidence: ${ocrConfidence}%`;
    if (ocrConfidence < 70) {
      bgColor = "bg-rose-100 text-rose-800 border-rose-200";
      message = `Low Confidence (${ocrConfidence}%) - Review Carefully`;
    } else if (ocrConfidence < 85) {
      bgColor = "bg-amber-100 text-amber-800 border-amber-200";
      message = `Confidence: ${ocrConfidence}% - Please verify`;
    }

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${bgColor}`}>
        {message}
      </span>
    );
  };

  return (
    <div className="flex flex-col space-y-6">
      {ocrError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{ocrError}</p>
        </div>
      )}

      {!selectedFile ? (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 font-bold"><span className="font-black text-[#03045e]">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Image files only (JPG, PNG, WEBP)</p>
            </div>
            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileSelect} />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Image Preview & Scan Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#03045e] uppercase tracking-widest">Original Image</h3>
              <button onClick={handleReset} className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors" disabled={isScanning}>
                Remove
              </button>
            </div>
            
            <div className="relative border-2 border-gray-100 rounded-2xl overflow-hidden bg-gray-50 aspect-[3/4] flex items-center justify-center">
              <img src={previewUrl} alt="Document Preview" className="max-h-full object-contain" />
              
              {isScanning && (
                <div className="absolute inset-0 bg-[#03045e]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <RefreshCw className="w-10 h-10 animate-spin mb-4 text-[#00b4d8]" />
                  <p className="text-sm font-black uppercase tracking-widest mb-2">Scanning Document</p>
                  <p className="text-2xl font-black text-[#00b4d8]">{ocrProgress}%</p>
                  <button 
                    onClick={handleCancelScan}
                    className="mt-6 px-4 py-2 border border-white/30 rounded-xl hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    Cancel Scan
                  </button>
                </div>
              )}
            </div>

            {!isScanning && !ocrText && (
              <button
                onClick={handleScan}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#03045e] text-white font-black uppercase tracking-widest text-sm hover:bg-[#03045e]/90 transition-all shadow-lg"
              >
                <RefreshCw size={18} />
                Extract Text (OCR)
              </button>
            )}
          </div>

          {/* Right Column: OCR Results & Preview */}
          <div className="space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#03045e] uppercase tracking-widest">Extracted Content</h3>
              {renderConfidenceBadge()}
            </div>

            {!ocrText && !isScanning ? (
              <div className="flex-1 min-h-[300px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50">
                <p className="text-sm font-bold text-gray-400">Scan the image to extract text.</p>
              </div>
            ) : (
              <div className="flex flex-col flex-1 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                
                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
                  <button
                    onClick={() => setActiveTab("text")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      activeTab === "text" ? "bg-white text-[#03045e] shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FileText size={14} />
                    Edit Text
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      activeTab === "preview" ? "bg-white text-[#03045e] shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <LayoutTemplate size={14} />
                    Preview Layout
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-4 bg-gray-50/30 overflow-y-auto min-h-[400px]">
                  {activeTab === "text" ? (
                    <textarea
                      value={ocrText}
                      onChange={(e) => setOcrText(e.target.value)}
                      className="w-full h-full min-h-[350px] p-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/10 resize-none font-mono text-sm leading-relaxed"
                      placeholder="Extracted text will appear here. You can manually correct any mistakes before inserting."
                    />
                  ) : (
                    <div className="h-full border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <QuestionPaperPreview 
                        paper={{
                          paperContent: questionPaperMigrationService.parseContentToBlocks(ocrText)
                        }}
                        isTeacherView={false}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <button
                    onClick={handleInsert}
                    disabled={!ocrText.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-widest text-sm hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={18} />
                    Insert Into Paper
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-bold mt-2">
                    Note: This will transfer the text to the main editor for final saving.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRImportPanel;
