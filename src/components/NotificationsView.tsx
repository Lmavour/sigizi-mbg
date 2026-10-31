import React from 'react';
import { NotificationItem } from '../types';
import { Bell, Sparkles, Heart, Truck, CheckCircle2 } from 'lucide-react';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
}) => {
  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-y-auto no-scrollbar p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Pemberitahuan MBG
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Update menu harian, rilis SPPG, dan interaksi ulasan
          </p>
        </div>
        <button
          onClick={onMarkAllAsRead}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
        >
          Tandai Dibaca
        </button>
      </div>

      {/* Notifications List */}
      <div className="mt-4 space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl border transition-all ${
              item.unread
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'menu'
                    ? 'bg-amber-500/20 text-amber-400'
                    : item.type === 'review'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {item.type === 'menu' && <Sparkles className="w-5 h-5" />}
                {item.type === 'review' && <Heart className="w-5 h-5 fill-rose-400" />}
                {item.type === 'system' && <Truck className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
