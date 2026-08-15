import React, { useState, useEffect } from 'react';
import { Country, CommitteeSettings } from '../types';
import { OIC_MEMBER_STATES } from '../data/oicCountries';
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Upload,
  Globe2,
  UserCheck,
  Clock,
  Shield,
  Save,
  AlertCircle,
} from 'lucide-react';

interface CommitteeSetupViewProps {
  settings: CommitteeSettings;
  onUpdateSettings: (newSettings: Partial<CommitteeSettings>) => void;
  countries: Country[];
  onUpdateCountries: (countries: Country[]) => void;
  onNavigateToRollCall: () => void;
}

export const CommitteeSetupView: React.FC<CommitteeSetupViewProps> = ({
  settings,
  onUpdateSettings,
  countries,
  onUpdateCountries,
  onNavigateToRollCall,
}) => {
  const [localSettings, setLocalSettings] = useState<CommitteeSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryFlag, setNewCountryFlag] = useState('🏳️');
  const [newDelegateName, setNewDelegateName] = useState('');
  const [isObserver, setIsObserver] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingCountryId, setEditingCountryId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDelegate, setEditDelegate] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim()) return;

    const newCountry: Country = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newCountryName.trim(),
      code: newCountryName.trim().substring(0, 3).toUpperCase(),
      flag: newCountryFlag || '🏳️',
      delegateName: newDelegateName.trim() || undefined,
      isObserver: isObserver,
      status: 'Absent',
    };

    onUpdateCountries([...countries, newCountry]);
    setNewCountryName('');
    setNewDelegateName('');
    setIsObserver(false);
    setNewCountryFlag('🏳️');
  };

  const handleLoadOic57 = () => {
    if (
      countries.length > 0 &&
      !window.confirm(
        'This will replace the current country list with the complete 57 Official OIC Member States. Proceed?'
      )
    ) {
      return;
    }

    const oic57: Country[] = OIC_MEMBER_STATES.map((c) => ({
      ...c,
      status: 'Absent',
    }));
    onUpdateCountries(oic57);
  };

  const handleLoadSampleActive = () => {
    const activeSample: Country[] = OIC_MEMBER_STATES.map((c, idx) => ({
      ...c,
      status: idx < 30 ? (idx % 2 === 0 ? 'Present & Voting' : 'Present') : 'Absent',
    }));
    onUpdateCountries(activeSample);
  };

  const handleRemoveCountry = (id: string) => {
    onUpdateCountries(countries.filter((c) => c.id !== id));
  };

  const handleStartEdit = (country: Country) => {
    setEditingCountryId(country.id);
    setEditName(country.name);
    setEditDelegate(country.delegateName || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateCountries(
      countries.map((c) =>
        c.id === id ? { ...c, name: editName.trim(), delegateName: editDelegate.trim() || undefined } : c
      )
    );
    setEditingCountryId(null);
  };

  const handleBulkImport = () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const newEntries: Country[] = lines.map((name, i) => ({
      id: `bulk_${Date.now()}_${i}`,
      name,
      code: name.substring(0, 3).toUpperCase(),
      flag: '🏳️',
      status: 'Absent',
    }));

    onUpdateCountries([...countries, ...newEntries]);
    setBulkInput('');
    setShowBulkModal(false);
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.delegateName && c.delegateName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div id="committee-setup-section" className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Committee Configuration Dais
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              Committee Setup & Agenda
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Configure your Model OIC committee credentials, session agenda, default speaking
              times, and roster of delegations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onNavigateToRollCall}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              Proceed to Roll Call →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Committee Credentials & Default Timers Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Committee Details Card */}
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>Committee Information</span>
              </div>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Committee Name
                </label>
                <input
                  type="text"
                  value={localSettings.committeeName}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, committeeName: e.target.value })
                  }
                  placeholder="e.g. Council of Foreign Ministers"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Acronym
                  </label>
                  <input
                    type="text"
                    value={localSettings.committeeAcronym}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, committeeAcronym: e.target.value })
                    }
                    placeholder="e.g. CFM"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chairperson Name
                  </label>
                  <input
                    type="text"
                    value={localSettings.chairName}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, chairName: e.target.value })
                    }
                    placeholder="e.g. H.E. Committee Chair"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agenda Topic / Mandate
                </label>
                <textarea
                  rows={2}
                  value={localSettings.agendaTopic}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, agendaTopic: e.target.value })
                  }
                  placeholder="Enter the official committee agenda..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Co-Chair / Vice Chair
                  </label>
                  <input
                    type="text"
                    value={localSettings.coChairName}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, coChairName: e.target.value })
                    }
                    placeholder="Vice Chair name"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rapporteur
                  </label>
                  <input
                    type="text"
                    value={localSettings.rapporteurName}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, rapporteurName: e.target.value })
                    }
                    placeholder="Rapporteur name"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Default Speaking Times */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-2.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Default Timers Preset</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    GSL (sec)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    step="5"
                    value={localSettings.gslDefaultSpeakingTime}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        gslDefaultSpeakingTime: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Mod Total (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.modDefaultTotalTime}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        modDefaultTotalTime: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Mod Spk (sec)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    step="5"
                    value={localSettings.modDefaultSpeakingTime}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        modDefaultSpeakingTime: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Unmod (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.unmodDefaultTotalTime}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        unmodDefaultTotalTime: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 text-center font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Committee Credentials
            </button>
          </form>

          {/* Quick Add Delegate Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Add Single Delegation</span>
            </div>

            <form onSubmit={handleAddCountry} className="space-y-2.5">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Flag Emoji
                  </label>
                  <input
                    type="text"
                    value={newCountryFlag}
                    onChange={(e) => setNewCountryFlag(e.target.value)}
                    className="w-full px-2 py-1.5 text-center text-sm rounded-lg border border-slate-300"
                    placeholder="🇵🇰"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Country / Entity Name
                  </label>
                  <input
                    type="text"
                    value={newCountryName}
                    onChange={(e) => setNewCountryName(e.target.value)}
                    placeholder="e.g. Sultanate of Oman"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Delegate Name (Optional)
                </label>
                <input
                  type="text"
                  value={newDelegateName}
                  onChange={(e) => setNewDelegateName(e.target.value)}
                  placeholder="Delegate's personal name"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isObserver}
                    onChange={(e) => setIsObserver(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Observer State (Non-Voting)</span>
                </label>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                >
                  Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Country Roster & Roster Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Roster Controls & Preset Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Delegation Roster ({countries.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadOic57}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Load full 57 official OIC member states"
                >
                  Load 57 OIC States
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleActive}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Load pre-configured sample session with roll call"
                >
                  Quick Demo Setup
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Bulk paste countries"
                >
                  Bulk Import
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search delegation or delegate name..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Roster List Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100">
              {filteredCountries.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-3">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-medium">No delegations found matching "{searchQuery}"</p>
                  <button
                    type="button"
                    onClick={handleLoadOic57}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Load 57 OIC Member States
                  </button>
                </div>
              ) : (
                filteredCountries.map((country, index) => {
                  const isEditing = editingCountryId === country.id;
                  return (
                    <div
                      key={country.id}
                      className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xs font-mono text-slate-400 w-6 text-right">
                          {index + 1}
                        </span>
                        <span className="text-xl shrink-0" role="img" aria-label={country.name}>
                          {country.flag}
                        </span>

                        {isEditing ? (
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2 py-1 text-xs rounded border border-emerald-500 focus:outline-none"
                              placeholder="Country Name"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={editDelegate}
                              onChange={(e) => setEditDelegate(e.target.value)}
                              className="px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none"
                              placeholder="Delegate Name"
                            />
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                {country.name}
                              </span>
                              {country.isObserver && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Observer
                                </span>
                              )}
                            </div>
                            {country.delegateName && (
                              <p className="text-[11px] text-slate-500 truncate">
                                Rep: {country.delegateName}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(country.id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(country)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Country"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveCountry(country.id)}
                          className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove delegation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>
                Total Configured: <strong>{countries.length}</strong> delegations
              </span>
              <button
                type="button"
                onClick={() => onUpdateCountries([])}
                className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
              >
                Clear Entire List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Bulk Import Delegations</h3>
            <p className="text-xs text-slate-600">
              Paste a list of country names separated by commas or line breaks:
            </p>
            <textarea
              rows={6}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Kingdom of Saudi Arabia, Republic of Turkey, Islamic Republic of Pakistan, Republic of Indonesia..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs"
              >
                Import Countries
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
