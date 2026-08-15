import React, { useState } from 'react';
import { Country, AttendanceStatus } from '../types';
import {
  Users,
  UserCheck,
  UserX,
  Vote,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Filter,
  CheckSquare,
  Copy,
  Check,
} from 'lucide-react';

interface RollCallViewProps {
  countries: Country[];
  onUpdateCountries: (countries: Country[]) => void;
  onNavigateToGsl: () => void;
}

export const RollCallView: React.FC<RollCallViewProps> = ({
  countries,
  onUpdateCountries,
  onNavigateToGsl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Calculate live statistical metrics
  const total = countries.length;
  const presentOnly = countries.filter((c) => c.status === 'Present').length;
  const presentAndVoting = countries.filter((c) => c.status === 'Present & Voting').length;
  const totalPresent = presentOnly + presentAndVoting;
  const absent = countries.filter((c) => c.status === 'Absent').length;

  // Model OIC Quorum calculation: Minimum 1/3 of member states
  const quorumRequired = Math.ceil(total / 3);
  const isQuorumMet = total > 0 && totalPresent >= quorumRequired;

  // Simple majority: 50% + 1 of total present
  const simpleMajority = Math.floor(totalPresent / 2) + 1;

  // 2/3 Supermajority: ceil(2/3 * totalPresent)
  const twoThirdsMajority = Math.ceil((2 / 3) * totalPresent);

  const handleSetStatus = (id: string, status: AttendanceStatus) => {
    const updated = countries.map((c) => (c.id === id ? { ...c, status } : c));
    onUpdateCountries(updated);
  };

  const handleSetAll = (status: AttendanceStatus) => {
    onUpdateCountries(countries.map((c) => ({ ...c, status })));
  };

  const handleCopySummary = () => {
    const text = `MODEL OIC COMMITTEE ROLL CALL SUMMARY
Date: ${new Date().toLocaleDateString()}
Total Delegations: ${total}
Total Present: ${totalPresent} (${Math.round((totalPresent / (total || 1)) * 100)}%)
- Present & Voting: ${presentAndVoting}
- Present: ${presentOnly}
- Absent: ${absent}
Quorum Status: ${isQuorumMet ? 'MET' : 'NOT MET'} (Required: ${quorumRequired})
Simple Majority (50%+1): ${simpleMajority}
2/3 Supermajority: ${twoThirdsMajority}
`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const filteredCountries = countries.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.delegateName && c.delegateName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="rollcall-section" className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Live Statistical Dashboard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Delegations */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Roster
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{total}</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Registered States</span>
        </div>

        {/* Total Present */}
        <div className="bg-teal-50/70 rounded-xl p-3.5 border border-teal-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
            Total Present
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-teal-950">{totalPresent}</span>
            <span className="text-xs font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
              {total > 0 ? Math.round((totalPresent / total) * 100) : 0}%
            </span>
          </div>
          <span className="text-[10px] text-teal-700 mt-1 block">Present in Chamber</span>
        </div>

        {/* Present & Voting */}
        <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Present & Voting
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-950">{presentAndVoting}</span>
            <Vote className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block">Cannot Abstain</span>
        </div>

        {/* Quorum Metric */}
        <div
          className={`rounded-xl p-3.5 border shadow-xs ${
            isQuorumMet
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}
        >
          <span
            className={`text-[11px] font-bold uppercase tracking-wider block ${
              isQuorumMet ? 'text-emerald-100' : 'text-amber-800'
            }`}
          >
            Quorum (1/3)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black">{quorumRequired}</span>
            {isQuorumMet ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <span
            className={`text-[10px] font-bold mt-1 block ${
              isQuorumMet ? 'text-emerald-100' : 'text-amber-700'
            }`}
          >
            {isQuorumMet ? '✓ Quorum Achieved' : '⚠ Quorum Not Met'}
          </span>
        </div>

        {/* Simple Majority (50% + 1) */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Simple Majority
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">
              {totalPresent > 0 ? simpleMajority : 0}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              50% + 1
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">To Pass Procedural</span>
        </div>

        {/* 2/3 Supermajority */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            2/3 Supermajority
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">
              {totalPresent > 0 ? twoThirdsMajority : 0}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              2/3 Votes
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">To Pass Resolution</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Present & Voting')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'Present & Voting'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Present & Voting ({presentAndVoting})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Present')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'Present'
                  ? 'bg-teal-700 text-white'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
            >
              Present ({presentOnly})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Absent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'Absent'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              Absent ({absent})
            </button>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSetAll('Present & Voting')}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Set all delegations to Present & Voting"
            >
              All P&V
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('Present')}
              className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Set all delegations to Present"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('Absent')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Reset all delegations to Absent"
            >
              Reset to Absent
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Copy attendance statistics summary to clipboard"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search delegation or delegate name for roll call..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Roll Call Attendance Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Delegation ({filteredCountries.length})</span>
          <span>Attendance Status Selector</span>
        </div>

        <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
          {filteredCountries.map((country, idx) => {
            const isAbsent = country.status === 'Absent';
            const isPresent = country.status === 'Present';
            const isPV = country.status === 'Present & Voting';

            return (
              <div
                key={country.id}
                id={`rollcall-row-${country.id}`}
                className={`p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isPV
                    ? 'bg-emerald-50/30 hover:bg-emerald-50/50'
                    : isPresent
                    ? 'bg-teal-50/20 hover:bg-teal-50/40'
                    : 'hover:bg-slate-50/80'
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
                      {country.isObserver && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Observer
                        </span>
                      )}
                    </div>
                    {country.delegateName && (
                      <span className="text-xs text-slate-500 block truncate">
                        Delegate: {country.delegateName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Toggle Button Group */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(country.id, 'Absent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isAbsent
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Absent
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(country.id, 'Present')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isPresent
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                    }`}
                  >
                    Present
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(country.id, 'Present & Voting')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isPV
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/50'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Present & Voting
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Current Floor: <strong>{totalPresent}</strong> / {total} Delegations Present (
            <strong>{presentAndVoting}</strong> Present & Voting)
          </div>

          <button
            type="button"
            onClick={onNavigateToGsl}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to General Speakers List</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
