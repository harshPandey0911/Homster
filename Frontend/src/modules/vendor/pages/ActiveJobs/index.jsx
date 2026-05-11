import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiMapPin, FiClock, FiUser, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import BottomNav from '../../components/layout/BottomNav';
import { getBookings, assignWorker as assignWorkerApi } from '../../services/bookingService';
import { ConfirmDialog } from '../../components/common';

const ActiveJobs = memo(() => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('in_progress'); // Default to showing active jobs
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  // Memoize loadJobs to prevent recreation
  const loadJobs = useCallback(async (currentFilter, currentSearch) => {
    try {
      setLoading(true);
      const response = await getBookings({
        status: currentFilter,
        q: currentSearch,
        limit: 50 // Fetch more than default since we removed client-side filter
      });
      const jobsData = response.data || [];
      // Map API response to Component State structure
      const mappedJobs = jobsData.map(job => ({
        id: job._id || job.id,
        serviceType: job.serviceName || 'Service',
        user: {
          name: job.userId?.name || 'Customer'
        },
        location: {
          address: job.address?.addressLine1 || 'Address not available'
        },
        price: (job.finalAmount ? job.finalAmount * 0.9 : 0).toFixed(2),
        status: job.status,
        assignedTo: job.workerId ? { name: job.workerId.name } : (job.assignedAt ? { name: 'You (Self)' } : null),
        timeSlot: {
          date: job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Date',
          time: job.scheduledTime || 'Time'
        }
      }));
      setJobs(mappedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Use a debounced search to avoid spamming the API
  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs(filter, searchQuery);
    }, filter === 'all' && searchQuery === '' ? 0 : 500); // Only debounce if active searching

    return () => clearTimeout(timer);
  }, [filter, searchQuery, loadJobs]);

  useEffect(() => {
    window.addEventListener('vendorJobsUpdated', () => loadJobs(filter, searchQuery));
    return () => {
      window.removeEventListener('vendorJobsUpdated', () => loadJobs(filter, searchQuery));
    };
  }, [loadJobs, filter, searchQuery]);

  // filteredJobs is now just the jobs from the server
  const filteredJobs = jobs;

  const handleAssignToSelf = async (jobId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Assign to Self',
      message: 'Are you sure you want to do this job yourself?',
      onConfirm: async () => {
        try {
          const response = await assignWorkerApi(jobId, 'SELF');
          if (response && response.success) {
            toast.success("Assigned to yourself!");
            // Refresh jobs list instead of full page reload
            loadJobs(filter, searchQuery);
          }
        } catch (error) {
          console.error("Error assigning to self:", error);
          toast.error("Failed to assign to yourself");
        }
      }
    });
  };

  const hexToRgba = useCallback((hex, alpha) => {
    if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      'ACCEPTED': '#F59E0B',
      'ASSIGNED': '#3B82F6',
      'JOURNEY_STARTED': '#F59E0B',
      'VISITED': '#8B5CF6',
      'WORK_DONE': '#10B981',
      'WORKER_PAID': '#06B6D4',
      'SETTLEMENT_PENDING': '#F97316',
      'COMPLETED': '#059669',
    };
    return colors[status?.toUpperCase()] || '#6B7280';
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ background: '#FFFFFF' }}>
      <header className="px-6 py-5 flex items-center justify-between bg-transparent">
        <h1 className="text-xl font-black text-gray-900">Active Jobs</h1>
        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
          <FiBriefcase className="w-5 h-5 text-black" />
        </div>
      </header>

      <main className="px-5">
        {/* Search Bar (Black Theme) */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-[24px] py-4 pl-12 pr-4 text-sm font-bold text-gray-900 shadow-sm border border-gray-100 focus:border-black outline-none transition-all"
            />
          </div>
        </div>

        {/* Filter Buttons (Black Theme) */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-6 py-2.5 rounded-full font-black text-xs whitespace-nowrap transition-all duration-300 ${
                filter === filterOption.id
                  ? 'bg-black text-white shadow-lg shadow-gray-200'
                  : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-50 rounded" />
                    <div className="h-3 w-20 bg-gray-50 rounded" />
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiBriefcase className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">No jobs found</h3>
            <p className="text-sm font-bold text-gray-400">
              {searchQuery ? 'Try another search term' : 'You don\'t have any jobs here yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredJobs.map((job) => {
              const isCompleted = job.status?.toLowerCase() === 'completed';

              return (
                <div
                  key={job.id}
                  onClick={() => navigate(`/vendor/booking/${job.id}`)}
                  className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 cursor-pointer active:scale-98 transition-all duration-200 relative group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {/* Status Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                      <FiBriefcase className="w-6 h-6 text-black" />
                    </div>

                    {/* Job Header */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-black text-gray-900 truncate">
                          {job.user?.name || 'Customer'}
                        </h4>
                        <span className="text-[11px] font-black text-black">
                          {isCompleted ? `₹${job.price}` : '---'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold text-gray-500">
                          {job.serviceType}
                        </p>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-black text-white uppercase tracking-widest">
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5 px-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center">
                        <FiMapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{job.location?.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center">
                        <FiClock className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{job.timeSlot?.time}</span>
                    </div>
                  </div>

                  {/* Assigned Info */}
                  {job.assignedTo && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-2xl mb-4">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <FiUser className="w-3 h-3 text-black" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-500">
                        Assigned: <span className="text-gray-900">{job.assignedTo.name}</span>
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {['ACCEPTED', 'CONFIRMED'].includes(job.status?.toUpperCase()) && !job.assignedTo && (
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignToSelf(job.id);
                        }}
                        className="flex-1 py-3 rounded-2xl bg-white border border-black text-black text-[11px] font-black hover:bg-gray-50 transition-colors"
                      >
                        DO IT MYSELF
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vendor/booking/${job.id}/assign-worker`);
                        }}
                        className="flex-1 py-3 rounded-2xl bg-black text-white text-[11px] font-black shadow-lg shadow-gray-200"
                      >
                        ASSIGN WORKER
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      <BottomNav />
    </div>
  );
});

export default ActiveJobs;

