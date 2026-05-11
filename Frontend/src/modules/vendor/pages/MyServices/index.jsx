import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiStar, FiChevronRight, FiInfo, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { vendorTheme as themeColors } from '../../../../theme';
import BottomNav from '../../components/layout/BottomNav';
import vendorService from '../../services/vendorService';

const MyServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const res = await vendorService.getMyServices();
        if (res.success) {
          setServices(res.data || []);
        }
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
  return (
    <div className="min-h-screen pb-24" style={{ background: '#FFFFFF' }}>
      <header className="px-6 py-5 flex items-center justify-between bg-transparent">
        <h1 className="text-xl font-black text-gray-900">My Services</h1>
        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
          <FiBriefcase className="w-5 h-5 text-black" />
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Stats Header (Black Theme) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Expertise</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900">{services.length}</span>
              <span className="text-[10px] font-bold text-black bg-gray-50 px-2 py-0.5 rounded-full">Categories</span>
            </div>
          </div>
          <div className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Overall Rating</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900">
                {services.length > 0 
                  ? (services.reduce((acc, s) => acc + s.stats.rating, 0) / services.length).toFixed(1) 
                  : '0.0'}
              </span>
              <FiStar className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Section Title (Black Theme) */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Authorized Portfolios</h2>
          </div>
          <button 
            onClick={() => navigate('/vendor/add-custom-content')}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-200 active:scale-95 transition-all"
          >
            <FiPlus className="w-3 h-3" />
            Add New
          </button>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: `#000000 transparent #000000 #000000` }}></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Portfolio...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
              <FiBriefcase className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">No Services Yet</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Contact admin to get assigned categories</p>
          </div>
        ) : (
          <div className="space-y-5">
            {services.map((service, index) => (
              <motion.div
                key={service.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-[32px] p-1 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500"
              >
                <div className="flex p-4 gap-4">
                  {/* Service Image/Icon */}
                  <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden shrink-0 shadow-inner">
                    <img 
                      src={service.imageUrl || service.iconUrl || 'https://via.placeholder.com/150'} 
                      alt={service.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <span className="text-[8px] font-black uppercase tracking-tighter text-white bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                        {service.status}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-gray-900 truncate tracking-tight">{service.title}</h3>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
                          <span className="text-[10px] font-black text-amber-600">{service.stats.rating}</span>
                          <FiStar className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-relaxed font-medium">
                        {service.description || `High-quality ${service.title} services for your professional needs.`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Jobs</span>
                          <span className="text-xs font-black text-gray-800">{service.stats.totalJobs}</span>
                        </div>
                        <div className="w-[1px] h-6 bg-gray-100 mt-1" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Done</span>
                          <span className="text-xs font-black text-black">{service.stats.completedJobs}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/vendor/jobs?category=${service.title}`)}
                        className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 shadow-sm active:scale-90"
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Card (Black/Gray Theme) */}
        <div className="mt-10 p-6 bg-gray-50 rounded-[28px] border border-gray-100">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <FiInfo className="w-5 h-5 text-black" />
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900">Need more categories?</h4>
              <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed">
                Your service portfolio is managed by the administrator. To add new skills or service categories, please raise a support ticket.
              </p>
              <button 
                onClick={() => navigate('/vendor/support')}
                className="mt-3 text-[10px] font-black uppercase tracking-widest text-black underline"
              >
                Open Support Ticket
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default MyServices;
