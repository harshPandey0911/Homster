import React, { useEffect, useState } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiGrid, FiList, FiAward } from "react-icons/fi";
import { ensureIds, loadCatalog } from "./utils";

const UserCategories = () => {
  const [catalog, setCatalog] = useState(() => ensureIds(loadCatalog()));

  useEffect(() => {
    const handler = () => setCatalog(ensureIds(loadCatalog()));
    window.addEventListener("adminUserAppCatalogUpdated", handler);
    return () => window.removeEventListener("adminUserAppCatalogUpdated", handler);
  }, []);

  const tabLinks = [
    { name: "Manage Home UI", path: "home", icon: FiHome },
    { name: "Categories", path: "categories", icon: FiGrid },
    { name: "Services", path: "sections", icon: FiList },
    { name: "Brands", path: "brands", icon: FiAward },
  ];

  const location = useLocation();

  const contextValue = React.useMemo(() => ({ catalog, setCatalog }), [catalog]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between text-white border border-slate-700 gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">User App Configuration</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">Manage all global content and UI sections for your platform</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
        {tabLinks.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end
            className={({ isActive }) => `
              flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 whitespace-nowrap
              ${isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 translate-y-[-1px]" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </NavLink>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-4"
      >
        <Outlet context={contextValue} />
      </motion.div>
    </div>
  );
};

export default UserCategories;
