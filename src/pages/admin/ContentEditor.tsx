import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('uz');
  
  const [formData, setFormData] = useState({
    type: 'article',
    status: 'draft',
    slug: '',
    authorName: '',
    title: { uz: '', ru: '', en: '' },
    shortDescription: { uz: '', ru: '', en: '' },
    body: { uz: '', ru: '', en: '' }
  });

  useEffect(() => {
    if (id) {
      const fetchDoc = async () => {
        const d = await getDoc(doc(db, 'content', id));
        if (d.exists()) {
          setFormData(d.data() as any);
        }
      };
      fetchDoc();
    } else {
      setFormData(prev => ({ ...prev, authorName: profile?.displayName || user?.displayName || '' }));
    }
  }, [id, profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Auto-generate slug if empty
    let finalSlug = formData.slug.trim();
    if (!finalSlug && formData.title.uz) {
      finalSlug = formData.title.uz.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    const dataToSave = {
      ...formData,
      slug: finalSlug,
      updatedAt: serverTimestamp(),
      ...(id ? {} : { 
        createdAt: serverTimestamp(),
        authorId: user?.uid,
        viewCount: 0 
      })
    };

    try {
      if (id) {
        await setDoc(doc(db, 'content', id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'content'), dataToSave);
      }
      navigate('/admin/content');
    } catch (err) {
      console.error(err);
      alert('Saqlashda xatolik yuz berdi');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-2xl font-bold font-serif text-primary-900">
            {id ? 'Materialni tahrirlash' : 'Yangi material'}
          </h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-900 text-white font-sans text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-primary-800 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded space-y-6">
            
            {/* Language Switcher */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex gap-2">
                {(['uz', 'ru', 'en'] as const).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setActiveLang(l)}
                    className={`px-4 py-1.5 text-[11px] font-sans font-bold uppercase tracking-widest rounded-sm transition-colors border ${
                      activeLang === l 
                        ? 'bg-primary-900 text-white border-primary-900' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {l === 'uz' ? "O'zbekcha" : l === 'ru' ? "Ruscha" : "Inglizcha"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Sarlavha ({activeLang})</label>
              <input
                type="text"
                value={formData.title[activeLang]}
                onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value }})}
                className="w-full p-4 border border-gray-200 rounded-sm focus:border-primary-900 focus:ring-0 outline-none text-xl font-serif text-primary-900"
                placeholder="Material sarlavhasi..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Qisqacha ta'rif ({activeLang})</label>
              <textarea
                value={formData.shortDescription[activeLang]}
                onChange={e => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, [activeLang]: e.target.value }})}
                className="w-full p-4 border border-gray-200 rounded-sm focus:border-primary-900 focus:ring-0 outline-none text-sm font-serif text-gray-600 min-h-[100px] resize-y"
                placeholder="Materialning qisqacha mazmuni..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2 flex justify-between items-center">
                <span>To'liq Matn ({activeLang})</span>
                <span className="text-[10px] text-gray-400 normal-case tracking-normal">Markdown qollab-quvvatlanadi</span>
              </label>
              <textarea
                value={formData.body[activeLang]}
                onChange={e => setFormData({ ...formData, body: { ...formData.body, [activeLang]: e.target.value }})}
                className="w-full p-4 border border-gray-200 rounded-sm focus:border-primary-900 focus:ring-0 outline-none text-base font-serif text-gray-800 min-h-[500px] resize-y"
                placeholder="Bu yerga materialning to'liq matnini kiriting..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded space-y-6">
            <h3 className="font-serif font-bold text-lg text-primary-900 border-b border-gray-200 pb-3">Sozlamalar</h3>
            
            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Material Turi</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-sm bg-white focus:border-primary-900 focus:ring-0 outline-none text-sm font-sans"
              >
                <option value="article">Ilmiy Maqola</option>
                <option value="thesis">Tezis</option>
                <option value="poetry">She'riyat</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Nashr Holati</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-sm bg-white focus:border-primary-900 focus:ring-0 outline-none text-sm font-sans"
              >
                <option value="draft">Qoralama (Draft)</option>
                <option value="published">Nashr qilingan (Published)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Muallif Ismi</label>
              <input
                type="text"
                value={formData.authorName}
                onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-sm bg-white focus:border-primary-900 focus:ring-0 outline-none text-sm font-sans"
                placeholder="F.I.SH."
              />
            </div>

            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">URL Slug (Ixtiyoriy)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-sm bg-white focus:border-primary-900 focus:ring-0 outline-none text-sm font-mono text-gray-600"
                placeholder="avtomatik-yaratiladi"
              />
              <p className="text-[10px] text-gray-400 mt-1 font-sans">Agar bo'sh qoldirilsa, sarlavhadan olinadi</p>
            </div>
          </div>
          
          {/* Media placeholder */}
          <div className="bg-[#FDFCFB] p-6 border border-gray-200 border-dashed rounded text-center">
             <div className="w-12 h-12 bg-white border border-gray-200 rounded flex items-center justify-center mx-auto mb-3 text-gray-400">
               <ImageIcon className="w-6 h-6" />
             </div>
             <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-1">Media va Fayllar</p>
             <p className="text-xs text-gray-400 font-serif italic">Tez orada qo'shiladi</p>
          </div>
        </div>

      </div>
    </div>
  );
}
