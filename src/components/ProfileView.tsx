import React from 'react';
import { Award, GraduationCap, Utensils, Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const ProfileView: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-y-auto no-scrollbar p-4 pb-28">
      {/* Profile Card Header */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-emerald-950/60 to-slate-900 border border-emerald-500/20 text-center flex flex-col items-center">
        <div className="relative">
          <img
            src="/src/assets/images/student_avatar_indo_1793460566045.jpg"
            alt="Sari Dewi Anggraini"
            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-400 shadow-xl"
          />
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-md">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <h3 className="text-base font-bold text-white mt-3">Sari Dewi Anggraini</h3>
        <p className="text-xs text-emerald-400 font-medium">@sari_dewi_smansa</p>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>Kelas XI-MIPA 2 · SMA Negeri 1 Jakarta</span>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-slate-800">
          <div className="text-center">
            <div className="text-base font-bold text-emerald-400">14</div>
            <div className="text-[10px] text-slate-400">Ulasan MBG</div>
          </div>
          <div className="text-center border-x border-slate-800">
            <div className="text-base font-bold text-white">4.9 ★</div>
            <div className="text-[10px] text-slate-400">Rata-rata Rasa</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-amber-400">520</div>
            <div className="text-[10px] text-slate-400">Poin Gizi</div>
          </div>
        </div>
      </div>

      {/* Badge / Achievement Section */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          Lencana Kontributor MBG
        </h4>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-800/70 text-center border border-emerald-500/30">
            <div className="text-xl">🥗</div>
            <div className="text-[10px] font-bold text-emerald-300 mt-1">Duta Sayur</div>
            <div className="text-[9px] text-slate-400">10x Habis Sayur</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/70 text-center border border-amber-500/30">
            <div className="text-xl">🥛</div>
            <div className="text-[10px] font-bold text-amber-300 mt-1">Susu Champion</div>
            <div className="text-[9px] text-slate-400">Setiap Hari Minum</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/70 text-center border border-rose-500/30">
            <div className="text-xl">⭐</div>
            <div className="text-[10px] font-bold text-rose-300 mt-1">Top Reviewer</div>
            <div className="text-[9px] text-slate-400">Level 3 Pelajar</div>
          </div>
        </div>
      </div>

      {/* Program Information Card */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Tentang Program MBG & SiGizi
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          SiGizi adalah inisiatif transparansi dan partisipasi pelajar dalam program Makan Bergizi
          Gratis (MBG) Nasional. Setiap masukan dan rating rasa dari pelajar langsung terhubung ke
          dapur SPPG untuk perbaikan menu berkelanjutan.
        </p>
      </div>
    </div>
  );
};
