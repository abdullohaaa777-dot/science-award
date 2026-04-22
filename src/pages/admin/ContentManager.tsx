import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Edit2, Plus, Trash2, Award, Eye, Copy, Check } from 'lucide-react';
import CertificateModal from '../../components/admin/CertificateModal';

export default function ContentManager() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [certContent, setCertContent] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setContents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if(!window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, 'content', id));
      fetchContents();
    } catch (err) {
      console.error(err);
      alert('Xatolik');
    }
  };

  const copyLink = (item: any) => {
    const slug = item.slug || item.id;
    const url = `${window.location.origin}/content/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-primary-900">Kontent Boshqaruvi</h2>
          <p className="text-gray-500 font-serif italic text-sm mt-1">Maqola, tezis va she'rlarni boshqaring</p>
        </div>
        <Link 
          to="/admin/content/new" 
          className="bg-primary-900 text-white font-sans text-[11px] font-bold uppercase tracking-widest px-6 py-3 rounded-sm hover:bg-primary-800 transition-colors flex items-center gap-2 border border-primary-900"
        >
          <Plus className="w-4 h-4" />
          Yangi Qo'shish
        </Link>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFCFB] border-b border-gray-200 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <th className="px-6 py-4 border-r border-gray-200">Sarlavha</th>
                <th className="px-6 py-4 border-r border-gray-200">Turi</th>
                <th className="px-6 py-4 border-r border-gray-200">Holati</th>
                <th className="px-6 py-4 border-r border-gray-200">Ko'rishlar</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm font-serif">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Yuklanmoqda...</td>
                </tr>
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Hozircha materiallar yo'q</td>
                </tr>
              ) : (
                contents.map(item => (
                  <tr key={item.id} className="hover:bg-[#FDFCFB] transition-colors">
                    <td className="px-6 py-4 border-r border-gray-200">
                      <div className="font-bold text-primary-900 max-w-xs sm:max-w-md truncate">
                        {item.title?.uz || item.title?.ru || item.title?.en || 'Nomsiz'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 italic">{item.authorName}</div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                       <span className="font-sans font-bold text-[10px] uppercase tracking-widest bg-gray-100 px-2 py-1 rounded text-primary-900 border border-gray-200">
                         {item.type}
                       </span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <span className={`font-sans font-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded inline-block border ${
                        item.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200 text-gray-500 font-sans font-medium">{item.viewCount || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => copyLink(item)} className="text-gray-400 hover:text-green-600 p-2 border border-transparent hover:border-green-600 rounded transition-colors inline-block tooltip" title="Nusxalash">
                        {copiedId === item.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setCertContent(item)} className="text-gray-400 hover:text-accent-500 p-2 border border-transparent hover:border-accent-500 rounded transition-colors inline-block tooltip" title="Sertifikat">
                        <Award className="w-4 h-4" />
                      </button>
                      <Link to={`/admin/content/edit/${item.id}`} className="text-gray-400 hover:text-blue-500 p-2 border border-transparent hover:border-blue-500 rounded transition-colors inline-block mt-0">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 p-2 border border-transparent hover:border-red-500 rounded transition-colors inline-block mt-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {certContent && (
        <CertificateModal content={certContent} onClose={() => setCertContent(null)} />
      )}
    </div>
  );
}
