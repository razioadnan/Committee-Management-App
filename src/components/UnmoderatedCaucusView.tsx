import React, { useState, useEffect, useRef } from 'react';
import { CommitteeSettings } from '../types';
import { soundManager } from '../utils/audio';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Square,
  FileText,
  Save,
  Check,
  Sparkles,
} from 'lucide-react';

interface UnmoderatedCaucusViewProps {
  settings: CommitteeSettings;
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

export const UnmoderatedCaucusView: React.FC<UnmoderatedCaucusViewProps> = ({
  settings,
  notes,
  onUpdateNotes,
}) => {
  const defaultMins = settings.unmodDefaultTotalTime || 15;
  const [caucusTopic, setCaucusTopic] = useState('Informal Consultation & Working Paper Merging');
  const [totalMinutes, setTotalMinutes] = useState(defaultMins);
  const [timeLeft, setTimeLeft] = useState(defaultMins * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);
  const [savedNotesSuccess, setSavedNotesSuccess] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            soundManager.playTimerEnd();
            return 0;
          }
          if (prev === 60) {
            soundManager.playWarningTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalMinutes * 60);
  };

  const handleSetPreset = (mins: number) => {
    setTotalMinutes(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
  };

  const handleAddMinutes = (mins: number) => {
    setTimeLeft((prev) => prev + mins * 60);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(localNotes);
    setSavedNotesSuccess(true);
    setTimeout(() => setSavedNotesSuccess(false), 2000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = Math.min(100, (timeLeft / (totalMinutes * 60 || 1)) * 100);

  const timerColor =
    timeLeft <= 60
      ? 'text-red-600'
      : timeLeft <= 180
      ? 'text-amber-500'
      : 'text-slate-900';

  return (
    <div id="unmoderated-caucus-section" className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/30 text-slate-200 border border-slate-400/30">
              Informal Consultation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
            Unmoderated Caucus
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Floor suspended for free informal lobbying, bloc negotiations, and draft resolution drafting.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/10">
          <Clock className="w-4 h-4 text-slate-300" />
          <span className="text-xs text-slate-200 font-medium">Quick Set:</span>
          {[5, 10, 15, 20, 30].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleSetPreset(m)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                totalMinutes === m
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Huge Projector Countdown Clock (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md flex flex-col items-center justify-between text-center relative overflow-hidden">
            {/* Consultation Topic */}
            <div className="w-full mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 inline-block mb-3">
                ● Caucus Purpose & Consultation Focus
              </span>
              <input
                type="text"
                value={caucusTopic}
                onChange={(e) => setCaucusTopic(e.target.value)}
                className="w-full text-center text-lg sm:text-xl font-bold text-slate-800 border-b border-slate-200 focus:border-indigo-600 focus:outline-none py-1"
                placeholder="Caucus Purpose..."
              />
            </div>

            {/* Giant Clock */}
            <div className="w-full my-6 flex flex-col items-center">
              <span
                id="unmod-clock-display"
                className={`font-mono text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight ${timerColor} transition-colors select-none`}
              >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>

              {/* Progress bar */}
              <div className="w-full max-w-lg h-3.5 bg-slate-100 rounded-full overflow-hidden mt-6 p-0.5 border border-slate-200">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Controls Bar */}
            <div className="w-full flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => handleAddMinutes(1)}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Add 1 minute"
              >
                +1 min
              </button>
              <button
                type="button"
                onClick={() => handleAddMinutes(5)}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Add 5 minutes"
              >
                +5 min
              </button>

              <button
                id="unmod-play-pause-btn"
                type="button"
                onClick={handleStartPause}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-sm transition-all flex items-center gap-2.5 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white ring-4 ring-amber-200/60'
                    : 'bg-slate-900 hover:bg-slate-800 text-white ring-4 ring-slate-200/60'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Consultation Timer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStop}
                className="p-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl transition-all cursor-pointer"
                title="Stop Timer"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                title="Reset to Original Preset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Chair Scratchpad & Working Paper Notes (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Chair's Consultation Scratchpad
                </h3>
              </div>
              {savedNotesSuccess && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Notes Saved
                </span>
              )}
            </div>

            <textarea
              rows={12}
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="Record working paper blocs, sponsors, signatories, key dispute clauses, and informal agreements during unmoderated caucus..."
              className="w-full flex-1 p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50/50 resize-none font-sans"
            />

            <button
              type="button"
              onClick={handleSaveNotes}
              className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Scratchpad Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
