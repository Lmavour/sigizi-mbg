import React from 'react';
import { ActiveTab } from '../types';
import { Map, Compass, Grid2X2, Camera, Bell, User, Plus } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenCameraFAB: () => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCameraFAB,
  unreadCount = 2,
}) => {
  return (
    <nav
      aria-label="Navigasi Utama"
      className="relative shrink-0 w-full z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl"
    >
      <div className="relative flex items-center justify-between px-3 h-16 pb-safe">
        {/* Tab 1: Map (Peta) */}
        <button
          onClick={() => onTabChange('map')}
          aria-label="Buka Peta SPPG"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'map' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Compass className="w-5 h-5" />
            {activeTab === 'map' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Peta SPPG</span>
        </button>

        {/* Tab 2: Feed (Feed Ulasan) */}
        <button
          onClick={() => onTabChange('feed')}
          aria-label="Buka Feed Ulasan MBG"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'feed' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Grid2X2 className="w-5 h-5" />
            {activeTab === 'feed' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Feed Ulasan</span>
        </button>

        {/* Center Floating Action Button (FAB) Camera */}
        <div className="relative -top-4 flex items-center justify-center px-1">
          <button
            onClick={onOpenCameraFAB}
            aria-label="Simulasi Ambil Foto Ulasan MBG"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-xl shadow-emerald-950 ring-4 ring-slate-950 active:scale-90 transition-transform group flex items-center justify-center"
          >
            <div className="w-full h-full rounded-full bg-emerald-500 group-hover:bg-emerald-400 flex items-center justify-center transition-colors">
              <Camera className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
          </button>
        </div>

        {/* Tab 4: Notifications (Notifikasi) */}
        <button
          onClick={() => onTabChange('notifications')}
          aria-label="Buka Notifikasi Menu"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'notifications'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center ring-2 ring-slate-950">
                {unreadCount}
              </span>
            )}
            {activeTab === 'notifications' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Info MBG</span>
        </button>

        {/* Tab 5: Profile (Profil) */}
        <button
          onClick={() => onTabChange('profile')}
          aria-label="Buka Profil Pelajar"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'profile'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5" />
            {activeTab === 'profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Profil</span>
        </button>
      </div>
    </nav>
  );
};
