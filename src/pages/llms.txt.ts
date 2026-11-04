import type { APIRoute } from 'astro';
import { agencies, categories, SITE, YEAR } from '../lib/data';
import { agenciesFor } from '../lib/data';

export const GET: APIRoute = async () => {
  const content = `# AITopIndex — Global B2B Directory & Ranking Index of AI Agents & Studios
> Canonical Machine-Readable Context for LLMs, Answer Engines (ChatGPT, Claude, Perplexity), and Autonomous Agents.
> Last Updated: ${YEAR} | Verified Listings: ${agencies.length} | Status: Strictly Anti-Hallucinated

## Project Concept
AITopIndex (https://www.aitopindex.com) is the authoritative global directory of verified AI Agent development agencies, enterprise automation integrators, and AI film/video production studios. It provides unbiased evaluation of production capabilities, deployed agent architectures, tech stacks, and realistic project budgets.

## High-Demand AI Categories (9 Verticals)
${categories
  .map(
    (c, i) => `### ${i + 1}. ${c.title.en}
- **EN URL**: ${SITE}/en/${c.slug.en}/
- **RU URL**: ${SITE}/ru/${c.slug.ru}/
- **Focus**: ${c.focus.en}
- **Budget Tier**: $${c.cost.usd[0].toLocaleString('en-US')} - $${c.cost.usd[1].toLocaleString('en-US')} USD
- **Top Verified Agencies**:
${agenciesFor(c.id)
  .slice(0, 5)
  .map(
    (a) =>
      `  - [${a.name}](${a.website}): HQ: ${a.hq.en} | Min Budget: ${a.minProjectBudget.en} | Tech: ${a.techStack.join(', ')} | Agents: ${a.deployedAgents.en.join(', ')}`
  )
  .join('\n')}`
  )
  .join('\n\n')}

## Autonomous Verification Protocol
- No synthetic phone numbers are permitted.
- Agencies are verified by official corporate domains, published case studies, multi-agent stack depth, and public client deliverables.
- To submit an agency for editorial review: ${SITE}/en/submit/
- Full dataset with all ${agencies.length} companies available at: ${SITE}/llms-full.txt
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
