import { Country } from '../types';

/**
 * Official 57 Member States of the Organisation of Islamic Cooperation (OIC)
 * Source: https://www.oic-oci.org/en/members
 */
export const OIC_MEMBER_STATES: Omit<Country, 'status'>[] = [
  { id: 'afg', name: 'Afghanistan', code: 'AF', flag: '🇦🇫' },
  { id: 'alb', name: 'Albania', code: 'AL', flag: '🇦🇱' },
  { id: 'dza', name: 'Algeria', code: 'DZ', flag: '🇩🇿' },
  { id: 'aze', name: 'Azerbaijan', code: 'AZ', flag: '🇦🇿' },
  { id: 'bhr', name: 'Bahrain', code: 'BH', flag: '🇧🇭' },
  { id: 'bgd', name: 'Bangladesh', code: 'BD', flag: '🇧🇩' },
  { id: 'ben', name: 'Benin', code: 'BJ', flag: '🇧🇯' },
  { id: 'brn', name: 'Brunei Darussalam', code: 'BN', flag: '🇧🇳' },
  { id: 'bfa', name: 'Burkina Faso', code: 'BF', flag: '🇧🇫' },
  { id: 'cmr', name: 'Cameroon', code: 'CM', flag: '🇨🇲' },
  { id: 'tcd', name: 'Chad', code: 'TD', flag: '🇹🇩' },
  { id: 'com', name: 'Comoros', code: 'KM', flag: '🇰🇲' },
  { id: 'civ', name: "Côte d'Ivoire", code: 'CI', flag: '🇨🇮' },
  { id: 'dji', name: 'Djibouti', code: 'DJ', flag: '🇩🇯' },
  { id: 'egy', name: 'Egypt', code: 'EG', flag: '🇪🇬' },
  { id: 'gab', name: 'Gabon', code: 'GA', flag: '🇬🇦' },
  { id: 'gmb', name: 'Gambia', code: 'GM', flag: '🇬🇲' },
  { id: 'gin', name: 'Guinea', code: 'GN', flag: '🇬🇳' },
  { id: 'gnb', name: 'Guinea-Bissau', code: 'GW', flag: '🇬🇼' },
  { id: 'guy', name: 'Guyana', code: 'GY', flag: '🇬🇾' },
  { id: 'idn', name: 'Indonesia', code: 'ID', flag: '🇮🇩' },
  { id: 'irn', name: 'Iran', code: 'IR', flag: '🇮🇷' },
  { id: 'irq', name: 'Iraq', code: 'IQ', flag: '🇮🇶' },
  { id: 'jor', name: 'Jordan', code: 'JO', flag: '🇯🇴' },
  { id: 'kaz', name: 'Kazakhstan', code: 'KZ', flag: '🇰🇿' },
  { id: 'kwt', name: 'Kuwait', code: 'KW', flag: '🇰🇼' },
  { id: 'kgz', name: 'Kyrgyzstan', code: 'KG', flag: '🇰🇬' },
  { id: 'lbn', name: 'Lebanon', code: 'LB', flag: '🇱🇧' },
  { id: 'lby', name: 'Libya', code: 'LY', flag: '🇱🇾' },
  { id: 'mys', name: 'Malaysia', code: 'MY', flag: '🇲🇾' },
  { id: 'mdv', name: 'Maldives', code: 'MV', flag: '🇲🇻' },
  { id: 'mli', name: 'Mali', code: 'ML', flag: '🇲🇱' },
  { id: 'mrt', name: 'Mauritania', code: 'MR', flag: '🇲🇷' },
  { id: 'mar', name: 'Morocco', code: 'MA', flag: '🇲🇦' },
  { id: 'moz', name: 'Mozambique', code: 'MZ', flag: '🇲🇿' },
  { id: 'ner', name: 'Niger', code: 'NE', flag: '🇳🇪' },
  { id: 'nga', name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  { id: 'omn', name: 'Oman', code: 'OM', flag: '🇴🇲' },
  { id: 'pak', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
  { id: 'pse', name: 'Palestine', code: 'PS', flag: '🇵🇸' },
  { id: 'qat', name: 'Qatar', code: 'QA', flag: '🇶🇦' },
  { id: 'sau', name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦' },
  { id: 'sen', name: 'Senegal', code: 'SN', flag: '🇸🇳' },
  { id: 'sle', name: 'Sierra Leone', code: 'SL', flag: '🇸🇱' },
  { id: 'som', name: 'Somalia', code: 'SO', flag: '🇸🇴' },
  { id: 'sdn', name: 'Sudan', code: 'SD', flag: '🇸🇩' },
  { id: 'sur', name: 'Suriname', code: 'SR', flag: '🇸🇷' },
  { id: 'syr', name: 'Syria', code: 'SY', flag: '🇸🇾' },
  { id: 'tjk', name: 'Tajikistan', code: 'TJ', flag: '🇹🇯' },
  { id: 'tgo', name: 'Togo', code: 'TG', flag: '🇹🇬' },
  { id: 'tun', name: 'Tunisia', code: 'TN', flag: '🇹🇳' },
  { id: 'tur', name: 'Türkiye', code: 'TR', flag: '🇹🇷' },
  { id: 'tkm', name: 'Turkmenistan', code: 'TM', flag: '🇹🇲' },
  { id: 'uga', name: 'Uganda', code: 'UG', flag: '🇺🇬' },
  { id: 'are', name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' },
  { id: 'uzb', name: 'Uzbekistan', code: 'UZ', flag: '🇺🇿' },
  { id: 'yem', name: 'Yemen', code: 'YE', flag: '🇾🇪' },
];

export const INITIAL_COUNTRIES: Country[] = OIC_MEMBER_STATES.map((c, idx) => ({
  ...c,
  // Start with delegations present to give an immediately rich working experience
  status: idx < 32 ? (idx % 2 === 0 ? 'Present & Voting' : 'Present') : 'Absent',
}));

export const DEFAULT_COMMITTEE_SETTINGS = {
  committeeName: 'Council of Foreign Ministers (CFM)',
  committeeAcronym: 'OIC-CFM',
  agendaTopic: 'Fostering Economic Resilience, Digital Integration, and Humanitarian Cooperation Across Member States',
  chairName: 'Committee Chairperson',
  coChairName: 'Vice-Chairperson',
  rapporteurName: 'Secretariat Rapporteur',
  gslDefaultSpeakingTime: 90, // seconds
  modDefaultTotalTime: 10, // minutes
  modDefaultSpeakingTime: 60, // seconds
  unmodDefaultTotalTime: 15, // minutes
  soundEnabled: true,
};
