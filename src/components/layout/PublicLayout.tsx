import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle, logout } from '../../lib/firebase';
import { Globe, User as UserIcon, ShieldCheck, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, profile, isAdmin } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
  };

  const currentLang = i18n.language || 'uz';

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-accent-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 h-[70px] flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="font-sans text-2xl font-bold uppercase tracking-tight text-primary-900 border-none bg-transparent m-0 p-0">
            Science <span className="text-accent-500">Award</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-sans text-[11px] uppercase tracking-widest font-bold text-gray-800">
          <Link to="/" className="hover:text-accent-500 transition-colors">{t('home')}</Link>
          <Link to="/scholar" className="hover:text-accent-500 transition-colors text-primary-900 border-b border-accent-500 pb-0.5">Scholar Database</Link>
          <Link to="/archive" className="hover:text-accent-500 transition-colors">Archive</Link>
          <Link to="/conference-papers" className="hover:text-accent-500 transition-colors">Conferences</Link>
          <Link to="/authors" className="hover:text-accent-500 transition-colors">Authors</Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="relative border-l border-gray-200 pl-5 flex items-center font-sans">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold tracking-wider uppercase border border-transparent hover:text-accent-500 transition-colors"
              aria-label="Change language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang.substring(0, 2)}</span>
            </button>
            
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-24 bg-white rounded shadow-lg border border-gray-100 py-1">
                {['uz', 'ru', 'en'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className="block w-full text-left px-4 py-2 text-[11px] font-bold text-gray-800 hover:bg-primary-900 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth / Admin */}
          {user ? (
            <div className="relative font-sans ml-2">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded border border-gray-200 hover:border-accent-500 transition-colors" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded shadow-lg border border-gray-100 py-2">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-[13px] font-bold text-primary-900 truncate">{user.displayName}</p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-primary-900 hover:bg-gray-50 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {t('admin_panel')}
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="hidden md:flex ml-2 items-center gap-1.5 px-4 py-1.5 border border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white transition-colors font-sans text-[11px] font-bold uppercase tracking-wider rounded-sm"
            >
              <UserIcon className="w-3.5 h-3.5" />
              {t('login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-primary-900 text-white mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <span className="font-sans text-xl font-bold uppercase tracking-tight text-white m-0 p-0">
                Science <span className="text-accent-500">Award</span>
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm text-[13px] leading-relaxed">
              Premium scientific and creative content platform. Elevating research, ideas, and artistry to the highest standard.
            </p>
          </div>
          <div>
            <h4 className="text-white text-[11px] uppercase tracking-widest font-bold mb-4">Academic Resources</h4>
            <ul className="space-y-3 text-[13px] text-gray-300">
              <li><Link to="/scholar" className="hover:text-accent-500 transition-colors">Scholar Index</Link></li>
              <li><Link to="/archive" className="hover:text-accent-500 transition-colors">Full Archive</Link></li>
              <li><Link to="/articles" className="hover:text-accent-500 transition-colors">Journal Articles</Link></li>
              <li><Link to="/theses" className="hover:text-accent-500 transition-colors">Theses & Dissertations</Link></li>
              <li><Link to="/conference-papers" className="hover:text-accent-500 transition-colors">Conference Proceedings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[11px] uppercase tracking-widest font-bold mb-4">Science Award</h4>
            <ul className="space-y-3 text-[13px] text-gray-300">
              <li><Link to="/about" className="hover:text-accent-500 transition-colors">{t('about')}</Link></li>
              <li><Link to="/contact" className="hover:text-accent-500 transition-colors">{t('contact')}</Link></li>
              <li><Link to="/verify" className="hover:text-accent-500 transition-colors">{t('verify_certificate')}</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="h-12 bg-primary-950 flex flex-col md:flex-row items-center justify-between px-4 sm:px-10 text-[11px] tracking-[0.5px] uppercase text-gray-400 border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} Science Award Platform. Barcha huquqlar himoyalangan.</p>
        <div className="flex gap-6 mt-2 md:mt-0 font-bold">
          <Link to="/privacy" className="hover:text-accent-500">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-accent-500">Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full bg-[#FDFCFB]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
