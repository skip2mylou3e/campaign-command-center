export const websiteProductContext = {
  masterBrand: {
    heroMessage: 'From intake to invoice, and everything in between',
    description: 'Our software products help law firms do more with less effort, get paid faster, and make better decisions with confidence',
    unityGlobal: 'Unity is everything you need to run your legal practice, all in one place — including full legal accounting',
    companyDescription: 'Premier practice management solutions empowering legal professionals every day, vital data insights to support critical corporate transactions, essential payments infrastructure trusted by government and financial institutions',
    markets: 'Operations in Canada, United Kingdom, Ireland, Australia, and South Africa',
    aiCapabilities: 'AI solutions built and trained by lawyers, designed for niche lawyer-specific tasks. Built on Microsoft Azure, AWS, OpenAI and Anthropic. AI assistant DeeDee for research, drafting, and legal questions.',
    dueDiligence: 'Real-time data from government registries, KYC and AML compliance tools, biometric facial recognition for identity verification, corporate searches, asset checks, and title verifications from a single source',
    fintech: 'Trusted financial infrastructure connecting banks to critical ecosystem partners including billers, governments, and legal professionals. Mortgage validation, property settlement, white label payment processing, digital banking capabilities.',
  },

  canada: {
    heroMessage: 'Faster, simpler, integrated filing powered by one unified platform',
    unityCA: {
      positioning: "Canada's #1 practice solution with the most feature-rich conveyancing workflows and integrations built in",
      description: "Canada's leading practice management solution. Fully integrated platform for managing practice more efficiently. All-in-one accounting, billing and practice management software.",
      features: ['Matter management', 'Document workflows', 'Full legal accounting (trust and general)', 'Integration with QuickBooks, NetSuite and Xero', 'Compliance tools', 'Custom fields'],
      practiceTypes: 'Built for general practice but rich with special features for corporate, property, wills and estates',
    },
    unityBC: {
      positioning: 'The all-in-one conveyancing software designed to make your firm more efficient, secure, and profitable',
      launchDate: 'February 9, 2026',
      keyStats: '350,000+ real estate transactions processed annually, platform uptime above 99%',
      description: "Canada's most widely used conveyancing solution with content and workflows specifically customized for B.C.",
      integrations: ['Lender Centre (mortgage instructions)', 'Tax Certificates Online (TCOL)', 'Land Title and Survey Authority (LTSA)', 'Identity verification', 'Accounting software'],
      marketInsight: '80% of BC legal professionals identified lack of platform integration as a major hurdle (Dye & Durham / BCNA survey)',
      quote_Rodriguez: 'Software is meant to reduce manual labour, save time and allow legal professionals to do what they do best — offer advice, manage relationships and safeguard their clients during major transactions.',
      quote_Patel: "By connecting critical systems inside a secure platform, we're giving firms a more unified operational environment that supports speed, accuracy, and scale.",
    },
    ecore: {
      positioning: "Canada's leading technology portal to public records data",
    },
    unityEntityManagement: {
      positioning: 'A cloud-based corporate records management system designed for law firms',
    },
    recentNews: [
      'Unity BC launch — Feb 9, 2026',
      'Electronic ID Verification in Unity Practice Management — Jan 13, 2026',
      'Tax Certificates Online for City of Hamilton — Nov 10, 2025',
      'Pablo Rodriguez appointed President of Canada — Jul 29, 2025',
    ],
  },

  unitedKingdom: {
    heroMessage: 'The future of legal tech is here — Everything you need to manage your legal practice, in one place',
    positioning: 'From intake to invoice, and everything in between. Bringing together some of the UK\'s most trusted legal technology and service providers, all under one roof.',
    keyMessage: "Firms don't need more software — they need smarter software",
    practiceManagement: {
      features: ['Legal Accounts', 'Case Management', 'Billing', 'Conveyancing Case Management', 'Document Management', 'Compliance', 'Legal Cashiering', 'Payroll Services', 'Typing & Transcription', 'AML Checks'],
      firmSizes: ['Sole Practitioners', 'Small and Medium Law Firms', 'Big Law Firms'],
    },
    dueDiligence: {
      description: 'Depend on us for every conveyancing report you need — reliable, compliant, and conveniently all in one place',
      features: ['Integrated Workflow Tools', 'Local Authority and Regulated Drainage & Water Searches', 'Environmental & Ground Searches', 'Commercial Property Searches', 'Conveyancing Search Indemnity and Other Title Insurance', 'Vendor Due Diligence'],
    },
    corporateServices: {
      positioning: 'Trusted by over 80 of the top 100 UK law firms. Form, govern & discover.',
      features: ['Company Formations', 'Company Secretarial', 'Corporate Searches', 'Court Searches'],
    },
    clientOnboarding: 'Client Onboarding and KYC Solutions',
  },

  australia: {
    heroMessage: 'Your legal practice, made perfect — From intake to invoice, and everything in between',
    positioning: 'Our software helps law firms do more with less effort, get paid faster, and make better decisions with confidence',
    unityPMS: {
      positioning: 'Everything you need to run your practice, from intake to invoice',
    },
    unitySearch: {
      positioning: 'Easily search information on companies, businesses, properties and individuals',
    },
    affinity: {
      positioning: 'Supporting productivity and growth for mid-tier legal practices',
    },
    terrain: {
      positioning: 'Map-based searching for property planning professionals',
      description: "The most comprehensive range of property information services to Australia's leading property planning and surveying professionals",
      recentUpdate: 'Nearmap integration for high-resolution aerial imagery in parcel and title workflows',
    },
    categories: {
      practiceManagement: 'Developed in collaboration with Australian legal and conveyancing professionals, supporting mid-to-large firms for decades',
      searchDueDiligence: 'Driving business process automation through interpretation and integration of information, including property, personal and company search',
      bankingSettlement: 'Intuitive ordering solutions providing streamlined access to thousands of property and commercial information searches, sourced from authorities across Australia',
    },
    industryReport: 'Changing Legal Landscape Industry Report — developed in partnership with ALPMA, informed by insights from nearly 200 law firms in Australia and New Zealand',
  },

  corporateFacts: {
    ceo: 'George Tsivin',
    boardChair: 'Arnaud Ajdler',
    canadaPresident: 'Pablo Rodriguez',
    cpo: 'Nikesh Patel',
    ticker: 'TSX: DND',
    revenue: '$440.7 million (FY2025)',
    adjustedEBITDA: '$232.8 million (FY2025)',
    q1FY2026Revenue: '$108.3 million',
    investmentInInnovation: '$60+ million annually in product innovation, software operations and R&D',
    founded: 'Over 144 years serving the legal industry',
    headquarters: 'Toronto, Canada (1100-25 York Street)',
    contactPR: 'Carmela Antolino, VP, Marketing & Communications',
  },
};

// Build website context string for selected products/regions
export function buildWebsiteContextString(selectedRegions: string[]): string {
  const sections: string[] = [];

  sections.push(`=== GLOBAL POSITIONING ===
Hero: ${websiteProductContext.masterBrand.heroMessage}
Description: ${websiteProductContext.masterBrand.description}
Unity Global: ${websiteProductContext.masterBrand.unityGlobal}
AI Capabilities: ${websiteProductContext.masterBrand.aiCapabilities}
Due Diligence: ${websiteProductContext.masterBrand.dueDiligence}
Fintech: ${websiteProductContext.masterBrand.fintech}`);

  if (selectedRegions.includes('canada') || selectedRegions.includes('global')) {
    const ca = websiteProductContext.canada;
    sections.push(`=== CANADA (dyedurham.ca) ===
Hero: ${ca.heroMessage}
Unity CA: ${ca.unityCA.positioning} — ${ca.unityCA.description}
Unity BC: ${ca.unityBC.positioning} (Launched ${ca.unityBC.launchDate})
Key Stats: ${ca.unityBC.keyStats}
Market Insight: ${ca.unityBC.marketInsight}
eCore: ${ca.ecore.positioning}
Recent News: ${ca.recentNews.join('; ')}`);
  }

  if (selectedRegions.includes('united_kingdom') || selectedRegions.includes('global')) {
    const uk = websiteProductContext.unitedKingdom;
    sections.push(`=== UNITED KINGDOM (dyedurham.co.uk) ===
Hero: ${uk.heroMessage}
Positioning: ${uk.positioning}
Key Message: ${uk.keyMessage}
Practice Management: ${uk.practiceManagement.features.join(', ')}
Due Diligence: ${uk.dueDiligence.description}
Corporate Services: ${uk.corporateServices.positioning}`);
  }

  if (selectedRegions.includes('australia') || selectedRegions.includes('global')) {
    const au = websiteProductContext.australia;
    sections.push(`=== AUSTRALIA (dyedurham.com.au) ===
Hero: ${au.heroMessage}
Positioning: ${au.positioning}
Terrain: ${au.terrain.positioning} — ${au.terrain.description}
Industry Report: ${au.industryReport}`);
  }

  const cf = websiteProductContext.corporateFacts;
  sections.push(`=== CORPORATE FACTS ===
CEO: ${cf.ceo} | Board Chair: ${cf.boardChair} | Canada President: ${cf.canadaPresident} | CPO: ${cf.cpo}
Ticker: ${cf.ticker} | Revenue: ${cf.revenue} | Adjusted EBITDA: ${cf.adjustedEBITDA}
Innovation Investment: ${cf.investmentInInnovation}
Founded: ${cf.founded} | HQ: ${cf.headquarters}
PR Contact: ${cf.contactPR}`);

  return sections.join('\n\n');
}
