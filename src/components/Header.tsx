import React, { useState } from 'react';
import { MoicLogo } from './MoicLogo';
import { CommitteeSettings, ActiveModule } from '../types';
import { soundManager } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
  X,
} from 'lucide-react';

interface HeaderProps {
  settings: CommitteeSettings;
  onUpdateSettings: (newSettings: Partial<CommitteeSettings>) => void;
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  activeModule,
  onSelectModule,
  onExport,
  onImport,
  onReset,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [gavelBouncing, setGavelBouncing] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleGavelStrike = () => {
    setGavelBouncing(true);
    soundManager.playGavel();
    setTimeout(() => setGavelBouncing(false), 400);
  };

  const toggleSound = () => {
    const nextState = !settings.soundEnabled;
    onUpdateSettings({ soundEnabled: nextState });
    soundManager.setMuted(!nextState);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const navTabs: { id: ActiveModule; label: string }[] = [
    { id: 'setup', label: 'Setup' },
    { id: 'rollcall', label: 'Roll Call' },
    { id: 'gsl', label: 'GSL' },
    { id: 'moderated', label: 'Mod Caucus' },
    { id: 'unmoderated', label: 'Unmod' },
    { id: 'motions', label: 'Motions' },
    { id: 'voting', label: 'Voting' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Official Logo */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onSelectModule('setup')}
            className="flex items-center focus:outline-none group cursor-pointer"
            title="Return to Committee Setup / Overview"
          >
            <MoicLogo size="md" />
          </button>

          <div className="hidden lg:block h-8 w-px bg-slate-200" />

          {/* Committee Details */}
          <div className="hidden md:flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                {settings.committeeName || 'Model OIC Committee'}
              </span>
              {settings.committeeAcronym && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {settings.committeeAcronym}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-md truncate" title={settings.agendaTopic}>
              <span className="font-medium text-slate-700">Agenda:</span>{' '}
              {settings.agendaTopic || 'General Committee Agenda'}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls & Chair Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Gavel Tap Button */}
          <button
            id="chair-gavel-button"
            type="button"
            onClick={handleGavelStrike}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
              gavelBouncing
                ? 'bg-amber-600 text-white border-amber-700 scale-95'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title="Strike Chair's Gavel (Play sound)"
          >
            <img
              src="/gavel.png"
              alt="Gavel"
              className={`w-[30px] h-[30px] object-contain transition-transform ${gavelBouncing ? 'rotate-[-25deg] scale-110' : ''}`}
              onError={(e) => {
                // If gavel.png doesn't exist yet, replace with emoji fallback
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = parent.querySelector('.gavel-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }
              }}
            />
            <span className={`gavel-fallback hidden text-sm ${gavelBouncing ? 'rotate-[-20deg]' : ''}`}>🔨</span>
            <span className="hidden sm:inline">Gavel</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-button"
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              settings.soundEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title={settings.soundEnabled ? 'Sound is On (Click to Mute)' : 'Sound is Muted (Click to Unmute)'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Projector Fullscreen Mode */}
          <button
            id="fullscreen-toggle-button"
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen / Projector Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Export Session JSON */}
          <button
            id="export-session-button"
            type="button"
            onClick={onExport}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Export / Backup Session Data (.json)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import Session JSON */}
          <label
            htmlFor="import-session-input"
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Import / Restore Session Data"
          >
            <Upload className="w-4 h-4" />
            <input
              id="import-session-input"
              type="file"
              accept=".json"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>

          {/* Reset Session Data */}
          <button
            id="reset-session-button"
            type="button"
            onClick={onReset}
            className="p-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
            title="Reset Committee Data to Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Info / Rules Modal button */}
          <button
            id="rules-guide-button"
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="MOIC Rules & Session Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module quick navigation bar */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 py-1">
          {navTabs.map((tab) => {
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                id={`quick-tab-${tab.id}`}
                type="button"
                onClick={() => onSelectModule(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules & Guide Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Model OIC Rules of Procedure & Chairing Guide
                </h3>
                <p className="text-xs text-slate-500">
                  Standard Diplomatic Procedures for Organisation of Islamic Cooperation Simulations
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 mb-1">1. Quorum & Roll Call</h4>
                <p>
                  Quorum requires at least <strong>one-third (1/3)</strong> of the total Member States to be present. 
                  Delegates marked <strong>"Present & Voting"</strong> renounce their right to abstain during substantive voting.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-1">2. General Speakers List (GSL) & Yields</h4>
                <p>
                  When a delegate concludes speaking with remaining time, they must yield:
                  <br />• <strong>Yield to Chair:</strong> Speech concludes, floor returns to the dais.
                  <br />• <strong>Yield to another Delegate:</strong> Remaining time transfers to that delegation.
                  <br />• <strong>Yield to Points/Questions:</strong> Open floor for questions from fellow delegates.
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-1">3. Caucuses & Precedence of Motions</h4>
                <p>
                  Motions are voted on in order of disruptiveness (Unmoderated Caucus &gt; Moderated Caucus &gt; Formal Debate). 
                  Chairs can set the total time and individual speaking time smoothly.
                </p>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                <h4 className="font-bold text-teal-900 mb-1">4. Voting Rules</h4>
                <p>
                  <strong>Procedural Matters:</strong> All present delegates must vote (No abstentions). Requires simple majority.
                  <br /><strong>Substantive Matters (Draft Resolutions/Amendments):</strong> Requires simple majority or 2/3 supermajority as specified by committee mandate.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
              >
                Close & Return to Dais
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
