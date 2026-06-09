import React, { useState, useMemo, useEffect } from "react";
import { Users, BookOpen, GraduationCap, User, Tag, Calculator, Check, X } from "lucide-react";
import getDataProvider from "../../data/providers/providerFactory";

const BROAD_GROUPS = ["Students", "Parents", "Teachers", "Admins"];
const CLASSES = [
  "Pre-Nursery", "Nursery", "LKG", "UKG",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];
const SECTIONS = ["A", "B", "C", "D"];
const STREAMS = ["Science", "Commerce", "Humanities"];
const TEACHER_TYPES = ["Class Teachers", "Subject Teachers", "Department Heads"];
const SUBJECTS = [
  "Mathematics", "Science", "Physics", "Chemistry", "Biology", 
  "English", "Hindi", "Social Studies", "Accounts", "Economics", "Computer Science"
];

const AudienceSelector = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState("broad");

  // Ensure default structure
  const safeValue = {
    groups: [],
    classes: [],
    sections: [],
    streams: [],
    teacherTypes: [],
    subjects: [],
    studentIds: [],
    employeeIds: [],
    ...value
  };

  const handleToggle = (category, item) => {
    const current = safeValue[category] || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    
    onChange({
      ...safeValue,
      [category]: updated
    });
  };



  const [baseCounts, setBaseCounts] = useState({
    totalStudents: 500,
    totalParents: 500,
    totalTeachers: 50,
    studentsPerClass: 40,
    studentsPerStream: 80,
    teachersPerRole: 10,
    teachersPerSubject: 5
  });

  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const provider = getDataProvider();
        const [students, teachers] = await Promise.all([
          provider.getStudents(),
          provider.getTeachers()
        ]);
        
        setAllStudents(students || []);
        setAllTeachers(teachers || []);

        const totalStudents = students?.length || 0;
        const totalParents = totalStudents; // roughly 1 parent account per student
        const totalTeachers = teachers?.length || 0;

        setBaseCounts({
          totalStudents,
          totalParents,
          totalTeachers,
          studentsPerClass: Math.max(1, Math.floor(totalStudents / 12)),
          studentsPerStream: Math.max(1, Math.floor(totalStudents / 3)),
          teachersPerRole: Math.max(1, Math.floor(totalTeachers / 3)),
          teachersPerSubject: Math.max(1, Math.floor(totalTeachers / 10))
        });
      } catch (err) {
        console.error("Failed to fetch audience counts", err);
      }
    };
    fetchCounts();
  }, []);

  const estimatedRecipients = useMemo(() => {
    let studentSet = new Set(safeValue.studentIds);
    let teacherSet = new Set(safeValue.employeeIds);
    let parentSet = new Set(); 

    // Students
    if (safeValue.groups.includes("Students")) {
      allStudents.forEach(s => studentSet.add(s.id));
    } else if (safeValue.classes.length > 0) {
      allStudents.forEach(s => {
        if (safeValue.classes.includes(s.classLevel)) {
          const matchesSection = safeValue.sections.length === 0 || safeValue.sections.includes(s.section);
          const matchesStream = safeValue.streams.length === 0 || safeValue.streams.some(st => s.stream?.includes(st));
          if (matchesSection && matchesStream) studentSet.add(s.id);
        }
      });
    }

    // Parents
    if (safeValue.groups.includes("Parents")) {
      allStudents.forEach(s => parentSet.add(s.parentId || s.id + "_p"));
    } else if (studentSet.size > 0) {
      allStudents.forEach(s => {
        if (studentSet.has(s.id)) parentSet.add(s.parentId || s.id + "_p");
      });
    }

    // Teachers
    if (safeValue.groups.includes("Teachers")) {
      allTeachers.forEach(t => teacherSet.add(t.id));
    } else if (safeValue.teacherTypes.length > 0 || safeValue.subjects.length > 0) {
      allTeachers.forEach(t => {
        const isClassTeacher = t.isClassTeacher && safeValue.teacherTypes.includes("Class Teachers");
        const isSubjectTeacher = t.subjectName && safeValue.teacherTypes.includes("Subject Teachers");
        const matchesSubject = safeValue.subjects.includes(t.subjectName) || safeValue.subjects.includes(t.department);
        if (isClassTeacher || isSubjectTeacher || matchesSubject) teacherSet.add(t.id);
      });
    }

    return { 
      students: studentSet.size, 
      parents: parentSet.size, 
      teachers: teacherSet.size, 
      total: studentSet.size + parentSet.size + teacherSet.size 
    };
  }, [safeValue, allStudents, allTeachers]);

  const FilterPill = ({ label, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
        selected
          ? "bg-[#03045e] text-white border-[#03045e] shadow-md shadow-[#03045e]/20"
          : "bg-white text-gray-500 border-gray-200 hover:border-[#0077b6] hover:text-[#0077b6]"
      }`}
    >
      {selected && <Check size={12} />}
      {label}
    </button>
  );

  const SearchSelect = ({ label, placeholder, options, selectedIds, onChange, renderLabel, searchFields }) => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const filteredOptions = useMemo(() => {
      if (!query) return [];
      const lowerQuery = query.toLowerCase();
      return options.filter(o => 
        !selectedIds.includes(o.id) && 
        searchFields.some(field => o[field] && String(o[field]).toLowerCase().includes(lowerQuery))
      ).slice(0, 8);
    }, [query, options, selectedIds, searchFields]);

    const handleSelect = (id) => {
      onChange([...selectedIds, id]);
      setQuery("");
    };

    const handleRemove = (id) => {
      onChange(selectedIds.filter(i => i !== id));
    };

    return (
      <div className="relative">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{label}</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedIds.map(id => {
            const opt = options.find(o => o.id === id);
            return (
              <div key={id} className="flex items-center gap-1.5 bg-[#caf0f8]/30 border border-[#caf0f8] text-[#0077b6] px-2 py-1 rounded-lg text-xs font-bold">
                {opt ? renderLabel(opt) : id}
                <button type="button" onClick={() => handleRemove(id)} className="text-[#0077b6] hover:text-red-500 transition-colors"><X size={12} /></button>
              </div>
            );
          })}
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0077b6] text-[#03045e] font-medium"
        />
        {isFocused && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {filteredOptions.map(opt => (
              <div 
                key={opt.id} 
                onMouseDown={() => handleSelect(opt.id)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-b-0 border-gray-100 flex flex-col"
              >
                <span className="font-bold text-[#03045e]">{opt.name || opt.teacherName}</span>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  {opt.admissionNo ? `Adm: ${opt.admissionNo}` : `ID: ${opt.teacherId || opt.id}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Top Tabs */}
      <div className="w-full bg-gray-50 border-b border-gray-200 p-2 flex flex-row gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("broad")}
          className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "broad" ? "bg-white text-[#0077b6] shadow-sm border border-gray-200" : "text-gray-500 hover:bg-gray-100"}`}
        >
          <Users size={14} /> Broad Audience
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("academic")}
          className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "academic" ? "bg-white text-[#0077b6] shadow-sm border border-gray-200" : "text-gray-500 hover:bg-gray-100"}`}
        >
          <GraduationCap size={14} /> Academic Filters
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("teachers")}
          className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "teachers" ? "bg-white text-[#0077b6] shadow-sm border border-gray-200" : "text-gray-500 hover:bg-gray-100"}`}
        >
          <BookOpen size={14} /> Teacher Filters
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("direct")}
          className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "direct" ? "bg-white text-[#0077b6] shadow-sm border border-gray-200" : "text-gray-500 hover:bg-gray-100"}`}
        >
          <Tag size={14} /> Direct Targeting
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 flex flex-col">
        
        <div className="flex-1">
          {/* BROAD AUDIENCE */}
          {activeTab === "broad" && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Broad Groups</h3>
              <div className="flex flex-wrap gap-2">
                {BROAD_GROUPS.map(g => (
                  <FilterPill key={g} label={g} selected={safeValue.groups.includes(g)} onClick={() => handleToggle("groups", g)} />
                ))}
              </div>
            </div>
          )}

          {/* ACADEMIC FILTERS */}
          {activeTab === "academic" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target by Class</h3>
                <div className="flex flex-wrap gap-2">
                  {CLASSES.map(c => (
                    <FilterPill key={c} label={`Class ${c}`} selected={safeValue.classes.includes(c)} onClick={() => handleToggle("classes", c)} />
                  ))}
                </div>
              </div>
              {safeValue.classes.length > 0 ? (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target by Section</h3>
                  <div className="flex flex-wrap gap-2">
                    {SECTIONS.map(s => (
                      <FilterPill key={s} label={`Section ${s}`} selected={safeValue.sections.includes(s)} onClick={() => handleToggle("sections", s)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4 opacity-50 pointer-events-none">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target by Section (Select a class first)</h3>
                  <div className="flex flex-wrap gap-2">
                    {SECTIONS.map(s => (
                      <FilterPill key={s} label={`Section ${s}`} selected={false} onClick={() => {}} />
                    ))}
                  </div>
                </div>
              )}
              
              {(safeValue.classes.includes("11") || safeValue.classes.includes("12")) ? (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target by Stream (Class 11/12)</h3>
                  <div className="flex flex-wrap gap-2">
                    {STREAMS.map(st => (
                      <FilterPill key={st} label={st} selected={safeValue.streams.includes(st)} onClick={() => handleToggle("streams", st)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4 opacity-50 pointer-events-none">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target by Stream (Select Class 11 or 12 first)</h3>
                  <div className="flex flex-wrap gap-2">
                    {STREAMS.map(st => (
                      <FilterPill key={st} label={st} selected={false} onClick={() => {}} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEACHER FILTERS */}
          {activeTab === "teachers" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Teacher Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {TEACHER_TYPES.map(t => (
                    <FilterPill key={t} label={t} selected={safeValue.teacherTypes.includes(t)} onClick={() => handleToggle("teacherTypes", t)} />
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Subject Teachers</h3>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(sub => (
                    <FilterPill key={sub} label={sub} selected={safeValue.subjects.includes(sub)} onClick={() => handleToggle("subjects", sub)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DIRECT TARGETING */}
          {activeTab === "direct" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchSelect 
                label="Target Students"
                placeholder="Search name or adm no..."
                options={allStudents}
                selectedIds={safeValue.studentIds}
                onChange={(newIds) => onChange({ ...safeValue, studentIds: newIds })}
                renderLabel={(opt) => `${opt.name} (${opt.admissionNo})`}
                searchFields={["name", "admissionNo"]}
              />
              <SearchSelect 
                label="Target Employees"
                placeholder="Search name or emp ID..."
                options={allTeachers}
                selectedIds={safeValue.employeeIds}
                onChange={(newIds) => onChange({ ...safeValue, employeeIds: newIds })}
                renderLabel={(opt) => `${opt.teacherName} (${opt.teacherId || opt.id})`}
                searchFields={["teacherName", "teacherId", "id"]}
              />
            </div>
          )}
        </div>

        {/* Estimated Recipients Banner */}
        <div className="mt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0 mt-0.5">
              <Calculator size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Estimated Recipients</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs font-medium text-gray-600">
                <span>Students: <strong className="text-gray-900">{estimatedRecipients.students}</strong></span>
                <span>Parents: <strong className="text-gray-900">{estimatedRecipients.parents}</strong></span>
                <span>Teachers/Staff: <strong className="text-gray-900">{estimatedRecipients.teachers}</strong></span>
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:items-end w-full lg:w-auto border-t lg:border-t-0 border-blue-200/50 pt-3 lg:pt-0">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Estimated</span>
            <span className="text-2xl font-black text-[#03045e] leading-none">{estimatedRecipients.total}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AudienceSelector;
