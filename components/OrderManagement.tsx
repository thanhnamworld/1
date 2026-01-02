
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Search, CheckCircle2, XCircle, Clock, RefreshCcw, Loader2, ArrowUpDown
} from 'lucide-react';
import { Booking, Profile, Trip } from '../types';
import { supabase } from '../lib/supabase';
import CopyableCode from './CopyableCode';
import { UnifiedDropdown } from './SearchTrips';

interface OrderManagementProps {
  profile: Profile | null;
  trips: Trip[];
  onRefresh: () => void;
}

type SortConfig = { key: string; direction: 'asc' | 'desc' | null };

const OrderManagement: React.FC<OrderManagementProps> = ({ profile, trips, onRefresh }) => {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });

  useEffect(() => { fetchBookings(); }, [profile]);

  const fetchBookings = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      let query = supabase.from('bookings').select('*, trips(*), profiles:passenger_id(full_name, phone)');
      if (profile.role === 'driver') {
        const { data: myTrips } = await supabase.from('trips').select('id').eq('driver_id', profile.id);
        const myTripIds = myTrips?.map(t => t.id) || [];
        if (myTripIds.length > 0) query = query.in('trip_id', myTripIds);
        else { setAllBookings([]); setLoading(false); return; }
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setAllBookings(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSort = (key: string) => {
    let direction: SortConfig['direction'] = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    setSortConfig({ key, direction });
  };

  const filteredOrders = useMemo(() => {
    let filtered = allBookings.filter(order => {
      const bookingCode = `#ORD-${order.id.substring(0, 5).toUpperCase()}`;
      const passengerName = order.profiles?.full_name?.toLowerCase() || '';
      const matchesSearch = order.passenger_phone?.includes(searchTerm) || passengerName.includes(searchTerm.toLowerCase()) || bookingCode.includes(searchTerm.toUpperCase());
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a: any, b: any) => {
        let valA, valB;
        if (sortConfig.key === 'passenger_name') {
          valA = a.profiles?.full_name || '';
          valB = b.profiles?.full_name || '';
        } else {
          valA = a[sortConfig.key];
          valB = b[sortConfig.key];
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [allBookings, searchTerm, statusFilter, sortConfig]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setActionLoading(bookingId);
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
      if (error) throw error;
      setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      onRefresh();
    } catch (err: any) { alert(err.message); } finally { setActionLoading(null); }
  };

  const SortHeader = ({ label, sortKey, width, textAlign = 'text-left' }: { label: string, sortKey: string, width?: string, textAlign?: string }) => (
    <th 
      style={{ width }} 
      className={`px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors ${textAlign}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${textAlign === 'text-center' ? 'justify-center' : textAlign === 'text-right' ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown size={12} className={`${sortConfig.key === sortKey ? 'text-indigo-600' : 'opacity-20'}`} />
      </div>
    </th>
  );

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-white p-4 rounded-[24px] border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" placeholder="Tìm đơn hàng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none text-xs font-bold" 
          />
        </div>
        <UnifiedDropdown 
          label="Trạng thái" icon={ShoppingBag} value={statusFilter} onChange={setStatusFilter}
          options={[{label:'Tất cả', value:'ALL'}, {label:'Đang chờ', value:'PENDING'}, {label:'Xác nhận', value:'CONFIRMED'}, {label:'Từ chối', value:'REJECTED'}]}
        />
        <button onClick={fetchBookings} className="p-2.5 bg-slate-50 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left table-fixed min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <SortHeader label="ĐƠN HÀNG" sortKey="id" width="20%" />
              <SortHeader label="HÀNH KHÁCH" sortKey="passenger_name" width="25%" />
              <SortHeader label="GHẾ / TIỀN" sortKey="total_price" width="15%" textAlign="text-center" />
              <SortHeader label="TRẠNG THÁI" sortKey="status" width="20%" textAlign="text-center" />
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <CopyableCode code={`#ORD-${order.id.substring(0, 5).toUpperCase()}`} className="text-[11px] font-black text-slate-900 w-fit" />
                  <div className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={10} /> {new Date(order.created_at).toLocaleTimeString('vi-VN')}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px] shrink-0 border border-indigo-100">{order.profiles?.full_name?.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-800 truncate">{order.profiles?.full_name}</p>
                      <p className="text-[10px] font-bold text-indigo-500">{order.passenger_phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="text-[11px] font-bold text-slate-900">{order.seats_booked} Ghế</div>
                  <div className="text-[10px] font-black text-indigo-600">{new Intl.NumberFormat('vi-VN').format(order.total_price)}đ</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${order.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : order.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {actionLoading === order.id ? <Loader2 className="animate-spin text-indigo-600" size={14} /> : (
                      <>
                        {order.status !== 'CONFIRMED' && <button onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"><CheckCircle2 size={14} /></button>}
                        {order.status !== 'REJECTED' && <button onClick={() => handleUpdateStatus(order.id, 'REJECTED')} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all border border-rose-100"><XCircle size={14} /></button>}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default OrderManagement;
