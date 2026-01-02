
import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Search, Phone, Loader2, ArrowUpDown } from 'lucide-react';
import { Profile, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import CopyableCode from './CopyableCode';
import { UnifiedDropdown } from './SearchTrips';

type SortConfig = { key: string; direction: 'asc' | 'desc' | null };

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'full_name', direction: 'asc' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
      if (error) throw error;
      if (data) setUsers(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSort = (key: string) => {
    let direction: SortConfig['direction'] = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    setSortConfig({ key, direction });
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u => {
      const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone?.includes(searchTerm);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a: any, b: any) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [users, searchTerm, roleFilter, sortConfig]);

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) { alert(err.message); } finally { setUpdatingId(null); }
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
            type="text" placeholder="Tìm thành viên..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none text-xs font-bold" 
          />
        </div>
        <UnifiedDropdown 
          label="Quyền hạn" icon={Shield} value={roleFilter} onChange={setRoleFilter}
          options={[{label:'Tất cả', value:'ALL'}, {label:'Admin', value:'admin'}, {label:'Tài xế', value:'driver'}, {label:'Điều phối', value:'manager'}]}
        />
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left table-fixed min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <SortHeader label="THÀNH VIÊN" sortKey="full_name" width="30%" />
              <SortHeader label="LIÊN HỆ" sortKey="phone" width="25%" />
              <SortHeader label="QUYỀN HẠN" sortKey="role" width="20%" textAlign="text-center" />
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px] shrink-0 border border-slate-200">{user.full_name?.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-800 truncate">{user.full_name}</p>
                      <CopyableCode code={`#USR-${user.id.substring(0,5).toUpperCase()}`} className="text-[9px] font-black text-indigo-400" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600"><Phone size={12} className="text-indigo-400" /> {user.phone || 'Chưa cập nhật'}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${user.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {updatingId === user.id ? <Loader2 className="animate-spin text-indigo-600 ml-auto" size={16} /> : (
                    <select 
                      value={user.role} onChange={e => handleUpdateRole(user.id, e.target.value as UserRole)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="user">USER</option>
                      <option value="driver">DRIVER</option>
                      <option value="manager">MANAGER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminPanel;
