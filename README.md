# Campaign Command Center

A browser-based digital advertising strategy tool built for the Dye & Durham marketing team. More than a campaign planner — it's an always-available digital advertising strategist, teacher, and operations hub.

## What This App Does

- **Quick Ask** — Chat-based Q&A for fast digital advertising answers, tailored to D&D's legal tech context
- **Plan a Campaign** — Guided brief builder that generates comprehensive campaign plans via AI, or produces a copy-paste prompt for any AI assistant
- **My Campaigns** — Dashboard of saved campaign plans with status tracking
- **Glossary** — Searchable glossary of 50+ digital advertising terms explained in plain language
- **Settings** — Team configuration (tech stack, experience level, tools) that customizes all AI recommendations

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** with Dye & Durham brand colors
- **Anthropic Claude API** for AI-powered features
- **localStorage** for data persistence (database-ready architecture)
- **html2canvas + jsPDF** for client-side PDF export

## Local Development

```bash
git clone <repo-url>
cd campaign-command-center
npm install
cp .env.example .env.local    # then fill in your API key
npm run dev                    # runs on http://localhost:3000
```

### Environment Variables

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**The app works without an API key** — you can use the "Give me a prompt" mode in Plan a Campaign to generate prompts you paste into Claude or ChatGPT. Quick Ask and Auto-Generate require the API key.

## Deploying to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variables in Vercel Dashboard → Settings → Environment Variables:
   - `ANTHROPIC_API_KEY`
4. Deploy happens automatically on push to `main`

**Note:** Full Plan auto-generation can take 15-45 seconds. Vercel Hobby plan has a 10-second timeout. You may need Vercel Pro ($20/month) for reliable auto-generation, or the streaming implementation keeps responses within limits.

## Project Structure

```
app/                    # Next.js App Router pages
  quick-ask/           # Quick Ask chat interface
  plan/                # Brief Builder + Plan View
  campaigns/           # My Campaigns dashboard
  glossary/            # Searchable glossary
  settings/            # Team configuration
  api/                 # API routes (serverless)
components/            # React components
lib/                   # Utilities, prompts, types
data/                  # Static data (platforms.json, glossary.json)
public/images/         # D&D logo
```

## Build Later Features

These are documented in the spec but not built in the initial version. The architecture supports adding them:

- **Post-Mortem mode** — Input actual campaign results, get AI analysis
- **Brief Analyzer** — Natural language → pre-populated form fields via AI
- **Readiness Checker** — Interactive pre-step with persistent checklist
- **Market Check** — Dedicated web search for fresh benchmark data
- **Persistent execution checklists** — Checkable items saved to database
- **Campaign templates** — Save/clone campaigns as reusable templates
- **Executive summary export** — Separate 1-page PDF for stakeholders
- **Learn section guides** — 10 pre-written how-to guides
- **Quick Ask search** — Search over past Q&A history
- **Campaign comparison** — Side-by-side view of saved plans
- **Insights accumulation** — Post-mortem learnings injected into future plans
- **Database migration** — Switch from localStorage to Vercel Postgres + Drizzle ORM

## Brand Customization

Brand colors are defined in `tailwind.config.ts` under `theme.extend.colors.dd`. Update hex values there to match official brand guidelines — all components reference these variables.

The D&D logo is loaded from `public/images/dd-logo.png`. Replace this file with the official logo.
