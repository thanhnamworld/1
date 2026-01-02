
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MapPin, Calendar, Users, Car, CheckCircle2, Navigation, Clock, Repeat, ChevronDown, Banknote } from 'lucide-react';
import { searchPlaces } from '../services/geminiService';
import CustomDatePicker from './CustomDatePicker';
import CustomTimePicker from './CustomTimePicker';

interface PostTripProps {
  onPost: (trips: any[]) => void;
}

const DAYS_OF_WEEK = [
  { label: 'T2', value: 1 }, { label: 'T3', value: 2 }, { label: 'T4', value: 3 },
  { label: 'T5', value: 4 }, { label: 'T6', value: 5 }, { label: 'T7', value: 6 }, { label: 'CN', value: 0 },
];

const QUICK_PRICES = [100000, 150000, 200000, 250000, 300000];

const PostTrip: React.FC<PostTripProps> = ({ onPost }) => {
  const [origin, setOrigin] = useState('');
  const [originDetail, setOriginDetail] = useState('');
  const [destination, setDestination] = useState('');
  const [destDetail, setDestDetail] = useState('');
  const [originUri, setOriginUri] = useState('');
  const [destUri, setDestUri] = useState('');
  
  const [vehicle, setVehicle] = useState('Sedan 4 chỗ');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [seats, setSeats] = useState(4);
  const [price, setPrice] = useState('');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  
  const [originSuggestions, setOriginSuggestions] = useState<{name: string, uri: string}[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<{name: string, uri: string}[]>([]);
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setShowDatePicker(false);
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) setShowTimePicker(false);
      if (originRef.current && !originRef.current.contains(event.target as Node)) setOriginSuggestions([]);
      if (destRef.current && !destRef.current.contains(event.target as Node)) setDestSuggestions([]);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (origin.length >= 1 && !originUri) setOriginSuggestions(await searchPlaces(origin));
      else setOriginSuggestions([]);
    };
    search();
  }, [origin, originUri]);

  useEffect(() => {
    const search = async () => {
      if (destination.length >= 1 && !destUri) setDestSuggestions(await searchPlaces(destination));
      else setDestSuggestions([]);
    };
    search();
  }, [destination, destUri]);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || (!isRecurring && !date) || (isRecurring && selectedDays.length === 0) || !price) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const tripBase = {
      driverName: 'Tài xế TripEase',
      origin: { name: origin, description: originDetail, mapsUrl: originUri },
      destination: { name: destination, description: destDetail, mapsUrl: destUri },
      price: parseInt(price),
      seats: seats,
      availableSeats: seats,
      vehicleInfo: vehicle,
      isRecurring: isRecurring,
      recurringDays: selectedDays
    };

    const tripsToCreate: any[] = [];
    if (isRecurring) {
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        if (selectedDays.includes(nextDay.getDay())) {
          const [h, m] = time.split(':');
          nextDay.setHours(parseInt(h), parseInt(m), 0, 0);
          tripsToCreate.push({ ...tripBase, departureTime: nextDay.toISOString() });
        }
      }
    } else {
      const departure = new Date(date);
      const [h, m] = time.split(':');
      departure.setHours(parseInt(h), parseInt(m), 0, 0);
      tripsToCreate.push({ ...tripBase, departureTime: departure.toISOString() });
    }
    onPost(tripsToCreate);
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        {/* Header - More Compact */}
        <div className="px-6 py-5 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Car size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">ĐĂNG CHUYẾN NHANH</h2>
              <p className="text-indigo-100 text-[10px] font-medium uppercase tracking-wider">Tiết kiệm chi phí hành trình</p>
            </div>
          </div>
          <Sparkles className="text-white/20 w-8 h-8" />
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lộ trình */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Navigation size={12} /> LỘ TRÌNH CHI TIẾT
            </h3>
            
            <div className="space-y-4 relative">
              <div className="absolute left-[18px] top-10 bottom-10 w-0.5 bg-slate-100 border-l border-dashed border-slate-200"></div>

              {/* Điểm đón */}
              <div className="relative" ref={originRef}>
                <div className="flex gap-4">
                  <div className={`mt-1 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${originUri ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <Navigation size={16} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Điểm đón</label>
                    <input 
                      type="text" value={origin} onChange={(e) => { setOrigin(e.target.value); setOriginUri(''); }}
                      placeholder="Tìm quận, huyện..." required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <input 
                      type="text" value={originDetail} onChange={(e) => setOriginDetail(e.target.value)}
                      placeholder="Địa chỉ cụ thể, số nhà..."
                      className="w-full px-4 py-2 bg-white border border-slate-100 rounded-lg outline-none text-[11px] italic text-slate-600 focus:border-indigo-200"
                    />
                  </div>
                </div>
                {originSuggestions.length > 0 && (
                  <div className="absolute top-16 left-12 right-0 z-50 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
                    {originSuggestions.map((s, idx) => (
                      <button key={idx} type="button" onClick={() => { setOrigin(s.name); setOriginUri(s.uri); setOriginSuggestions([]); }}
                        className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 text-xs font-bold text-slate-700 border-b border-slate-50 last:border-0">{s.name}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Điểm trả */}
              <div className="relative" ref={destRef}>
                <div className="flex gap-4">
                  <div className={`mt-1 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${destUri ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Điểm trả</label>
                    <input 
                      type="text" value={destination} onChange={(e) => { setDestination(e.target.value); setDestUri(''); }}
                      placeholder="Tìm xã, thị trấn..." required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <input 
                      type="text" value={destDetail} onChange={(e) => setDestDetail(e.target.value)}
                      placeholder="Ghi chú điểm trả..."
                      className="w-full px-4 py-2 bg-white border border-slate-100 rounded-lg outline-none text-[11px] italic text-slate-600 focus:border-indigo-200"
                    />
                  </div>
                </div>
                {destSuggestions.length > 0 && (
                  <div className="absolute top-16 left-12 right-0 z-50 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
                    {destSuggestions.map((s, idx) => (
                      <button key={idx} type="button" onClick={() => { setDestination(s.name); setDestUri(s.uri); setDestSuggestions([]); }}
                        className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 text-xs font-bold text-slate-700 border-b border-slate-50 last:border-0">{s.name}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chi tiết */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> THỜI GIAN & CHI PHÍ
            </h3>

            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Repeat size={14} /></div>
                  <span className="text-[10px] font-bold text-slate-700 uppercase">Chuyến định kỳ</span>
                </div>
                <button type="button" onClick={() => setIsRecurring(!isRecurring)}
                  className={`w-10 h-5 rounded-full transition-all relative ${isRecurring ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isRecurring ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>

              {isRecurring ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS_OF_WEEK.map(day => (
                      <button key={day.value} type="button" onClick={() => toggleDay(day.value)}
                        className={`py-1.5 rounded-lg text-[9px] font-bold border ${selectedDays.includes(day.value) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowTimePicker(!showTimePicker)} className="w-full flex items-center justify-between px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                    <span>{time}</span><Clock size={14} className="text-indigo-400" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative" ref={datePickerRef}>
                    <button type="button" onClick={() => setShowDatePicker(!showDatePicker)} className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                      <span>{date}</span><Calendar size={14} className="text-indigo-400" />
                    </button>
                    {showDatePicker && <div className="absolute top-full left-0 z-[60] mt-2"><CustomDatePicker selectedDate={date} onSelect={setDate} onClose={() => setShowDatePicker(false)} /></div>}
                  </div>
                  <div className="relative" ref={timePickerRef}>
                    <button type="button" onClick={() => setShowTimePicker(!showTimePicker)} className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                      <span>{time}</span><Clock size={14} className="text-indigo-400" />
                    </button>
                    {showTimePicker && <div className="absolute top-full right-0 z-[60] mt-2"><CustomTimePicker selectedTime={time} onSelect={setTime} onClose={() => setShowTimePicker(false)} /></div>}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Loại xe</label>
                <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option className="text-slate-900">Sedan 4 chỗ</option>
                  <option className="text-slate-900">SUV 7 chỗ</option>
                  <option className="text-slate-900">Limousine 9 chỗ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Ghế trống</label>
                <input type="number" value={seats} onChange={(e) => setSeats(parseInt(e.target.value))} min="1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 outline-none" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Giá/Chỗ (VNĐ)</label>
                <div className="flex gap-1">
                  {QUICK_PRICES.map(p => (
                    <button key={p} type="button" onClick={() => setPrice(p.toString())}
                      className="px-2 py-0.5 bg-indigo-50 text-[9px] font-bold text-indigo-600 rounded-lg border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">{p/1000}k</button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 font-bold text-lg">₫</div>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" required 
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-2xl font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200" />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
              XÁC NHẬN ĐĂNG CHUYẾN <Sparkles size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostTrip;
