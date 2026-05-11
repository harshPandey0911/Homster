import React from 'react';
import { FiClock, FiMapPin, FiBell } from 'react-icons/fi';

// Internal Timer Component for unification
const CountdownTimer = ({ durationSeconds, createdAt, expiresAt, onExpire }) => {
  const calculateTimeLeft = () => {
    try {
      if (expiresAt) {
        const end = new Date(expiresAt).getTime();
        if (!isNaN(end)) {
          const left = Math.floor((end - Date.now()) / 1000);
          return Math.max(0, left);
        }
      }
      if (!createdAt) return Number(durationSeconds) || 300;
      const start = new Date(createdAt).getTime();
      if (!isNaN(start)) {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        return Math.max(0, (Number(durationSeconds) || 300) - elapsed);
      }
      return Number(durationSeconds) || 300;
    } catch (err) {
      return 0;
    }
  };

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  React.useEffect(() => {
    // Recalculate once on mount to handle refresh correctly
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (initial <= 0 && onExpire) onExpire();
  }, [createdAt, expiresAt]);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }
    const interval = setInterval(() => {
      const current = calculateTimeLeft();
      setTimeLeft(current);
      if (current <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, createdAt, expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return (
    <div className={`text-[10px] font-mono font-bold flex items-center gap-1 ${timeLeft < 30 ? 'text-red-600 animate-pulse' : 'text-yellow-600'}`}>
      <FiClock className="w-3 h-3" />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
};

const PendingJobCard = ({ booking, onAccept, onReject, onClick, loadingAction, showTimer = false, maxSearchTimeMins = 5 }) => {
  const bookingId = booking.id || booking._id;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[32px] shadow-sm cursor-pointer active:scale-98 transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      {/* Urgency header */}
      {showTimer && (
        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <span className={`text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 ${booking.bookingType === 'instant' ? 'text-black animate-pulse' : 'text-gray-400'}`}>
            {booking.bookingType === 'instant' ? '⚡ INSTANT BOOKING' : 'NEW REQUEST'}
          </span>
          <CountdownTimer
            durationSeconds={maxSearchTimeMins * 60}
            createdAt={booking.createdAt}
            expiresAt={booking.expiresAt}
            onExpire={() => {
              window.dispatchEvent(new CustomEvent('removeVendorBooking', { detail: { id: bookingId } }));
            }}
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-black text-white uppercase tracking-widest">
                {booking.serviceCategory || 'Service'}
              </span>
              <span className="text-[10px] font-bold text-gray-400">•</span>
              <span className="text-[10px] font-bold text-gray-400 truncate max-w-[100px]">
                {booking.customerName || 'Customer'}
              </span>
            </div>
            
            <h3 className="font-black text-gray-900 text-base leading-tight mb-2 line-clamp-1">
              {booking.serviceName || 'New Request'}
            </h3>

            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
              <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate">{booking.location?.address || 'Location N/A'}</span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 relative">
            <FiBell className="w-6 h-6 text-black" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full border-2 border-white animate-bounce" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
              <FiClock className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span className="text-[11px] font-black text-gray-700">
              {booking.timeSlot?.time || 'ASAP'}
            </span>
          </div>
          
          <div className="text-xl font-black text-gray-900">
            ₹{booking.price || 0}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            disabled={!!loadingAction}
            onClick={(e) => onAccept(e, booking)}
            className="flex-[2] bg-black text-white py-3 px-4 rounded-2xl text-sm font-black shadow-lg shadow-gray-200 hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingAction === 'accept' ? 'ACCEPTING...' : 'ACCEPT NOW'}
          </button>
          <button
            disabled={!!loadingAction}
            onClick={(e) => onReject(e, booking)}
            className="flex-1 bg-gray-50 text-gray-400 py-3 px-4 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingAction === 'reject' ? '...' : 'SKIP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingJobCard;
