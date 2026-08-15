import React, { useState } from 'react';
import { Country, Motion, MotionType, MotionOutcome, ActiveModule } from '../types';
import { soundManager } from '../utils/audio';
import {
  Gavel,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Play,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  HelpCircle,
  Vote,
} from 'lucide-react';

interface MotionsViewProps {
  countries: Country[];
  motions: Motion[];
  onUpdateMotions: (motions: Motion[]) => void;
  onLaunchCaucus?: (type: 'moderated' | 'unmoderated', topic?: string, totalMins?: number, spkSecs?: number) => void;
}

export const MotionsView: React.FC<MotionsViewProps> = ({
  countries,
  motions,
  onUpdateMotions,
  onLaunchCaucus,
}) => {
  const [showNewMotionModal, setShowNewMotionModal] = useState(false);
  const [selectedProponentId, setSelectedProponentId] = useState('');
  const [motionType, setMotionType] = useState<MotionType>('Moderated Caucus');
  const [topic, setTopic] = useState('');
  const [totalTime, setTotalTime] = useState(10);
  const [speakingTime, setSpeakingTime] = useState(60);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | MotionOutcome>('All');

  const presentCountries = countries.filter((c) => c.status !== 'Absent');

  const handleRaiseMotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProponentId) return;
    const country = countries.find((c) => c.id === selectedProponentId);
    if (!country) return;

    const newMotion: Motion = {
      id: `motion_${Date.now()}`,
      proponentCountryId: country.id,
      proponentCountryName: country.name,
      proponentFlag: country.flag,
      type: motionType,
      topic: topic.trim() || undefined,
      totalTime: totalTime,
      speakingTime: motionType === 'Moderated Caucus' ? speakingTime : undefined,
      outcome: 'Pending',
      timestamp: Date.now(),
      notes: notes.trim() || undefined,
    };

    onUpdateMotions([newMotion, ...motions]);
    setShowNewMotionModal(false);
    setSelectedProponentId('');
    setTopic('');
    setNotes('');
  };

  const handleSetOutcome = (id: string, outcome: MotionOutcome) => {
    if (outcome === 'Passed') {
      soundManager.playSuccessFanfare();
      soundManager.playGavel();
    } else if (outcome === 'Failed') {
      soundManager.playGavel();
    }

    const updated = motions.map((m) => (m.id === id ? { ...m, outcome } : m));
    onUpdateMotions(updated);
  };

  const handleDeleteMotion = (id: string) => {
    onUpdateMotions(motions.filter((m) => m.id !== id));
  };

  const handleQuickLaunch = (motion: Motion) => {
    if (!onLaunchCaucus) return;
    if (motion.type === 'Moderated Caucus') {
      onLaunchCaucus('moderated', motion.topic, motion.totalTime, motion.speakingTime);
    } else if (motion.type === 'Unmoderated Caucus') {
      onLaunchCaucus('unmoderated', motion.topic, motion.totalTime);
    }
  };

  const filteredMotions = motions.filter((m) => {
    if (statusFilter === 'All') return true;
    return m.outcome === statusFilter;
  });

  const pendingCount = motions.filter((m) => m.outcome === 'Pending').length;
  const passedCount = motions.filter((m) => m.outcome === 'Passed').length;
  const failedCount = motions.filter((m) => m.outcome === 'Failed').length;

  return (
    <div id="motions-section" className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Parliamentary Motions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
            Motions & Procedural Votes
          </h1>
          <p className="text-purple-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Record raised motions from the floor, adjudicate precedence, and log voting outcomes in
            accordance with Model OIC rules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewMotionModal(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Raise New Motion
        </button>
      </div>

      {/* Stats and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Motions ({motions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Passed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'Passed'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Passed ({passedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Failed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'Failed'
                ? 'bg-red-700 text-white'
                : 'bg-red-50 text-red-800 hover:bg-red-100'
            }`}
          >
            Failed ({failedCount})
          </button>
        </div>

        {motions.length > 0 && (
          <button
            type="button"
            onClick={() => onUpdateMotions([])}
            className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Motions List */}
      <div className="space-y-3">
        {filteredMotions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
            <Gavel className="w-10 h-10 text-purple-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Motions Recorded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When a delegate raises a motion from the floor, click "Raise New Motion" to record
              its type, time, and voting outcome.
            </p>
            <button
              type="button"
              onClick={() => setShowNewMotionModal(true)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Raise First Motion
            </button>
          </div>
        ) : (
          filteredMotions.map((motion) => {
            const isPending = motion.outcome === 'Pending';
            const isPassed = motion.outcome === 'Passed';
            const isFailed = motion.outcome === 'Failed';

            const isCaucusType =
              motion.type === 'Moderated Caucus' || motion.type === 'Unmoderated Caucus';

            return (
              <div
                key={motion.id}
                id={`motion-card-${motion.id}`}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPassed
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : isFailed
                    ? 'border-red-200 bg-red-50/10'
                    : 'border-purple-200/90 hover:border-purple-300'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl" role="img" aria-label={motion.proponentCountryName}>
                      {motion.proponentFlag}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {motion.proponentCountryName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {motion.type}
                    </span>

                    {/* Time details tag */}
                    {motion.totalTime && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {motion.totalTime} mins
                        {motion.speakingTime ? ` (${motion.speakingTime}s spk)` : ''}
                      </span>
                    )}

                    {/* Outcome Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isFailed
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {motion.outcome}
                    </span>
                  </div>

                  {motion.topic && (
                    <p className="text-xs sm:text-sm text-slate-700 font-medium">
                      <span className="text-slate-500 font-normal">Topic:</span> "{motion.topic}"
                    </p>
                  )}

                  {motion.notes && (
                    <p className="text-xs text-slate-500 italic">Notes: {motion.notes}</p>
                  )}
                </div>

                {/* Outcome Action Controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSetOutcome(motion.id, 'Passed')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetOutcome(motion.id, 'Failed')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Fail
                      </button>
                    </>
                  )}

                  {isPassed && isCaucusType && onLaunchCaucus && (
                    <button
                      type="button"
                      onClick={() => handleQuickLaunch(motion)}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Activate this caucus in timer view"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Caucus</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteMotion(motion.id)}
                    className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete motion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Raise New Motion Modal */}
      {showNewMotionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Raise Parliamentary Motion</h3>
                <p className="text-xs text-slate-500">Record a formal motion from the floor</p>
              </div>
            </div>

            <form onSubmit={handleRaiseMotion} className="space-y-3.5">
              {/* Proponent Country */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposing Member State:
                </label>
                <select
                  value={selectedProponentId}
                  onChange={(e) => setSelectedProponentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50"
                  required
                >
                  <option value="">-- Select Proponent Delegation --</option>
                  {presentCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motion Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motion Type:
                </label>
                <select
                  value={motionType}
                  onChange={(e) => setMotionType(e.target.value as MotionType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50"
                >
                  <option value="Moderated Caucus">Moderated Caucus</option>
                  <option value="Unmoderated Caucus">Unmoderated Caucus</option>
                  <option value="Introduction of Draft Resolution">
                    Introduction of Draft Resolution
                  </option>
                  <option value="Closure of Debate">Closure of Debate</option>
                  <option value="Suspension of Meeting">Suspension of Meeting</option>
                  <option value="Adjournment of Meeting">Adjournment of Meeting</option>
                  <option value="Point of Order">Point of Order</option>
                  <option value="Point of Personal Privilege">Point of Personal Privilege</option>
                  <option value="Point of Parliamentary Inquiry">
                    Point of Parliamentary Inquiry
                  </option>
                  <option value="Other">Other Procedural Motion</option>
                </select>
              </div>

              {/* Topic / Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic / Purpose / Resolution Title:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Humanitarian Logistics in Gaza & Sahel"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50"
                />
              </div>

              {/* Time configurations for Caucuses */}
              {(motionType === 'Moderated Caucus' || motionType === 'Unmoderated Caucus') && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                      Total Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={totalTime}
                      onChange={(e) => setTotalTime(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-purple-300 bg-white"
                    />
                  </div>

                  {motionType === 'Moderated Caucus' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                        Speaking Time (seconds)
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="180"
                        step="5"
                        value={speakingTime}
                        onChange={(e) => setSpeakingTime(Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-purple-300 bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Additional notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes (Optional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Secondary sponsor: Republic of Türkiye"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewMotionModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedProponentId}
                  className="px-4 py-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 disabled:bg-slate-200 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Log Motion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
