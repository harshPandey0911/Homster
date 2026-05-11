import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'react-icons/fi';

const HowItWorks = ({ data }) => {
  if (!data || !data.items || data.items.length === 0) return null;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 px-5 bg-white overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black text-gray-900 mb-4"
          >
            {data.title || 'How It Works'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-medium max-w-2xl mx-auto"
          >
            {data.subtitle || 'Simple steps to get your services done'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 -z-0" />

          {data.items.map((item, index) => {
            const Icon = Icons[item.icon] || Icons.FiCheckCircle;
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl shadow-blue-100 flex items-center justify-center mb-8 border border-gray-50 group-hover:scale-110 transition-transform duration-500">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Icon className="w-8 h-8" />
                  </div>
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed px-4">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
