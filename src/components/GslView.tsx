import React, { useState, useEffect, useRef } from 'react';
import { Country, Speaker, CommitteeSettings } from '../types';
import { soundManager } from '../utils/audio';
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Volume2,
  Clock,
  UserCheck,
  CheckCircle,
  Share2,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Shield,
  MessageSquare,
} from 'lucide-react';

interface GslViewProps {
  countries: Country[];
  settings: CommitteeSettings;
  speakers: Speaker[];
  onUpdateSpeakers: (speakers: Speaker[]) => void;
}

export const GslView: React.FC<GslViewProps> = ({
  countries,
  settings,
  speakers,
  onUpdateSpeakers,
}) => {
  const defaultTime = settings.gslDefaultSpeakingTime || 90;
  const [speakingTimeLimit, setSpeakingTimeLimit] = useState(defaultTime);
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCountryToAdd, setSelectedCountryToAdd] = useState('');
  const [showYieldModal, setShowYieldModal] = useState(false);
  const [yieldTargetCountry, setYieldTargetCountry] = useState('');
  const [yieldType, setYieldType] = useState<'Chair' | 'Delegate' | 'Points'>('Chair');
  const [speechLog, setSpeechLog] = useState<
    { country: string; flag: string; duration: number; yieldInfo?: string; time: string }[]
  >([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presentCountries = countries.filter((c) => c.status !== 'Absent');
  const activeSpeaker = speakers.find((s) => s.status === 'speaking');
  const queuedSpeakers = speakers.filter((s) => s.status === 'queued');

  // If no speaker is speaking but queue exists, make first speaker active if not set
  useEffect(() => {
    if (!activeSpeaker && queuedSpeakers.length > 0) {
      const first = queuedSpeakers[0];
      const updated = speakers.map((s) =>
        s.id === first.id ? { ...s, status: 'speaking' as const } : s
      );
      onUpdateSpeakers(updated);
    }
  }, [activeSpeaker, queuedSpeakers, speakers]);

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
          if (prev === 11) {
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

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(speakingTimeLimit);
  };

  const handleAdjustTime = (delta: number) => {
    setTimeLeft((prev) => Math.max(0, prev + delta));
  };

  const handleAddSpeaker = () => {
    if (!selectedCountryToAdd) return;
    const country = countries.find((c) => c.id === selectedCountryToAdd);
    if (!country) return;

    // Check if already in active or queue
    const isAlreadyQueued = speakers.some(
      (s) => s.countryId === country.id && (s.status === 'queued' || s.status === 'speaking')
    );
    if (isAlreadyQueued) {
      alert(`${country.name} is already on the Speakers List.`);
      return;
    }

    const newSpeaker: Speaker = {
      id: `spk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      countryId: country.id,
      countryName: country.name,
      flag: country.flag,
      status: speakers.length === 0 ? 'speaking' : 'queued',
      speakingTimeLeft: speakingTimeLimit,
    };

    onUpdateSpeakers([...speakers, newSpeaker]);
    setSelectedCountryToAdd('');
  };

  const handleNextSpeaker = () => {
    setIsRunning(false);
    if (activeSpeaker) {
      // Record speech log
      const timeUsed = speakingTimeLimit - timeLeft;
      setSpeechLog((prev) => [
        {
          country: activeSpeaker.countryName,
          flag: activeSpeaker.flag,
          duration: timeUsed,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    }

    // Mark active speaker completed, next in queue becomes speaking
    const nextQueueIndex = speakers.findIndex((s) => s.status === 'queued');
    if (nextQueueIndex !== -1) {
      const updated = speakers.map((s, idx) => {
        if (s.id === activeSpeaker?.id) return { ...s, status: 'completed' as const };
        if (idx === nextQueueIndex) return { ...s, status: 'speaking' as const };
        return s;
      });
      onUpdateSpeakers(updated);
    } else if (activeSpeaker) {
      const updated = speakers.map((s) =>
        s.id === activeSpeaker.id ? { ...s, status: 'completed' as const } : s
      );
      onUpdateSpeakers(updated);
    }

    setTimeLeft(speakingTimeLimit);
  };

  const handleRemoveSpeaker = (id: string) => {
    const removingActive = activeSpeaker?.id === id;
    const remaining = speakers.filter((s) => s.id !== id);
    if (removingActive && remaining.length > 0) {
      remaining[0].status = 'speaking';
      setTimeLeft(speakingTimeLimit);
      setIsRunning(false);
    }
    onUpdateSpeakers(remaining);
  };

  const handleMoveQueue = (index: number, direction: 'up' | 'down') => {
    const queue = [...speakers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= queue.length) return;
    const temp = queue[index];
    queue[index] = queue[targetIndex];
    queue[targetIndex] = temp;
    onUpdateSpeakers(queue);
  };

  const handleExecuteYield = () => {
    if (!activeSpeaker) return;
    setIsRunning(false);
    const remainingSecs = timeLeft;

    let yieldDesc = 'Yielded to the Chair';
    if (yieldType === 'Delegate') {
      const target = countries.find((c) => c.id === yieldTargetCountry);
      if (target) {
        yieldDesc = `Yielded ${remainingSecs}s to ${target.name}`;
        // Insert target delegate as speaking with the remaining time!
        const transferredSpeaker: Speaker = {
          id: `yield_${Date.now()}`,
          countryId: target.id,
          countryName: target.name,
          flag: target.flag,
          status: 'speaking',
          speakingTimeLeft: remainingSecs,
        };

        const updated = speakers.map((s) =>
          s.id === activeSpeaker.id ? { ...s, status: 'yielded' as const, yieldedTo: target.name } : s
        );

        onUpdateSpeakers([transferredSpeaker, ...updated]);
        setTimeLeft(remainingSecs);
        setShowYieldModal(false);
        return;
      }
    } else if (yieldType === 'Points') {
      yieldDesc = `Yielded ${remainingSecs}s to Points & Questions`;
    }

    // Log the yield
    setSpeechLog((prev) => [
      {
        country: activeSpeaker.countryName,
        flag: activeSpeaker.flag,
        duration: speakingTimeLimit - timeLeft,
        yieldInfo: yieldDesc,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);

    // Complete active speaker and load next
    const updated = speakers.map((s) =>
      s.id === activeSpeaker.id ? { ...s, status: 'yielded' as const, yieldedTo: yieldDesc } : s
    );
    onUpdateSpeakers(updated);
    handleNextSpeaker();
    setShowYieldModal(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = Math.min(100, (timeLeft / (speakingTimeLimit || 1)) * 100);

  const timerColor =
    timeLeft <= 10
      ? 'text-red-600'
      : timeLeft <= 25
      ? 'text-amber-500'
      : 'text-slate-900';

  const progressBg =
    timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 25 ? 'bg-amber-500' : 'bg-cyan-600';

  return (
    <div id="gsl-section" className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Top Banner / Topic */}
      <div className="bg-gradient-to-r from-cyan-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              General Debate
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
            General Speakers List (GSL)
          </h1>
          <p className="text-cyan-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Floor is open for formal statements on the committee agenda. Manage queue, track
            speech time, and adjudicate diplomatic yields.
          </p>
        </div>

        {/* Default Limit Selector */}
        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/10">
          <Clock className="w-4 h-4 text-cyan-300" />
          <span className="text-xs font-medium text-cyan-100">Speech Limit:</span>
          <select
            value={speakingTimeLimit}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSpeakingTimeLimit(val);
              setTimeLeft(val);
              setIsRunning(false);
            }}
            className="bg-slate-900/80 text-white font-bold text-xs px-2.5 py-1 rounded-lg border border-cyan-500/30 focus:outline-none"
          >
            <option value={45}>45 seconds</option>
            <option value={60}>60 seconds (1 min)</option>
            <option value={90}>90 seconds (1.5 min)</option>
            <option value={120}>120 seconds (2 min)</option>
            <option value={180}>180 seconds (3 min)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Huge Active Speaker Card & Clock (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col items-center justify-between text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none" />

            {/* Active Delegate Header */}
            <div className="w-full mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200/80 inline-block mb-3">
                ● Floor Recognized Delegation
              </span>

              {activeSpeaker ? (
                <div className="flex flex-col items-center">
                  <span className="text-5xl sm:text-6xl mb-2 filter drop-shadow-xs" role="img" aria-label={activeSpeaker.countryName}>
                    {activeSpeaker.flag}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {activeSpeaker.countryName}
                  </h2>
                </div>
              ) : (
                <div className="py-6 text-slate-400">
                  <Mic className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-base font-semibold">No Speaker Currently Recognized</p>
                  <p className="text-xs text-slate-400 mt-1">Add a delegation to the speakers queue below</p>
                </div>
              )}
            </div>

            {/* Giant Countdown Timer Display */}
            <div className="w-full my-4 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <span
                  id="gsl-clock-display"
                  className={`font-mono text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter ${timerColor} transition-colors select-none`}
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>

              {/* Smooth Progress Bar */}
              <div className="w-full max-w-md h-3 bg-slate-100 rounded-full overflow-hidden mt-4 p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${progressBg}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Timer Controls Toolbar */}
            <div className="w-full flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => handleAdjustTime(-10)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Subtract 10 seconds"
              >
                -10s
              </button>

              <button
                id="gsl-play-pause-btn"
                type="button"
                onClick={toggleTimer}
                disabled={!activeSpeaker}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-sm transition-all flex items-center gap-2.5 cursor-pointer ${
                  !activeSpeaker
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white ring-4 ring-amber-200/60'
                    : 'bg-cyan-700 hover:bg-cyan-800 text-white ring-4 ring-cyan-200/60'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause Speech</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Time</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleAdjustTime(10)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Add 10 seconds"
              >
                +10s
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                title="Reset Timer to Default"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Yield & Next Speaker Action Bar */}
            {activeSpeaker && (
              <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowYieldModal(true)}
                  className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-purple-700" />
                  <span>Yield Remaining Time ({timeLeft}s)</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextSpeaker}
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Recognize Next Speaker</span>
                  <SkipForward className="w-4 h-4 text-emerald-700" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Speaker Queue & Recent History (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add to Queue Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Plus className="w-4 h-4 text-cyan-700" />
                <span>Add Delegation to Speakers List</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {presentCountries.length} Present
              </span>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCountryToAdd}
                onChange={(e) => setSelectedCountryToAdd(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-slate-50/50"
              >
                <option value="">-- Select Member State --</option>
                {presentCountries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name} {c.status === 'Present & Voting' ? '(P&V)' : ''}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddSpeaker}
                disabled={!selectedCountryToAdd}
                className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-200 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Speakers Queue List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Upcoming Queue ({queuedSpeakers.length})
                </h3>
              </div>
              {speakers.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateSpeakers([])}
                  className="text-[11px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
              {queuedSpeakers.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No upcoming speakers in queue. Add delegates above to schedule speaking order.
                </div>
              ) : (
                queuedSpeakers.map((spk, idx) => (
                  <div
                    key={spk.id}
                    className="p-3 hover:bg-slate-50 flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5">
                        {idx + 1}.
                      </span>
                      <span className="text-xl" role="img" aria-label={spk.countryName}>
                        {spk.flag}
                      </span>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                        {spk.countryName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveQueue(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveQueue(idx, 'down')}
                        disabled={idx === queuedSpeakers.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpeaker(spk.id)}
                        className="p-1 text-red-400 hover:text-red-700 rounded hover:bg-red-50"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Spoken History Log */}
          {speechLog.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recent Speeches Concluded
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {speechLog.slice(0, 5).map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg text-slate-700"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{log.flag}</span>
                      <span className="font-semibold truncate">{log.country}</span>
                      {log.yieldInfo && (
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-medium truncate">
                          {log.yieldInfo}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">
                      {log.duration}s ({log.time})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Yield Modal */}
      {showYieldModal && activeSpeaker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Yield Remaining Time</h3>
                <p className="text-xs text-slate-500">
                  {activeSpeaker.countryName} has {timeLeft} seconds remaining.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Yield Option:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setYieldType('Chair')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    yieldType === 'Chair'
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4 mx-auto mb-1" />
                  To the Chair
                </button>

                <button
                  type="button"
                  onClick={() => setYieldType('Delegate')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    yieldType === 'Delegate'
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Mic className="w-4 h-4 mx-auto mb-1" />
                  To Delegate
                </button>

                <button
                  type="button"
                  onClick={() => setYieldType('Points')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    yieldType === 'Points'
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mx-auto mb-1" />
                  To Questions
                </button>
              </div>
            </div>

            {yieldType === 'Delegate' && (
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Recipient Delegation:
                </label>
                <select
                  value={yieldTargetCountry}
                  onChange={(e) => setYieldTargetCountry(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">-- Choose Delegation --</option>
                  {presentCountries
                    .filter((c) => c.id !== activeSpeaker.countryId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowYieldModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteYield}
                disabled={yieldType === 'Delegate' && !yieldTargetCountry}
                className="px-4 py-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 disabled:bg-slate-200 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Yield
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
