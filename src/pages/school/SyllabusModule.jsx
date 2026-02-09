import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { uploadSyllabus, getSyllabus, getClasses } from '../../lib/services';
import { Upload, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';

const SyllabusModule = () => {
    const { schoolId } = useAuth();
    const [syllabusList, setSyllabusList] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (schoolId) {
            loadData();
        }
    }, [schoolId]);

    const loadData = async () => {
        const [sylData, classesData] = await Promise.all([
            getSyllabus(schoolId),
            getClasses(schoolId)
        ]);
        setSyllabusList(sylData);
        setClasses(classesData);
    };

    const onSubmit = async (data) => {
        try {
            setUploading(true);
            const file = data.file[0];
            const uploadResult = await uploadToCloudinary(file);

            // Basic chapter parsing simulation (User would ideally enter these)
            // For now, we'll ask them to enter comma separated chapters
            const chapters = data.chapters.split(',').map(c => c.trim());

            await uploadSyllabus(schoolId, {
                classId: data.classId,
                subject: data.subject,
                chapters: chapters,
                pdfUrl: uploadResult.url,
                pdfName: uploadResult.originalName
            });

            setUploading(false);
            reset();
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Error uploading syllabus");
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Syllabus Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Upload className="w-4 h-4" /> Upload New Syllabus
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {syllabusList.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No syllabus uploaded yet.</p>
                    </div>
                ) : (
                    syllabusList.map((syl) => {
                        const cls = classes.find(c => c.id === syl.classId);
                        return (
                            <div key={syl.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900">{syl.subject}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                        {cls ? `${cls.name} (${cls.section})` : 'Unknown Class'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">{syl.chapters.length} Chapters defined</p>
                                <a
                                    href={syl.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                                >
                                    <FileText className="w-4 h-4" /> View PDF
                                </a>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-6">Upload Syllabus</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                <select {...register("classId", { required: true })} className="w-full px-3 py-2 border rounded-lg">
                                    <option value="">Select Class</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input {...register("subject", { required: true })} className="w-full px-3 py-2 border rounded-lg" placeholder="Mathematics" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chapters (comma separated)</label>
                                <textarea {...register("chapters", { required: true })} className="w-full px-3 py-2 border rounded-lg" placeholder="Chapter 1, Chapter 2..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus PDF</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    {...register("file", { required: true })}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-70">
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyllabusModule;
