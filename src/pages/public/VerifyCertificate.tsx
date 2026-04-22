import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Search, ShieldCheck, XCircle, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VerifyCertificate() {
  const { t } = useTranslation();
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!certId.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const q = query(collection(db, 'certificates'), where('certificateId', '==', certId.trim()));
      const snap = await getDocs(q);

      if (snap.empty) {
         setError('Bunday ID ga ega sertifikat tizimda topilmadi.');
      } else {
         setResult(snap.docs[0].data());
      }
    } catch (err) {
      console.error(err);
      setError('Tekshirishda xatolik yuz berdi.');
    }
    setLoading(false);
  };

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-10">
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-900 text-accent-500 rounded-sm mb-6 border border-primary-800">
            <Award className="w-8 h-8 stroke-1" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-primary-900 mb-4 tracking-tight">Sertifikatni Tekshirish</h1>
          <div className="w-16 border-b-2 border-accent-500 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-serif max-w-2xl mx-auto">Platformamizdan berilgan sertifikatlarni noyob ID raqami orqali tekshiring va haqiqiyligiga ishonch hosil qiling.</p>
        </div>

        <div className="bg-white p-8 sm:p-12 shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-200 rounded text-center relative overflow-hidden">
          {/* subtle decorative background */}
          <div className="absolute -right-8 -top-8 text-gray-50 opacity-5 pointer-events-none transform rotate-12">
            <Award className="w-64 h-64" />
          </div>

          <form onSubmit={handleVerify} className="relative z-10 max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="SA-2024-XXXX"
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-sm font-sans text-lg font-bold text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:border-primary-900 bg-[#FDFCFB] tracking-wider uppercase transition-colors outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="font-sans px-8 py-4 bg-primary-900 text-white font-bold text-[13px] uppercase tracking-widest hover:bg-primary-800 transition-all rounded-sm disabled:opacity-70 border border-primary-900 whitespace-nowrap"
              >
                {loading ? 'Izlanmoqda...' : 'Tasdiqlash'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-10 max-w-xl mx-auto p-6 bg-red-50 text-red-700 rounded-sm border border-red-100 flex items-center justify-center gap-3 relative z-10">
              <XCircle className="w-6 h-6 shrink-0" />
              <p className="font-serif">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-12 bg-[#FDFCFB] border-2 border-accent-500 rounded-sm p-8 sm:p-10 text-left relative z-10 shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                     <CheckCircle className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-sans font-bold text-lg text-primary-900 uppercase tracking-widest">Sertifikat Tasdiqlandi</h3>
                     <p className="font-serif text-gray-500 text-sm">Ushbu hujjat haqiqiy hisoblanadi</p>
                   </div>
                 </div>
                 <div className="text-right hidden sm:block">
                   <p className="font-sans text-[10px] uppercase font-bold text-gray-400 tracking-widest">Sertifikat ID</p>
                   <p className="font-sans font-bold text-primary-900 font-mono mt-1">{result.certificateId}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">Muallif</p>
                  <p className="font-serif font-bold text-xl text-primary-900">{result.authorName}</p>
                </div>
                <div>
                  <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">Sana</p>
                  <p className="font-serif font-bold text-xl text-primary-900">
                    {result.createdAt?.seconds ? new Date(result.createdAt.seconds * 1000).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">Material Sarlavhasi</p>
                  <p className="font-serif text-lg text-gray-800 border-l-2 border-accent-500 pl-4 py-1 italic">
                    {result.contentTitle || 'Ilmiy ish'}
                  </p>
                  <span className="inline-block mt-3 bg-[#EEE] px-2 py-1 rounded text-[11px] text-gray-600 uppercase tracking-widest font-sans font-bold">{result.type}</span>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center text-center sm:text-left">
                {result.pdfUrl && (
                  <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer" className="font-sans font-bold text-[11px] uppercase tracking-widest px-6 py-2.5 bg-primary-900 text-white rounded-sm hover:bg-primary-800 transition-colors w-full sm:w-auto">
                     Sertifikatni yuklab olish
                  </a>
                )}
                {result.contentId && (
                  <Link to={`/content/${result.contentId}`} className="font-sans text-[11px] font-bold uppercase tracking-widest text-primary-900 hover:text-accent-500 flex items-center justify-center gap-2 transition-colors w-full sm:w-auto">
                    Materialni o'qish &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
