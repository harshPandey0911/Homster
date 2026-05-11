import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Logo from '../../../../components/common/Logo';
import { configService } from '../../../../services/configService';
import api from '../../../../services/api';

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState(null);
  const [dynamicLinks, setDynamicLinks] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await configService.getSettings();
      if (data?.success) {
        setSettings(data.settings);
      }
    };
    const fetchLinks = async () => {
      try {
        const response = await api.get('/footer-links');
        if (response.data.success) {
          setDynamicLinks(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch footer links:', error);
      }
    };
    fetchSettings();
    fetchLinks();
  }, []);

  // Only show on home page as per user request
  if (location.pathname !== '/user' && location.pathname !== '/user/') {
    return null;
  }

  // Group dynamic links by section
  const groupedLinks = dynamicLinks.reduce((acc, link) => {
    const sec = link.section.toUpperCase();
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push({ label: link.title, path: link.url });
    return acc;
  }, {});

  const footerSections = [
    {
      title: 'Company',
      links: groupedLinks['COMPANY'] || []
    },
    {
      title: 'Quick Links',
      links: groupedLinks['QUICK LINKS'] || []
    },
    {
      title: 'Support & Services',
      links: [
        ...(groupedLinks['USER BOTTOM'] || []),
        {
          label: settings?.supportEmail || settings?.companyEmail || 'support@homestr.in',
          path: `mailto:${settings?.supportEmail || settings?.companyEmail || 'support@homestr.in'}`,
          icon: FiMail
        },
        {
          label: settings?.supportPhone || settings?.companyPhone || '+91 7014641102',
          path: `tel:${(settings?.supportPhone || settings?.companyPhone || '+91 7014641102').replace(/\s/g, '')}`,
          icon: FiPhone
        }
      ]
    }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8 lg:pb-12 mt-20 relative overflow-hidden group">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-teal-500/10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -ml-32 -mb-32 transition-colors group-hover:bg-orange-500/10" />

      <div className="max-w-screen-xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/user" className="inline-block transform hover:scale-105 transition-transform duration-300">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Nexora Go is your one-stop destination for all home services. From electrical repairs to premium salon services, we bring the experts to your doorstep.
            </p>
            <div className="flex items-center gap-4">
              {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#347989] hover:border-[#347989] hover:shadow-lg transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.filter(section => section.links && section.links.length > 0).map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.path.startsWith('http') || link.path.startsWith('mailto') || link.path.startsWith('tel') ? (
                      <a
                        href={link.path}
                        className="text-gray-500 hover:text-[#347989] text-sm flex items-center gap-2 transition-colors duration-200"
                      >
                        {link.icon && <link.icon className="w-4 h-4" />}
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-gray-500 hover:text-[#347989] text-sm flex items-center gap-2 transition-colors duration-200"
                      >
                        {link.icon && <link.icon className="w-4 h-4" />}
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-400 text-sm">
            © {currentYear} {settings?.companyName || 'Nexora Go'}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Privacy</Link>
            <Link to="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Terms</Link>
            <Link to="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
