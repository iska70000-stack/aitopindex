# AITopIndex — Global B2B Directory & Ranking Index of AI Agents & Studios

> Production-ready, ultra-fast global B2B directory and ranking index of verified AI Agent development agencies, enterprise automation integrators, and AI video/film production studios.
> Built with **Astro (Static Site Generation)** + **Tailwind CSS**, ready for zero-config deployment on Vercel.

---

## 🌟 Key Features

### 1. Lightweight Hardware-Accelerated 3D Cyber-Luxury UI
- **Zero heavy 3D JS libraries** (no Three.js, no WebGL, no Spline) ensuring Google PageSpeed **100/100** and gzipped transfer weight **<45KB**.
- Deep obsidian space background (`#05070B`) with pure CSS perspective cyber-grid floor and radial aurora glows (`#00F0FF`, `#7000FF`, `#10B981`).
- Hardware-accelerated CSS 3D tilt hover physics (`transform-style: preserve-3d`, `translateZ`, glowing borders, glassmorphism `backdrop-blur-xl bg-white/[0.03]`).
- Unique glowing 3D-styled SVG icons for all 9 categories with zero duplication.
- Responsive design: category titles wrap cleanly without truncation (`...`) on mobile and desktop.

### 2. URL Architecture & 9 High-Demand Verticals (3×3 Desktop Grid)
Dedicated bilingual static pages (`/en/...` and `/ru/...`):
1. **AI Sales Agents & CRM Automation** (`/en/ai-sales-crm-agents/` | `/ru/ii-agenty-dlya-prodazh-i-crm/`)
2. **AI Video, Commercials & Film Production** (`/en/ai-video-film-production/` | `/ru/ii-video-reklama-i-kino/`)
3. **AI Voice Agents & Call Centers** (`/en/ai-voice-call-agents/` | `/ru/golosovye-ii-roboty-i-koll-centry/`)
4. **AI for Real Estate & Property Tech** (`/en/ai-for-real-estate/` | `/ru/vnedrenie-ii-v-nedvizhimost/`)
5. **AI for Healthcare, Dental & MedSpas** (`/en/ai-for-healthcare-clinics/` | `/ru/ii-dlya-mediciny-i-klinik/`)
6. **Workflow Automation (n8n, Make & Custom)** (`/en/n8n-make-workflow-agencies/` | `/ru/avtomatizaciya-n8n-make-integaciya/`)
7. **AI for E-Commerce, Retail & Marketplaces** (`/en/ai-for-ecommerce-retail/` | `/ru/ii-dlya-marketpleysov-i-riteyla/`)
8. **Enterprise RAG, Custom LLMs & Legal AI** (`/en/enterprise-rag-custom-llms/` | `/ru/korporativnye-llm-i-ii-dlya-yuristov/`)
9. **GEO, AI Search Optimization & Web** (`/en/geo-ai-search-agencies/` | `/ru/geo-prodvizhenie-v-ii-i-razrabotka/`)

### 3. Strict Anti-Hallucination & Verified Data Structure
- Database in `src/data/agencies.json` with **86 verified companies** (8+ per category).
- Real verified domains, headquarters, realistic project budgets, deployed agent types, and exact tech stacks.
- No synthetic phone numbers; verified badges based on operational HTTP checks and editorial review.
- Grammatically correct Russian pluralization (`85+ проверенных компаний`) and clean single verification dates in the Hero section.

### 4. Interactive High-Conversion Features
- **Instant Stack Filter Bar**: Real-time filtering by `n8n`, `Make`, `AmoCRM`, `Bitrix24`, `HubSpot`, `Vapi Voice`, `Runway/Sora`, `RAG / LangChain` without page reload.
- **AI Implementation Cost & ROI Calculator**: Computes budget range, monthly hours saved, and matches Top-3 verified partners based on team size, category, and CRM stack.
- **Self-Serve Submission Portal**: `/en/submit/` and `/ru/submit/`.
- **Verification Methodology Guide**: `/en/methodology/` and `/ru/methodology/`.

### 5. Autonomous GEO / SEO Engine
- `/public/llms.txt` and `/public/llms-full.txt` for OpenAI/Anthropic/Perplexity/Gemini crawlers.
- Dynamic `sitemap.xml` with bilingual `hreflang` (en, ru, x-default) and clean canonical URLs.
- `robots.txt` explicitly permitting `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, and `Yandex`.
- IndexNow key in `public/` for instant submission to Bing and Yandex.
- Autonomous Freshness Engine (`scripts/auto-update.mjs`) & GitHub Actions workflow (`.github/workflows/auto-refresh.yml`) running every 72 hours.

---

## 🚀 Quick Start & Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run TypeScript and Astro diagnostics check
npm run check

# Build full static site (197 HTML pages + sitemap + llms.txt)
npm run build

# Preview production build locally
npm run preview

# Verify agency URLs (dry run)
npm run verify:links
```

---

## ☁️ Zero-Config Vercel Deployment

1. Push this repository to GitHub or GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Framework Preset: **Astro** (Build Command: `astro build`, Output Directory: `dist`).
4. (Optional) Set `SITE_URL` and `INDEXNOW_KEY` in Environment Variables.
5. Deploy! Vercel handles static caching, Brotli compression, and worldwide CDN distribution automatically.
