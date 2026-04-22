import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Shield, ShieldAlert, UserCheck, XCircle } from 'lucide-react';

export default function RoleManager() {
  const { profile, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailToSearch, setEmailToSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      const snapshot = await getDocs(q);
      const adminList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAdmins(adminList);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    if (!emailToSearch) return;

    setActionLoading(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', emailToSearch.trim().toLowerCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setSearchError('Foydalanuvchi topilmadi! Tizimga Google orqali kamida bir marta kirgan bo\'lishi shart.');
      } else {
        const userDoc = snapshot.docs[0];
        setSearchResult({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (err) {
      console.error(err);
      setSearchError('Qidiruvda xatolik yuz berdi. Ruxsatlarni tekshiring.');
    }
    setActionLoading(false);
  };

  const handleMakeAdmin = async () => {
    if (!searchResult) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', searchResult.id), { role: 'admin' });
      setSearchResult({ ...searchResult, role: 'admin' });
      fetchAdmins(); // Refresh
    } catch (err) {
      console.error(err);
      alert('Xatolik yuz berdi!');
    }
    setActionLoading(false);
  };

  const handleRemoveAdmin = async (userId: string) => {
    if(!window.confirm("Rostdan ham admin huquqini olib tashlamoqchimisiz?")) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), { role: 'user' });
      fetchAdmins(); // Refresh
    } catch (err) {
      console.error(err);
      alert('Xatolik yuz berdi!');
    }
    setActionLoading(false);
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-red-50 text-red-700 p-12 rounded border border-red-200 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 mb-6 opacity-30" />
        <h2 className="text-3xl font-serif font-bold mb-2">Ruxsat etilmagan</h2>
        <p className="font-serif">Bu sahifa faqatgina Super Admin uchun ochiq.</p>
        <p className="font-sans text-[11px] font-bold uppercase tracking-widest mt-6 opacity-70">Joriy rol: {profile?.role}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-primary-900">Adminlar Boshqaruvi</h2>
          <p className="text-gray-500 font-serif italic mt-1">Platforma adminlarini qo'shing yoki o'chiring</p>
        </div>
        <div className="font-sans text-[11px] font-bold uppercase tracking-widest bg-accent-50 text-accent-700 px-4 py-2 rounded-sm flex items-center gap-2 border border-accent-200">
          <Shield className="w-4 h-4" />
          Super Admin Rejimi
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-200">
        <h3 className="text-lg font-serif font-bold text-primary-900 mb-6 border-l-2 border-accent-500 pl-3">Yangi admin qo'shish</h3>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="email"
            value={emailToSearch}
            onChange={(e) => setEmailToSearch(e.target.value)}
            placeholder="Foydalanuvchi emaili..."
            className="flex-1 px-4 py-3 border border-gray-200 bg-[#FDFCFB] rounded-sm focus:border-primary-900 focus:ring-0 outline-none font-sans text-sm"
            required
          />
          <button 
            type="submit" 
            disabled={actionLoading}
            className="bg-primary-900 text-white font-sans text-[11px] font-bold uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-primary-800 disabled:opacity-50 transition-colors border border-primary-900"
          >
            {actionLoading ? 'Qidirilmoqda...' : 'Qidirish'}
          </button>
        </form>

        {searchError && <p className="text-red-600 font-serif text-sm italic mb-4">{searchError}</p>}
        
        {searchResult && (
          <div className="bg-[#FDFCFB] rounded-sm p-6 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               {searchResult.photoURL ? (
                 <img src={searchResult.photoURL} alt="profile" className="w-12 h-12 rounded border border-gray-200" />
               ) : (
                 <div className="w-12 h-12 bg-white border border-gray-200 rounded flex items-center justify-center text-gray-400"><UserCheck className="w-5 h-5"/></div>
               )}
               <div>
                  <p className="font-serif font-bold text-primary-900 text-lg mb-1">{searchResult.displayName || 'Ism kiritilmagan'}</p>
                  <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-gray-400">{searchResult.email}</p>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-primary-900 inline-block px-2 py-0.5 mt-2 rounded-sm border border-gray-200">Rol: {searchResult.role}</p>
               </div>
            </div>
            <div>
              {searchResult.role === 'admin' || searchResult.role === 'superadmin' ? (
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-gray-400">Allaqachon Admin</span>
              ) : (
                <button 
                   onClick={handleMakeAdmin}
                   disabled={actionLoading}
                   className="font-sans text-[11px] font-bold uppercase tracking-widest bg-accent-500 hover:bg-accent-600 text-primary-900 px-6 py-2.5 rounded-sm transition-colors"
                >
                   Admin Qilish
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-[#FDFCFB]">
           <h3 className="text-lg font-serif font-bold text-primary-900">Joriy Adminlar Ro'yxati</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-serif italic">Yuklanmoqda...</div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-serif italic">Hozircha adminlar yo'q</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {admins.map(admin => (
              <div key={admin.id} className="p-6 flex items-center justify-between hover:bg-[#FDFCFB] transition-colors">
                 <div className="flex items-center gap-4">
                    <img src={admin.photoURL || 'https://via.placeholder.com/40'} alt="admin" className="w-10 h-10 rounded border border-gray-200" />
                    <div>
                       <p className="font-serif font-bold text-primary-900 text-lg mb-0.5">{admin.displayName || admin.email}</p>
                       <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">{admin.email}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => handleRemoveAdmin(admin.id)}
                   disabled={actionLoading}
                   className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 border border-transparent hover:border-red-200 rounded-sm flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-widest transition-colors"
                 >
                   <XCircle className="w-4 h-4" />
                   O'chirish
                 </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
