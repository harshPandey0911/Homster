import React from 'react';
import { motion } from 'framer-motion';

const OffersSection = ({ data }) => {
  if (!data) return null;
  const { title, subtitle, items } = data;

  return (
    <section id="offers" className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{title || 'Exclusive Offers'}</h2>
          <p className="text-gray-600 text-lg">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(items || []).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} className="w-10 h-10 object-contain" alt={item.title} />
                   ) : (
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                     </svg>
                   )}
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                  {item.discount}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Use Code</span>
                <span className="text-sm font-black text-blue-600 uppercase tracking-widest">{item.code || 'N/A'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
