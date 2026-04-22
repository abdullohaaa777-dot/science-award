import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, FileText, PenTool, Award, Search } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-[#FDFCFB] text-primary-900 border-b border-gray-200 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif leading-[1.1] mb-6 text-primary-900 max-w-4xl">
            O‘zbekistonda raqamli iqtisodiyotni rivojlantirishning <span className="text-accent-500">strategik</span> yo‘nalishlari.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-[1.6] max-w-3xl font-serif">
            Science Award – olimlar, tadqiqotchilar va ijodkorlar uchun nufuzli platforma. Xalqaro ko'lamdagi tadqiqotlar va tezislaringizni nashr qiling hamda rasmiy sertifikatlarga ega bo‘ling.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/articles" className="inline-flex font-sans items-center justify-center gap-2 px-8 py-3.5 bg-primary-900 hover:bg-primary-800 text-white font-bold text-xs uppercase tracking-widest transition-colors rounded-sm">
              Ilimiy Maqolalar
            </Link>
            <div className="relative w-full sm:w-80 mt-4 sm:mt-0 font-sans">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="MATERIAL IZLASH..." 
                className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:border-primary-900 bg-white text-xs font-bold uppercase tracking-widest outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white border-b border-gray-200 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="flex flex-wrap justify-between items-center gap-6 text-center divide-x divide-gray-200">
            <div className="flex-1 px-4">
              <p className="text-3xl font-bold text-primary-900 mb-1 leading-none">14.2k</p>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Maqolalar</p>
            </div>
            <div className="flex-1 px-4 border-l border-gray-200">
              <p className="text-3xl font-bold text-primary-900 mb-1 leading-none">8.9k</p>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tezislar</p>
            </div>
            <div className="flex-1 px-4 border-l border-gray-200">
              <p className="text-3xl font-bold text-primary-900 mb-1 leading-none">3.1k</p>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Mualliflar</p>
            </div>
            <div className="flex-1 px-4 border-l border-gray-200">
              <p className="text-3xl font-bold text-primary-900 mb-1 leading-none">5.2k</p>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Sertifikatlar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Categories */}
      <section className="py-24 bg-[#FDFCFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-primary-900 mb-4">Mavzular va Kategoriyalar</h2>
            <p className="text-gray-600 text-lg font-serif">Ilmiy ishlaringizni mutaxassislar sinovidan o‘tgan platformada yoriting.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Articles */}
            <Link to="/articles" className="group bg-white p-8 border border-gray-200 hover:border-accent-500 transition-colors flex flex-col h-full shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
              <div className="mb-6 text-primary-900">
                <BookOpen className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary-900 mb-3 group-hover:text-accent-500 transition-colors">Ilmiy Maqolalar</h3>
              <p className="text-gray-600 leading-[1.6] text-sm mb-6 flex-1 font-serif">Turli sohalardagi chuqur tahliliy maqolalar ro‘yxati va xalqaro miqyosdagi ishlarga kirish.</p>
              <span className="font-sans text-[11px] uppercase tracking-widest font-bold text-primary-900 flex items-center gap-2 group-hover:text-accent-500 transition-colors mt-auto">
                Batafsil <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* Theses */}
            <Link to="/theses" className="group bg-white p-8 border border-gray-200 hover:border-accent-500 transition-colors flex flex-col h-full shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
              <div className="mb-6 text-primary-900">
                <FileText className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary-900 mb-3 group-hover:text-accent-500 transition-colors">Xalqaro Tezislar</h3>
              <p className="text-gray-600 leading-[1.6] text-sm mb-6 flex-1 font-serif">Ilmiy anjumanlar va konferensiyalar uchun tayyorlangan qisqa metrajdagi izlanishlar bayoni.</p>
              <span className="font-sans text-[11px] uppercase tracking-widest font-bold text-primary-900 flex items-center gap-2 group-hover:text-accent-500 transition-colors mt-auto">
                Batafsil <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* Poems */}
            <Link to="/poems" className="group bg-white p-8 border border-gray-200 hover:border-accent-500 transition-colors flex flex-col h-full shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
              <div className="mb-6 text-primary-900">
                <PenTool className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary-900 mb-3 group-hover:text-accent-500 transition-colors">Badiiy She'riyat</h3>
              <p className="text-gray-600 leading-[1.6] text-sm mb-6 flex-1 font-serif">Adabiyot shinavandalari va lirik shaxslar uchun badiiy bezaklangan nazm na'munalari.</p>
              <span className="font-sans text-[11px] uppercase tracking-widest font-bold text-primary-900 flex items-center gap-2 group-hover:text-accent-500 transition-colors mt-auto">
                Batafsil <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Certificate Banner Section */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div style={{ background: 'linear-gradient(135deg, var(--color-primary-900) 0%, #00152e 100%)' }} className="rounded relative overflow-hidden text-white flex flex-col md:flex-row shadow-lg">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <span style={{ fontSize: '300px' }}>✓</span>
            </div>
            
            <div className="p-10 md:p-16 relative z-10 flex-1">
              <div className="inline-block px-3 py-1 bg-white/10 text-accent-500 font-sans text-[10px] font-bold uppercase tracking-widest rounded-sm mb-6 border border-white/20">
                Sertifikatsiya
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-6 leading-[1.2]">
                Isbotlangan Mukammallik
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-[1.6] font-serif max-w-xl">
                Qabul qilingan har bir material noyob identifikator va xavfsiz tasdiqlash sahifasi bilan himoyalangan maxsus xalqaro sertifikatga ega bo'ladi.
              </p>
              <Link to="/verify" className="inline-flex font-sans items-center justify-center gap-2 px-8 py-3.5 bg-accent-500 text-white font-bold text-[11px] uppercase tracking-widest hover:bg-accent-600 transition-colors rounded-sm">
                Sertifikatni Tekshirish
              </Link>
            </div>
            
            {/* Visual offset */}
            <div className="hidden md:flex flex-1 items-center justify-center p-10 relative z-10">
              <div className="w-full max-w-sm aspect-[1.414] bg-[#FDFCFB] border border-[#E5E7EB] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 flex flex-col items-center justify-center relative transform rotate-3">
                <div className="absolute inset-2 border-2 border-double border-gray-300 pointer-events-none"></div>
                <Award className="w-12 h-12 text-accent-500 mb-4 stroke-1" />
                <h3 className="font-serif text-xl font-bold text-primary-900 mb-2 uppercase tracking-[0.2em] text-center">Certificate</h3>
                <div className="w-2/3 border-b border-gray-300 pb-2 mb-3 text-center text-lg font-serif italic text-gray-800">Of Achievement</div>
                <div className="flex justify-between w-full px-8 mt-4">
                  <div className="w-12 border-b border-gray-300"></div>
                  <div className="w-12 border-b border-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
