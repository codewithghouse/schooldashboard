import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addStudent, bulkAddStudents, getStudents, getClasses, getTeachers } from '../../lib/services';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Plus, Upload, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';

const StudentsModule = () => {
    const { schoolId } = useAuth();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [uploadMode, setUploadMode] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm();
    const [selectedClassId, setSelectedClassId] = useState('');
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        if (schoolId) {
            loadData();
        }
    }, [schoolId, selectedClassId]);

    const loadData = async () => {
        const [studentsData, classesData, teachersData] = await Promise.all([
            getStudents(schoolId, selectedClassId || null),
            getClasses(schoolId),
            getTeachers(schoolId)
        ]);
        setStudents(studentsData);
        if (classes.length === 0) setClasses(classesData);
        setTeachers(teachersData);
    };

    const onSubmit = async (data) => {
        try {
            await addStudent(schoolId, data);
            reset();
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Error adding student");
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Expect columns: Name, ParentEmail, ClassName (or we assume selected class logic later)
                // For MVP: manual link or expect "classId" or drop down to select class for all
                if (!selectedClassId) {
                    alert("Please select a class filter first to import students into that class.");
                    return;
                }

                const studentsToUpload = data.map(row => ({
                    name: row['Name'] || row['name'],
                    parentEmail: row['ParentEmail'] || row['parentEmail'],
                    classId: selectedClassId, // Import into current filtered class
                }));

                if (studentsToUpload.length > 0) {
                    await bulkAddStudents(schoolId, studentsToUpload);
                    alert(`Successfully imported ${studentsToUpload.length} students.`);
                    loadData();
                    setUploadMode(false);
                } else {
                    alert("No valid data found in Excel.");
                }
            } catch (err) {
                console.error(err);
                alert("Error parsing Excel file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Students Registry</h1>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                    </select>

                    <button
                        onClick={async () => {
                            if (!teachers.length) return alert("Add at least one teacher first!");
                            const defaultTeacher = teachers[0].uid || teachers[0].id;
                            if (window.confirm(`Repair all classes? This will link classes missing a teacher to: ${teachers[0].name}`)) {
                                const res = await fixMissingClassTeacherLinks(schoolId, defaultTeacher);
                                alert(`Migration complete! Fixed ${res.fixed} classes.`);
                                loadData();
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-amber-200 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all font-bold"
                    >
                        🛠️ Repair Links
                    </button>
                    <button
                        onClick={() => setIsSeedModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-purple-200 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all font-bold"
                    >
                        🚀 Super Seed
                    </button>
                    <button
                        onClick={() => { setUploadMode(true); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Upload className="w-4 h-4" /> Import Excel
                    </button>
                    <button
                        onClick={() => {
                            setUploadMode(false);
                            setIsModalOpen(true);
                            if (selectedClassId) setValue('classId', selectedClassId);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Student
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Student Name</th>
                            <th className="px-6 py-4 font-medium">Class</th>
                            <th className="px-6 py-4 font-medium">Parent Email</th>
                            <th className="px-6 py-4 font-medium">Parent Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.map((student) => {
                            const cls = classes.find(c => c.id === student.classId);
                            return (
                                <tr key={student.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {cls ? `${cls.name} (${cls.section})` : 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{student.parentEmail}</td>
                                    <td className="px-6 py-4">
                                        {student.parentUid ? (
                                            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">Linked</span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Pending</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                    No students found. Add or import them.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Super Seed Modal */}
            {isSeedModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border border-purple-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 italic">Super Seed Intelligence</h2>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Plus className="w-3 h-3" /> Auto-Linking Teacher + Class + Students
                        </p>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const classId = formData.get('classId');
                            const teacherId = formData.get('teacherId');
                            const count = parseInt(formData.get('count'));

                            if (!classId || !teacherId) {
                                alert("Please select both class and teacher!");
                                return;
                            }

                            setSeeding(true);
                            console.log(`🚀 Starting Super Seed: Class ${classId} with Teacher ${teacherId}`);

                            try {
                                // 1. Assign Teacher to Class
                                await updateDoc(doc(db, 'classes', classId), {
                                    classTeacherId: teacherId
                                });
                                console.log("✅ Step 1: Teacher assigned to Class successfully.");

                                // 2. Create Dummy Students
                                const dummyNames = [
                                    "Aarav Sharma", "Ishani Gupta", "Vihaan Khan", "Ananya Reddy", "Arjun Malhotra",
                                    "Saanvi Iyer", "Kabir Singh", "Myra Kapoor", "Aryan Verma", "Diya Mistri",
                                    "Reyansh Das", "Navya Joshi", "Ishaan Nair", "Advika Rao", "Krishna Bhat",
                                    "Kyra Saxena", "Atharva Patil", "Zara Ahmed", "Sai Charan", "Pari Deshmukh",
                                    "Aavya Kulkarni", "Avyaan Shah", "Shanaya Choudhury", "Ayaan Siddiqui", "Amaira Gill",
                                    "Aaditya Mehra", "Sarah Sheikh", "Veer Dixit", "Sia Thakur", "Vivaan Goel"
                                ];

                                const studentsToSeed = Array.from({ length: count }).map((_, i) => ({
                                    name: dummyNames[i % dummyNames.length] + (i >= 30 ? ` ${i}` : ''),
                                    parentEmail: `parent.dev${i + 1}@example.com`,
                                    classId: classId
                                }));

                                await bulkAddStudents(schoolId, studentsToSeed);
                                console.log(`✅ Step 2: ${count} students linked to class successfully.`);

                                alert("Super Seed Complete! Data is now fully linked.");
                                setIsSeedModalOpen(false);
                                loadData();
                            } catch (err) {
                                console.error("Super Seed Failed:", err);
                                alert("Seeding failed: " + err.message);
                            } finally {
                                setSeeding(false);
                            }
                        }} className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Target Class</label>
                                <select name="classId" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-300 font-bold text-sm">
                                    <option value="">Select Class...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Responsible Teacher (UID)</label>
                                <select name="teacherId" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-300 font-bold text-sm">
                                    <option value="">Select Teacher...</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.uid || t.id}>
                                            {t.name} (ID: {(t.uid || t.id).slice(0, 6)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Student Density</label>
                                <input type="number" name="count" defaultValue="20" min="1" max="50" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-300 font-bold text-sm" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsSeedModalOpen(false)} className="px-6 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-xl">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={seeding}
                                    className="px-10 py-4 bg-purple-600 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-xl shadow-purple-600/20 hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {seeding ? 'Processing Context...' : 'Execute Super Seed'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsModule;
