import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiPlus, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { supportService } from '../../services/supportService';
import Header from '../../components/layout/Header';
import { vendorTheme } from '../../../../theme';
import toast from 'react-hot-toast';

const SupportList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ subject: '', category: 'general', message: '' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await supportService.getTickets();
      if (res.success) {
        setTickets(res.data);
      }
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await supportService.createTicket(formData);
      if (res.success) {
        toast.success('Ticket created successfully!');
        setShowCreateModal(false);
        setFormData({ subject: '', category: 'general', message: '' });
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-black text-white';
      case 'in_progress': return 'bg-gray-100 text-black';
      case 'waiting_on_user': return 'bg-gray-50 text-gray-400 border border-gray-100';
      case 'resolved':
      case 'closed': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <FiMessageSquare className="w-3.5 h-3.5 mr-1.5" />;
      case 'in_progress': return <FiClock className="w-3.5 h-3.5 mr-1.5" />;
      case 'waiting_on_user': return <FiAlertCircle className="w-3.5 h-3.5 mr-1.5" />;
      case 'resolved':
      case 'closed': return <FiCheckCircle className="w-3.5 h-3.5 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Helpdesk & Support" showBack={true} />

      <div className="p-5">
        {/* Header Action (Black Theme) */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tighter">Support</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Communication History</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-5 py-2.5 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200 transition-all active:scale-95"
          >
            <FiPlus className="mr-2 w-4 h-4" /> New Ticket
          </button>
        </div>

        {/* Ticket List (Black Theme) */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-[40px] p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
              <FiMessageSquare className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">No Active Tickets</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-8 px-8">Our executive team is ready to assist you. Start a conversation if you need help.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gray-200"
            >
              Raise a Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div
                key={ticket._id}
                onClick={() => navigate(`/vendor/support/${ticket._id}`)}
                className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer group hover:border-black"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{ticket.ticketNumber}</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2 group-hover:text-black transition-colors">{ticket.subject}</h3>
                <p className="text-[11px] font-medium text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                  {ticket.messages[0]?.message}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">{ticket.category}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                    {new Date(ticket.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal (Black Theme) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">New Request</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Support Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest focus:border-black focus:bg-white outline-none transition-all"
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="payout">Payout Issue</option>
                    <option value="booking">Booking Issue</option>
                    <option value="account">Account/Profile</option>
                    <option value="technical">Technical Bug</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="BRIEF OVERVIEW"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest focus:border-black focus:bg-white outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Detail</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="DESCRIBE THE ISSUE..."
                    rows="4"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest focus:border-black focus:bg-white outline-none transition-all resize-none"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full py-5 rounded-[24px] bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 active:scale-95 transition-all"
                >
                  Authorize Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportList;
