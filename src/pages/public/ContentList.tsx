import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { BookOpen, FileText, PenTool, User, Calendar, ArrowRight, Library, Search } from 'lucide-react';

export default function ContentList({ overrideType = '' }: { overrideType?: string }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');

  const type = overrideType || (location.pathname.includes('articles') ? 'article' : location.pathname.includes('theses') ? 'thesis' : location.pathname.includes('conference') ? 'conference_paper' : 'poetry');
  const lang = i18n.language || 'uz';

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        let q;
        if (type === 'archive' || type === 'author' || type === 'scholar') {
          // All published
          q = query(collection(db, 'content'), where('status', '==', 'published'));
        } else {
          q = query(
            collection(db, 'content'),
            where('status', '==', 'published'),
            where('type', '==', type)
          );
        }
        
        const snapshot = await getDocs(q);
        let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        // Secondary client-side filters to avoid missing index errors in Firestore
        if (type === 'scholar') {
          results = results.filter((r: any) => r.scholar_visible === true);
        }

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
    conference_paper: Library,
    poetry: PenTool,
    scholar: BookOpen,
    archive: Library
  };
  const TypeIcon = IconMap[type] || FileText;

  const getTitleInfo = () => {
    switch (type) {
      case 'article': return { t: 'Ilmiy Maqolalar', d: 'Tadqiqotchilar va olimlarning chuqur tahliliy ishlari' };
      case 'thesis': return { t: 'Tezislar', d: 'Ilmiy anjumanlar uchun qisqacha ma\'lumotlar' };
      case 'conference_paper': return { t: 'Konferensiya Materiallari', d: "Anjumanlar t'oplami va dokladlar" };
      case 'poetry': return { t: 'She\'riyat', d: 'Badiiy va ijodiy ishlar to\'plami' };
      case 'scholar': return { t: 'Ilmiy Baza (Scholar)', d: 'To\'liq indeksatsiyalanadigan ilmiy nashrlar kutubxonasi' };
      case 'archive': return { t: 'Arxiv', d: 'Barcha nasr etilgan ilmiy va badiiy ishlar arxivi' };
      case 'author': return { t: 'Mualliflar', d: 'Platformada e\'lon qilingan maqolalar mualliflari katalogi' };
      default: return { t: 'Materiallar', d: 'Barcha ruxsat etilgan materiallar' };
    }
  }

  const { t: titleText, d: descText } = getTitleInfo();
  
  // Filter for search
  const filteredContents = contents.filter(item => {
     if(!searchTerm) return true;
     const searchLower = searchTerm.toLowerCase();
     const tUz = item.title?.uz?.toLowerCase() || '';
     const cTitle = (item.citation_title || '').toLowerCase();
     const kws = (item.keywords || []).join(' ').toLowerCase();
     const auth = (item.citation_authors?.join(' ') || item.authorName || '').toLowerCase();
     return tUz.includes(searchLower) || cTitle.includes(searchLower) || kws.includes(searchLower) || auth.includes(searchLower);
  });

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-10 min-h-screen">
      <div className="flex flex-col items-center text-center mb-16">
        <h1 className="text-4xl font-bold font-serif text-primary-900 mb-4">{titleText}</h1>
        <div className="w-16 border-b-2 border-accent-500 mb-6"></div>
        <p className="text-gray-600 max-w-2xl font-serif text-lg">{descText}</p>
        
        {['scholar', 'archive', 'article', 'thesis', 'conference_paper'].includes(type) && (
          <div className="mt-8 max-w-2xl w-full flex items-center bg-white border border-gray-300 rounded px-4 py-2 shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-shadow">
             <Search className="w-5 h-5 text-gray-400 mr-2" />
             <input type="text" placeholder="Sarlavha, muallif, kalit so'z bo'yicha qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-serif p-2" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="bg-white rounded p-8 border border-gray-200 animate-pulse h-80 shadow-[0_4px_15px_rgba(0,0,0,0.02)]"></div>
          ))}
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="text-center bg-white rounded p-16 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
           <p className="text-xl text-gray-500 font-serif italic">Hozircha materiallar topilmadi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map(item => {
            const itemTitle = item.citation_title || item.title?.[lang] || item.title?.uz || item.title?.ru || item.title?.en || 'Nomsiz';
            const itemDesc = item.shortDescription?.[lang] || item.shortDescription?.uz || item.shortDescription?.ru || item.shortDescription?.en || '';
            const date = item.citation_publication_date || (item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : '');
            
            // Build the appropriate link based on type to comply with Scholar URLs
            const linkPrefix = item.type === 'thesis' ? '/theses/' : item.type === 'conference_paper' ? '/conference-papers/' : item.type === 'poetry' ? '/poems/' : '/articles/';

            return (
              <a href={`${linkPrefix}${item.slug || item.id}`} key={item.id} className="group bg-white rounded overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:border-accent-500 transition-colors border border-gray-200 flex flex-col h-full transform hover:-translate-y-1 duration-300">
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-sans font-bold text-gray-500 mb-4 uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-500" /> {date}</span>
                     <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-400">{item.type.replace('_', ' ')}</span>
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold text-primary-900 mb-4 group-hover:text-accent-500 transition-colors line-clamp-3 leading-[1.3]">
                    {itemTitle}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-serif italic mb-6">
                     <User className="w-4 h-4" />
                     <span className="line-clamp-1">{item.citation_authors?.join(', ') || item.authorName}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-8 line-clamp-3 leading-[1.6] flex-1 font-serif text-sm">
                    {itemDesc}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-200 flex items-center justify-between text-primary-900 font-sans text-[11px] font-bold uppercase tracking-widest">
                    <span className="group-hover:text-accent-500 transition-colors">Maqolani o'qish</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-accent-500 transition-all" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
