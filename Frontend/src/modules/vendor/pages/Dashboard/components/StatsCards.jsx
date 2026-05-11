import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiBriefcase, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { vendorTheme as themeColors } from '../../../../../theme';

const StatsCards = memo(({ stats }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Today's Earnings",
      value: `₹${stats.todayEarnings.toLocaleString()}`,
      icon: FaWallet,
      gradient: 'linear-gradient(135deg, #001947 0%, #003b77 100%)',
      onClick: () => navigate('/vendor/earnings')
    },
    {
      title: 'Pending Alerts',
      value: stats.pendingAlerts,
      icon: FiClock,
      gradient: 'linear-gradient(135deg, #406788 0%, #304a63 100%)',
      onClick: () => navigate('/vendor/booking-alerts')
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: FiBriefcase,
      gradient: 'linear-gradient(135deg, #406788 0%, #304a63 100%)',
      onClick: () => navigate('/vendor/jobs')
    },
    {
      title: 'My Services',
      value: stats.totalCategories || 0,
      icon: FiBriefcase,
      gradient: 'linear-gradient(135deg, #001947 0%, #003b77 100%)',
      onClick: () => navigate('/vendor/my-services')
    }
  ];

  return (
    <div className="px-5 relative z-10">
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, index) => {
          const IconComponent = card.icon;

          return (
            <motion.div
              key={index}
              whileTap={{ scale: 0.98 }}
              onClick={card.onClick}
              className="bg-white/60 backdrop-blur-md rounded-[28px] p-5 shadow-sm border border-white/40 cursor-pointer hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 group flex flex-col justify-between h-full"
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-teal-50 text-teal-600 group-hover:scale-110"
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-[1000] text-gray-900 tracking-tight">
                  {card.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

StatsCards.displayName = 'VendorStatsCards';

export default StatsCards;
