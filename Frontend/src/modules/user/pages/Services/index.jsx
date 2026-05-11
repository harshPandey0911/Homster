import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiGrid, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { publicCatalogService } from '../../../../services/catalogService';
import CategoryModal from '../Home/components/CategoryModal';
import { useCart } from '../../../../context/CartContext';
import { useCity } from '../../../../context/CityContext';

const ServicesPage = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { currentCity } = useCity();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const toAssetUrl = (url) => {
    if (!url) return '';
    const clean = url.replace('/api/upload', '/upload');
    if (clean.startsWith('http')) return clean;
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
    return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const cityId = currentCity?._id || currentCity?.id;
        const response = await publicCatalogService.getCategories(cityId);
        if (response.success) {
          setCategories(response.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [currentCity]);

  const filteredCategories = categories.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (category) => {
    setSelectedCategory({
      ...category,
      icon: toAssetUrl(category.icon)
    });
    setIsCategoryModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 pt-10 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold text-sm"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                <FiGrid className="w-4 h-4" />
                <span>Our Catalog</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-[1000] text-gray-900 tracking-tight">
                All Services
              </h1>
              <p className="text-gray-500 font-medium mt-4 text-lg max-w-xl">
                Explore our wide range of professional services delivered right to your doorstep.
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input 
                type="text"
                placeholder="Search for a service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[24px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-700"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-[32px] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            {filteredCategories.map((category) => (
              <motion.div
                key={category.id || category._id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category)}
                className="group relative bg-white p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 border border-gray-100 cursor-pointer transition-all duration-300 flex flex-col items-center text-center"
              >
                {category.hasSaleBadge && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest z-10">
                    {category.badge || 'SALE'}
                  </div>
                )}
                
                <div className="w-16 h-16 mb-5 bg-gray-50 rounded-2xl p-3 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <img 
                    src={toAssetUrl(category.icon)} 
                    alt={category.title} 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <h3 className="text-[14px] font-black text-gray-900 leading-tight mb-2">
                  {category.title}
                </h3>
                
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Book Now <FiArrowRight />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-3xl">
              🔍
            </div>
            <h2 className="text-xl font-bold text-gray-900">No services found</h2>
            <p className="text-gray-500 mt-2">Try searching for something else</p>
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        location={localStorage.getItem('currentAddress') || ''}
        cartCount={cartCount}
        currentCity={currentCity}
      />
    </div>
  );
};

export default ServicesPage;
