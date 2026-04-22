import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { BookOpen, FileText, PenTool, User, Calendar, ArrowRight } from 'lucide-react';

export default function ContentList({ overrideType = '' }: { overrideType?: string }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Type derived from URL if not overridden
  const type = overrideType || (location.pathname.includes('articles') ? 'article' : location.pathname.includes('theses') ? 'thesis' : 'poetry');
  const lang = i18n.language || 'uz';

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'content'),
          where('status', '==', 'published'),
          where('type', '==', type)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sory by created at
        results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setContents(results);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchContents();
  }, [type, lang]);

  const IconMap: Record<string, any> = {
    article: BookOpen,
    thesis: FileText,
    poetry: PenTool
  };
  const TypeIcon = IconMap[type] || FileText;

  const getTitleInfo = () => {
    switch (type) {
      case 'article': return { t: 'Ilmiy Maqolalar', d: 'Tadqiqotchilar va olimlarning chuqur tahliliy ishlari' };
      case 'thesis': return { t: 'Tezislar', d: 'Ilmiy anjumanlar uchun qisqacha ma\'lumotlar' };
      case 'poetry': return { t: 'She\'riyat', d: 'Badiiy va ijodiy ishlar to\'plami' };
      default: return { t: 'Materiallar', d: 'Barcha ruxsat etilgan materiallar' };
    }
  }

  const { t: titleText, d: descText } = getTitleInfo();

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-10">
      <div className="flex flex-col items-center text-center mb-16">
        <h1 className="text-4xl font-bold font-serif text-primary-900 mb-4">{titleText}</h1>
        <div className="w-16 border-b-2 border-accent-500 mb-6"></div>
        <p className="text-gray-600 max-w-2xl font-serif text-lg">{descText}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="bg-white rounded p-8 border border-gray-200 animate-pulse h-80 shadow-[0_4px_15px_rgba(0,0,0,0.02)]"></div>
          ))}
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center bg-white rounded p-16 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
           <p className="text-xl text-gray-500 font-serif italic">Ushbu turkumda hozircha materiallar mavjud emas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map(item => {
            const itemTitle = item.title?.[lang] || item.title?.uz || item.title?.ru || item.title?.en || 'Nomsiz';
            const itemDesc = item.shortDescription?.[lang] || item.shortDescription?.uz || item.shortDescription?.ru || item.shortDescription?.en || '';
            const date = item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : '';

            return (
              <Link to={`/content/${item.slug || item.id}`} key={item.id} className="group bg-white rounded overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:border-accent-500 transition-colors border border-gray-200 flex flex-col h-full">
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-sans font-bold text-gray-500 mb-6 uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-500" /> {date}</span>
                     <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary-900" /> {item.authorName}</span>
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold text-primary-900 mb-4 group-hover:text-accent-500 transition-colors line-clamp-3 leading-tight">
                    {itemTitle}
                  </h3>
                  
                  <p className="text-gray-600 mb-8 line-clamp-3 leading-[1.6] flex-1 font-serif">
                    {itemDesc}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-200 flex items-center justify-between text-primary-900 font-sans text-[11px] font-bold uppercase tracking-widest">
                    <span className="group-hover:text-accent-500 transition-colors">Batafsil o'qish</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-accent-500 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
