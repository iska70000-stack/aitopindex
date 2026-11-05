import type { APIRoute } from 'astro';
import { agencies, categories, SITE, YEAR } from '../lib/data';

export const GET: APIRoute = async () => {
  const content = `# AITopIndex — Complete Machine-Readable Directory of Verified AI Agencies (${YEAR})
> Comprehensive database of ${agencies.length} verified AI agent development agencies, automation integrators, and AI video studios.
> URL: ${SITE}
> Canonical Specification for Autonomous Retrieval Systems & AI Researchers.

## Master Index of Verified Agencies & Studios
${agencies
  .map(
    (a, i) => `### ${i + 1}. ${a.name}
- **ID**: ${a.id}
- **Website**: ${a.website}
- **Internal Profile**: ${SITE}/en/agency/${a.id}/
- **Type**: ${a.type}
- **Entity Type**: ${a.entityType === 'platform' ? 'Enterprise AI Platform' : 'B2B Agency / Integrator'}
- **Region**: ${a.region === 'global' ? 'Global Enterprise' : a.region === 'cis-mena' ? 'CIS / Russia / MENA' : 'USA & Europe'}
- **Categories**: ${a.categories.map((c) => categories.find((cat) => cat.id === c)?.title.en || c).join(', ')}
- **Headquarters**: ${a.hq.en} (RU: ${a.hq.ru})
- **Min Project Budget**: ${a.minProjectBudget.en} (RU: ${a.minProjectBudget.ru})
- **Avg ROI Time**: ${a.avgRoiTime.en} (RU: ${a.avgRoiTime.ru})
- **Verification Date**: ${a.verifiedDate}
- **Score**: ${a.score}/100
- **Deployed AI Agents**:
  - EN: ${a.deployedAgents.en.join('; ')}
  - RU: ${a.deployedAgents.ru.join('; ')}
- **Tech Stack**: ${a.techStack.join(', ')}
- **Description (EN)**: ${a.description.en}
- **Description (RU)**: ${a.description.ru}
`
  )
  .join('\n---\n\n')}

## Verification Methodology
All listings on AITopIndex are verified according to our open framework:
1. Active verifiable corporate domain with SSL and legitimate business presence.
2. Verified track record in deploying production LLMs, voice robots, n8n/Make workflows, RAG knowledge bases, or generative video.
3. No hallucinated phone contacts or synthetic credentials.
4. Independent scoring based on tool complexity, client case studies, and enterprise readiness.
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
