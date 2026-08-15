import React from 'react';
import { ActiveModule } from '../types';
import {
  Settings,
  Users,
  Mic,
  Timer,
  Clock,
  Gavel,
  Vote,
  FileText,
  Globe2,
  CheckSquare,
  ListOrdered,
  Sparkles,
} from 'lucide-react';

interface ModuleGridNavProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  stats: {
    totalPresent: number;
    totalCountries: number;
    gslQueueCount: number;
    pendingMotionsCount: number;
    activeCaucus: 'none' | 'moderated' | 'unmoderated';
  };
}

export const ModuleGridNav: React.FC<ModuleGridNavProps> = ({
  activeModule,
  onSelectModule,
  stats,
}) => {
  const modules = [
    {
      id: 'setup' as ActiveModule,
      title: 'Committee Setup',
      description: 'Add/edit country list, committee name & agenda.',
      topColor: 'bg-emerald-600',
      borderColor: 'border-emerald-600',
      activeRing: 'ring-emerald-500',
      hoverBorder: 'hover:border-emerald-500',
      badge: `${stats.totalCountries} Delegations`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: (
        <div className="relative w-12 h-12 flex items-center justify-center text-emerald-700 bg-emerald-50 rounded-lg">
          <FileText className="w-7 h-7 absolute" />
          <Settings className="w-4 h-4 absolute -top-1 -left-1 text-emerald-800" />
          <Globe2 className="w-4 h-4 absolute -bottom-1 -right-1 text-emerald-600" />
        </div>
      ),
    },
    {
      id: 'rollcall' as ActiveModule,
      title: 'Roll Call',
      description: 'Record attendance (Absent / Present / Present & Voting).',
      topColor: 'bg-teal-600',
      borderColor: 'border-teal-600',
      activeRing: 'ring-teal-500',
      hoverBorder: 'hover:border-teal-500',
      badge: `${stats.totalPresent} Present`,
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: (
        <div className="relative w-12 h-12 flex items-center justify-center text-teal-700 bg-teal-50 rounded-lg">
          <CheckSquare className="w-6 h-6 absolute -top-0.5 -left-0.5" />
          <Users className="w-6 h-6 absolute -bottom-0.5 -right-0.5 text-teal-800" />
        </div>
      ),
    },
    {
      id: 'gsl' as ActiveModule,
      title: 'General Speakers List (GSL)',
      description: 'Per-speaker timer, speaker queue, yield time, and navigation.',
      topColor: 'bg-cyan-600',
      borderColor: 'border-cyan-600',
      activeRing: 'ring-cyan-500',
      hoverBorder: 'hover:border-cyan-500',
      badge: stats.gslQueueCount > 0 ? `${stats.gslQueueCount} in Queue` : 'Queue Empty',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      icon: (
        <div className="relative w-12 h-12 flex items-center justify-center text-cyan-700 bg-cyan-50 rounded-lg">
          <Mic className="w-6 h-6 absolute left-1" />
          <ListOrdered className="w-5 h-5 absolute right-1 text-cyan-800" />
        </div>
      ),
    },
    {
      id: 'moderated' as ActiveModule,
      title: 'Moderated Caucus',
      description: 'Speaker list management, individual speaking time timer, yield time.',
      topColor: 'bg-blue-600',
      borderColor: 'border-blue-600',
      activeRing: 'ring-blue-500',
      hoverBorder: 'hover:border-blue-500',
      badge: stats.activeCaucus === 'moderated' ? '● Active Caucus' : 'Ready',
      badgeColor: stats.activeCaucus === 'moderated' ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse' : 'bg-blue-50 text-blue-700 border-blue-200',
      icon: (
        <div className="relative w-12 h-12 flex items-center justify-center text-blue-700 bg-blue-50 rounded-lg">
          <Timer className="w-7 h-7 absolute" />
          <Mic className="w-4 h-4 absolute -bottom-1 -right-1 text-blue-900" />
        </div>
      ),
    },
    {
      id: 'unmoderated' as ActiveModule,
      title: 'Unmoderated Caucus',
      description: 'Simple countdown timer (minutes) with play/pause/stop/reset.',
      topColor: 'bg-slate-700',
      borderColor: 'border-slate-700',
      activeRing: 'ring-slate-500',
      hoverBorder: 'hover:border-slate-500',
      badge: stats.activeCaucus === 'unmoderated' ? '● Active Consultation' : 'Informal',
      badgeColor: stats.activeCaucus === 'unmoderated' ? 'bg-indigo-50 text-indigo-700 border-indigo-300 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200',
      icon: (
        <div className="relative w-12 h-12 flex items-center justify-center text-slate-700 bg-slate-100 rounded-lg">
          <Clock className="w-7 h-7" />
        </div>
      ),
    },
    {
      id: 'motions' as ActiveModule,
      title: 'Motions',
      description: 'Record motion text, type, time, and outcome (Pending/Failed).',
      topColor: 'bg-purple-600',
      borderColor: 'border-purple-600',
      activeRing: 'ring-purple-500',
      hoverBorder: 'hover:border-purple-500',
      badge: stats.pendingMotionsCount > 0 ? `${stats.pendingMotionsCount} Pending` : 'Floor Open',
      badgeColor: stats.pendingMotionsCount > 0 ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-zinc-50 text-zinc-700 border-zinc-200',
      icon: (
        <div className="relative w-12 h-12 flex items-center justify-center text-purple-700 bg-purple-50 rounded-lg">
          <Gavel className="w-6 h-6 absolute" />
          <CheckSquare className="w-4 h-4 absolute -bottom-1 -right-1 text-purple-900" />
        </div>
      ),
    },
    {
      id: 'voting' as ActiveModule,
      title: 'Voting',
      description: 'Per-delegate voting (In Favor, Against, Abstain) with real-time display.',
      topColor: 'bg-emerald-700',
      borderColor: 'border-emerald-700',
      activeRing: 'ring-emerald-500',
      hoverBorder: 'hover:border-emerald-500',
      badge: 'Substantive & Procedural',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: (
        <div className="relative w-12 h-12 flex items-center justify-center text-emerald-800 bg-emerald-50 rounded-lg">
          <Vote className="w-6 h-6 absolute -top-0.5 -left-0.5" />
          <CheckSquare className="w-5 h-5 absolute -bottom-0.5 -right-0.5 text-emerald-700" />
        </div>
      ),
    },
  ];

  const topRow = modules.slice(0, 3);
  const bottomRow = modules.slice(3);

  return (
    <div id="moic-module-navigation" className="w-full max-w-7xl mx-auto px-4 py-2 space-y-4">
      {/* Top row of 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topRow.map((mod) => {
          const isSelected = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              id={`nav-btn-${mod.id}`}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              className={`group relative text-left bg-white rounded-xl shadow-xs border transition-all duration-200 overflow-hidden flex flex-col justify-between p-4 cursor-pointer hover:shadow-md ${
                isSelected
                  ? `border-t-[5px] ${mod.borderColor} ring-2 ${mod.activeRing} shadow-md bg-slate-50/50`
                  : `border-t-4 ${mod.borderColor} border-slate-200/80 ${mod.hoverBorder}`
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="shrink-0 transition-transform group-hover:scale-105">
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug group-hover:text-slate-950">
                      {mod.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className={`px-2 py-0.5 rounded-md font-medium border ${mod.badgeColor}`}>
                  {mod.badge}
                </span>
                <span className={`font-semibold flex items-center gap-1 ${isSelected ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {isSelected ? 'Active View' : 'Open Module →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom row of 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bottomRow.map((mod) => {
          const isSelected = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              id={`nav-btn-${mod.id}`}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              className={`group relative text-left bg-white rounded-xl shadow-xs border transition-all duration-200 overflow-hidden flex flex-col justify-between p-4 cursor-pointer hover:shadow-md ${
                isSelected
                  ? `border-t-[5px] ${mod.borderColor} ring-2 ${mod.activeRing} shadow-md bg-slate-50/50`
                  : `border-t-4 ${mod.borderColor} border-slate-200/80 ${mod.hoverBorder}`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 transition-transform group-hover:scale-105">
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug group-hover:text-slate-950">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className={`px-2 py-0.5 rounded-md font-medium border ${mod.badgeColor}`}>
                  {mod.badge}
                </span>
                <span className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {isSelected ? 'Active' : 'Open →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
