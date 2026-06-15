import React from "react";
import { CheckCircle, AlertCircle, Clock, Award, ChevronRight, CornerDownRight } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_PILLS = {
  SUBMITTED: { bg: "bg-amber-50 border-amber-200 text-amber-600", label: "Submitted", icon: AlertCircle },
  GRADED: { bg: "bg-emerald-50 border-emerald-200 text-emerald-600", label: "Graded", icon: CheckCircle },
  OVERDUE: { bg: "bg-rose-50 border-rose-200 text-rose-600", label: "Overdue", icon: Clock },
  PENDING: { bg: "bg-blue-50 border-blue-200 text-blue-600", label: "Pending", icon: Clock }
};

const SubmissionTable = ({ roster, totalMarks, onGradeStudent }) => {
  return (
    <div className="w-full border border-gray-150 rounded-3xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Submitted At</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[#03045e]">
            {roster.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-xs text-gray-400 font-bold">
                  No students found in the class roster for this subject.
                </td>
              </tr>
            ) : (
              roster.map((student, idx) => {
                const pill = STATUS_PILLS[student.status] || STATUS_PILLS.PENDING;
                const Icon = pill.icon;

                return (
                  <motion.tr 
                    key={student.studentId}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-gray-50/50 transition-all group"
                  >
                    {/* Student Name */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black">{student.studentName}</span>
                        <span className="text-[9px] text-gray-400 font-bold mt-0.5">Adm No: {student.admissionNo}</span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 border rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${pill.bg}`}>
                          <Icon size={11} strokeWidth={2.5} />
                          {pill.label}
                        </span>
                      </div>
                    </td>

                    {/* Submitted At */}
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                      {student.submittedAt ? student.submittedAt : (
                        <span className="text-[10px] text-gray-400 italic">No submission</span>
                      )}
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 text-center">
                      {student.status === "GRADED" ? (
                        <div className="flex items-center justify-center gap-1 text-xs font-black text-indigo-600">
                          <Award size={13} className="text-indigo-500" />
                          <span>{student.marksAwarded ?? student.marksObtained ?? student.score} / {totalMarks}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">-- / {totalMarks}</span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onGradeStudent(student)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          student.status === "GRADED"
                            ? "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-[#03045e]"
                            : student.status === "SUBMITTED"
                            ? "bg-amber-500 text-white shadow-md shadow-amber-500/10 hover:bg-amber-600"
                            : "bg-[#03045e]/5 text-[#03045e] hover:bg-[#03045e] hover:text-white"
                        }`}
                      >
                        {student.status === "GRADED" ? "Update Grade" : "Grade Now"}
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionTable;
