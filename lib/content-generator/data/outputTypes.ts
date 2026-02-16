import { OutputType, OutputCategory } from '../types';

export const outputTypes: OutputType[] = [
  // ============================================
  // LINKEDIN + SOCIAL MEDIA
  // ============================================
  {
    id: 'linkedin_thought_leadership',
    label: 'LinkedIn Post - Thought Leadership Angle',
    category: 'linkedin_social',
    charLimit: { min: 1200, max: 1600 },
    wordLimit: { min: 200, max: 270 },
    formatNotes: 'Hook in first 210 characters before "see more" fold. Include 2-3 hashtags.',
    description: 'Lead with an industry insight, trend, or provocative question. Connect back to how Dye & Durham addresses it.',
  },
  {
    id: 'linkedin_customer_outcome',
    label: 'LinkedIn Post - Customer Outcome Angle',
    category: 'linkedin_social',
    charLimit: { min: 1200, max: 1600 },
    formatNotes: 'Front-load the outcome in the first 210 characters. Include 2-3 hashtags.',
    description: 'Lead with a result, outcome, or transformation story. Frame the product/feature as the enabler.',
  },
  {
    id: 'linkedin_news',
    label: 'LinkedIn Post - News/Announcement Angle',
    category: 'linkedin_social',
    charLimit: { min: 800, max: 1200 },
    wordLimit: { min: 130, max: 200 },
    formatNotes: 'Shorter and punchier for news. Include 2-3 hashtags.',
    description: 'Lead with the news itself. Explain why it matters to the target audience.',
  },
  {
    id: 'twitter_post',
    label: 'X/Twitter Post',
    category: 'linkedin_social',
    charLimit: { min: 1, max: 280 },
    formatNotes: 'Single punchy statement under 280 characters.',
    description: 'Distill the core message into a single concise post.',
  },
  {
    id: 'instagram_caption',
    label: 'Instagram Caption',
    category: 'linkedin_social',
    wordLimit: { min: 150, max: 200 },
    formatNotes: 'More visual/storytelling tone. Include 5-8 hashtags.',
    description: 'Visual-forward caption with storytelling tone and relevant hashtags.',
  },

  // ============================================
  // EMAIL CAMPAIGNS
  // ============================================
  {
    id: 'email_pre_release',
    label: 'Email - Pre-Release / Coming Soon',
    category: 'email',
    wordLimit: { min: 50, max: 125 },
    formatNotes: 'Builds anticipation. Teases key capabilities without full details. CTA: "Stay tuned" or "Register your interest." Include 3 subject line options (6-10 words each) + preview text (40-90 characters).',
    description: 'Pre-release teaser email that builds anticipation without revealing full details.',
  },
  {
    id: 'email_launch',
    label: 'Email - Launch Announcement',
    category: 'email',
    wordLimit: { min: 50, max: 125 },
    formatNotes: '3 subject line options (6-10 words each) + preview text (40-90 characters). Hook -> Key message -> Proof point -> CTA.',
    description: 'Main launch announcement email with subject line variants and clear CTA.',
  },
  {
    id: 'email_nurture_x3',
    label: 'Email - Post-Launch Nurture x3',
    category: 'email',
    wordLimit: { min: 50, max: 125 },
    formatNotes: 'Three emails: feature spotlight sequence. Each focuses on one value driver. CTA escalates: learn more -> watch demo -> contact us. Each with 3 subject lines + preview text.',
    description: 'Three-part nurture sequence, each spotlighting a different value driver with escalating CTAs.',
  },
  {
    id: 'in_app_message',
    label: 'In-App Message',
    category: 'email',
    wordLimit: { min: 40, max: 60 },
    formatNotes: 'Short, action-oriented. Links to product sheet, video, or website. For existing users of adjacent products.',
    description: 'Brief in-app notification for existing users about new features or products.',
  },

  // ============================================
  // PAID DIGITAL ADVERTISING
  // ============================================
  {
    id: 'google_search_ads',
    label: 'Google Search Ads - 3 variations',
    category: 'ads',
    formatNotes: 'Each variation: Headlines max 30 chars x3, Descriptions max 90 chars x2, Display URL path max 15 chars x2, Sitelink suggestions x4.',
    description: 'Three Google Search Ad variations with headlines, descriptions, display paths, and sitelinks.',
  },
  {
    id: 'linkedin_sponsored_content',
    label: 'LinkedIn Sponsored Content - 3 variations',
    category: 'ads',
    formatNotes: 'Each variation: Intro text max 150 chars, Headline max 70 chars, Description max 100 chars, CTA button text, Image direction note.',
    description: 'Three LinkedIn Sponsored Content ad variations with intro text, headlines, and CTA recommendations.',
  },
  {
    id: 'linkedin_text_ads',
    label: 'LinkedIn Text Ads - 2 variations',
    category: 'ads',
    formatNotes: 'Each variation: Headline max 25 chars, Description max 75 chars.',
    description: 'Two LinkedIn Text Ad variations with tight character constraints.',
  },
  {
    id: 'meta_ads',
    label: 'Meta (Facebook/Instagram) Ads - 3 variations',
    category: 'ads',
    formatNotes: 'Each variation: Primary text max 125 chars, Headline max 40 chars, Description max 30 chars, CTA button selection, Image/video direction note.',
    description: 'Three Meta ad variations for Facebook and Instagram with primary text, headlines, and CTA recommendations.',
  },
  {
    id: 'youtube_ads',
    label: 'YouTube Ad Scripts - 2 variations',
    category: 'ads',
    formatNotes: 'Each variation: Hook (first 5 seconds script), Main message (15-25 seconds script), CTA (5 seconds script). Plus companion banner headline max 25 chars.',
    description: 'Two YouTube in-stream ad scripts with hook, message, and CTA structured for skippable format.',
  },
  {
    id: 'industry_pub_ad',
    label: 'Industry Publication Ad / Advertorial Brief',
    category: 'ads',
    formatNotes: 'Banner ad: Headline max 8 words, tagline max 12 words, CTA max 4 words. Newsletter sponsorship: 50-75 word blurb + headline. Advertorial: 300-500 word outline.',
    description: 'Ad copy for legal industry publications — banner ads, newsletter sponsorships, or advertorial briefs.',
  },

  // ============================================
  // BLOG + THOUGHT LEADERSHIP
  // ============================================
  {
    id: 'blog_full_draft',
    label: 'Blog Post - Full Draft',
    category: 'blog',
    wordLimit: { min: 1500, max: 2000 },
    formatNotes: '3 headline options (max 60 chars for SEO). Meta description (150-160 chars). Structure: intro hook, 3 body sections, conclusion + CTA. Internal link placeholders. SEO keywords 3-5 times.',
    description: 'Full-length SEO-optimized blog post with headline options, meta description, and structured body.',
  },
  {
    id: 'executive_summary',
    label: 'Executive Summary / One-Pager',
    category: 'blog',
    wordLimit: { min: 200, max: 300 },
    formatNotes: 'Structure: Key Insight -> Why It Matters -> What We Offer -> Next Step.',
    description: 'Concise executive summary suitable for a PDF one-pager or internal briefing.',
  },
  {
    id: 'blog_social_amplification',
    label: 'Blog Social Amplification Kit',
    category: 'blog',
    formatNotes: '2 LinkedIn posts promoting the blog + 1 email teaser (50-75 words).',
    description: 'Social promotion kit for a blog post: LinkedIn posts and email teaser.',
  },
  {
    id: 'trade_media_advertorial',
    label: 'Trade Media / Advertorial Outline',
    category: 'blog',
    wordLimit: { min: 400, max: 600 },
    formatNotes: 'Thought leadership angle suitable for legal industry publications, Law Society journals, or ALPMA-style content. Educational tone, not promotional.',
    description: 'Thought leadership article outline for trade publications and legal industry journals.',
  },
  {
    id: 'press_release_draft',
    label: 'Press Release Draft',
    category: 'blog',
    wordLimit: { min: 400, max: 600 },
    formatNotes: 'Standard press release structure: headline, dateline, lead paragraph, quotes, boilerplate. Follows Dye & Durham press release conventions.',
    description: 'Full press release draft following standard structure with Dye & Durham boilerplate.',
  },

  // ============================================
  // SALES ENABLEMENT + INTERNAL
  // ============================================
  {
    id: 'product_card',
    label: 'Product Card / Brochure Copy',
    category: 'sales_internal',
    wordLimit: { min: 250, max: 400 },
    formatNotes: 'Structure: headline, 3-line elevator pitch, 4-6 key benefits with icons, feature list, CTA. For design team to lay out.',
    description: 'Product card copy with elevator pitch, key benefits, and feature list for design layout.',
  },
  {
    id: 'battlecard',
    label: 'Battlecard Talking Points',
    category: 'sales_internal',
    wordLimit: { min: 300, max: 500 },
    formatNotes: '"When they say X, we say Y" format. Key differentiators, objection handling, proof points.',
    description: 'Competitive battlecard with positioning, objection handling, and differentiators.',
  },
  {
    id: 'faq_draft',
    label: 'FAQ Draft',
    category: 'sales_internal',
    formatNotes: '8-12 Q&A pairs. Customer-facing and support-team-facing. Covers: what\'s new, who it\'s for, how to access, pricing/packaging, migration, and support.',
    description: 'Comprehensive FAQ covering customer and support team questions.',
  },
  {
    id: 'internal_launch_email',
    label: 'Internal Launch Email / CEO Email',
    category: 'sales_internal',
    wordLimit: { min: 150, max: 200 },
    formatNotes: 'Motivational tone. Positions the launch as a milestone. Equips staff with what to say to customers.',
    description: 'Internal announcement email positioning the launch as a milestone.',
  },
  {
    id: 'sales_enablement_brief',
    label: 'Sales Enablement Brief',
    category: 'sales_internal',
    wordLimit: { min: 200, max: 300 },
    formatNotes: 'Elevator pitch + 5 key talking points + 3 objection responses. Quick-reference format for account managers.',
    description: 'Quick-reference sales brief with talking points and objection handling.',
  },

  // ============================================
  // WEBSITE
  // ============================================
  {
    id: 'product_page_copy',
    label: 'Product Page Copy',
    category: 'website',
    wordLimit: { min: 300, max: 500 },
    formatNotes: 'Hero headline + subhead, 3-section body with value propositions, feature list, CTA. Written for conversion.',
    description: 'Conversion-focused product page copy with hero section and value propositions.',
  },
  {
    id: 'homepage_banner',
    label: 'Homepage Banner Copy',
    category: 'website',
    formatNotes: 'Headline: max 10 words. Subhead: max 25 words. CTA button text.',
    description: 'Concise homepage banner with headline, subhead, and CTA button text.',
  },
  {
    id: 'video_script_outline',
    label: 'Video Script Outline',
    category: 'website',
    wordLimit: { min: 200, max: 400 },
    formatNotes: 'Structure: hook (5 sec), problem (15 sec), solution (30 sec), proof (15 sec), CTA (5 sec). For 60-90 second overview video.',
    description: 'Structured video script outline for a 60-90 second product overview video.',
  },
];

// Output category display info
export const outputCategories: { id: OutputCategory; label: string; icon: string }[] = [
  { id: 'linkedin_social', label: 'LinkedIn + Social Media', icon: 'Linkedin' },
  { id: 'email', label: 'Email Campaigns', icon: 'Mail' },
  { id: 'ads', label: 'Paid Digital Advertising', icon: 'Megaphone' },
  { id: 'blog', label: 'Blog + Thought Leadership', icon: 'FileText' },
  { id: 'sales_internal', label: 'Sales Enablement + Internal', icon: 'Briefcase' },
  { id: 'website', label: 'Website', icon: 'Globe' },
];

// Helper: get output types grouped by category
export function getOutputTypesByCategory(): Record<OutputCategory, OutputType[]> {
  const grouped: Record<string, OutputType[]> = {};
  for (const ot of outputTypes) {
    if (!grouped[ot.category]) grouped[ot.category] = [];
    grouped[ot.category].push(ot);
  }
  return grouped as Record<OutputCategory, OutputType[]>;
}
