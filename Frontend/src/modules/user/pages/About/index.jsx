import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { publicCatalogService } from '../../../../services/catalogService';
import AboutUs from '../Home/components/AboutUs';
import LogoLoader from '../../../../components/common/LogoLoader';

const AboutPage = () => {
  const [homeContent, setHomeContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const cityId = localStorage.getItem('currentCityId');
        const response = await publicCatalogService.getHomeData(cityId);
        if (response.success && response.homeContent) {
          setHomeContent(response.homeContent);
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) return <LogoLoader />;

  return (
    <div className="min-h-screen bg-white">
      <Header 
        siteIdentity={homeContent?.siteIdentity} 
        homeContent={homeContent}
      />
      
      <main className="pt-10 pb-24">
        {homeContent?.aboutUs ? (
          <AboutUs data={homeContent.aboutUs} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">About Us</h2>
            <p className="text-gray-500">Content coming soon...</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default AboutPage;
