import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiArrowRight } from 'react-icons/hi';
import { FiCheckCircle, FiClock, FiTruck, FiBox } from 'react-icons/fi';
import { themeColors, getColorWithOpacity } from '../../../../../theme';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroBanner = ({ banners = [], onSearchClick, heroData }) => {
  const title = heroData?.title || 'Everything You Need, Delivered to You.';
  const subtitle = heroData?.subtitle || 'One super app for all your daily needs. Fast, reliable & secure delivery at your doorstep.';
  const primaryBtnText = heroData?.primaryBtnText || 'Get Started';
  const secondaryBtnText = heroData?.secondaryBtnText || 'Explore Services';
  const heroImage = heroData?.imageUrl || '/hero-illustration.png';

  return (
    <div className="relative w-full overflow-hidden bg-[#F0F9FF]">
      {/* Decorative Circles */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-teal-50/50 rounded-full blur-3xl -z-0" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left items-center lg:items-start"
          >
            <div className="space-y-3 sm:space-y-4">
              <h1 
                className="text-3xl sm:text-5xl md:text-7xl font-[1000] text-gray-900 leading-[1.1] tracking-tight" 
                dangerouslySetInnerHTML={{ __html: title }}
              />
              <p className="text-xs sm:text-lg text-gray-500 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-2 sm:mt-4 w-full">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSearchClick}
                className="w-full sm:w-auto px-10 py-4 bg-white text-gray-900 border border-gray-100 rounded-[22px] font-black shadow-xl shadow-blue-500/5 flex items-center justify-center gap-2"
              >
                {secondaryBtnText}
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 mt-6 sm:mt-8">
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                  <FiCheckCircle className="w-3 h-3" />
                </div>
                Secure Payments
              </div>
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                  <FiClock className="w-3 h-3" />
                </div>
                24/7 Support
              </div>
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                  <FiTruck className="w-3 h-3" />
                </div>
                Fast Delivery
              </div>
            </div>
          </motion.div>

          {/* Right Content - Illustration (Now visible on mobile) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end relative order-first lg:order-last mb-8 lg:mb-0"
          >
            <div className="relative w-full max-w-[280px] sm:max-w-[450px] lg:max-w-[600px]">
              <img 
                src={heroImage} 
                alt="Delivery Illustration" 
                className="w-full h-auto"
                style={{
                  maskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                  filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.08))'
                }}
              />
              {/* Floating elements - simplified for mobile */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -left-4 sm:top-10 sm:left-0 bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border border-gray-50 flex items-center gap-2 sm:gap-3"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center text-orange-500">
                  <FiBox className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[7px] sm:text-[10px] font-black text-gray-400 uppercase tracking-tight">Delivered</div>
                  <div className="text-[9px] sm:text-[12px] font-black text-gray-900 leading-none">Successful!</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Reduced spacing indicator */}
      <div className="h-2 w-full" />
    </div>
  );
};

export default HeroBanner;

