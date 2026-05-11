import React, { useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiLocationMarker, HiOutlineSearch, HiOutlineShoppingCart, HiOutlineUser } from 'react-icons/hi';
import { gsap } from 'gsap';
import LocationSelector from '../common/LocationSelector';
import { animateLogo } from '../../../../utils/gsapAnimations';
import Logo from '../../../../components/common/Logo';
import { themeColors, getColorWithOpacity } from '../../../../theme';
import { useCart } from '../../../../context/CartContext';
import { useAuth } from '../../../../context/AuthContext';
import { motion } from 'framer-motion';

const Header = ({ location: address, onLocationClick, navLinks: dynamicNavLinks, siteIdentity, homeContent }) => {
  const logoRef = useRef(null);
  const routerLocation = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const brandName = siteIdentity?.brandName || 'NEXORA GO';
  const slogan = siteIdentity?.slogan || 'Everything you need, one place';

  useEffect(() => {
    if (logoRef.current) {
      animateLogo(logoRef.current);
    }
  }, []);

  const navLinks = useMemo(() => {
    let links = (dynamicNavLinks && dynamicNavLinks.length > 0)
      ? dynamicNavLinks.map(link => ({ name: link.label, path: link.path }))
      : [];

    // Automatically add active sections if not already present
    if (homeContent?.isAboutUsVisible !== false && homeContent?.aboutUs && !links.some(l => l.path.includes('about'))) {
      links.push({ name: 'About Us', path: '/user/about' });
    }
    if (homeContent?.isHowItWorksVisible !== false && homeContent?.howItWorks?.items?.length > 0 && !links.some(l => l.path.includes('how-it-works'))) {
      links.push({ name: 'How It Works', path: '/user#how-it-works' });
    }
    if (homeContent?.isOffersVisible !== false && homeContent?.offers?.items?.length > 0 && !links.some(l => l.path.includes('offers'))) {
      links.push({ name: 'Offers', path: '/user#offers' });
    }
    if (homeContent?.isCategoriesVisible !== false && !links.some(l => l.path.includes('services'))) {
      links.push({ name: 'Services', path: '/user/services' });
    }
    if (homeContent?.isContactUsVisible !== false && homeContent?.contactUs && !links.some(l => l.path.includes('contact'))) {
      links.push({ name: 'Contact', path: '/user/contact' });
    }

    return links;
  }, [dynamicNavLinks, homeContent]);

  const isActive = (path) => {
    if (path === '/user') return routerLocation.pathname === '/user';
    return routerLocation.pathname.startsWith(path);
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      {/* Top Blue Bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: themeColors.primary }}></div>

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo & Brand Name */}
          <Link to="/user" className="flex items-center gap-3 shrink-0 group">
            <div ref={logoRef} className="relative">
              <Logo className="h-10 w-10 sm:h-12 sm:w-12" />
              <div className="absolute inset-0 bg-brand/10 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tighter leading-none" style={{ color: themeColors.primary }}>
                {brandName}
              </span>
              <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] text-gray-400 mt-0.5">
                {slogan}
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className="relative py-2 text-[15px] font-bold transition-colors duration-200"
                style={{ color: isActive(link.path) ? themeColors.primary : '#4B5563' }}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: themeColors.primary }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Actions (Search, Cart, Account, Location) */}
          <div className="flex items-center gap-1 sm:gap-5">
            {/* Location (Subtle integration) */}
            <div 
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-black/[0.03]"
              onClick={onLocationClick}
            >
              <HiLocationMarker className="w-4 h-4 text-gray-400" />
              <span className="text-[11px] font-bold text-gray-600 truncate max-w-[100px]">
                {address && address !== '...' ? address.split(',')[0] : 'Location'}
              </span>
            </div>

            {/* Icons Group */}
            <div className="flex items-center gap-0.5 sm:gap-3">
              <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                <HiOutlineSearch className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <Link to="/user/cart" className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                <HiOutlineShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartCount > 0 && (
                  <span 
                    className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] flex items-center justify-center text-[8px] sm:text-[10px] font-black text-white rounded-full shadow-sm ring-2 ring-white"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Language Selector */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl cursor-pointer border border-black/[0.03]">
              <div className="w-5 h-5 flex items-center justify-center text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-gray-600">English</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Profile / Account Link */}
            <Link to="/user/account" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-black/[0.03]">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-all duration-300 shadow-sm overflow-hidden border border-black/[0.03]">
                {user?.photo ? (
                  <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <HiOutlineUser className="w-5 h-5" />
                )}
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Account</span>
                <span className="text-[13px] font-black text-gray-900">
                  {user ? (user.name ? user.name.split(' ')[0] : 'Profile') : 'Sign In'}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

