import React from 'react';
import { FaGooglePlay, FaApple } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AppDownloadBanner = ({ appData }) => {
  const title = appData?.title || 'Download the Nexora GO App';
  const subtitle = appData?.subtitle || 'Better experience, exclusive offers & faster everything. Scan to download or use the stores.';
  const playStoreUrl = appData?.playStoreUrl || '#';
  const appStoreUrl = appData?.appStoreUrl || '#';
  const qrCodeUrl = appData?.qrCodeUrl || '/qr-code.png';
  const imageUrl = appData?.imageUrl || '/app-preview.png';

  return (
    <div className="px-5 max-w-screen-xl mx-auto w-full mt-16 mb-24">
      <div className="bg-gray-50 rounded-[40px] p-8 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 border border-gray-100">
        
        {/* Content */}
        <div className="relative z-10 flex-1 max-w-xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[1000] text-gray-900 leading-tight mb-6">
            {title}
          </h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10">
            {subtitle}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href={playStoreUrl} 
              className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
            >
              <FaGooglePlay className="text-2xl" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold leading-none">Get it on</div>
                <div className="text-[16px] font-black">Google Play</div>
              </div>
            </a>
            <a 
              href={appStoreUrl} 
              className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
            >
              <FaApple className="text-2xl" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold leading-none">Download on the</div>
                <div className="text-[16px] font-black">App Store</div>
              </div>
            </a>
          </div>
        </div>

        {/* Device & QR */}
        <div className="relative flex items-center gap-12">
          <div className="relative w-[280px] drop-shadow-[0_50px_100px_rgba(0,0,0,0.15)] hidden sm:block">
            <img 
              src={imageUrl} 
              alt="App Phone" 
              className="w-full h-auto rounded-[3rem]"
            />
          </div>
          
          <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-[32px] shadow-xl border border-gray-100">
            <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center border-4 border-gray-50">
              {/* QR Code Placeholder */}
              <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
            </div>
            <div className="text-[12px] font-black text-gray-400 uppercase tracking-widest text-center">
              Scan to Download
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -z-0" />
      </div>
    </div>
  );
};

export default AppDownloadBanner;
