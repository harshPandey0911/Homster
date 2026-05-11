import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { vendorTheme as themeColors } from '../../../../theme';
import Logo from '../../../../components/common/Logo';
import api from '../../../../services/api';

const Header = memo(({
  title,
  onBack,
  showBack = true,
  showSearch = false,
  showNotifications = true,
  notificationCount = 0
}) => {
  const navigate = useNavigate();
  const [count, setCount] = useState(notificationCount);

  // Sync prop changes
  useEffect(() => {
    if (typeof notificationCount !== 'undefined') {
      setCount(notificationCount);
    }
  }, [notificationCount]);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/vendor');
        if (res.data.success && typeof res.data.unreadCount === 'number') {
          setCount(res.data.unreadCount);
        }
      } catch (error) {
        // Silent fail
      }
    };

    if (showNotifications) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [showNotifications]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleNotifications = () => {
    navigate('/vendor/notifications');
  };

  const handleLogoClick = () => {
    navigate('/vendor/dashboard');
  };

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md"
      style={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <motion.button
              onClick={handleBack}
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-black shadow-sm"
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowLeft className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.div
              className="cursor-pointer"
              onClick={handleLogoClick}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Logo className="h-10 w-auto" />
            </motion.div>
          )}
          {showBack && <h1 className="text-lg font-black text-gray-900 tracking-tight">{title || 'Vendor'}</h1>}
        </div>

        {/* Right: Search and Notifications */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-black shadow-sm active:scale-95 transition-all"
              onClick={() => navigate('/vendor/jobs')}
            >
              <FiSearch className="w-5 h-5" />
            </button>
          )}
          {showNotifications && (
            <motion.div
              className="relative"
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={handleNotifications}
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-black shadow-sm"
              >
                <FiBell className="w-5 h-5" />
              </button>
              
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center z-20 min-w-[18px] h-[18px] px-1 border-2 border-white shadow-sm"
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'VendorHeader';
export default Header;
