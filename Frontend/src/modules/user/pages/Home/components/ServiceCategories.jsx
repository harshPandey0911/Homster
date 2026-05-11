import React from 'react';
import CategoryCard from '../../../components/common/CategoryCard';
import electricianIcon from '../../../../../assets/images/icons/services/electrician.png';
import womensSalonIcon from '../../../../../assets/images/icons/services/womens-salon-spa-icon.png';
import massageMenIcon from '../../../../../assets/images/icons/services/massage-men-icon.png';
import cleaningIcon from '../../../../../assets/images/icons/services/cleaning-icon.png';
import electricianPlumberIcon from '../../../../../assets/images/icons/services/electrician-plumber-carpenter-icon.png';
import acApplianceRepairIcon from '../../../../../assets/images/icons/services/ac-appliance-repair-icon.png';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const ServiceCategories = React.memo(({ categories, onCategoryClick, onSeeAllClick }) => {


  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  const serviceCategories = categories.map((cat) => ({
    ...cat,
    icon: toAssetUrl(cat.icon || cat.image),
  }));

  return (
    <div className="px-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-black text-gray-900 tracking-tight">
          Service Category
        </h2>
        <button 
          onClick={onSeeAllClick}
          className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
        >
          See All
        </button>
      </div>

      {/* Professional Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {serviceCategories.map((category, index) => {
          const iconSrc = toAssetUrl(category.icon || category.image);
          return (
            <div 
              key={category.id || index} 
              onClick={() => onCategoryClick?.(category)}
              className="flex flex-col items-center bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-50 cursor-pointer hover:shadow-[0_15px_35px_rgba(37,99,235,0.08)] transition-all duration-300 group"
            >
              <div className="w-14 h-14 mb-3 flex items-center justify-center bg-gray-50 rounded-2xl p-2 group-hover:scale-110 transition-transform">
                <img
                  src={iconSrc}
                  alt={category.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-[13px] font-black text-gray-900 leading-tight">
                  {category.title}
                </span>
                <span className="text-[10px] font-medium text-gray-400 leading-tight line-clamp-1">
                  {category.description || 'Professional service'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle Bottom Separator */}
      <div className="mt-10 h-[1px] w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
    </div>
  );
});

ServiceCategories.displayName = 'ServiceCategories';

export default ServiceCategories;

