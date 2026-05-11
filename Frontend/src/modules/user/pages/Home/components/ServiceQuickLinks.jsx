import React from 'react';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { 
  FiZap, 
  FiDroplet, 
  FiTool, 
  FiWind, 
  FiShield, 
  FiScissors, 
  FiCoffee, 
  FiTruck, 
  FiLayout, 
  FiHome,
  FiBox
} from 'react-icons/fi';
import Logo from '../../../../../components/common/Logo';

const ServiceQuickLinks = ({ categories = [], onCategoryClick }) => {
  // Mapping of category slugs/titles to icons
  const getCategoryIcon = (category) => {
    const title = category.title?.toLowerCase() || '';
    const slug = category.slug?.toLowerCase() || '';
    
    if (title.includes('electric') || slug.includes('electric')) return <FiZap />;
    if (title.includes('plumb') || slug.includes('plumb') || title.includes('water')) return <FiDroplet />;
    if (title.includes('clean') || slug.includes('clean')) return <FiBox />; // Box as placeholder for cleaning stuff
    if (title.includes('repair') || title.includes('fix') || slug.includes('fix')) return <FiTool />;
    if (title.includes('ac') || title.includes('air') || slug.includes('ac')) return <FiWind />;
    if (title.includes('security') || title.includes('guard')) return <FiShield />;
    if (title.includes('salon') || title.includes('beauty')) return <FiScissors />;
    if (title.includes('cook') || title.includes('food')) return <FiCoffee />;
    if (title.includes('shift') || title.includes('pack')) return <FiTruck />;
    
    return <FiLayout />; // Default
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="w-full px-5 relative z-20 mt-8 mb-8">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-[20px] font-black text-gray-900 tracking-tight">
          Our Services
        </h2>
        {categories.length > 8 && (
          <button
            onClick={() => onCategoryClick?.(categories[0])}
            className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            More
          </button>
        )}
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5">
        <div className="flex items-stretch gap-4 min-w-max">
          {(categories || []).map((category, index) => {
            return (
              <motion.div
                key={category.id || index}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategoryClick?.(category)}
                className="flex flex-col items-center bg-white rounded-[20px] sm:rounded-[24px] p-3 sm:p-5 w-[100px] sm:w-[140px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-50 cursor-pointer hover:shadow-[0_15px_35px_rgba(37,99,235,0.08)] transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 flex items-center justify-center bg-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-3">
                  {category.icon ? (
                    <img 
                      src={category.icon} 
                      alt={category.title} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-2xl sm:text-3xl text-blue-600">
                      {getCategoryIcon(category)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center text-center gap-0.5 sm:gap-1">
                  <span className="text-[11px] sm:text-[13px] font-[1000] text-gray-900 leading-tight truncate w-full px-1">
                    {category.title}
                  </span>
                  <span className="hidden sm:block text-[10px] font-medium text-gray-400 leading-tight line-clamp-2">
                    {category.description || 'Service at your doorstep'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceQuickLinks;
