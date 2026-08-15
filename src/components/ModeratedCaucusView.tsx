import React, { useState, useEffect, useRef } from 'react';
import { Country, Speaker, CommitteeSettings } from '../types';
import { soundManager } from '../utils/audio';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  Trash2,
  Clock,
  Mic,
  Share2,
  Users,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ModeratedCaucusViewProps {
  countries: Country[];
  settings: CommitteeSettings;
  onConcludeCaucus?: () => void;
}

export const ModeratedCaucusView: React.FC<ModeratedCaucusViewProps> = ({
  countries,
  settings,
}) => {
  const [topic, setTopic] = useState('Addressing Economic Infrastructure & Trade in OIC Region');
  const [totalCaucusMinutes, setTotalCaucusMinutes] = useState(settings.modDefaultTotalTime || 10);
  const [individualSpeakingSeconds, setIndividualSpeakingSeconds] = useState(
    settings.modDefaultSpeakingTime || 60
  );

  const [totalTimeLeft, setTotalTimeLeft] = useState(totalCaucusMinutes * 60);
  const [speakerTimeLeft, setSpeakerTimeLeft] = useState(individualSpeakingSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [caucusHistory, setCaucusHistory] = useState<
    { country: string; flag: string; duration: number }[]
  >([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presentCountries = countries.filter((c) => c.status !== 'Absent');
  const activeSpeaker = speakers.find((s) => s.status === 'speaking');
  const queuedSpeakers = speakers.filter((s) => s.status === 'queued');

  // Auto set first queued speaker as active if none is speaking
  useEffect(() => {
    if (!activeSpeaker && queuedSpeakers.length > 0) {
      const first = queuedSpeakers[0];
      setSpeakers((prev) =>
        prev.map((s) => (s.id === first.id ? { ...s, status: 'speaking' as const } : s))
      );
    }
  }, [activeSpeaker, queuedSpeakers]);

  // Dual Timer Loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // Decrement overall caucus time
        setTotalTimeLeft((prevTotal) => {
          if (prevTotal <= 1) {
            setIsRunning(false);
            soundManager.playTimerEnd();
            return 0;
          }
          return prevTotal - 1;
        });

        // Decrement active speaker time
        setSpeakerTimeLeft((prevSpk) => {
          if (prevSpk <= 1) {
            soundManager.playTimerEnd();
            return 0;
          }
          if (prevSpk === 11) {
            soundManager.playWarningTick();
          }
          return prevSpk - 1;
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

  const handleReset = () => {
    setIsRunning(false);
    setTotalTimeLeft(totalCaucusMinutes * 60);
    setSpeakerTimeLeft(individualSpeakingSeconds);
  };

  const handleApplyNewSettings = (totalMins: number, spkSecs: number) => {
    setTotalCaucusMinutes(totalMins);
    setIndividualSpeakingSeconds(spkSecs);
    setTotalTimeLeft(totalMins * 60);
    setSpeakerTimeLeft(spkSecs);
    setIsRunning(false);
  };

  const handleAddSpeaker = () => {
    if (!selectedCountryId) return;
    const country = countries.find((c) => c.id === selectedCountryId);
    if (!country) return;

    if (speakers.some((s) => s.countryId === country.id && (s.status === 'queued' || s.status === 'speaking'))) {
      alert(`${country.name} is already in the speakers queue for this caucus.`);
      return;
    }

    const newSpk: Speaker = {
      id: `mod_spk_${Date.now()}`,
      countryId: country.id,
      countryName: country.name,
      flag: country.flag,
      status: speakers.length === 0 ? 'speaking' : 'queued',
      speakingTimeLeft: individualSpeakingSeconds,
    };

    setSpeakers((prev) => [...prev, newSpk]);
    setSelectedCountryId('');
  };

  const handleNextSpeaker = () => {
    if (activeSpeaker) {
      setCaucusHistory((prev) => [
        {
          country: activeSpeaker.countryName,
          flag: activeSpeaker.flag,
          duration: individualSpeakingSeconds - speakerTimeLeft,
        },
        ...prev,
      ]);
    }

    const nextIndex = speakers.findIndex((s) => s.status === 'queued');
    if (nextIndex !== -1) {
      setSpeakers((prev) =>
        prev.map((s, idx) => {
          if (s.id === activeSpeaker?.id) return { ...s, status: 'completed' as const };
          if (idx === nextIndex) return { ...s, status: 'speaking' as const };
          return s;
        })
      );
    } else if (activeSpeaker) {
      setSpeakers((prev) =>
        prev.map((s) => (s.id === activeSpeaker.id ? { ...s, status: 'completed' as const } : s))
      );
    }

    setSpeakerTimeLeft(individualSpeakingSeconds);
  };

  const handleYieldToChair = () => {
    handleNextSpeaker();
  };

  const totalMinsLeft = Math.floor(totalTimeLeft / 60);
  const totalSecsLeft = totalTimeLeft % 60;
  const spkMinsLeft = Math.floor(speakerTimeLeft / 60);
  const spkSecsLeft = speakerTimeLeft % 60;

  const totalSlots = Math.floor((totalCaucusMinutes * 60) / (individualSpeakingSeconds || 1));
  const spokenSlots = caucusHistory.length + (activeSpeaker ? 1 : 0);

  return (
    <div id="moderated-caucus-section" className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Top Banner / Topic */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Moderated Caucus
            </span>
            <span className="text-xs text-blue-200">
              {totalCaucusMinutes} mins total / {individualSpeakingSeconds}s per speaker (~{totalSlots} slots)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-lg sm:text-2xl font-extrabold bg-transparent text-white border-b border-blue-400/40 focus:border-blue-300 focus:outline-none w-full py-0.5"
              placeholder="Caucus Topic / Sub-Agenda..."
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => handleApplyNewSettings(5, 45)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-800/60 hover:bg-blue-700 transition-colors"
          >
            5m / 45s
          </button>
          <button
            type="button"
            onClick={() => handleApplyNewSettings(10, 60)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-800/60 hover:bg-blue-700 transition-colors"
          >
            10m / 60s
          </button>
          <button
            type="button"
            onClick={() => handleApplyNewSettings(15, 60)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-800/60 hover:bg-blue-700 transition-colors"
          >
            15m / 60s
          </button>
          <button
            type="button"
            onClick={() => handleApplyNewSettings(20, 90)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-800/60 hover:bg-blue-700 transition-colors"
          >
            20m / 90s
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dual Timers & Active Speaker (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col items-center justify-between text-center relative overflow-hidden">
            {/* Active Delegation Box */}
            <div className="w-full mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80 inline-block mb-3">
                ● Current Speaker
              </span>

              {activeSpeaker ? (
                <div className="flex flex-col items-center">
                  <span className="text-5xl sm:text-6xl mb-2" role="img" aria-label={activeSpeaker.countryName}>
                    {activeSpeaker.flag}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {activeSpeaker.countryName}
                  </h2>
                </div>
              ) : (
                <div className="py-4 text-slate-400">
                  <p className="text-sm font-semibold">No Speaker Currently Recognized</p>
                  <p className="text-xs text-slate-400">Select delegation from the list below</p>
                </div>
              )}
            </div>

            {/* Dual Clock Display: Speaker Clock & Overall Caucus Clock */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              {/* Speaker Timer Clock */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Speaker Time Remaining
                </span>
                <span
                  className={`font-mono text-4xl sm:text-5xl font-black tracking-tight mt-1 ${
                    speakerTimeLeft <= 10 ? 'text-red-600' : 'text-blue-900'
                  }`}
                >
                  {String(spkMinsLeft).padStart(2, '0')}:{String(spkSecsLeft).padStart(2, '0')}
                </span>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${(speakerTimeLeft / (individualSpeakingSeconds || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Total Caucus Timer Clock */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 flex flex-col items-center">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Total Caucus Remaining
                </span>
                <span
                  className={`font-mono text-4xl sm:text-5xl font-black tracking-tight mt-1 ${
                    totalTimeLeft <= 60 ? 'text-red-600' : 'text-indigo-950'
                  }`}
                >
                  {String(totalMinsLeft).padStart(2, '0')}:{String(totalSecsLeft).padStart(2, '0')}
                </span>
                <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{
                      width: `${(totalTimeLeft / (totalCaucusMinutes * 60 || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="w-full flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={handleStartPause}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-sm transition-all flex items-center gap-2.5 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white ring-4 ring-amber-200/60'
                    : 'bg-blue-700 hover:bg-blue-800 text-white ring-4 ring-blue-200/60'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause Caucus</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Caucus Timer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer"
                title="Reset Both Timers"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNextSpeaker}
                className="px-5 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Next Speaker</span>
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Speaker Queue & Stats (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Speaker Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Plus className="w-4 h-4 text-blue-700" />
                <span>Add Caucus Speaker</span>
              </div>
              <span className="text-xs text-slate-500">
                Slot {spokenSlots} of ~{totalSlots}
              </span>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCountryId}
                onChange={(e) => setSelectedCountryId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
              >
                <option value="">-- Select Member State --</option>
                {presentCountries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddSpeaker}
                disabled={!selectedCountryId}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Speakers Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Caucus Queue ({queuedSpeakers.length})
              </h3>
              {speakers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSpeakers([])}
                  className="text-[11px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
              {queuedSpeakers.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No speakers in queue for this moderated caucus.
                </div>
              ) : (
                queuedSpeakers.map((spk, idx) => (
                  <div
                    key={spk.id}
                    className="p-3 hover:bg-slate-50 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5">
                        {idx + 1}.
                      </span>
                      <span className="text-xl">{spk.flag}</span>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                        {spk.countryName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSpeakers(speakers.filter((s) => s.id !== spk.id))}
                      className="p-1 text-red-400 hover:text-red-700 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
