import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Award, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { logout } from '../../lib/firebase';

export function AdminLayout() {
  const { isAdmin, loading, profile } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-serif text-lg text-primary-900 bg-[#FDFCFB]">Yuklanmoqda...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: t('dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: 'Mutolaa & Materiallar', path: '/admin/content', icon: FileText }
    // certificates removed
  ];

  if (profile?.role === 'superadmin') {
    navItems.push({ name: 'Adminlar & Rollar', path: '/admin/roles', icon: Users });
  }

  return (
    <div className="min-h-screen flex bg-[#E5E7EB]">
      {/* Sidebar background and structural container */}
      <aside className="w-64 bg-primary-900 text-white flex flex-col md:relative fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:translate-x-0 border-r border-primary-800">
        <div className="h-[70px] flex items-center px-6 border-b border-primary-800 bg-primary-950">
          <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-sans text-[11px] font-bold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" />
            <span>Saytga qaytish</span>
          </Link>
        </div>
        
        <div className="px-6 py-8">
          <Link to="/" className="text-2xl font-sans font-bold uppercase tracking-tight text-white mb-2 block hover:text-accent-500 transition-colors">
            Science <span className="text-accent-500">Award</span>
          </Link>
          <div className="inline-block bg-primary-800 px-2 py-0.5 mt-2 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest text-[#FDFCFB]">{profile?.role}</div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 font-sans text-[12px] font-bold uppercase tracking-widest ${
                  isActive 
                    ? 'bg-accent-500 text-primary-900' 
                    : 'text-gray-300 hover:bg-primary-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 stroke-2" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-800">
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-sm text-red-400 hover:bg-primary-800 hover:text-red-300 transition-colors font-sans text-[11px] font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FDFCFB]">
        <header className="h-[70px] bg-white border-b border-gray-200 flex items-center px-8 justify-between shrink-0 z-10">
          <h1 className="text-xl font-serif font-bold text-primary-900">
            {navItems.find(i => location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path)))?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-[13px] font-bold text-primary-900 truncate font-sans">{profile?.displayName}</p>
               <p className="text-[11px] text-gray-500 font-sans truncate">{profile?.email}</p>
             </div>
             <img src={profile?.photoURL || ''} alt="Admin" className="w-9 h-9 rounded border border-gray-200" />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
