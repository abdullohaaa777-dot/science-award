import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, User, Eye, Share2, Award, ChevronLeft } from 'lucide-react';

export default function ContentDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const lang = i18n.language || 'uz';

  useEffect(() => {
    const fetchContent = async () => {
      if (!slug) return;
      try {
        // Query by slug
        let q = query(collection(db, 'content'), where('slug', '==', slug), where('status', '==', 'published'));
        let snap = await getDocs(q);
        
        if (snap.empty) {
          // Fallback query by ID just in case
          const docRef = doc(db, 'content', slug);
          const q2 = query(collection(db, 'content'), where('__name__', '==', slug), where('status', '==', 'published'));
          snap = await getDocs(q2);
        }

        if (!snap.empty) {
          const docData = snap.docs[0];
          setContent({ id: docData.id, ...docData.data() });
          
          // Increment views
          updateDoc(docData.ref, { viewCount: increment(1) }).catch(console.error);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchContent();
  }, [slug]);

  if (loading) {
    return <div className="py-32 text-center text-gray-500 font-serif text-xl">Yuklanmoqda...</div>;
  }

  if (!content) {
    return (
      <div className="py-32 text-center max-w-lg mx-auto">
         <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Topilmadi</h1>
         <p className="text-gray-500 mb-8 font-serif">Kechirasiz, siz qidirayotgan material topilmadi yoki u o'chirilgan bo'lishi mumkin.</p>
         <button onClick={() => navigate(-1)} className="text-primary-900 font-sans font-bold text-[11px] uppercase tracking-widest hover:text-accent-500 flex items-center justify-center gap-2 w-full transition-colors">
            <ChevronLeft className="w-4 h-4"/> Natijalarga qaytish
         </button>
      </div>
    );
  }

  const title = content.title?.[lang] || content.title?.uz || content.title?.ru || content.title?.en;
  const body = content.body?.[lang] || content.body?.uz || content.body?.ru || content.body?.en;
  const date = content.createdAt?.seconds ? new Date(content.createdAt.seconds * 1000).toLocaleDateString() : '';

  return (
    <article className="py-16 sm:py-24 bg-[#FDFCFB]">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-10 text-center mb-16">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-8">
          <span className="bg-primary-900 text-white px-3 py-1 rounded-sm">{content.type}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-500" /> {date}</span>
          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-primary-900" /> {content.viewCount || 0}</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-primary-900 mb-10 leading-[1.1] max-w-3xl mx-auto">
          {title}
        </h1>

        <div className="flex items-center justify-center gap-6 pb-12 border-b border-gray-200">
           <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 border border-gray-200 bg-white flex items-center justify-center text-primary-900">
                <User className="w-5 h-5" />
              </div>
              <div>
                 <p className="font-bold text-primary-900 font-serif text-lg leading-tight">{content.authorName}</p>
                 <p className="text-[11px] text-gray-500 uppercase tracking-widest font-sans mt-0.5">Muallif</p>
              </div>
           </div>
        </div>
      </header>

      {/* Content Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-10 mb-20 bg-white p-8 sm:p-12 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded">
        <div className="markdown-body">
          <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-10 pb-12">
        <div className="p-8 border border-gray-200 bg-white rounded flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
           <div className="flex gap-4 w-full sm:w-auto text-[11px] font-sans font-bold uppercase tracking-widest">
             <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 border border-gray-200 text-primary-900 hover:border-accent-500 transition-colors rounded-sm">
                <Share2 className="w-4 h-4" /> Ulashish
             </button>
           </div>
           
           <div className="bg-[#FDFCFB] px-8 py-4 border border-gray-200 flex items-center gap-4 w-full sm:w-auto rounded-sm">
              <Award className="w-8 h-8 text-accent-500 shrink-0 stroke-1" />
              <div>
                <p className="text-sm text-primary-900 font-bold font-serif mb-0.5">Sertifikatlangan ish</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">Science Award tasdiqladi</p>
              </div>
           </div>
        </div>
      </footer>
    </article>
  );
}
