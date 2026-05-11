import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = ({ data }) => {
  if (!data) return null;
  const { title, content, imageUrl, features } = data;

  return (
    <section id="about-us" className="py-16 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">{title || 'About Us'}</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">{content}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(features || []).map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{f.title}</h4>
                  <p className="text-sm text-gray-500">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]" />
          ) : (
            <div className="bg-gray-100 rounded-3xl aspect-[4/3] flex items-center justify-center text-gray-400 border border-dashed border-gray-300 font-bold uppercase tracking-widest text-xs">
              Preview Image
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
