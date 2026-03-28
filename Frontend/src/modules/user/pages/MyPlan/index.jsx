import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiStar, FiCheckCircle, FiShield, FiZap } from 'react-icons/fi';
import { getPlans } from '../../services/planService';
import { userAuthService } from '../../../../services/authService';
import { toast } from 'react-hot-toast';

const MyPlan = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to determine card styling based on plan name
  const getCardStyle = (name) => {
    const lower = name.toLowerCase();

    if (lower.includes('platinum')) {
      return {
        container: 'bg-slate-900 border-slate-700 text-white',
        badge: 'bg-emerald-500 text-white',
        includes: 'text-slate-400',
        check: 'text-emerald-400',
        price: 'text-white',
        button: 'bg-white text-slate-900 hover:bg-slate-100'
      };
    }
    if (lower.includes('diamond')) {
      return {
        container: 'bg-indigo-50 border-indigo-100 text-indigo-900',
        badge: 'bg-emerald-500 text-white',
        includes: 'text-indigo-600',
        check: 'text-indigo-500',
        price: 'text-indigo-900',
        button: 'bg-indigo-600 text-white hover:bg-indigo-700'
      }
    }
    if (lower.includes('gold')) {
      return {
        container: 'bg-[#FEF9C3] border-yellow-200 text-[#854D0E]',
        badge: 'bg-[#22C55E] text-white',
        includes: 'text-[#854D0E] opacity-70',
        check: 'text-[#854D0E]',
        price: 'text-[#854D0E]',
        button: 'bg-[#854D0E] text-white hover:bg-amber-900'
      };
    }
    if (lower.includes('silver')) {
      return {
        container: 'bg-[#F1F5F9] border-slate-200 text-slate-800',
        badge: 'bg-[#22C55E] text-white',
        includes: 'text-slate-500',
        check: 'text-slate-400',
        price: 'text-slate-900',
        button: 'bg-slate-800 text-white hover:bg-slate-900'
      };
    }

    // Default
    return {
      container: 'bg-white border-gray-200 text-gray-800',
      badge: 'bg-emerald-500 text-white',
      includes: 'text-gray-500',
      check: 'text-primary-500',
      price: 'text-gray-900',
      button: 'bg-primary-600 text-white hover:bg-primary-700'
    };
  };

  const getPreviousPlanNote = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('platinum')) return 'Everything in Diamond & More';
    if (lower.includes('diamond')) return 'Everything in Gold & More';
    if (lower.includes('gold')) return 'Everything in Silver & More';
    return null;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, userRes] = await Promise.all([
        getPlans(),
        userAuthService.getProfile()
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (userRes.success) setUser(userRes.user);

    } catch (error) {
      console.error(error);
      toast.error('Could not load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center gap-3 max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Subscription Plans</h1>
        </div>
      </header>

      <main className="px-4 py-12 max-w-7xl mx-auto">
        <div className="mb-12 bg-white/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white shadow-sm">
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Experience Living, Elevated.</h2>
          <p className="text-slate-500 font-bold text-lg max-w-2xl leading-relaxed">
            Choose a plan that matches your lifestyle. Our premium tiers are <span className="text-primary-600">additive</span>—higher plans seamlessly include every single benefit of the levels below them.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {plans.map((plan) => {
              const style = getCardStyle(plan.name || '');
              const currentPlan = user?.plans;
              const isCurrent = currentPlan?.isActive && currentPlan?.name === plan.name;

              const userPlanPrice = currentPlan?.price || 0;
              const isUpgrade = currentPlan?.isActive && plan.price > userPlanPrice;
              const isDowngradeOrSame = currentPlan?.isActive && plan.price <= userPlanPrice && !isCurrent;
              const isDisabled = isCurrent || isDowngradeOrSame;

              let buttonText = `Select ${plan.name}`;
              if (isCurrent) buttonText = 'Current Plan';
              else if (isUpgrade) buttonText = 'Upgrade';

              return (
                <div
                  key={plan._id}
                  onClick={() => navigate(`/user/my-plan/${plan._id}`)}
                  className={`relative cursor-pointer rounded-3xl border shadow-sm transition-all flex flex-col overflow-hidden ${style.container}`}
                >
                  <div className="p-8 pb-8 flex-1 relative">
                    {/* Top Row: Name and Status */}
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-3xl font-black">{plan.name}</h3>
                      {isCurrent && (
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${style.badge}`}>
                          Active
                        </span>
                      )}
                    </div>

                    {/* Price and Duration */}
                    <div className="flex items-baseline mb-8">
                      <span className={`text-4xl font-black ${style.price}`}>₹{plan.price}</span>
                      <span className="text-sm font-bold opacity-40 ml-2">/ {plan.duration || '60'} Days</span>
                    </div>

                    {/* Benefits Section */}
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.25em] ${style.includes}`}>
                          MEMBERSHIP PERKS
                        </h4>
                        {getPreviousPlanNote(plan.name) && (
                          <p className={`text-[11px] font-black italic opacity-60 flex items-center gap-1.5`}>
                            <FiStar className="w-3 h-3 fill-current" />
                            {getPreviousPlanNote(plan.name)}
                          </p>
                        )}
                      </div>
                      <ul className="space-y-3.5">
                        {(plan.highlights || []).map((feature, idx) => (
                          <li key={`h-${idx}`} className="flex items-start gap-3">
                            <FiCheck className={`w-4 h-4 mt-1 shrink-0 ${style.check}`} />
                            <span className="text-[14px] font-bold opacity-80 leading-snug">{feature}</span>
                          </li>
                        ))}
                        {(plan.freeCategories || []).map((cat, idx) => (
                          <li key={`cat-${idx}`} className="flex items-start gap-3">
                            <FiZap className="w-4 h-4 mt-1 shrink-0 text-amber-500 fill-amber-500" />
                            <span className="text-[14px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Free {cat.title || cat.name}</span>
                          </li>
                        ))}
                        {(plan.freeBrands || []).map((brand, idx) => (
                          <li key={`brand-${idx}`} className="flex items-start gap-3">
                            <FiZap className="w-4 h-4 mt-1 shrink-0 text-amber-500 fill-amber-500" />
                            <span className="text-[14px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Free {brand.title || brand.name}</span>
                          </li>
                        ))}
                        {(plan.freeServices || []).map((svc, idx) => (
                          <li key={`svc-${idx}`} className="flex items-start gap-3">
                            <FiZap className="w-4 h-4 mt-1 shrink-0 text-amber-500 fill-amber-500" />
                            <span className="text-[14px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Free {svc.title || svc.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-8 pb-8 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/my-plan/${plan._id}`);
                      }}
                      className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 transform hover:translate-y-[-2px] ${style.button} ${isDisabled && !isCurrent ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                      {buttonText}
                    </button>
                    {isCurrent && (
                       <p className="text-center text-[10px] font-bold uppercase tracking-widest opacity-30 mt-3">Membership In Good Standing</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {plans.length === 0 && !loading && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-inner">
            <FiStar className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">No subscription plans found at this time.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPlan;
