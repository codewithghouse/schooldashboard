import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { getSyllabus, getStudents, createTest, addTestResult } from '../../lib/services';
import { ClipboardList, Plus, Save, BookOpen, AlertCircle } from 'lucide-react';

const TeacherTests = () => {
    const { schoolId, userData } = useAuth();
    const { activeClassId, activeClass } = useClass();
    const [students, setStudents] = useState([]);
    const [points, setPoints] = useState({ total: 20 });
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);

    // Test Creation State
    const [testData, setTestData] = useState({
        subject: '',
        date: '',
        chaptersCovered: [], // Multi-select
    });
    const [availableChapters, setAvailableChapters] = useState([]);

    // Logic: 
    // 1. Create Test (Metadata)
    // 2. Then Enter Results for that test for all students
    // For MVP transparency, separate flow? Or one flow?
    // "Create test: Subject, date... Enter results: Total marks, marks scored..."
    // Let's do a flow: "Add New Test Result set". First screen: Test Details. Next: Student list with inputs.

    const [step, setStep] = useState(1); // 1 = Details, 2 = Results

    // Results State: studentId -> { marks: 0, weakTopics: [] }
    const [resultsData, setResultsData] = useState({});

    useEffect(() => {
        if (schoolId && activeClassId) {
            loadInitialData();
        } else {
            setStudents([]);
            setAvailableChapters([]);
        }
    }, [schoolId, activeClassId]);

    const loadInitialData = async () => {
        // Fetch syllabus for chapters and students
        const [sts, syl] = await Promise.all([
            getStudents(schoolId, activeClassId),
            getSyllabus(schoolId, activeClassId)
        ]);
        setStudents(sts);
        // Flatten available chapters from all syllabus of this class
        const chapters = syl.flatMap(s => s.chapters);
        setAvailableChapters(chapters);
    };

    const handleNext = () => {
        if (!selectedClassId || !testData.subject || !testData.date) {
            alert("Please fill all details");
            return;
        }
        setStep(2);
    };

    const handleResultChange = (studentId, field, value) => {
        setResultsData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const toggleWeakTopic = (studentId, topic) => {
        const currentWeak = resultsData[studentId]?.weakTopics || [];
        const newWeak = currentWeak.includes(topic)
            ? currentWeak.filter(t => t !== topic)
            : [...currentWeak, topic];

        handleResultChange(studentId, 'weakTopics', newWeak);
    };

    const handleSubmitAll = async () => {
        try {
            // 1. Create Test Doc
            const testRef = await createTest({
                ...testData,
                schoolId,
                classId: selectedClassId,
                totalMarks: points.total,
                createdBy: userData.teacherId
            });

            // 2. Create Result Docs
            const promises = students.map(std => {
                const res = resultsData[std.id] || {};
                return addTestResult({
                    testId: testRef.id,
                    studentId: std.id,
                    marksScored: res.marks || 0,
                    totalMarks: points.total,
                    weakTopics: res.weakTopics || [],
                    schoolId, // redundant but useful for security rules filter
                });
            });

            await Promise.all(promises);
            alert("Test results published!");
            setIsTestModalOpen(false);
            setStep(1);
            setTestData({ subject: '', date: '', chaptersCovered: [] });
            setResultsData({});
        } catch (error) {
            console.error(error);
            alert("Error saving results");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Assessments & Results</h1>
                    <p className="text-gray-500 font-medium italic mt-1">“Quantifying progress, celebrating growth.”</p>
                </div>
                <div className="flex items-center gap-3">
                    {!activeClassId && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold animate-pulse">
                            <AlertCircle className="w-4 h-4" /> Class selection required
                        </div>
                    )}
                    <button
                        onClick={() => setIsTestModalOpen(true)}
                        disabled={!activeClassId}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${!activeClassId
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                                : 'bg-primary-600 text-white shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-95'
                            }`}
                    >
                        <Plus className="w-4 h-4" /> New Test Entry
                    </button>
                </div>
            </div>

            {!activeClassId ? (
                <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                        <BookOpen className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">No Class Selected</h3>
                    <p className="text-gray-500 font-medium max-w-xs mt-2">Please use the top bar to select a class before managing assessments.</p>
                </div>
            ) : (
                <div className="text-gray-500 bg-white p-12 rounded-[40px] border border-gray-100 text-center flex flex-col items-center justify-center shadow-sm">
                    <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Workspace Ready</h3>
                    <p className="max-w-xs mt-2">Select "New Test Entry" to begin logging results for <b>{activeClass?.name}</b>.</p>
                </div>
            )}

            {isTestModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8">
                        <h2 className="text-xl font-bold mb-6">Log Test Results - Step {step}/2</h2>

                        {step === 1 ? (
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Class Context</label>
                                        <div className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-gray-600 flex items-center gap-3">
                                            <BookOpen className="w-4 h-4 text-primary-500" />
                                            {activeClass?.name} - {activeClass?.section}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <input
                                            className="w-full px-3 py-2 border rounded-lg"
                                            value={testData.subject}
                                            onChange={(e) => setTestData({ ...testData, subject: e.target.value })}
                                            placeholder="Ex. Mathematics"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border rounded-lg"
                                            value={testData.date}
                                            onChange={(e) => setTestData({ ...testData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border rounded-lg"
                                            value={points.total}
                                            onChange={(e) => setPoints({ total: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapters Covered</label>
                                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 min-h-[60px]">
                                        {availableChapters.map((chap, i) => (
                                            <label key={i} className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value={chap}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setTestData(prev => ({
                                                            ...prev,
                                                            chaptersCovered: e.target.checked
                                                                ? [...prev.chaptersCovered, val]
                                                                : prev.chaptersCovered.filter(c => c !== val)
                                                        }))
                                                    }}
                                                />
                                                <span className="text-sm">{chap}</span>
                                            </label>
                                        ))}
                                        {availableChapters.length === 0 && <span className="text-xs text-gray-400">Select class first or no syllabus found.</span>}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button onClick={() => setIsTestModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button onClick={handleNext} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Next</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4 p-4 bg-primary-50 rounded-xl flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-primary-900">{testData.subject} Test</span>
                                        <span className="mx-2 text-primary-300">|</span>
                                        <span className="text-primary-700">Total: {points.total}</span>
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-sm text-primary-600 underline">Edit Details</button>
                                </div>

                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                    {students.map(std => (
                                        <div key={std.id} className="p-4 border border-gray-200 rounded-xl hover:border-primary-200 transition-colors">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-gray-900">{std.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm text-gray-500">Marks:</label>
                                                    <input
                                                        type="number"
                                                        className="w-20 px-2 py-1 border rounded text-right font-mono"
                                                        placeholder="0"
                                                        max={points.total}
                                                        onChange={(e) => handleResultChange(std.id, 'marks', e.target.value)}
                                                    />
                                                    <span className="text-gray-400">/ {points.total}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">Identify Weak Topics (from covered chapters):</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {testData.chaptersCovered.map((chap) => (
                                                        <button
                                                            key={chap}
                                                            onClick={() => toggleWeakTopic(std.id, chap)}
                                                            className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${resultsData[std.id]?.weakTopics?.includes(chap)
                                                                    ? 'bg-red-50 text-red-600 border-red-200 shadow-sm'
                                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                                                                } `}
                                                        >
                                                            {chap}
                                                        </button>
                                                    ))}
                                                    {testData.chaptersCovered.length === 0 && <span className="text-xs italic text-gray-400">No chapters selected in step 1</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                    <button onClick={() => setIsTestModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button onClick={handleSubmitAll} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Publish Results
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default TeacherTests;
