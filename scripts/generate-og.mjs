import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#05070B" />
      <stop offset="50%" stop-color="#080C14" />
      <stop offset="100%" stop-color="#05070B" />
    </linearGradient>

    <!-- Radial Glow Cyan -->
    <radialGradient id="cyan-glow" cx="20%" cy="25%" r="45%">
      <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#00F0FF" stop-opacity="0" />
    </radialGradient>

    <!-- Radial Glow Violet -->
    <radialGradient id="violet-glow" cx="80%" cy="75%" r="50%">
      <stop offset="0%" stop-color="#7000FF" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#7000FF" stop-opacity="0" />
    </radialGradient>

    <!-- Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1" />
    </pattern>

    <!-- Text Gradient -->
    <linearGradient id="title-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="50%" stop-color="#7000FF" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#grid)" />
  <rect width="1200" height="630" fill="url(#cyan-glow)" />
  <rect width="1200" height="630" fill="url(#violet-glow)" />

  <!-- Outer Glass Frame Border -->
  <rect x="30" y="30" width="1140" height="570" rx="24" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1.5" />

  <!-- Top Badge -->
  <g transform="translate(70, 75)">
    <rect width="270" height="36" rx="18" fill="#ffffff" fill-opacity="0.05" stroke="#00F0FF" stroke-opacity="0.4" stroke-width="1" />
    <circle cx="20" cy="18" r="5" fill="#10B981" />
    <text x="35" y="23" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#E2E8F0" letter-spacing="0.5">86+ VERIFIED PROVIDERS • 2026</text>
  </g>

  <!-- Brand Logo & Name -->
  <g transform="translate(70, 150)">
    <rect width="44" height="44" rx="12" fill="#00F0FF" fill-opacity="0.1" stroke="#00F0FF" stroke-opacity="0.5" stroke-width="1.5" />
    <polygon points="17,32 22,14 27,32 24.5,23 19.5,23" fill="#00F0FF" />
    <text x="60" y="32" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">AITopIndex<tspan fill="#00F0FF">.com</tspan></text>
  </g>

  <!-- Main Headline -->
  <text x="70" y="260" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
    Global Directory &amp; Ranking of
  </text>
  <text x="70" y="325" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="52" font-weight="900" fill="url(#title-grad)" letter-spacing="-1">
    Verified AI Agent Integrators
  </text>

  <!-- Description Subtext -->
  <text x="70" y="390" font-family="'Segoe UI', Arial, sans-serif" font-size="20" fill="#94A3B8">
    Enterprise AI SDRs, Voice Call Bots, n8n / Make Automation, and Generative Video Studios.
  </text>
  <text x="70" y="420" font-family="'Segoe UI', Arial, sans-serif" font-size="20" fill="#94A3B8">
    Compare real implementation budgets, audited tech stacks, and payback ROI.
  </text>

  <!-- Bottom Metric Pills -->
  <g transform="translate(70, 480)">
    <!-- Pill 1 -->
    <rect x="0" y="0" width="220" height="70" rx="14" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1" />
    <text x="24" y="30" font-family="'JetBrains Mono', 'Segoe UI', monospace" font-size="12" fill="#64748B" font-weight="600">COVERAGE</text>
    <text x="24" y="54" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="20" fill="#00F0FF" font-weight="700">9 AI Verticals</text>

    <!-- Pill 2 -->
    <rect x="240" y="0" width="240" height="70" rx="14" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1" />
    <text x="264" y="30" font-family="'JetBrains Mono', 'Segoe UI', monospace" font-size="12" fill="#64748B" font-weight="600">AUDIT STANDARDS</text>
    <text x="264" y="54" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="20" fill="#10B981" font-weight="700">100% Verified Cases</text>

    <!-- Pill 3 -->
    <rect x="500" y="0" width="250" height="70" rx="14" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1" />
    <text x="524" y="30" font-family="'JetBrains Mono', 'Segoe UI', monospace" font-size="12" fill="#64748B" font-weight="600">PAYBACK HORIZON</text>
    <text x="524" y="54" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="20" fill="#C084FC" font-weight="700">1–3 Months Avg ROI</text>

    <!-- Pill 4 -->
    <rect x="770" y="0" width="260" height="70" rx="14" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1" />
    <text x="794" y="30" font-family="'JetBrains Mono', 'Segoe UI', monospace" font-size="12" fill="#64748B" font-weight="600">TARGET MARKETS</text>
    <text x="794" y="54" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="20" fill="#FFFFFF" font-weight="700">Global • US / EU / CIS</text>
  </g>
</svg>
`;

async function main() {
  const outputPath = path.resolve('public/og-cover.png');
  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(outputPath);
  console.log(`Generated og-cover.png at ${outputPath}`);
}

main().catch(console.error);
