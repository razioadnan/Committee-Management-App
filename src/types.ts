export type AttendanceStatus = 'Absent' | 'Present' | 'Present & Voting';

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  delegateName?: string;
  isObserver?: boolean;
  status: AttendanceStatus;
}

export interface Speaker {
  id: string;
  countryId: string;
  countryName: string;
  flag: string;
  speakingTimeLeft?: number;
  status: 'queued' | 'speaking' | 'completed' | 'yielded';
  yieldedTo?: string; // Country name or 'Chair' or 'Points/Questions'
  actualTimeSpoke?: number;
}

export interface ModeratedCaucusState {
  topic: string;
  totalTime: number; // in seconds
  speakingTime: number; // in seconds
  totalTimeRemaining: number; // in seconds
  speakerTimeRemaining: number; // in seconds
  speakers: Speaker[];
  currentSpeakerIndex: number;
  isActive: boolean;
  isPaused: boolean;
  proposerCountryId?: string;
}

export interface UnmoderatedCaucusState {
  topic: string;
  totalTime: number; // in seconds
  timeRemaining: number; // in seconds
  isActive: boolean;
  isPaused: boolean;
  notes: string;
  proposerCountryId?: string;
}

export type MotionType =
  | 'Moderated Caucus'
  | 'Unmoderated Caucus'
  | 'Introduction of Draft Resolution'
  | 'Closure of Debate'
  | 'Suspension of Meeting'
  | 'Adjournment of Meeting'
  | 'Point of Order'
  | 'Point of Personal Privilege'
  | 'Point of Parliamentary Inquiry'
  | 'Other';

export type MotionOutcome = 'Pending' | 'Passed' | 'Failed' | 'Withdrawn';

export interface Motion {
  id: string;
  proponentCountryId: string;
  proponentCountryName: string;
  proponentFlag: string;
  type: MotionType;
  topic?: string;
  totalTime?: number; // minutes or seconds
  speakingTime?: number; // seconds
  outcome: MotionOutcome;
  timestamp: number;
  notes?: string;
}

export type VoteChoice = 'In Favor' | 'Against' | 'Abstain' | 'Unvoted';

export type VotingMajorityType = 'Simple Majority' | 'Two-Thirds (2/3)' | 'Consensus';
export type VotingNature = 'Substantive' | 'Procedural';

export interface VoteRecord {
  id: string;
  title: string;
  nature: VotingNature;
  majorityType: VotingMajorityType;
  timestamp: number;
  votes: Record<string, VoteChoice>; // countryId -> VoteChoice
  result: 'Passed' | 'Failed' | 'In Progress';
  inFavorCount: number;
  againstCount: number;
  abstainCount: number;
  totalEligible: number;
  thresholdRequired: number;
}

export interface CommitteeSettings {
  committeeName: string;
  committeeAcronym: string;
  agendaTopic: string;
  chairName: string;
  coChairName: string;
  rapporteurName: string;
  gslDefaultSpeakingTime: number; // in seconds (e.g. 90)
  modDefaultTotalTime: number; // in minutes (e.g. 10)
  modDefaultSpeakingTime: number; // in seconds (e.g. 60)
  unmodDefaultTotalTime: number; // in minutes (e.g. 15)
  soundEnabled: boolean;
}

export type ActiveModule =
  | 'setup'
  | 'rollcall'
  | 'gsl'
  | 'moderated'
  | 'unmoderated'
  | 'motions'
  | 'voting';
