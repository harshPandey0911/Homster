import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiGift, FiAlertCircle, FiPieChart } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { vendorTheme as themeColors } from '../../../../theme';
import BottomNav from '../../components/layout/BottomNav';
import { getEarningsOverview } from '../../services/earningsService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Earnings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('monthly'); // for chart: daily, weekly, monthly
  const [filter, setFilter] = useState('all'); // for history and breakdown: all, today, week, month
  
  const [earningsData, setEarningsData] = useState({
    totals: { total: 0, today: 0, week: 0, month: 0 },
    breakdown: { totalEarnings: 0, totalDeductions: 0, totalBonuses: 0 },
    chartData: [],
    history: []
  });

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getEarningsOverview({ period, filter });
      if (res.success) {
        setEarningsData(res.data);
      } else {
        setError(res.message || 'Failed to load earnings data');
      }
    } catch (err) {
      console.error('Fetch earnings error:', err);
      setError('An error occurred while fetching earnings data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [period, filter]);

  // Format date for chart X-axis
  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    const parts = tickItem.split('-');
    if (period === 'daily' && parts.length === 3) {
      return `${parts[2]}/${parts[1]}`; // DD/MM
    }
    if (period === 'weekly') {
      return `W${parts[1]}`;
    }
    if (period === 'monthly' && parts.length >= 2) {
      const date = new Date(parts[0], parseInt(parts[1]) - 1, 1);
      return date.toLocaleString('default', { month: 'short' });
    }
    return tickItem;
  };

  if (loading && !earningsData.chartData.length) {
    return <LogoLoader />;
  }

  const { totals, breakdown, chartData, history } = earningsData;

  return (
  return (
    <div className="min-h-screen pb-24" style={{ background: '#FFFFFF' }}>
      <header className="px-6 py-5 flex items-center justify-between bg-transparent">
        <h1 className="text-xl font-black text-gray-900">Earnings</h1>
        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
          <FiTrendingUp className="w-5 h-5 text-black" />
        </div>
      </header>

      <main className="px-5 space-y-6">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Top Totals Grid (Black theme) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gray-50 rounded-lg text-black">
                <FiCalendar className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Today</p>
            </div>
            <p className="text-2xl font-black text-gray-900">₹{totals.today.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gray-50 rounded-lg text-black">
                <FiTrendingUp className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">This Week</p>
            </div>
            <p className="text-2xl font-black text-gray-900">₹{totals.week.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gray-50 rounded-lg text-black">
                <FiPieChart className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">This Month</p>
            </div>
            <p className="text-2xl font-black text-gray-900">₹{totals.month.toLocaleString()}</p>
          </div>

          <div 
            className="rounded-[24px] p-4 shadow-xl shadow-gray-200/20 relative overflow-hidden"
            style={{ background: themeColors.accentGradient }}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <FaWallet className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/80">All Time</p>
            </div>
            <p className="text-2xl font-black text-white">₹{totals.total.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Section (Black Theme) */}
        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Revenue Growth</h3>
            <div className="flex bg-gray-50 rounded-xl p-1">
              {['daily', 'weekly', 'monthly'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                    period === p ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {p.replace('ly', '')}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-48 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                  <XAxis dataKey="date" tickFormatter={formatXAxis} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#000000', fontWeight: 'bold' }}
                    labelStyle={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#000000" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-300 text-sm font-bold">
                 No data available
               </div>
            )}
          </div>
        </div>

        {/* Breakdown Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest px-1">Breakdown</h3>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-xs font-black text-black outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-sm">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Earnings</p>
                  <p className="text-lg font-black text-gray-900">+₹{breakdown.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-sm">
                  <FiGift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Bonuses</p>
                  <p className="text-lg font-black text-gray-900">+₹{breakdown.totalBonuses.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm">
                  <FiAlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Deductions</p>
                  <p className="text-lg font-black text-red-500">-₹{breakdown.totalDeductions.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div>
           <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-black text-gray-900">Recent Activity</h2>
            <button onClick={() => navigate('/vendor/wallet')} className="text-xs font-black text-black">View Wallet</button>
          </div>
          
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
                <p className="text-sm font-bold text-gray-400">No recent activity.</p>
              </div>
            ) : (
              history.slice(0, 5).map((item) => (
                <div key={item.id} className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.isDeduction ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-black'}`}>
                      {item.isDeduction ? <FiTrendingUp className="w-4 h-4 rotate-180" /> : <FiTrendingUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 capitalize">{item.description || item.type.replace('_', ' ')}</p>
                      <p className="text-[10px] font-bold text-gray-400">
                        {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black ${item.isDeduction ? 'text-red-500' : 'text-gray-900'}`}>
                      {item.isDeduction ? '-' : '+'}₹{item.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
};

export default Earnings;
