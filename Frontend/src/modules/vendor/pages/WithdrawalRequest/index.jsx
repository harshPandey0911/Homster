import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiArrowRight, FiCreditCard, FiAlertCircle, FiCheckCircle, FiEdit2, FiClock, FiPlusCircle, FiActivity } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { requestWithdrawal, getWalletBalance, getWithdrawalHistory } from '../../services/walletService';
import { vendorDashboardService } from '../../services/dashboardService';
import { toast } from 'react-hot-toast';
import LogoLoader from '../../../../components/common/LogoLoader';

const WithdrawalRequest = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ available: 0 });
  const [amount, setAmount] = useState('');
  const [showBankForm, setShowBankForm] = useState(false);
  const [history, setHistory] = useState([]);
  const [bankAccount, setBankAccount] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [isBankSaved, setIsBankSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendorStats, setVendorStats] = useState({
    commissionRate: 15,
    level: 3,
    platformFeeRate: 2
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletRes, historyRes, statsRes] = await Promise.all([
        getWalletBalance(),
        getWithdrawalHistory(),
        vendorDashboardService.getDashboardStats()
      ]);
      setWallet({ available: walletRes.earnings || 0 });
      setHistory(historyRes || []);
      
      if (statsRes.success) {
        const stats = statsRes.data.stats;
        const level = stats.level || 3;
        const levelKey = `level${level}`;
        
        // Use dynamic rates from backend
        const commRate = stats.commissionRates?.[levelKey] || stats.commissionRate || 15;
        const pfRate = stats.platformFeeRates?.[levelKey] || 2;

        setVendorStats({
          commissionRate: commRate,
          level: level,
          platformFeeRate: pfRate
        });
      }

      const savedBank = JSON.parse(localStorage.getItem('vendorBankAccount') || 'null');
      if (savedBank) {
        setBankAccount({ ...savedBank, confirmAccountNumber: savedBank.accountNumber });
        setIsBankSaved(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAmountChange = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setAmount(numValue);
    setError('');

    const numAmount = parseInt(numValue) || 0;
    if (numAmount > wallet.available) {
      setError('Amount cannot exceed available earnings');
    } else if (numAmount < 100 && numValue !== '') {
      setError('Minimum withdrawal amount is ₹100');
    }
  };

  const handleMaxAmount = () => {
    setAmount(wallet.available.toString());
    setError('');
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;

    // Validate number-only fields
    if (name === 'accountNumber' || name === 'confirmAccountNumber') {
      const numValue = value.replace(/[^0-9]/g, '');
      setBankAccount(prev => ({ ...prev, [name]: numValue }));
      return;
    }

    setBankAccount(prev => ({ ...prev, [name]: value }));
  };

  const saveBankDetails = () => {
    if (!bankAccount.accountHolderName || !bankAccount.accountNumber || !bankAccount.bankName || !bankAccount.ifscCode) {
      toast.error('Please fill all mandatory bank details');
      return;
    }

    if (bankAccount.accountNumber !== bankAccount.confirmAccountNumber) {
      toast.error('Account numbers do not match');
      return;
    }

    localStorage.setItem('vendorBankAccount', JSON.stringify(bankAccount));
    setIsBankSaved(true);
    setShowBankForm(false);
    toast.success('Bank details updated');
  };

  const handleSubmit = async () => {
    const numAmount = parseInt(amount) || 0;
    if (!amount || numAmount === 0 || error) return;
    if (!isBankSaved) {
      toast.error('Please add bank details');
      return;
    }

    try {
      setLoading(true);
      await requestWithdrawal({
        amount: numAmount,
        bankDetails: bankAccount
      });
      toast.success('Request sent successfully!');
      window.dispatchEvent(new Event('vendorWalletUpdated'));
      navigate('/vendor/wallet');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const tdsRate = 1; // Updated to 1% as per user request
  const commissionRate = vendorStats.commissionRate;
  const platformFeeRate = vendorStats.platformFeeRate;

  const grossAmount = parseInt(amount) || 0;
  const commissionAmount = Math.round(grossAmount * (commissionRate / 100));
  const platformFeeAmount = Math.round(grossAmount * (platformFeeRate / 100));
  const tdsAmount = Math.round(grossAmount * (tdsRate / 100));
  const netAmount = grossAmount - commissionAmount - platformFeeAmount - tdsAmount;

  return (
  return (
    <div className="min-h-screen pb-24 bg-white">
      <Header title="Request Withdrawal" />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Modern Balance Header (Black Theme) */}
        <div className="rounded-[32px] p-8 shadow-xl relative overflow-hidden mb-8 bg-black">
          <div className="relative z-10 text-white flex flex-col items-center">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Redeemable</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white/50">₹</span>
              <span className="text-6xl font-black text-white tracking-tighter">
                {wallet.available.toLocaleString()}
              </span>
            </div>
            <div className="mt-6">
              <div className="px-4 py-1.5 bg-white/10 text-white rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Verified Balance
              </div>
            </div>
          </div>
          {/* Decorative Icon Background */}
          <div className="absolute -bottom-10 -right-10 text-white/[0.03] transform rotate-12">
            <FiDollarSign className="w-64 h-64" />
          </div>
        </div>

        {/* Input Card (Black Theme) */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 mb-6 group transition-all">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <FiDollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Withdraw Amount</h3>
            </div>
            <button
              onClick={handleMaxAmount}
              className="text-[9px] font-black text-white px-4 py-2 rounded-xl bg-black shadow-lg shadow-gray-200 active:scale-95 transition-all uppercase tracking-widest"
            >
              Max
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute top-1/2 left-0 -translate-y-1/2 text-gray-200 font-black text-4xl">₹</div>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className={`w-full pl-8 pr-4 py-6 bg-white border-b-2 border-dashed ${error ? 'border-red-300 text-red-500' : 'border-gray-200 focus:border-black'
                } text-5xl font-black text-right focus:outline-none transition-all text-gray-900 placeholder:text-gray-100`}
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center mb-6 flex justify-center items-center gap-2"><FiAlertCircle className="w-4 h-4" /> {error}</p>}

          {amount && !error && (
            <div className="bg-gray-50 rounded-[28px] p-6 space-y-4 border border-gray-100">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Gross Total</span>
                <span className="text-gray-900">₹{grossAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Commission ({commissionRate}%)</span>
                <span className="text-black">- ₹{commissionAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Platform Fee ({platformFeeRate}%)</span>
                <span className="text-black">- ₹{platformFeeAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Tax (TDS {tdsRate}%)</span>
                <span className="text-black">- ₹{tdsAmount.toLocaleString()}</span>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated</span>
                  <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Net Payout</span>
                </div>
                <span className="text-3xl font-black text-black tracking-tighter">₹{netAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bank Detail Card (Black Theme) */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <FiCreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Payout Destination</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">Primary Bank Account</p>
              </div>
            </div>
            {isBankSaved && !showBankForm && (
              <button
                onClick={() => setShowBankForm(true)}
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 active:scale-90 transition-all shadow-sm"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isBankSaved || showBankForm ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Holder</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={bankAccount.accountHolderName}
                  onChange={handleBankInputChange}
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:bg-white outline-none text-xs font-black text-gray-900 uppercase tracking-widest transition-all"
                  placeholder="FULL NAME"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={bankAccount.bankName}
                  onChange={handleBankInputChange}
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:bg-white outline-none text-xs font-black text-gray-900 uppercase tracking-widest transition-all"
                  placeholder="BANK NAME"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                <input
                  type="tel"
                  name="accountNumber"
                  value={bankAccount.accountNumber}
                  onChange={handleBankInputChange}
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:bg-white outline-none text-lg font-black text-gray-900 tracking-widest transition-all"
                  placeholder="00000000000"
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={bankAccount.ifscCode}
                  onChange={handleBankInputChange}
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-black focus:bg-white outline-none text-xs font-black text-gray-900 uppercase tracking-[0.2em] transition-all"
                  placeholder="IFSC0000XXX"
                  maxLength={11}
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={saveBankDetails}
                  disabled={!bankAccount.accountNumber || bankAccount.accountNumber !== bankAccount.confirmAccountNumber}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 active:scale-[0.98] transition-all disabled:opacity-20"
                >
                  Verify & Save Account
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-[28px] p-6 border border-gray-100 shadow-sm relative group cursor-pointer" onClick={() => setShowBankForm(true)}>
              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Account Holder</p>
                    <p className="font-black text-gray-900 text-sm uppercase tracking-widest">{bankAccount.accountHolderName}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-black shadow-sm">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Bank</p>
                    <p className="font-black text-gray-800 text-xs uppercase tracking-widest">{bankAccount.bankName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">IFSC</p>
                    <p className="font-black text-gray-800 text-xs uppercase tracking-widest">{bankAccount.ifscCode}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Account Number</p>
                  <p className="font-black text-gray-900 text-xl tracking-[0.2em]">
                    {bankAccount.accountNumber?.replace(/(.{4})/g, '$1 ').trim()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Action (Black Theme) */}
        <button
          onClick={handleSubmit}
          disabled={!amount || !!error || !isBankSaved || loading}
          className="w-full py-6 rounded-[32px] font-black text-white text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-20 bg-black shadow-2xl shadow-gray-300 group"
        >
          {loading ? (
            <LogoLoader fullScreen={false} size="w-6 h-6" />
          ) : (
            <>
              Confirm Payout
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-[9px] text-gray-400 mt-10 font-black uppercase tracking-[0.1em] leading-relaxed opacity-40 px-8">
          Payouts processed in 24-48 business hours.<br />
          TDS deduction is mandatory as per govt norms.
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default WithdrawalRequest;
