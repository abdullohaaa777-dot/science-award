import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, User, Eye, Share2, Award, ChevronLeft, DownloadCloud, FileText, FileBadge, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        let q = query(collection(db, 'content'), where('slug', '==', slug), where('status', '==', 'published'));
        let snap = await getDocs(q);
        
        if (snap.empty) {
          const q2 = query(collection(db, 'content'), where('__name__', '==', slug), where('status', '==', 'published'));
          snap = await getDocs(q2);
        }

        if (!snap.empty) {
          const docData = snap.docs[0];
          setContent({ id: docData.id, ...docData.data() });
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

  const title = content.citation_title || content.title?.[lang] || content.title?.uz || content.title?.ru || content.title?.en;
  const abstractText = content.shortDescription?.[lang] || content.shortDescription?.uz || content.shortDescription?.en || '';
  const body = content.body?.[lang] || content.body?.uz || content.body?.ru || content.body?.en;
  const date = content.citation_publication_date || (content.createdAt?.seconds ? new Date(content.createdAt.seconds * 1000).toLocaleDateString() : '');
  const url = window.location.href;
  
  const isScientific = ['article', 'thesis', 'conference_paper', 'research'].includes(content.type);

  return (
    <article className="py-16 sm:py-24 bg-[#FDFCFB] min-h-screen">
      <header className="max-w-4xl mx-auto px-4 sm:px-10 text-center mb-12">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-8">
          <span className="bg-primary-900 text-white px-3 py-1 rounded-sm">{content.type.replace('_', ' ')}</span>
          {date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent-500" /> {date}</span>}
          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-primary-900" /> {content.viewCount || 0}</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-5xl font-serif font-bold text-primary-900 mb-8 leading-[1.2] max-w-4xl mx-auto">
          {title}
        </h1>

        {isScientific && (
           <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                 {content.citation_authors && content.citation_authors.length > 0 ? (
                    content.citation_authors.map((author: string, idx: number) => (
                      <span key={idx} className="text-lg font-serif font-bold text-primary-800">
                         {author}{idx < content.citation_authors.length - 1 ? ',' : ''}
                      </span>
                    ))
                 ) : (
                    <span className="text-lg font-serif font-bold text-primary-800">{content.authorName}</span>
                 )}
              </div>
              {content.author_affiliations && content.author_affiliations.length > 0 && (
                <div className="flex flex-col items-center gap-1 text-sm font-sans text-gray-500 italic px-4">
                   {content.author_affiliations.map((affil: string, idx: number) => (
                      <span key={idx}><sup>{idx+1}</sup> {affil}</span>
                   ))}
                </div>
              )}
           </div>
        )}

        {!isScientific && (
           <div className="flex items-center justify-center gap-6 pb-8">
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
        )}
      </header>

      {/* Access buttons for scientific publications */}
      {(content.pdf_url || content.doi) && (
        <div className="max-w-4xl mx-auto px-4 sm:px-10 mb-12 flex flex-wrap justify-center gap-4">
           {content.pdf_url && (
             <a href={content.pdf_url} target="_blank" rel="noopener noreferrer" className="bg-primary-900 text-white font-sans text-[11px] font-bold uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-primary-800 transition-colors flex items-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
               <DownloadCloud className="w-4 h-4" /> Download PDF
             </a>
           )}
           {content.doi && (
             <a href={`https://doi.org/${content.doi}`} target="_blank" rel="noopener noreferrer" className="bg-white text-primary-900 border border-gray-300 font-sans text-[11px] font-bold uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
               <LinkIcon className="w-4 h-4" /> DOI: {content.doi}
             </a>
           )}
        </div>
      )}

      {/* Abstract and Metadata Panel */}
      {isScientific && abstractText && (
        <div className="max-w-4xl mx-auto px-4 sm:px-10 mb-12">
           <div className="bg-white p-8 sm:p-10 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded">
              <h3 className="font-sans font-bold text-[11px] uppercase tracking-widest text-primary-900 mb-4 border-b border-gray-100 pb-2">Abstract (Annotatsiya)</h3>
              <p className="text-gray-700 font-serif leading-relaxed text-lg mb-8">{abstractText}</p>
              
              {content.keywords && content.keywords.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-3">Keywords / Kalit so'zlar</h4>
                  <div className="flex flex-wrap gap-2">
                     {content.keywords.map((kw: string, idx: number) => (
                       <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-[4px] text-xs font-sans">{kw}</span>
                     ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-100 text-sm font-sans">
                 {content.journal_title && (
                   <div><span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Journal</span> <span className="font-medium text-primary-900">{content.journal_title}</span></div>
                 )}
                 {content.conference_title && (
                   <div><span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Conference</span> <span className="font-medium text-primary-900">{content.conference_title}</span></div>
                 )}
                 {(content.volume || content.issue) && (
                   <div>
                     <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Volume/Issue</span> 
                     <span className="font-medium text-primary-900">{content.volume ? `Vol. ${content.volume}` : ''} {content.issue ? `Issue ${content.issue}` : ''}</span>
                   </div>
                 )}
                 {content.pages && (
                   <div><span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Pages</span> <span className="font-medium text-primary-900">{content.pages}</span></div>
                 )}
                 {content.language && (
                   <div><span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Language</span> <span className="font-medium text-primary-900 uppercase">{content.language}</span></div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Main Full Text Content */}
      {body && (
      <div className="max-w-4xl mx-auto px-4 sm:px-10 mb-20 bg-white p-8 sm:p-12 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded">
        <div className="markdown-body font-serif">
          <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
        </div>
      </div>
      )}

      {/* How to cite block */}
      {isScientific && (
      <div className="max-w-4xl mx-auto px-4 sm:px-10 mb-12">
        <div className="bg-[#F8FBFF] p-8 border border-blue-100 rounded">
           <h3 className="font-sans font-bold text-[11px] uppercase tracking-widest text-primary-900 mb-3 block">Iqtibos keltirish (How to cite)</h3>
           <div className="bg-white p-4 border border-gray-200 rounded text-sm font-serif text-gray-700 leading-relaxed shadow-sm">
             {content.citation_authors?.join(', ') || content.authorName} ({date?.split('/')[0] || new Date().getFullYear()}). {title}. 
             {content.journal_title ? ` ${content.journal_title}` : ''} 
             {content.conference_title ? ` ${content.conference_title}` : ''}
             {content.volume ? `, ${content.volume}` : ''}
             {content.issue ? `(${content.issue})` : ''}
             {content.pages ? `, ${content.pages}` : ''}.
             {content.doi ? ` https://doi.org/${content.doi}` : ''}
           </div>
        </div>
      </div>
      )}

      {/* Footer Actions */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-10 pb-12">
        <div className="p-8 border border-gray-200 bg-white rounded flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
           <div className="flex gap-4 w-full sm:w-auto text-[11px] font-sans font-bold uppercase tracking-widest">
             <button 
                onClick={() => navigator.clipboard.writeText(url)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 border border-gray-200 text-primary-900 hover:border-accent-500 transition-colors rounded-sm"
             >
                <Share2 className="w-4 h-4" /> Nusxalar (Copy Link)
             </button>
           </div>
           
           <div className="bg-[#FDFCFB] px-8 py-4 border border-gray-200 flex items-center gap-4 w-full sm:w-auto rounded-sm">
              <Award className="w-8 h-8 text-accent-500 shrink-0 stroke-1" />
              <div>
                <p className="text-sm text-primary-900 font-bold font-serif mb-0.5">Sertifikatlangan / Tasdiqlangan</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">Science Award Platformasi</p>
              </div>
           </div>
        </div>
      </footer>
    </article>
  );
}
