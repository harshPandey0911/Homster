import React from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiSearch, FiMapPin } from 'react-icons/fi';

const OrderTrackingBar = () => {
  return (
    <div className="relative z-30 -mt-10 px-5 max-w-screen-xl mx-auto w-full">
      <div className="bg-white rounded-[32px] p-4 lg:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-8">
        
        {/* Track Your Order */}
        <div className="flex-1 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <FiPackage className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-black text-gray-900 leading-tight">Track Your Order</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Real-time updates of your order</div>
          </div>
          <div className="relative flex-1 max-w-[200px] hidden sm:block">
            <input 
              type="text" 
              placeholder="Enter Order ID" 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:brightness-110 active:scale-95 transition-all">
            Track Now
          </button>
        </div>

        {/* Deliver To */}
        <div className="flex-1 flex items-center gap-4 lg:pl-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-black text-gray-900 leading-tight">Deliver to</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tight truncate max-w-[150px]">
              Lucknow, Uttar Pradesh
            </div>
          </div>
          <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
            Change
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderTrackingBar;
