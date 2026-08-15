import React, { useState, useEffect } from 'react';
import { Country, VoteRecord, VoteChoice, VotingMajorityType, VotingNature } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Vote,
  CheckCircle2,
  XCircle,
  MinusCircle,
  RotateCcw,
  Sparkles,
  Award,
  History,
  Shield,
  HelpCircle,
  Check,
  Percent,
} from 'lucide-react';

interface VotingViewProps {
  countries: Country[];
  voteRecords: VoteRecord[];
  onUpdateVoteRecords: (records: VoteRecord[]) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  countries,
  voteRecords,
  onUpdateVoteRecords,
}) => {
  const [resolutionTitle, setResolutionTitle] = useState(
    'Draft Resolution 1.1: Expanding the OIC Special Humanitarian Fund'
  );
  const [votingNature, setVotingNature] = useState<VotingNature>('Substantive');
  const [majorityType, setMajorityType] = useState<VotingMajorityType>('Two-Thirds (2/3)');
  const [currentVotes, setCurrentVotes] = useState<Record<string, VoteChoice>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presentCountries = countries.filter((c) => c.status !== 'Absent');

  // Initialize votes as Unvoted for present delegates
  useEffect(() => {
    const initial: Record<string, VoteChoice> = {};
    presentCountries.forEach((c) => {
      initial[c.id] = currentVotes[c.id] || 'Unvoted';
    });
    setCurrentVotes(initial);
  }, [countries]);

  const handleVote = (countryId: string, choice: VoteChoice) => {
    setCurrentVotes((prev) => ({
      ...prev,
      [countryId]: choice,
    }));
  };

  const handleSetAll = (choice: VoteChoice) => {
    const next: Record<string, VoteChoice> = {};
    presentCountries.forEach((c) => {
      // If setting to Abstain, but country is 'Present & Voting' and voting is Substantive, keep as unvoted or skip
      if (choice === 'Abstain' && c.status === 'Present & Voting') {
        next[c.id] = currentVotes[c.id] || 'Unvoted';
      } else {
        next[c.id] = choice;
      }
    });
    setCurrentVotes(next);
  };

  const handleResetVotes = () => {
    const reset: Record<string, VoteChoice> = {};
    presentCountries.forEach((c) => {
      reset[c.id] = 'Unvoted';
    });
    setCurrentVotes(reset);
  };

  // Tallies
  let inFavor = 0;
  let against = 0;
  let abstain = 0;
  let unvoted = 0;

  presentCountries.forEach((c) => {
    const v = currentVotes[c.id] || 'Unvoted';
    if (v === 'In Favor') inFavor++;
    else if (v === 'Against') against++;
    else if (v === 'Abstain') abstain++;
    else unvoted++;
  });

  // Total active votes cast (abstentions don't count toward majority in substantive MUN voting)
  const votesCast = inFavor + against;
  const totalEligible = presentCountries.length;

  let requiredToPass = 0;
  if (majorityType === 'Simple Majority') {
    requiredToPass = Math.floor(votesCast / 2) + 1;
  } else if (majorityType === 'Two-Thirds (2/3)') {
    requiredToPass = Math.ceil((2 / 3) * votesCast);
  } else {
    // Consensus
    requiredToPass = totalEligible;
  }

  const isComplete = unvoted === 0 && totalEligible > 0;
  const isPassed =
    isComplete &&
    (majorityType === 'Consensus'
      ? against === 0 && inFavor > 0
      : votesCast > 0 && inFavor >= requiredToPass);

  const handleSaveResult = () => {
    const record: VoteRecord = {
      id: `vote_${Date.now()}`,
      title: resolutionTitle,
      nature: votingNature,
      majorityType: majorityType,
      timestamp: Date.now(),
      votes: { ...currentVotes },
      result: isPassed ? 'Passed' : 'Failed',
      inFavorCount: inFavor,
      againstCount: against,
      abstainCount: abstain,
      totalEligible: totalEligible,
      thresholdRequired: requiredToPass,
    };

    onUpdateVoteRecords([record, ...voteRecords]);
    if (isPassed) {
      soundManager.playSuccessFanfare();
      soundManager.playGavel();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      soundManager.playGavel();
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const inFavorPercent = totalEligible > 0 ? Math.round((inFavor / totalEligible) * 100) : 0;
  const againstPercent = totalEligible > 0 ? Math.round((against / totalEligible) * 100) : 0;
  const abstainPercent = totalEligible > 0 ? Math.round((abstain / totalEligible) * 100) : 0;

  return (
    <div id="voting-section" className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Formal Voting Procedure
            </span>
          </div>
          <input
            type="text"
            value={resolutionTitle}
            onChange={(e) => setResolutionTitle(e.target.value)}
            className="text-lg sm:text-2xl font-extrabold bg-transparent text-white border-b border-emerald-400/40 focus:border-emerald-300 focus:outline-none w-full py-0.5"
            placeholder="Draft Resolution / Motion Title..."
          />
        </div>

        {/* Voting Config Selectors */}
        <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/10">
          <select
            value={votingNature}
            onChange={(e) => setVotingNature(e.target.value as VotingNature)}
            className="bg-slate-900/80 text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30"
          >
            <option value="Substantive">Substantive (Resolution)</option>
            <option value="Procedural">Procedural (Motion)</option>
          </select>

          <select
            value={majorityType}
            onChange={(e) => setMajorityType(e.target.value as VotingMajorityType)}
            className="bg-slate-900/80 text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30"
          >
            <option value="Simple Majority">Simple Majority (50% + 1)</option>
            <option value="Two-Thirds (2/3)">Two-Thirds (2/3) Supermajority</option>
            <option value="Consensus">Consensus / Acclamation</option>
          </select>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({voteRecords.length})</span>
          </button>
        </div>
      </div>

      {/* Real-time Tally Dashboard & Progress Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* In Favor */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              In Favor (Yes)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-950">{inFavor}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {inFavorPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${inFavorPercent}%` }}
            />
          </div>
        </div>

        {/* Against */}
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
              Against (No)
            </span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-red-950">{against}</span>
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              {againstPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${againstPercent}%` }}
            />
          </div>
        </div>

        {/* Abstentions */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Abstentions
            </span>
            <MinusCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-amber-950">{abstain}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {abstainPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${abstainPercent}%` }}
            />
          </div>
        </div>

        {/* Required Threshold & Live Decision */}
        <div
          className={`rounded-2xl p-4 border shadow-xs flex flex-col justify-between ${
            isComplete
              ? isPassed
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-red-600 text-white border-red-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              {isComplete ? 'Outcome' : 'Votes to Pass'}
            </span>
            <Award className="w-4 h-4" />
          </div>

          <div className="my-1">
            {isComplete ? (
              <span className="text-2xl font-black tracking-tight">
                {isPassed ? '✓ PASSED' : '✗ FAILED'}
              </span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{requiredToPass}</span>
                <span className="text-xs opacity-75">/ {votesCast} cast</span>
              </div>
            )}
          </div>

          <span className="text-[10px] font-semibold opacity-80">
            {unvoted > 0 ? `${unvoted} unvoted remaining` : `${majorityType} requirement`}
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSetAll('In Favor')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            All In Favor (Acclamation)
          </button>
          <button
            type="button"
            onClick={handleResetVotes}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Reset All Votes
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveResult}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Voting Record & Announce</span>
          </button>
        </div>
      </div>

      {/* Roll Call Voting Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Delegation Roll Call Matrix ({presentCountries.length} Present)</span>
          <span>Individual Vote</span>
        </div>

        <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
          {presentCountries.map((country, idx) => {
            const vote = currentVotes[country.id] || 'Unvoted';
            const isPV = country.status === 'Present & Voting';
            // Delegates marked Present & Voting CANNOT abstain on substantive matters
            const cannotAbstain = votingNature === 'Substantive' && isPV;

            return (
              <div
                key={country.id}
                id={`vote-row-${country.id}`}
                className={`p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  vote === 'In Favor'
                    ? 'bg-emerald-50/40'
                    : vote === 'Against'
                    ? 'bg-red-50/40'
                    : vote === 'Abstain'
                    ? 'bg-amber-50/40'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-slate-400 w-6 text-right">
                    {idx + 1}
                  </span>
                  <span className="text-2xl shrink-0" role="img" aria-label={country.name}>
                    {country.flag}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {country.name}
                      </span>
                      {isPV && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Present & Voting
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3-Button Vote Choice Selector */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* In Favor Button */}
                  <button
                    type="button"
                    onClick={() => handleVote(country.id, 'In Favor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      vote === 'In Favor'
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/50'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    In Favor
                  </button>

                  {/* Against Button */}
                  <button
                    type="button"
                    onClick={() => handleVote(country.id, 'Against')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      vote === 'Against'
                        ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-400/50'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Against
                  </button>

                  {/* Abstain Button (Disabled if Present & Voting in substantive debate) */}
                  <button
                    type="button"
                    disabled={cannotAbstain}
                    onClick={() => handleVote(country.id, 'Abstain')}
                    title={
                      cannotAbstain
                        ? 'This delegation is Present & Voting and cannot abstain.'
                        : 'Abstain from voting'
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      cannotAbstain
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                        : vote === 'Abstain'
                        ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/50'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer'
                    }`}
                  >
                    Abstain
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voting History Drawer/Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-base">Archived Voting Records</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {voteRecords.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No votes recorded yet in this committee session.
                </p>
              ) : (
                voteRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{rec.title}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                          rec.result === 'Passed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {rec.result}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>In Favor: <strong>{rec.inFavorCount}</strong></span>
                      <span>Against: <strong>{rec.againstCount}</strong></span>
                      <span>Abstain: <strong>{rec.abstainCount}</strong></span>
                      <span>Requirement: {rec.majorityType}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Recorded: {new Date(rec.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
