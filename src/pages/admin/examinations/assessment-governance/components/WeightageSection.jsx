import React, { useState, useEffect } from "react";
import { PieChart, Save } from "lucide-react";
import MainCard from "../../../../../components/MainCard";

const WeightageSection = ({ governance, onUpdate }) => {
  const [weightages, setWeightages] = useState({});
  const [error, setError] = useState("");
  const activeCategories = governance.categories.filter(c => c.isActive);

  useEffect(() => {
    // Initialize state from governance
    const initial = {};
    activeCategories.forEach(cat => {
      const existing = governance.weightages.find(w => w.categoryId === cat.id);
      initial[cat.id] = existing ? existing.weightage : 0;
    });
    setWeightages(initial);
  }, [governance]);

  const total = Object.values(weightages).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

  const handleSave = () => {
    if (total !== 100) {
      setError(`Total weightage must equal 100%. Currently it is ${total}%.`);
      return;
    }
    


    const updatedWeightages = Object.entries(weightages).map(([categoryId, weightage]) => ({
      categoryId,
      weightage: Number(weightage)
    }));

    setError("");
    onUpdate({ weightages: updatedWeightages });
  };

  const handleChange = (id, value) => {
    setWeightages(prev => ({
      ...prev,
      [id]: value
    }));
    setError("");
  };

  return (
    <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
          <PieChart size={16} className="text-blue-500"/> Weightage Configuration
        </h3>
        <span className={`text-xs font-black px-3 py-1 rounded-full ${total === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          Total: {total}%
        </span>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {activeCategories.map(cat => (
            <div key={cat.id} className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider">{cat.name}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weightages[cat.id] !== undefined ? weightages[cat.id] : ''}
                  onChange={(e) => handleChange(cat.id, e.target.value)}
                  className="w-full pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-[#03045e] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
            </div>
          ))}
          {activeCategories.length === 0 && (
            <div className="col-span-full text-sm text-gray-400 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Please activate at least one category to configure weightages.
            </div>
          )}
        </div>

        {activeCategories.length > 0 && (
          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-xl text-sm font-black tracking-wider uppercase transition-all shadow-md flex items-center gap-2 ${
                total === 100 
                ? 'bg-[#03045e] text-white hover:bg-[#023e8a] hover:-translate-y-0.5' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save size={16} /> Save Weightages
            </button>
          </div>
        )}
      </div>
    </MainCard>
  );
};

export default WeightageSection;
