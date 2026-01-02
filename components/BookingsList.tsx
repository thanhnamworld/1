
import React, { useState } from 'react';
import { Booking, Trip } from '../types';
import { Clock, MapPin, Trash2, Map as MapIcon, Navigation, ExternalLink, Hash, Calendar, AlertCircle, XCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CopyableCode from './CopyableCode';

interface BookingsListProps {
  bookings: Booking[];
  trips: Trip[];
  onRefresh?: () => void;
}

const BookingItem: React.FC<{ booking: Booking; trip: Trip; onRefresh?: () => void }> = ({ booking, trip, onRefresh }) => {
  const [showMap, setShowMap] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLocallyRemoved, setIsLocallyRemoved] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const bookingCode = `#ORD-${booking.id.substring(0, 5).toUpperCase()}`;
  const tripCode = trip.trip_code || `#TRP-${trip.id.substring(0, 5).toUpperCase()}`;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(trip.origin_name)}+to+${encodeURIComponent(trip.dest_name)}&output=embed`;
  const navUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(trip.origin_name)}&destination=${encodeURIComponent(trip.dest_name)}`;

  const handleCancelBooking = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }
    
    setIsDeleting(true);
    setIsConfirmingDelete(false);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;
      
      setIsLocallyRemoved(true);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Lỗi xoá đơn hàng:", err);
      alert('Không thể xoá đơn hàng: ' + (err.message || 'Lỗi kết nối'));
      setIsDeleting(false);
    }
  };

  if (isLocallyRemoved) return null;

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all group ${booking.status === 'REJECTED' ? 'border-rose-100 bg-rose-50/10' : 'border-slate-100'}`}>
      <div className="p-6">
        <div className="flex flex-wrap md:flex-nowrap gap-6 items-center">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <CopyableCode 
                code={bookingCode} 
                className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm"
              />
              
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                booking.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {booking.status === 'CONFIRMED' ? 'Đã xác nhận' : 
                 booking.status === 'REJECTED' ? 'Bị từ chối' : 'Đang chờ'}
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                <Clock size={12} className="text-indigo-500" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                  {new Date(booking.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:border-indigo-200 transition-colors">
                  <MapPin size={18} className="pointer-events-none group-hover:text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Lộ trình</p>
                    <CopyableCode 
                      code={tripCode} 
                      className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter"
                    />
                  </div>
                  <p className="text-sm text-slate-700 font-bold truncate">
                    {trip.origin_name} <span className="mx-1 text-slate-300">→</span> {trip.dest_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Calendar size={18} className="pointer-events-none" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Khởi hành</p>
                  <p className="text-sm text-slate-700 font-bold">
                    {new Date(trip.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(trip.departure_time).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-px h-16 bg-slate-100 hidden md:block"></div>

          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6">
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Thanh toán tại xe</p>
              <p className="text-2xl font-black text-indigo-600 tracking-tighter">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price)}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowMap(!showMap)}
                className={`p-3 rounded-xl transition-all ${showMap ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600 border border-slate-100'}`}
                title="Xem bản đồ"
              >
                <MapIcon size={20} className="pointer-events-none" />
              </button>
              
              {(booking.status === 'PENDING' || booking.status === 'REJECTED') && (
                <button 
                  onClick={handleCancelBooking}
                  disabled={isDeleting}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all shadow-sm border ${
                    isConfirmingDelete 
                    ? 'bg-amber-500 text-white border-amber-600 animate-pulse' 
                    : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border-slate-100'
                  } min-w-[50px]`}
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : isConfirmingDelete ? (
                    <span className="text-[8px] font-black leading-none">HUỶ?</span>
                  ) : (
                    <Trash2 size={20} className="pointer-events-none" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {booking.status === 'REJECTED' && (
          <div className="mt-4 p-4 bg-rose-50/50 rounded-2xl flex items-center gap-3 border border-rose-100 animate-in fade-in slide-in-from-left-2 duration-500">
            <XCircle className="text-rose-500 shrink-0" size={20} />
            <div>
              <p className="text-[11px] font-black text-rose-700 uppercase tracking-tight">Đơn hàng đã bị từ chối</p>
              <p className="text-[10px] text-rose-600 font-medium leading-relaxed">Tài xế hiện không thể tiếp nhận yêu cầu này. Bạn có thể xoá đơn hàng này và tìm một chuyến xe khác phù hợp hơn.</p>
            </div>
          </div>
        )}

        {booking.status === 'CONFIRMED' && (
          <div className="mt-4 p-4 bg-emerald-50/50 rounded-2xl flex items-center gap-3 border border-emerald-100">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
            <div>
              <p className="text-[11px] font-black text-emerald-700 uppercase tracking-tight">Đã sẵn sàng khởi hành</p>
              <p className="text-[10px] text-emerald-600 font-medium">Tài xế đã xác nhận đơn hàng. Chúc bạn có một chuyến đi an toàn và vui vẻ!</p>
            </div>
          </div>
        )}
      </div>

      {showMap && (
        <div className="border-t border-slate-50 bg-slate-50/50 p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
              <Navigation size={14} className="text-indigo-600" />
              Chi tiết hành trình thực tế
            </h4>
            <a 
              href={navUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-black text-indigo-600 flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm hover:bg-indigo-600 hover:text-white transition-all"
            >
              MỞ GOOGLE MAPS <ExternalLink size={12} />
            </a>
          </div>
          
          <div className="rounded-[28px] overflow-hidden shadow-inner border border-slate-200 h-[300px] relative bg-slate-200">
             <iframe 
                width="100%" 
                height="100%" 
                title="Hành trình"
                frameBorder="0" 
                style={{ border: 0 }}
                src={mapEmbedUrl} 
                allowFullScreen
                loading="lazy"
              />
          </div>
        </div>
      )}
    </div>
  );
};

const BookingsList: React.FC<BookingsListProps> = ({ bookings, trips, onRefresh }) => {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-white rounded-[40px] border border-slate-100 shadow-sm">
        <div className="p-8 bg-slate-50 rounded-full mb-6 text-slate-300 border border-slate-100">
          <AlertCircle size={64} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-black text-slate-800 italic uppercase">Hành trình trống</h3>
        <p className="mt-2 text-slate-400 text-center max-w-xs text-sm font-medium">
          Lịch sử chuyến đi của bạn sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-slide-up">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">CHUYẾN ĐI CỦA TÔI</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Theo dõi mã đơn và lịch trình chi tiết.</p>
        </div>
        <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl font-black text-xs text-indigo-600 uppercase tracking-widest shadow-sm">
          {bookings.length} ĐƠN HÀNG
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {bookings.map(booking => {
          const trip = trips.find(t => t.id === booking.trip_id);
          if (!trip) return null;
          return <BookingItem key={booking.id} booking={booking} trip={trip} onRefresh={onRefresh} />;
        })}
      </div>
    </div>
  );
};

export default BookingsList;
