/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveModule,
  Country,
  CommitteeSettings,
  Speaker,
  Motion,
  VoteRecord,
} from './types';
import {
  loadSettings,
  saveSettings,
  loadCountries,
  saveCountries,
  loadGslSpeakers,
  saveGslSpeakers,
  loadMotions,
  saveMotions,
  loadVotes,
  saveVotes,
  exportFullSession,
  resetAllSessionData,
  ExportedSessionData,
} from './utils/storage';
import { soundManager } from './utils/audio';

import { Header } from './components/Header';
import { ModuleGridNav } from './components/ModuleGridNav';
import { IslamicBackgroundPattern } from './components/IslamicBackgroundPattern';
import { CommitteeSetupView } from './components/CommitteeSetupView';
import { RollCallView } from './components/RollCallView';
import { GslView } from './components/GslView';
import { ModeratedCaucusView } from './components/ModeratedCaucusView';
import { UnmoderatedCaucusView } from './components/UnmoderatedCaucusView';
import { MotionsView } from './components/MotionsView';
import { VotingView } from './components/VotingView';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('setup');
  const [settings, setSettings] = useState<CommitteeSettings>(loadSettings);
  const [countries, setCountries] = useState<Country[]>(loadCountries);
  const [gslSpeakers, setGslSpeakers] = useState<Speaker[]>(loadGslSpeakers);
  const [motions, setMotions] = useState<Motion[]>(loadMotions);
  const [votes, setVotes] = useState<VoteRecord[]>(loadVotes);
  const [unmodNotes, setUnmodNotes] = useState<string>(() => {
    try {
      return localStorage.getItem('moic_unmod_notes_v2') || '';
    } catch {
      return '';
    }
  });

  // Keep soundManager muted state synced
  useEffect(() => {
    soundManager.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Persist state changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveCountries(countries);
  }, [countries]);

  useEffect(() => {
    saveGslSpeakers(gslSpeakers);
  }, [gslSpeakers]);

  useEffect(() => {
    saveMotions(motions);
  }, [motions]);

  useEffect(() => {
    saveVotes(votes);
  }, [votes]);

  useEffect(() => {
    try {
      localStorage.setItem('moic_unmod_notes_v2', unmodNotes);
    } catch {
      // ignore
    }
  }, [unmodNotes]);

  // Stats calculation for navigation cards
  const totalPresent = countries.filter((c) => c.status !== 'Absent').length;
  const pendingMotionsCount = motions.filter((m) => m.outcome === 'Pending').length;

  const handleUpdateSettings = (newSettings: Partial<CommitteeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleExportSession = () => {
    const jsonStr = exportFullSession(
      settings,
      countries,
      gslSpeakers,
      motions,
      votes,
      unmodNotes
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moic-session-${settings.committeeAcronym || 'committee'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSession = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed: ExportedSessionData = JSON.parse(content);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.countries) setCountries(parsed.countries);
        if (parsed.gslSpeakers) setGslSpeakers(parsed.gslSpeakers);
        if (parsed.motions) setMotions(parsed.motions);
        if (parsed.votes) setVotes(parsed.votes);
        if (parsed.unmodNotes !== undefined) setUnmodNotes(parsed.unmodNotes);
        alert('Committee session restored successfully from backup!');
      } catch (err) {
        alert('Failed to import session file. Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSession = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all session data? This will restore initial defaults and clear speaker lists & motions.'
      )
    ) {
      resetAllSessionData();
      window.location.reload();
    }
  };

  const handleLaunchCaucusFromMotion = (
    type: 'moderated' | 'unmoderated',
    topic?: string,
    totalMins?: number,
    spkSecs?: number
  ) => {
    if (type === 'moderated') {
      if (totalMins) handleUpdateSettings({ modDefaultTotalTime: totalMins });
      if (spkSecs) handleUpdateSettings({ modDefaultSpeakingTime: spkSecs });
      setActiveModule('moderated');
    } else {
      if (totalMins) handleUpdateSettings({ unmodDefaultTotalTime: totalMins });
      setActiveModule('unmoderated');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col relative font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Subtle Islamic Arabesque Star Pattern Watermark */}
      <IslamicBackgroundPattern />

      {/* Top Application Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onExport={handleExportSession}
        onImport={handleImportSession}
        onReset={handleResetSession}
      />

      {/* Main Module Grid & Active Workspace */}
      <main className="flex-1 w-full relative z-10 py-4 space-y-6">
        {/* Navigation Grid Cards as featured in Image 1 */}
        <ModuleGridNav
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          stats={{
            totalPresent,
            totalCountries: countries.length,
            gslQueueCount: gslSpeakers.filter((s) => s.status === 'queued').length,
            pendingMotionsCount,
            activeCaucus: 'none',
          }}
        />

        {/* Dynamic Active Module View Container */}
        <section className="w-full transition-opacity duration-200">
          {activeModule === 'setup' && (
            <CommitteeSetupView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              countries={countries}
              onUpdateCountries={setCountries}
              onNavigateToRollCall={() => setActiveModule('rollcall')}
            />
          )}

          {activeModule === 'rollcall' && (
            <RollCallView
              countries={countries}
              onUpdateCountries={setCountries}
              onNavigateToGsl={() => setActiveModule('gsl')}
            />
          )}

          {activeModule === 'gsl' && (
            <GslView
              countries={countries}
              settings={settings}
              speakers={gslSpeakers}
              onUpdateSpeakers={setGslSpeakers}
            />
          )}

          {activeModule === 'moderated' && (
            <ModeratedCaucusView
              countries={countries}
              settings={settings}
            />
          )}

          {activeModule === 'unmoderated' && (
            <UnmoderatedCaucusView
              settings={settings}
              notes={unmodNotes}
              onUpdateNotes={setUnmodNotes}
            />
          )}

          {activeModule === 'motions' && (
            <MotionsView
              countries={countries}
              motions={motions}
              onUpdateMotions={setMotions}
              onLaunchCaucus={handleLaunchCaucusFromMotion}
            />
          )}

          {activeModule === 'voting' && (
            <VotingView
              countries={countries}
              voteRecords={votes}
              onUpdateVoteRecords={setVotes}
            />
          )}
        </section>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full border-t border-slate-200 bg-white/80 backdrop-blur-xs py-3 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-700 font-bold">Model OIC</span> Committee Management
            Platform
          </div>
          <div className="text-[11px] text-slate-400">
            Organisation of Islamic Cooperation • Client-side local storage auto-save active
          </div>
        </div>
      </footer>
    </div>
  );
}
