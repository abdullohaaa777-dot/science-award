import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Save, ArrowLeft, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('uz');
  
  const [formData, setFormData] = useState<any>({
    type: 'article',
    status: 'draft',
    slug: '',
    authorName: '',
    title: { uz: '', ru: '', en: '' },
    shortDescription: { uz: '', ru: '', en: '' },
    body: { uz: '', ru: '', en: '' },
    
    // Scholar Specific Fields
    citation_title: '',
    citation_authors: [],
    author_affiliations: [],
    citation_publication_date: '',
    journal_title: '',
    conference_title: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    keywords: [],
    language: 'uz',
    pdf_url: '',
    scholar_visible: false,
    
    // UI Helpers
    tagsInput: '',
    authorsInput: '',
    affiliationsInput: ''
  });

  useEffect(() => {
    if (id) {
      const fetchDoc = async () => {
        const d = await getDoc(doc(db, 'content', id));
        if (d.exists()) {
          const data = d.data() as any;
          setFormData({
            ...formData,
            ...data,
            tagsInput: data.keywords ? data.keywords.join(', ') : '',
            authorsInput: data.citation_authors ? data.citation_authors.join(', ') : '',
            affiliationsInput: data.author_affiliations ? data.author_affiliations.join('; ') : ''
          });
        }
      };
      fetchDoc();
    } else {
      setFormData((prev: any) => ({ ...prev, authorName: profile?.displayName || user?.displayName || '' }));
    }
  }, [id, profile, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Faqat PDF formatdagi fayllar qabul qilinadi!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Fayl hajmi 5MB dan oshmasligi kerak!");
      return;
    }

    const storageRef = ref(storage, `pdfs/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Yuklashda xatolik:", error);
        alert("Fayl yuklashda xatolik yuz berdi");
        setUploadProgress(0);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData((prev: any) => ({ ...prev, pdf_url: downloadURL }));
        setUploadProgress(0);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Auto-generate slug if empty
    let finalSlug = formData.slug?.trim() || '';
    if (!finalSlug && formData.title.uz) {
      finalSlug = formData.title.uz.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const isScientific = ['article', 'thesis', 'conference_paper', 'research'].includes(formData.type);
    
    if (isScientific && formData.status === 'published') {
      let draftData = { ...formData };
      if (!draftData.citation_title) draftData.citation_title = draftData.title.uz || draftData.title.en;
      if (!draftData.citation_publication_date) {
         // YYYY/MM/DD
         const d = new Date();
         draftData.citation_publication_date = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
      }
      if (!draftData.authorsInput && !draftData.authorName) {
        alert("Scholar uchun kamida bir nafar muallif ko'rsatilishi shart!");
        setLoading(false);
        return;
      }
      setFormData(draftData);
    }

    const dataToSave = {
      ...formData,
      slug: finalSlug,
      keywords: formData.tagsInput ? formData.tagsInput.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
      citation_authors: formData.authorsInput ? formData.authorsInput.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
      author_affiliations: formData.affiliationsInput ? formData.affiliationsInput.split(';').map((k: string) => k.trim()).filter(Boolean) : [],
      updatedAt: serverTimestamp(),
      ...(id ? {} : { 
        createdAt: serverTimestamp(),
        authorId: user?.uid,
        viewCount: 0 
      })
    };
    
    // Remove UI helpers
    delete dataToSave.tagsInput;
    delete dataToSave.authorsInput;
    delete dataToSave.affiliationsInput;

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

  const isScientific = ['article', 'thesis', 'conference_paper', 'research'].includes(formData.type);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
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
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Qisqacha ta'rif / Annotatsiya (Abstract) ({activeLang})</label>
              <textarea
                value={formData.shortDescription[activeLang]}
                onChange={e => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, [activeLang]: e.target.value }})}
                className="w-full p-4 border border-gray-200 rounded-sm focus:border-primary-900 focus:ring-0 outline-none text-sm font-serif text-gray-600 min-h-[100px] resize-y"
                placeholder="Materialning qisqacha mazmuni yoki ilmiy annotatsiyasi..."
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

          {/* Scholar Metadata Section */}
          {isScientific && (
          <div className="bg-[#F8FBFF] p-6 border border-blue-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded space-y-6">
             <h3 className="font-serif font-bold text-xl text-primary-900 mb-2">Google Scholar Metadata</h3>
             <p className="text-gray-500 text-sm font-serif mb-6">Ilmiy ishning indeksatsiyasi uchun zarur bo'lgan bibliografik ma'lumotlar.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Asosiy Sarlavha (Citation Title)</label>
                  <input type="text" value={formData.citation_title} onChange={e => setFormData({...formData, citation_title: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white" placeholder="Masalan: Quantum Computing in 2026..." />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Nashr qilingan sana format: YYYY/MM/DD</label>
                  <input type="text" value={formData.citation_publication_date} onChange={e => setFormData({...formData, citation_publication_date: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white" placeholder="2026/04/22" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Mualliflar (Vergul bilan ajrating)</label>
                  <input type="text" value={formData.authorsInput} onChange={e => setFormData({...formData, authorsInput: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white" placeholder="F. Ism, F. Ism 2..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Affiliatsiyalar (Nuqtali vergul bilan ajrating)</label>
                  <input type="text" value={formData.affiliationsInput} onChange={e => setFormData({...formData, affiliationsInput: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white" placeholder="Tashkent State University; National University of Uzbekistan..." />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Kalit so'zlar (Vergul bilan ajrating)</label>
                  <input type="text" value={formData.tagsInput} onChange={e => setFormData({...formData, tagsInput: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white" placeholder="SEO, Scholar, Science..." />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">DOI (Mavjud bo'lsa)</label>
                  <input type="text" value={formData.doi} onChange={e => setFormData({...formData, doi: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white" placeholder="10.1000/xyz123" />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Jurnal yoki Nashr Nomi</label>
                  <input type="text" value={formData.journal_title} onChange={e => setFormData({...formData, journal_title: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white" placeholder="Science Award Journal" />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Konferensiya Nomi (Agar tezis/konf. bo'lsa)</label>
                  <input type="text" value={formData.conference_title} onChange={e => setFormData({...formData, conference_title: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Tom (Volume) & Nashr (Issue)</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} className="w-1/2 p-3 border border-gray-200 rounded-sm bg-white" placeholder="Vol. 1" />
                    <input type="text" value={formData.issue} onChange={e => setFormData({...formData, issue: e.target.value})} className="w-1/2 p-3 border border-gray-200 rounded-sm bg-white" placeholder="Issue 2" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Sahifalar (Masalan: 12-18)</label>
                  <input type="text" value={formData.pages} onChange={e => setFormData({...formData, pages: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white" placeholder="12-18" />
                </div>
             </div>
             
             <div className="mt-4 flex items-center gap-3 bg-white p-4 border border-blue-100 rounded">
                <input type="checkbox" id="scholar_visible" checked={formData.scholar_visible} onChange={e => setFormData({...formData, scholar_visible: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-gray-300" />
                <label htmlFor="scholar_visible" className="text-sm font-sans font-bold text-primary-900 cursor-pointer">Google Scholar Crawlerlariga ruxsat berish (Public & Indexable)</label>
             </div>
          </div>
          )}
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
                <option value="conference_paper">Konferensiya Materiali</option>
                <option value="research">Ilmiy Ish</option>
                <option value="poetry">She'riyat</option>
                <option value="news">Yangilik / Post</option>
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
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Umumiy Muallif</label>
              <input
                type="text"
                value={formData.authorName}
                onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-sm bg-white focus:border-primary-900 focus:ring-0 outline-none text-sm font-sans"
                placeholder="F.I.SH."
              />
            </div>

            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Asosiy Til</label>
              <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full p-3 border border-gray-200 rounded-sm bg-white text-sm font-sans">
                 <option value="uz">O'zbek</option>
                 <option value="ru">Rus</option>
                 <option value="en">Ingliz</option>
              </select>
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
            </div>
          </div>
          
          {/* PDF files section */}
          {isScientific && (
          <div className="bg-[#FDFCFB] p-6 border border-gray-200 border-dashed rounded text-center">
             <div className="w-12 h-12 bg-white border border-gray-200 rounded flex items-center justify-center mx-auto mb-3 text-gray-400">
               <UploadCloud className="w-6 h-6" />
             </div>
             <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500 mb-2">Public PDF Faylni Yuklang</p>
             <p className="text-[10px] text-gray-400 font-sans mb-4">Maksimal hajm: 5MB. PDF "Searchable Text" bo'lishi shart.</p>
             
             <label className="cursor-pointer border border-primary-900 text-primary-900 px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-primary-50 transition-colors inline-block">
                Fayl Tanlash
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
             </label>
             
             {uploadProgress > 0 && <p className="text-xs mt-3 text-blue-600 font-bold">{uploadProgress.toFixed(0)}% yuklanmoqda...</p>}
             
             {formData.pdf_url && (
               <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-xs text-left break-all">
                  PDF yuklangan: <a href={formData.pdf_url} target="_blank" rel="noreferrer" className="underline font-bold">Ko'rish</a>
               </div>
             )}
          </div>
          )}
        </div>

      </div>
    </div>
  );
}
