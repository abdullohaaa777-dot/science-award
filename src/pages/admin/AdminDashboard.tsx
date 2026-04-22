import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { FileText, Users, Award, Eye, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalContent: 0,
    totalViews: 0,
    totalCertificates: 0,
    totalUsers: 0
  });
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch content stats
        const contentSnap = await getDocs(collection(db, 'content'));
        const contents = contentSnap.docs.map(d => d.data());
        const totalContent = contents.length;
        const totalViews = contents.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);

        // Fetch certificates stats
        const certSnap = await getDocs(collection(db, 'certificates'));
        const totalCertificates = certSnap.size;

        // Fetch recent content
        const recentQ = query(collection(db, 'content'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);
        const recent = recentSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setStats({
          totalContent,
          totalViews,
          totalCertificates,
          totalUsers: 0 // Fetch users if necessary
        });
        setRecentContent(recent);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-primary-900 font-serif">Yuklanmoqda...</div>;
  }

  const statCards = [
    { title: 'Jami Materiallar', value: stats.totalContent, icon: FileText, color: 'text-primary-900', bg: 'bg-[#FDFCFB]' },
    { title: 'Jami Ko\'rishlar', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-primary-900', bg: 'bg-[#FDFCFB]' },
    { title: 'Berilgan Sertifikatlar', value: stats.totalCertificates, icon: Award, color: 'text-primary-900', bg: 'bg-[#FDFCFB]' },
    { title: 'Foydalanuvchilar', value: '---', icon: Users, color: 'text-primary-900', bg: 'bg-[#FDFCFB]' }, // Placeholder
  ];

  return (
    <div className="space-y-8">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded flex flex-col justify-between items-start text-left">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 border border-gray-200 flex items-center justify-center rounded">
                 <stat.icon className={`w-5 h-5 ${stat.color}`} />
               </div>
               <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-gray-500">{stat.title}</p>
             </div>
             <p className="text-3xl font-serif font-bold text-primary-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Content */}
      <div className="bg-white border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-primary-900">So'nggi qo'shilgan materiallar</h2>
          <Link to="/admin/content" className="font-sans text-[11px] font-bold uppercase tracking-widest text-primary-900 hover:text-accent-500 transition-colors flex items-center gap-1">
            Barchasini ko'rish <ArrowRight className="w-4 h-4 text-accent-500" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFCFB] border-b border-gray-200 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <th className="py-4 px-6 border-r border-gray-200">Sarlavha & Muallif</th>
                <th className="py-4 px-6 border-r border-gray-200">Turkum</th>
                <th className="py-4 px-6 border-r border-gray-200">Holat</th>
                <th className="py-4 px-6 text-right">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-serif text-sm">
              {recentContent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 italic">Hozircha materiallar yo'q</td>
                </tr>
              ) : (
                recentContent.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDFCFB] transition-colors">
                    <td className="py-4 px-6 border-r border-gray-200">
                      <p className="font-medium text-primary-900 mb-1 max-w-md truncate">
                        {item.title?.uz || item.title?.ru || item.title?.en || 'Nomsiz'}
                      </p>
                      <p className="text-gray-500 text-xs italic">{item.authorName}</p>
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200">
                      <span className="font-sans font-bold text-[10px] uppercase tracking-widest bg-gray-100 px-2 py-1 rounded text-primary-900 border border-gray-200">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200">
                      <span className={`font-sans font-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${
                        item.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-500 whitespace-nowrap text-xs">
                      {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
