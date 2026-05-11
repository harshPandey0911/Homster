import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiEdit2, FiMapPin, FiBriefcase, FiStar, FiSettings, FiChevronRight, FiLogOut, FiPlus } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import { vendorAuthService } from '../../../../services/authService';
import BottomNav from '../../components/layout/BottomNav';
import LogoLoader from '../../../../components/common/LogoLoader';

const Profile = () => {
  const navigate = useNavigate();

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const menuItems = [
    { id: 2, label: 'Wallet', icon: FaWallet, path: '/vendor/wallet' },
    { id: 5, label: 'My Ratings', icon: FiStar, path: '/vendor/my-ratings' },
    { id: 10, label: 'My Services', icon: FiBriefcase, path: '/vendor/my-services' },
    { id: 11, label: 'Add Custom Offering', icon: FiPlus, path: '/vendor/add-custom-content', highlight: true },
    { id: 7, label: 'Manage Address', icon: FiMapPin, path: '/vendor/address-management' },
    { id: 8, label: 'Settings', icon: FiSettings, path: '/vendor/settings' },
    { id: 9, label: 'About Nexora', icon: null, customIcon: 'S', path: '/vendor/about-cleaning-expert' },
  ];

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchProfile = async () => {
      // Try to load from local storage first for immediate display
      const storedVendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
      if (storedVendorData && Object.keys(storedVendorData).length > 0) {
        setProfile({
          name: storedVendorData.name || 'Vendor Name',
          businessName: storedVendorData.businessName || null,
          phone: storedVendorData.phone || '',
          email: storedVendorData.email || '',
          address: storedVendorData.address ?
            (typeof storedVendorData.address === 'string' ? storedVendorData.address :
              `${storedVendorData.address.addressLine1 || ''} ${storedVendorData.address.addressLine2 || ''} ${storedVendorData.address.city || ''} ${storedVendorData.address.state || ''} ${storedVendorData.address.pincode || ''}`.trim() || 'Not set')
            : 'Not set',
          rating: storedVendorData.rating || 0,
          totalJobs: storedVendorData.totalJobs || 0,
          completionRate: storedVendorData.completionRate || 0,
          serviceCategory: storedVendorData.service || '',
          skills: [],
          photo: storedVendorData.profilePhoto || null,
          approvalStatus: storedVendorData.approvalStatus,
          isPhoneVerified: storedVendorData.isPhoneVerified || false,
          isEmailVerified: storedVendorData.isEmailVerified || false
        });
        setIsLoading(false); // Show content immediately
      }

      setError(null);
      try {
        const response = await vendorAuthService.getProfile();
        if (response.success) {
          const vendorData = response.vendor;
          // Format address
          const addressString = vendorData.address
            ? (typeof vendorData.address === 'string' ? vendorData.address :
              `${vendorData.address.addressLine1 || ''} ${vendorData.address.addressLine2 || ''} ${vendorData.address.city || ''} ${vendorData.address.state || ''} ${vendorData.address.pincode || ''}`.trim() || 'Not set')
            : 'Not set';

          setProfile({
            name: vendorData.name || 'Vendor Name',
            businessName: vendorData.businessName || null,
            phone: vendorData.phone || '',
            email: vendorData.email || '',
            address: addressString,
            rating: vendorData.rating || 0,
            totalJobs: vendorData.totalJobs || 0,
            completionRate: vendorData.completionRate || 0,
            serviceCategory: vendorData.service || '',
            skills: [],
            photo: vendorData.profilePhoto || null,
            approvalStatus: vendorData.approvalStatus,
            isPhoneVerified: vendorData.isPhoneVerified || false,
            isEmailVerified: vendorData.isEmailVerified || false
          });
          localStorage.setItem('vendorData', JSON.stringify(vendorData));
        } else {
          // If API fails but we have local data, stick with it?
          if (!storedVendorData || Object.keys(storedVendorData).length === 0) {
            setError(response.message || 'Failed to fetch profile');
            toast.error(response.message || 'Failed to fetch profile');
          }
        }
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
        if (!storedVendorData || Object.keys(storedVendorData).length === 0) {
          setError(err.response?.data?.message || 'Failed to fetch profile');
          toast.error(err.response?.data?.message || 'Failed to fetch profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    window.addEventListener('vendorDataUpdated', fetchProfile);
    window.addEventListener('vendorProfileUpdated', fetchProfile);

    return () => {
      window.removeEventListener('vendorDataUpdated', fetchProfile);
      window.removeEventListener('vendorProfileUpdated', fetchProfile);
    };
  }, []);

  if (isLoading) {
    return <LogoLoader />;
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: themeColors.backgroundGradient }}>
        <div className="text-center p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error loading profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:opacity-90"
            style={{ backgroundColor: themeColors.button }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#FFFFFF' }}>
      <header className="px-6 py-5 flex items-center justify-between bg-transparent">
        <h1 className="text-xl font-black text-gray-900">My Profile</h1>
        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
          <FiSettings className="w-5 h-5 text-black" />
        </div>
      </header>

      <main className="px-5">
        {/* Profile Header Card (Teal Gradient) */}
        <div 
          className="rounded-[32px] p-6 shadow-xl shadow-gray-200/20 mb-8 relative overflow-hidden"
          style={{ background: themeColors.accentGradient }}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />

          <div className="relative z-10 flex items-center gap-5">
            {/* Profile Image */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-[24px] bg-white/20 border-2 border-white/30 overflow-hidden backdrop-blur-md flex items-center justify-center">
                {profile.photo ? (
                  <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-10 h-10 text-white/40" />
                )}
              </div>
              <button 
                onClick={() => navigate('/vendor/profile/details')}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100"
              >
                <FiEdit2 className="w-3.5 h-3.5 text-black" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white truncate mb-0.5">{profile.name}</h2>
              <p className="text-xs font-bold text-white/60 mb-3 truncate">{profile.businessName || 'PlugPro Partner'}</p>
              
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1.5 bg-white/10 rounded-xl backdrop-blur-md flex items-center gap-1.5">
                  <FiStar className="w-3 h-3 text-white fill-white" />
                  <span className="text-[10px] font-black text-white">{profile.rating.toFixed(1)}</span>
                </div>
                <div className="px-2.5 py-1.5 bg-white/10 rounded-xl backdrop-blur-md flex items-center gap-1.5">
                  <FiBriefcase className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-black text-white">{profile.totalJobs} Jobs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary Grid (Black theme) */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Wallet', icon: FaWallet, path: '/vendor/wallet' },
            { label: 'Jobs', icon: FiBriefcase, path: '/vendor/jobs' },
            { label: 'Workers', icon: FiUsers, path: '/vendor/workers' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center active:scale-95 transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-black transition-all">
                <item.icon className="w-5 h-5 text-black group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Menu (Minimalist Black) */}
        <div className="space-y-4 mb-8">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Management</h3>
          
          {menuItems.map((item) => {
            const IconComponent = item.icon || FiSettings;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between p-4 rounded-[28px] border transition-all active:scale-[0.98] ${
                  item.highlight 
                  ? 'bg-black border-black shadow-lg shadow-gray-200 text-white' 
                  : 'bg-white border-gray-100 text-gray-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.highlight ? 'bg-white/10' : 'bg-gray-50'
                  }`}>
                    {item.customIcon ? (
                      <span className={`text-sm font-black ${item.highlight ? 'text-white' : 'text-black'}`}>{item.customIcon}</span>
                    ) : (
                      <IconComponent className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-black'}`} />
                    )}
                  </div>
                  <span className="text-sm font-black tracking-tight">{item.label}</span>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.highlight ? 'bg-white/10' : 'bg-gray-50'
                }`}>
                  <FiChevronRight className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-gray-300'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Danger Zone */}
        <div className="mb-10">
          <button
            onClick={async () => {
              try {
                await vendorAuthService.logout();
                toast.success('Logged out');
                navigate('/vendor/login');
              } catch (e) {
                localStorage.clear();
                navigate('/vendor/login');
              }
            }}
            className="w-full py-5 rounded-[28px] bg-red-50 border border-red-100 text-red-500 text-sm font-black flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            LOGOUT ACCOUNT
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;


