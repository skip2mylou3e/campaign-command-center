import { StrategicContext } from '../types';

export const strategicContext: StrategicContext = {
  themes: [
    {
      id: 'aml_ctf',
      name: 'AML/CTF Compliance Transformation',
      description:
        'Australia Tranche 2 deadline July 1, 2026 extends AML/CTF obligations to lawyers, conveyancers, and real estate agents. Massive compliance demand across AU events.',
      relevantEvents: [
        'AU-4', 'AU-5', 'AU-11', 'AU-7', 'AU-29', 'AU-31', 'AU-1', 'AU-2',
        'AU-22', 'UK-35', 'UK-36',
      ],
      keyDeadlines: ['AML/CTF Tranche 2 (Australia): July 1, 2026'],
    },
    {
      id: 'ai_genai',
      name: 'AI and GenAI Adoption in Legal Practice',
      description:
        'DeeDee AI assistant vs LEAP LawY. AI governance, ethical adoption, and practical applications across all three markets.',
      relevantEvents: [
        'UK-1', 'UK-2', 'UK-9', 'UK-26', 'AU-1', 'AU-2', 'CA-10', 'CA-6',
        'CA-5', 'UK-10', 'UK-7',
      ],
      keyDeadlines: ['Legal Technology Awards AI categories: Entries due ~Sep 2026'],
    },
    {
      id: 'digital_conveyancing',
      name: 'Digital Conveyancing and Land Registry Modernization',
      description:
        'ARLO in Alberta, Unity BC launch, HMLR digitization in UK, PEXA expansion. Core product positioning across markets.',
      relevantEvents: [
        'CA-7', 'CA-24', 'CA-29', 'CA-30', 'CA-5', 'UK-3', 'UK-4', 'UK-22',
        'UK-27', 'UK-28', 'AU-7', 'AU-23', 'AU-25',
      ],
      keyDeadlines: [
        'Unity BC Launch: Announced Feb 9, 2026',
        'GoVeyance Ontario expansion: Launched Jun 2025 (ongoing threat)',
      ],
    },
    {
      id: 'mortgage_lending',
      name: 'Mortgage/Lending Technology and the Renewal Cycle',
      description:
        'Canadian 2025-2026 mortgage renewal wave, UK lending innovation, Australian broker market. Digital closing and settlement tech.',
      relevantEvents: [
        'CA-3', 'CA-12', 'CA-13', 'CA-11', 'CA-18', 'UK-6', 'UK-11', 'UK-12',
        'UK-17', 'UK-18', 'AU-8', 'AU-9',
      ],
      keyDeadlines: ['Canada mortgage renewal wave: 2025-2026 (ongoing)'],
    },
    {
      id: 'proptech_convergence',
      name: 'PropTech Convergence with Legal Technology',
      description:
        'Legal tech increasingly overlapping with property technology. Opportunity to position D&D at the intersection.',
      relevantEvents: [
        'UK-5', 'UK-13', 'UK-14', 'AU-3', 'AU-16', 'AU-19', 'AU-20', 'CA-1',
      ],
      keyDeadlines: [],
    },
  ],
  deadlines: [
    {
      name: 'AML/CTF Tranche 2 (Australia)',
      date: 'July 1, 2026',
      impact:
        'Extends AML/CTF obligations to lawyers, conveyancers, and real estate agents. Massive compliance technology demand.',
      relatedEvents: ['AU-4', 'AU-5', 'AU-11', 'AU-29', 'AU-31', 'AU-7', 'AU-22'],
    },
    {
      name: 'Unity BC Launch',
      date: 'Announced Feb 9, 2026',
      impact:
        'New market entry for Unity in British Columbia. Key messaging opportunity at BC-focused events.',
      relatedEvents: ['CA-7', 'CA-12', 'CA-15'],
    },
    {
      name: 'GoVeyance Ontario Expansion',
      date: 'Launched Jun 2025 (ongoing)',
      impact:
        'Teranet/GoVeyance expanding into Ontario, directly competing with Unity. $100/file pricing threat.',
      relatedEvents: ['CA-5', 'CA-30', 'CA-8'],
    },
    {
      name: 'LEAP ALPMA Principal Partner',
      date: 'Locked for 2026 + 2027',
      impact:
        'LEAP secured top-tier sponsorship at ALPMA, replacing D&D. Must explore supporting sponsor tiers.',
      relatedEvents: ['AU-2'],
    },
    {
      name: 'UK National Conveyancing Month',
      date: 'March 2026',
      impact:
        'Month-long awareness campaign opportunity. Low cost, high visibility for conveyancing products.',
      relatedEvents: ['UK-27', 'UK-22', 'UK-28', 'UK-3'],
    },
    {
      name: 'Legal Technology Awards AI Categories',
      date: 'Entries due ~Sep 2026',
      impact:
        '4 new AI award categories for 2026. Ideal for D&D AI positioning and DeeDee recognition.',
      relatedEvents: ['UK-26'],
    },
  ],
  counterProgramming: [
    {
      threat: 'InfoTrack + LEAP AML/CTF Roadshows (AU, Mar 2026)',
      counterAt: ['AU-4', 'AU-5', 'AU-11', 'AU-1'],
    },
    {
      threat: 'LEAP AI Seminar Series (AU, ongoing)',
      counterAt: ['AU-1', 'AU-2', 'AU-4', 'AU-5'],
    },
    {
      threat: 'Teranet GoVeyance Ontario events',
      counterAt: ['CA-5', 'CA-30', 'CA-8'],
    },
    {
      threat: 'Landmark CA Conference headline sponsorship',
      counterAt: ['UK-3'],
    },
  ],
};
