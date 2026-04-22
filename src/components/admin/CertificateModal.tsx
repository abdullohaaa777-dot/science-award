import React, { useRef, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { X, Download, Loader2, Trophy } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';

interface CertificateModalProps {
  content: any;
  onClose: () => void;
}

export default function CertificateModal({ content, onClose }: CertificateModalProps) {
  const [loading, setLoading] = useState(false);
  const [certId, setCertId] = useState(`SA-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const certRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // 1. Save record in Firestore
      await setDoc(doc(db, 'certificates', certId), {
        certificateId: certId,
        contentId: content.id,
        contentTitle: content.title?.uz || content.title?.en || content.title?.ru || 'Material',
        authorName: content.authorName,
        type: content.type,
        createdAt: serverTimestamp(),
      });

      // 2. Generate PDF using html-to-image & jsPDF
      if (certRef.current) {
        const dataUrl = await toPng(certRef.current, { cacheBust: true, pixelRatio: 3 });
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1000, 700]
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, 1000, 700);
        pdf.save(`${certId}.pdf`);
      }
      
      alert("Sertifikat muvaffaqiyatli saqlandi va yuklab olindi!");
      onClose();
    } catch (err) {
      console.error(err);
      alert('Sertifikat yaratishda xatolik yuz berdi');
    }
    setLoading(false);
  };

  const domain = window.location.origin;

  return (
    <div className="fixed inset-0 bg-primary-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FDFCFB] rounded-sm w-full max-w-5xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[95vh] border border-gray-200">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold font-serif text-primary-900">Sertifikat Generatori</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-accent-500 hover:bg-accent-50 rounded-sm transition-colors border border-transparent">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[#EEE]">
          {/* Certificate Virtual DOM */}
          <div className="scale-[0.5] sm:scale-[0.7] lg:scale-100 transform origin-top shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
             <div 
               ref={certRef}
               className="w-[1000px] h-[700px] bg-white relative flex items-center justify-center overflow-hidden font-serif"
             >
                {/* 1. Subtle Texture Background (SVG Base64) to give paper texture feel without overlapping text */}
                <div 
                  className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" 
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23002147\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
                ></div>

                {/* 2. Classic Borders - High End */}
                <div className="absolute inset-[24px] border-[10px] border-[#002147] z-0 pointer-events-none"></div>
                <div className="absolute inset-[40px] border-2 border-[#D4AF37] z-0 pointer-events-none"></div>
                <div className="absolute inset-[46px] border border-[#D4AF37] z-0 pointer-events-none"></div>

                {/* Background Watermark Crest */}
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-5">
                   <div className="w-[500px] h-[500px] border-[40px] border-[#002147] rounded-full flex items-center justify-center transform -rotate-12">
                       <span className="text-[250px] font-bold text-[#002147]">SA</span>
                   </div>
                </div>

                {/* 3. Main Content Container (Controlled Flexbox to never overlap) */}
                <div className="relative z-10 w-full h-full p-[60px] flex flex-col justify-between">
                   
                   {/* HEADER SECTION */}
                   <div className="flex flex-col items-center shrink-0 mt-2">
                       <div className="w-16 h-16 border-[3px] border-[#D4AF37] rounded-full flex items-center justify-center bg-white shadow-sm mb-4">
                           <Trophy className="w-8 h-8 text-[#002147]" strokeWidth={1.5} />
                       </div>
                       <p className="tracking-[0.4em] font-bold text-[11px] text-[#D4AF37] uppercase mb-3 font-sans">Science Award Xalqaro Platformasi</p>
                       <h1 className="text-6xl text-[#002147] tracking-widest font-bold uppercase" style={{ fontFamily: 'Georgia, serif' }}>Sertifikat</h1>
                   </div>

                   {/* BODY / TEXT SECTION */}
                   <div className="flex-1 flex flex-col items-center justify-center text-center w-full px-16 mt-2 mb-4">
                       <p className="text-2xl text-gray-500 italic mb-6" style={{ fontFamily: 'Georgia, serif' }}>Ushbu hujjat tasdiqlaydiki,</p>
                       
                       {/* Name with safe wrapping */}
                       <h2 className="text-5xl text-[#002147] font-bold py-3 px-8 text-center break-words leading-tight w-full max-w-4xl mx-auto uppercase tracking-wide border-b-2 border-[#D4AF37] mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                         {content.authorName}
                       </h2>

                       <div className="text-2xl text-[#002147] leading-relaxed flex flex-col gap-5 w-full max-w-4xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
                         <p>Platformamiz tomonidan ko'rib chiqilgan va malakaviy talablarga javob beruvchi</p>
                         <p className="font-bold text-3xl italic break-words text-center px-4 max-h-24 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            "{content.title?.uz || content.title?.en || content.title?.ru || 'Material'}"
                         </p>
                         <p>nomli ilmiy {content.type === 'article' ? 'maqolasi' : content.type === 'thesis' ? 'tezisi' : 'ijodiy ishi'} muvaffaqiyatli nashr etilganligi uchun ushbu sertifikat bilan taqdirlandi.</p>
                       </div>
                   </div>

                   {/* FOOTER SECTION */}
                   <div className="shrink-0 flex items-center justify-between w-full px-10 mb-4 bg-white/40 p-4 rounded-lg">
                       <div className="flex flex-col gap-4 text-left justify-center">
                          <div className="flex items-end gap-3">
                            <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold font-sans pb-1">Berilgan sana:</span>
                            <span className="text-xl font-bold text-[#002147] border-b border-[#002147]/20 pb-0.5 min-w-[150px]" style={{ fontFamily: 'Georgia, serif' }}>{new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-end gap-3">
                            <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold font-sans pb-0.5">Qayd raqami:</span>
                            <span className="text-base font-bold text-[#002147] font-mono">{certId}</span>
                          </div>
                       </div>

                       <div className="text-center flex flex-col items-center">
                          <div className="p-2 border border-[#D4AF37] bg-white rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                              <QRCodeSVG value={`${domain}/verify?id=${certId}`} size={80} level="M" fgColor="#002147" />
                          </div>
                       </div>
                   </div>

                </div>
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-white flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 font-sans text-[11px] font-bold uppercase tracking-widest border border-gray-300 text-gray-600 hover:text-primary-900 rounded-sm hover:bg-gray-50 transition-colors">Yopish</button>
          <button disabled={loading} onClick={handleGenerate} className="px-6 py-3 font-sans text-[11px] font-bold uppercase tracking-widest bg-primary-900 border border-primary-900 text-white flex items-center gap-2 hover:bg-primary-800 transition-colors disabled:opacity-50 rounded-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            O'rnatish & Yuklash
          </button>
        </div>
      </div>
    </div>
  );
}
