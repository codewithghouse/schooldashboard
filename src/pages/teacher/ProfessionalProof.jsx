import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getStudents } from '../../lib/services';
import {
    Award,
    FileText,
    Zap,
    Target,
    TrendingUp,
    Download,
    CheckCircle2,
    Activity,
    Clock,
    UserCheck,
    BarChart3,
    ArrowUpRight
} from 'lucide-react';

const ProfessionalProof = () => {
    const { schoolId, userData } = useAuth();

    const achievements = [
        { label: 'Weekly Updates', value: '42', target: '40', status: 'completed' },
        { label: 'Syllabus Pace', value: '1.2x', target: '1.0x', status: 'ahead' },
        { label: 'Parent Engagement', value: '88%', target: '80%', status: 'high' },
        { label: 'Test Turnaround', value: '48h', target: '72h', status: 'fast' },
    ];

    const logs = [
        { action: "Syllabus Update: Unit 4 Completed", timestamp: "Oct 12, 10:20 AM", category: "Academic" },
        { action: "Dispatched 24 Weekly Reports to Class 10-A", timestamp: "Oct 10, 04:45 PM", category: "Communication" },
        { action: "Published Mid-Term Quiz results", timestamp: "Oct 08, 09:12 AM", category: "Assessment" },
        { action: "Created AI Lab Worksheet for Class 9", timestamp: "Oct 05, 11:30 AM", category: "Prep" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Professional Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] pointer-events-none opacity-50"></div>
                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                            Teacher Performance Log
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-4">Proof of Academic Effort</h1>
                    <p className="text-gray-500 font-medium max-w-xl">
                        Your professional contributions, quantified. A data-backed summary of your teaching impact and operational consistency.
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 relative z-10">
                    <button className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[24px] hover:bg-black transition-all shadow-xl shadow-gray-900/10 font-black text-[11px] uppercase tracking-widest group/btn">
                        <Download className="w-5 h-5 group-hover/btn:translate-y-1 transition-transform" /> Export Effort Report
                    </button>
                </div>
            </div>

            {/* Core KPIs for Management */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {achievements.map((item, i) => (
                    <div key={i} className="bg-white p-7 rounded-[32px] border border-gray-100 shadow-sm group hover:border-emerald-200 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                                {item.label.includes('Update') ? <FileText className="w-5 h-5" /> : item.label.includes('Pace') ? <Zap className="w-5 h-5" /> : item.label.includes('Parent') ? <UserCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            <div className="text-[9px] font-black uppercase text-emerald-600 tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                {item.status}
                            </div>
                        </div>
                        <h4 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{item.value}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{item.label}</p>
                        <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[100%] animate-in slide-in-from-left duration-1000"></div>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-2 font-bold italic">Benchmarked Target: {item.target}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Visual Impact Graph */}
                <div className="lg:col-span-12 bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-[600px] h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Academic Consistency Map</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Operational activity vs. Timeline</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-emerald-500" />
                    </div>

                    <div className="h-[250px] w-full flex items-end justify-between gap-1 px-4 relative z-10">
                        {/* Heatmap/Bar chart representation */}
                        {Array.from({ length: 24 }).map((_, i) => {
                            const val = Math.floor(Math.random() * 80) + 20;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div
                                        style={{ height: `${val}%` }}
                                        className={`w-full max-w-[12px] rounded-full transition-all duration-700 ${val > 70 ? 'bg-emerald-500 group-hover:bg-emerald-400' : val > 40 ? 'bg-indigo-500 group-hover:bg-indigo-400' : 'bg-gray-700 group-hover:bg-gray-600'}`}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between px-4 mt-6 text-[10px] font-black text-gray-500 uppercase tracking-widest border-t border-white/5 pt-6 relative z-10">
                        <span>Sept 01</span>
                        <span>Oct 15 (Today)</span>
                        <span>Nov 30</span>
                    </div>
                </div>

                {/* Granular Activity Proof */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Activity className="w-6 h-6 text-emerald-600" /> Granular Execution Log
                            </h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-4 py-2 rounded-xl">Immutable Records</span>
                        </div>
                        <div className="space-y-4">
                            {logs.map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-[28px] bg-gray-50/20 border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{log.action}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{log.timestamp}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{log.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-5 bg-gray-50 text-gray-400 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200">
                            Load Full History for Semester 1
                        </button>
                    </div>
                </div>
            </div>

            {/* Final Professional Seal */}
            <div className="bg-emerald-600 rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-all duration-1000">
                    <Award className="w-48 h-48" />
                </div>
                <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center border border-white/20 backdrop-blur-xl flex-shrink-0">
                    <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-2xl font-black tracking-tight mb-2 uppercase">Management Insight</h4>
                    <p className="text-emerald-50 font-medium text-sm max-w-lg">
                        You've exceeded the standard teaching operational benchmark by **12%** this month. This data is part of your professional portfolio.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalProof;
