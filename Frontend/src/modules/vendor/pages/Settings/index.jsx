import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiVolume2, FiGlobe, FiInfo, FiLogOut, FiTrash2, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import { vendorAuthService } from '../../../../services/authService';
import { registerFCMToken, removeFCMToken } from '../../../../services/pushNotificationService';
import BottomNav from '../../components/layout/BottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    language: 'en',
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

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = JSON.parse(localStorage.getItem('vendorSettings') || '{}');
        if (Object.keys(savedSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...savedSettings }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('vendorSettings', JSON.stringify(updated));

    // Handle FCM Token registration/removal if notifications toggled
    if (key === 'notifications') {
      if (updated.notifications) {
        // Turning ON
        try {
          await registerFCMToken('vendor', true);
          toast.success('Notifications enabled');
        } catch (error) {
          console.error('Error enabling notifications:', error);
          toast.error('Failed to enable notifications');
          // Revert toggle if failed? For now, we keep UI in sync with intent.
        }
      } else {
        // Turning OFF
        try {
          await removeFCMToken('vendor');
          toast.success('Notifications disabled');
        } catch (error) {
          console.error('Error disabling notifications:', error);
        }
      }
    }
  };

  const handleLanguageChange = (lang) => {
    const updated = { ...settings, language: lang };
    setSettings(updated);
    localStorage.setItem('vendorSettings', JSON.stringify(updated));
  };

  const handleLogout = async () => {
    try {
      await vendorAuthService.logout();
      toast.success('Logged out successfully');
      navigate('/vendor/login');
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('vendorAccessToken');
      localStorage.removeItem('vendorRefreshToken');
      localStorage.removeItem('vendorData');
      toast.success('Logged out successfully');
      navigate('/vendor/login');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Clear all vendor data
      localStorage.removeItem('vendorProfile');
      localStorage.removeItem('vendorSettings');
      localStorage.removeItem('vendorWorkers');
      localStorage.removeItem('vendorAcceptedBookings');
      localStorage.removeItem('vendorWallet');
      localStorage.removeItem('vendorTransactions');
      // Navigate to home
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: '#FFFFFF' }}>
      <header className="px-6 py-5 flex items-center justify-between bg-transparent">
        <h1 className="text-xl font-black text-gray-900">Settings</h1>
        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
          <FiBell className="w-5 h-5 text-black" />
        </div>
      </header>

      <main className="px-5">
        {/* Notification Settings (Black Theme) */}
        <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-5">Notifications</h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                  <FiBell className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900">Push Notifications</p>
                  <p className="text-[10px] font-bold text-gray-400">Receive booking alerts</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-black' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.notifications ? 'translate-x-6' : ''}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                  <FiVolume2 className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900">Sound Alerts</p>
                  <p className="text-[10px] font-bold text-gray-400">Play sound for new bookings</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('soundAlerts')}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.soundAlerts ? 'bg-black' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.soundAlerts ? 'translate-x-6' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={() => navigate('/vendor/address-management')}
            className="w-full bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                <FiMapPin className="w-5 h-5 text-black" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm text-gray-900">Manage Address</p>
                <p className="text-[10px] font-bold text-gray-400">Set your business location</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <button
            onClick={() => navigate('/vendor/support')}
            className="w-full bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-black">
                <FiInfo className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm text-gray-900">Helpdesk & Support</p>
                <p className="text-[10px] font-bold text-gray-400">Raise a ticket or view status</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
              <FiGlobe className="w-5 h-5 text-black" />
            </div>
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">Language</h3>
          </div>

          <div className="space-y-2">
            {[
              { code: 'en', name: 'English' },
              { code: 'hi', name: 'हिंदी' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full py-3 px-4 rounded-2xl text-left font-black text-sm transition-all ${
                  settings.language === lang.code
                    ? 'bg-black text-white shadow-lg shadow-gray-200'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-5 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
              <FiInfo className="w-5 h-5 text-black" />
            </div>
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">About</h3>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-14">Version 1.0.0 · Vendor App</p>
        </div>

        <div className="space-y-4 mb-10">
          <button
            onClick={handleLogout}
            className="w-full py-5 rounded-[28px] bg-black text-white font-black text-sm shadow-lg shadow-gray-400 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            LOGOUT
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full py-5 rounded-[28px] bg-red-50 border border-red-100 text-red-500 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FiTrash2 className="w-5 h-5" />
            DELETE ACCOUNT
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;

