import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createTicket, getTickets, addTicketReply } from '../../lib/services';
import {
    MessageSquare,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    Send,
    User,
    ArrowRight,
    Loader2,
    LifeBuoy
} from 'lucide-react';

const SupportModule = () => {
    const { userData, schoolId, role } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newReply, setNewReply] = useState('');
    const [newTicket, setNewTicket] = useState({ category: 'Technical Issue', subject: '', description: '' });

    useEffect(() => {
        if (userData?.uid) {
            fetchTickets();
        }
    }, [userData?.uid]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await getTickets(schoolId, role, role === 'owner' ? null : userData.uid);
            setTickets(data.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
        } catch (error) {
            console.error("Ticket Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await createTicket(schoolId, {
                ...newTicket,
                userId: userData.uid,
                userName: userData.name || userData.email,
                role: role,
                replies: []
            });
            setIsModalOpen(false);
            setNewTicket({ category: 'Technical Issue', subject: '', description: '' });
            fetchTickets();
            alert("Support ticket raised successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to raise ticket.");
        }
    };

    const handleSendReply = async () => {
        if (!newReply.trim()) return;
        try {
            await addTicketReply(selectedTicket.id, {
                userId: userData.uid,
                userName: userData.name || userData.email,
                message: newReply,
                role: role
            });
            setNewReply('');
            // Refresh detail
            const updatedTickets = await getTickets(schoolId, role, role === 'owner' ? null : userData.uid);
            const updated = updatedTickets.find(t => t.id === selectedTicket.id);
            setSelectedTicket(updated);
            setTickets(updatedTickets.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic flex items-center gap-3">
                        <LifeBuoy className="w-8 h-8 text-primary-600" /> Support Desk
                    </h1>
                    <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest">Submit tickets and track resolutions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 bg-primary-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Raise Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tickets List */}
                <div className={`${selectedTicket ? 'lg:col-span-12' : 'lg:col-span-12'} space-y-4`}>
                    {selectedTicket ? (
                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                            {/* Ticket Header */}
                            <div className="bg-gray-50 p-8 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedTicket(null)} className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all">
                                        <ArrowRight className="w-5 h-5 rotate-180" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black bg-primary-100 text-primary-700 px-3 py-1 rounded-full uppercase tracking-widest">{selectedTicket.ticketNo}</span>
                                            <h2 className="text-xl font-bold text-gray-900 italic">{selectedTicket.subject}</h2>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium">Category: {selectedTicket.category}</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${selectedTicket.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                    {selectedTicket.status === 'open' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                    {selectedTicket.status}
                                </div>
                            </div>

                            {/* Conversation */}
                            <div className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[400px]">
                                {/* Initial Message */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 font-bold uppercase">{selectedTicket.userName.substring(0, 1)}</div>
                                    <div className="bg-gray-50 p-6 rounded-[32px] rounded-tl-none border border-gray-100 max-w-2xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-black text-xs text-gray-900">{selectedTicket.userName} <span className="text-gray-400 font-medium ml-2 px-2 py-0.5 bg-gray-100 rounded-md text-[9px] uppercase">{selectedTicket.role}</span></span>
                                            <span className="text-[9px] text-gray-400 font-medium">{selectedTicket.createdAt?.toDate().toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedTicket.description}</p>
                                    </div>
                                </div>

                                {/* Replies */}
                                {selectedTicket.replies?.map((reply, idx) => (
                                    <div key={idx} className={`flex gap-4 ${reply.userId === userData.uid ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold uppercase ${reply.role === 'owner' ? 'bg-primary-900 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {reply.userName.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div className={`p-6 rounded-[32px] border max-w-2xl shadow-sm ${reply.userId === userData.uid
                                                ? 'bg-primary-600 text-white border-primary-600 rounded-tr-none'
                                                : 'bg-white text-gray-600 border-gray-100 rounded-tl-none'
                                            }`}>
                                            <div className="flex justify-between items-center mb-2 gap-8">
                                                <span className={`font-black text-xs ${reply.userId === userData.uid ? 'text-white' : 'text-gray-900'}`}>
                                                    {reply.userName}
                                                    <span className={`font-medium ml-2 px-2 py-0.5 rounded-md text-[9px] uppercase ${reply.userId === userData.uid ? 'bg-white/20' : 'bg-gray-100'}`}>
                                                        {reply.role}
                                                    </span>
                                                </span>
                                                <span className={`text-[9px] font-medium ${reply.userId === userData.uid ? 'text-white/60' : 'text-gray-400'}`}>
                                                    {new Date(reply.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed font-medium">{reply.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input */}
                            {selectedTicket.status === 'open' && (
                                <div className="p-8 border-t border-gray-100 bg-white">
                                    <div className="relative">
                                        <textarea
                                            value={newReply}
                                            onChange={(e) => setNewReply(e.target.value)}
                                            placeholder="Type your response here..."
                                            className="w-full p-6 pr-20 bg-gray-50 border border-gray-100 rounded-[32px] outline-none focus:bg-white focus:border-primary-300 font-medium text-sm transition-all"
                                            rows="3"
                                        />
                                        <button
                                            onClick={handleSendReply}
                                            disabled={!newReply.trim()}
                                            className="absolute bottom-4 right-4 p-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all disabled:opacity-50 active:scale-95"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-6">Ticket Details</th>
                                        <th className="px-8 py-6">Category</th>
                                        <th className="px-8 py-6">Raised On</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                                        <MessageSquare className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 italic">{ticket.subject}</p>
                                                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{ticket.ticketNo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full uppercase tracking-widest">{ticket.category}</span>
                                            </td>
                                            <td className="px-8 py-6 text-gray-500 font-medium text-xs">
                                                {ticket.createdAt?.toDate().toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ticket.status === 'open'
                                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                        : 'bg-green-50 text-green-600 border-green-100'
                                                    }`}>
                                                    {ticket.status === 'open' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                                    {ticket.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end">
                                                    <div className="p-3 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all">
                                                        <ArrowRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {tickets.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <div className="max-w-xs mx-auto opacity-20 mb-4">
                                                    <LifeBuoy className="w-16 h-16 mx-auto mb-4" />
                                                </div>
                                                <p className="text-gray-400 font-black italic text-xl uppercase tracking-tighter">Everything is running smoothly.</p>
                                                <p className="text-gray-400 text-sm mt-1">No active support tickets found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Ticket Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-blue-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-8 text-gray-900 tracking-tight italic">Raise Ticket</h2>
                            <form onSubmit={handleCreateTicket} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                    <select
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-300 font-bold text-sm appearance-none"
                                    >
                                        <option>Technical Issue</option>
                                        <option>Billing & Subscription</option>
                                        <option>Data Correction</option>
                                        <option>Feature Request</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Subject</label>
                                    <input
                                        required
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-300 font-bold text-sm"
                                        placeholder="Brief summary of the issue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                    <textarea
                                        required
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-300 font-bold text-sm min-h-[120px]"
                                        placeholder="Detail the issue or request here..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                                    <button type="submit" className="px-10 py-4 bg-primary-600 text-white rounded-[24px] hover:bg-primary-700 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2">
                                        Open Ticket
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportModule;
