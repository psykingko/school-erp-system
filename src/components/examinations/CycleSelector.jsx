import React from "react";
import { motion } from "framer-motion";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

function CycleSelector({ cycles, selectedCycleId, onSelectCycle }) {
  if (!cycles || cycles.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {cycles.map((cycle) => {
        const isSelected = cycle.id === selectedCycleId;

        return (
          <button
            key={cycle.id}
            onClick={() => onSelectCycle(cycle.id)}
            className={`
              relative px-5 py-2.5 rounded-full text-sm font-extrabold transition-all duration-300
              ${isSelected ? "shadow-md z-10" : "hover:bg-gray-200"}
            `}
            style={{
              backgroundColor: isSelected ? NAVY : "#f3f4f6",
              color: isSelected ? "white" : "#4b5563",
            }}
          >
            {cycle.name}
            {isSelected && (
              <motion.div
                layoutId="cycle-selector-active-bg"
                className="absolute inset-0 rounded-full -z-10 shadow-lg"
                style={{ backgroundColor: NAVY }}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default CycleSelector;
