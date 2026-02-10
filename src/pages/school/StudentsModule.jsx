import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addStudent, bulkAddStudents, getStudents, getClasses, getTeachers } from '../../lib/services';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Plus, Upload } from 'lucide-react';
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
        setClasses(classesData);
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

                if (!selectedClassId) {
                    alert("Please select a class filter first to import students into that class.");
                    return;
                }

                const studentsToUpload = data.map(row => ({
                    name: row['Name'] || row['name'],
                    parentEmail: row['ParentEmail'] || row['parentEmail'],
                    classId: selectedClassId,
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm gap-4">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Students Registry</h1>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="px-6 py-3 border border-gray-100 rounded-2xl bg-gray-50 font-bold text-sm outline-none focus:bg-white focus:border-primary-300 transition-all"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                    </select>

                    <button
                        onClick={() => setIsSeedModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 border border-purple-100 text-purple-600 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-purple-500/10"
                    >
                        🚀 Super Seed
                    </button>
                    <button
                        onClick={() => { setUploadMode(true); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-100 text-gray-600 bg-white rounded-2xl hover:bg-gray-50 transition-colors font-black text-[11px] uppercase tracking-widest"
                    >
                        <Upload className="w-4 h-4" /> Import Excel
                    </button>
                    <button
                        onClick={() => {
                            setUploadMode(false);
                            setIsModalOpen(true);
                            if (selectedClassId) setValue('classId', selectedClassId);
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20"
                    >
                        <Plus className="w-4 h-4" /> Add Student
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-6">Student Name</th>
                            <th className="px-8 py-6">Class Context</th>
                            <th className="px-8 py-6">Parent Email</th>
                            <th className="px-8 py-6 text-right">Presence</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.map((student) => {
                            const cls = classes.find(c => c.id === student.classId);
                            return (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6 font-bold text-gray-900 italic text-lg">{student.name}</td>
                                    <td className="px-8 py-6 text-gray-500 font-medium">
                                        {cls ? `${cls.name} (${cls.section})` : 'Unknown'}
                                    </td>
                                    <td className="px-8 py-6 text-gray-500 font-medium font-mono text-xs">{student.parentEmail}</td>
                                    <td className="px-8 py-6 text-right">
                                        {student.parentUid ? (
                                            <span className="text-[10px] font-black px-3 py-1.5 bg-green-50 text-green-600 rounded-full uppercase tracking-widest border border-green-100 shadow-sm">Linked</span>
                                        ) : (
                                            <span className="text-[10px] font-black px-3 py-1.5 bg-gray-50 text-gray-400 rounded-full uppercase tracking-widest border border-gray-100">Pending</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-8 py-20 text-center">
                                    <p className="text-gray-400 font-black italic text-xl">No students found.</p>
                                    <p className="text-gray-400 text-sm mt-1">Start by adding or importing your roster.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-3xl font-black mb-8 text-gray-900 tracking-tight italic">{uploadMode ? 'Bulk Import' : 'New Student'}</h2>

                        {uploadMode ? (
                            <div className="space-y-6">
                                <div className="p-8 border-4 border-dashed border-gray-100 rounded-[32px] text-center">
                                    <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" id="excel-upload" />
                                    <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                        <Upload className="w-12 h-12 text-primary-600" />
                                        <p className="font-bold text-gray-900">Choose Excel File</p>
                                        <p className="text-xs text-gray-400">Expects: 'Name', 'ParentEmail'</p>
                                    </label>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-full py-4 text-gray-400 font-black uppercase text-[11px] tracking-widest hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Student Name</label>
                                    <input {...register("name", { required: true })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary-300 font-bold text-sm" placeholder="Full legal name" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Parent Email</label>
                                    <input {...register("parentEmail", { required: true })} type="email" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary-300 font-bold text-sm" placeholder="parent@email.com" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Grade Level</label>
                                    <input {...register("grade", { required: true })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary-300 font-bold text-sm" placeholder="e.g. 10" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Section / Division</label>
                                    <input {...register("section", { required: true })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary-300 font-bold text-sm" placeholder="e.g. A" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Class Context</label>
                                    <select {...register("classId", { required: true })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary-300 font-bold text-sm">
                                        <option value="">Select Class...</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-xl">Cancel</button>
                                    <button type="submit" className="px-10 py-4 bg-primary-600 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all">Link Student</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Super Seed Modal */}
            {isSeedModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border border-purple-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 italic">Super Seed Intelligence</h2>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-8 flex items-center gap-2">
                            Auto-Linking Teacher + Class + Students
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
                            try {
                                await updateDoc(doc(db, 'classes', classId), {
                                    classTeacherId: teacherId
                                });

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
                                    classId: classId,
                                    grade: classes.find(c => c.id === classId)?.grade || "10",
                                    section: classes.find(c => c.id === classId)?.section || "A"
                                }));

                                await bulkAddStudents(schoolId, studentsToSeed);
                                alert("Super Seed Complete!");
                                setIsSeedModalOpen(false);
                                loadData();
                            } catch (err) {
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
                                            {t.name} ({(t.uid || t.id).slice(0, 6)})
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
