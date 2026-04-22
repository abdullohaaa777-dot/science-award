import { useState } from 'react';
import { loginWithEmail, registerWithEmail, signInWithGoogle } from '../../lib/firebase';
import { X } from 'lucide-react';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Tizimda Email orqali kirish yoqilmagan. Iltimos Firebase Console'dan yoqing.");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Email yoki parol xato.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Bu email band qilingan.");
      } else {
        setError(err.message || 'Xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError("Google orqali kirishda xato. Boshqa usulni tanlang.");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-md relative font-sans overflow-hidden border border-gray-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-serif font-bold text-primary-900 mb-6 text-center">
            {isLogin ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-700 mb-1">Email manzil</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all outline-none"
                placeholder="misol@gmail.com"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-700 mb-1">Parol</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-900 text-white font-bold uppercase tracking-widest text-[11px] py-3 rounded hover:bg-primary-800 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Kutib turing...' : (isLogin ? 'Kirish' : "Ro'yxatdan o'tish")}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <hr className="w-full border-gray-200" />
            <span className="px-3 text-[10px] text-gray-400 uppercase font-bold tracking-widest">Yoki</span>
            <hr className="w-full border-gray-200" />
          </div>

          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full mt-6 bg-white border border-gray-300 text-gray-700 font-bold text-[12px] uppercase tracking-wider py-2.5 rounded hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
            Google orqali
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Akkauntingiz yo'qmi?" : "Akkauntingiz bormi?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-accent-500 font-bold hover:underline"
            >
              {isLogin ? "Ro'yxatdan o'tish" : 'Kirish'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
