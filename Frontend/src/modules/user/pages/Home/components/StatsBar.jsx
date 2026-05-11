import { FiUsers, FiShoppingBag, FiTruck, FiActivity } from 'react-icons/fi';

const StatsBar = ({ statsData }) => {
  const iconMap = {
    FiUsers: FiUsers,
    FiShoppingBag: FiShoppingBag,
    FiTruck: FiTruck,
    FiActivity: FiActivity
  };

  const defaultStats = [
    { icon: FiUsers, label: 'Happy Customers', value: '10K+' },
    { icon: FiShoppingBag, label: 'Orders Delivered', value: '25K+' },
    { icon: FiTruck, label: 'Service Partners', value: '500+' },
    { icon: FiActivity, label: 'On-Time Delivery', value: '99%' },
  ];

  const stats = (statsData && statsData.length > 0) 
    ? statsData.map(s => ({
        label: s.label,
        value: s.value,
        icon: iconMap[s.icon] || FiActivity
      }))
    : defaultStats;

  return (
    <div className="px-5 max-w-screen-xl mx-auto w-full mt-12 mb-12">
      <div className="bg-blue-600 rounded-[32px] p-8 lg:p-12 shadow-2xl shadow-blue-200 flex flex-wrap lg:flex-nowrap justify-between gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 flex-1">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10">
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-[1000] text-white leading-tight">
                {stat.value}
              </div>
              <div className="text-[11px] font-bold text-blue-100 uppercase tracking-widest mt-1">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;
