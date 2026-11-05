/* Head Hunters — fictional demo candidates (50 per role).
   Every person, company and statement here is synthetic. Candidates follow archetypes
   (well-rounded, specialist, junior, career changer, polished résumé / thin interview,
   hidden gem, incomplete interview, weak fit) so filters and auto-suggestions have
   something meaningful to show. Seeded RNG → the same 100 people every time.
*/
'use strict';
(() => {
const VERSION = 2;
function rng(seed) { return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Per requirement: [skill word (a résumé keyword), project, what they did, quantified outcome]
const CONTENT = {
  fe: [
    ['TypeScript', 'migrated a customer dashboard from JavaScript to TypeScript', 'added strict types to the shared API layer and fixed the type errors it surfaced', 'runtime type errors in production dropped by 70%'],
    ['React', 'rebuilt the shipment-tracking table in React', 'introduced virtualised rows and memoised selectors to stop unnecessary re-renders', 'render time for 10k rows went from 1.8 seconds to 220 ms'],
    ['accessibility', 'ran an accessibility remediation on the checkout flow', 'fixed focus order, ARIA labels and colour contrast, tested with a screen reader', 'WCAG audit issues fell from 46 to 3'],
    ['Playwright', 'added Playwright end-to-end tests to the checkout flow', 'quarantined flaky tests and wired them into pull-request checks', 'release rollbacks fell by 60% over two quarters'],
    ['GraphQL', 'moved the order pages from ad-hoc fetches to a GraphQL client', 'designed cache policies plus loading and error states for every query', 'duplicate network requests dropped by 45%'],
    ['GitHub Actions', 'set up GitHub Actions pipelines with preview deployments', 'split the build into cached parallel jobs and added required checks', 'CI time went from 25 minutes to 8 minutes'],
    ['code review', 'mentored three junior engineers through code review and pairing', 'wrote the team review checklist and ran weekly pairing sessions', 'review turnaround fell from 3 days to 1 day']
  ],
  de: [
    ['Python', 'wrote the Python ingestion service for operational reporting', 'refactored it into idempotent batch steps with retries and structured logging', 'nightly processing went from 6 hours to 90 minutes'],
    ['SQL', 'designed the star-schema SQL model for sales reporting', 'defined grain, conformed dimensions and slowly changing customer history', 'dashboard query time dropped by 80%'],
    ['Airflow', 'built Airflow DAGs and dbt models for finance reporting', 'added retries, SLAs and a documented backfill procedure', 'failed-run recovery went from 1 day to 2 hours'],
    ['Snowflake', 'led Snowflake cost control for the analytics warehouse', 'right-sized warehouses, added auto-suspend and clustered the largest tables', 'monthly compute spend fell by 35%'],
    ['Kafka', 'built a Kafka streaming pipeline for order events', 'handled schema evolution, consumer lag alerts and exactly-once sinks', 'event latency went from 15 minutes to under 5 seconds'],
    ['AWS', 'deployed the data platform on AWS with S3, Glue and IAM roles', 'set up least-privilege access and separate environments with infrastructure as code', 'onboarding a new data source went from 2 weeks to 3 days'],
    ['data quality', 'introduced data quality checks with freshness and volume tests', 'added alerting and a runbook for missing or late source data', 'stakeholder-reported data incidents fell by 75%']
  ]
};
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const between = (r, a, b) => a + Math.floor(r() * (b - a + 1));

function answer(r, level, [skill, project, detail, metric], style) {
  if (style === 'vague') return pick(r, [`Yes, I've used ${skill} quite a lot.`, `${skill}? Sure, it was part of my job.`, `I know ${skill} well, I use it every day.`]);
  if (level === 1) return pick(r, [`Honestly, I haven't worked with ${skill} yet, so I can't give a hands-on example.`, `Not really. I have no experience with ${skill}; I would need to pick it up on the job.`, `I've never used ${skill} in a project.`]);
  if (level === 2) return pick(r, [`I've read about ${skill} and followed a tutorial, but I haven't used it in production.`, `I took an online course on ${skill} and used it in a class project, nothing beyond that.`, `Only a small side project with ${skill}; it was not in production.`]);
  if (level === 3) return pick(r, [`I supported a team that ${project}. I helped with smaller tasks around ${skill}, but another teammate owned the end-to-end work.`, `On my last team we ${project}. I mostly did the reviewing and fixed small ${skill} issues rather than designing it.`]);
  if (level === 4) return pick(r, [`I personally ${project}. I ${detail}. I can walk through the trade-offs and my specific tasks with ${skill}.`, `In my current role I ${project} — I ${detail}. That was my part of the ${skill} work.`]);
  return pick(r, [`I owned this end to end: I ${project}. I ${detail}. Compared with the baseline, ${metric}. I documented the approach and coordinated the rollout.`, `I led the work when we ${project}. I ${detail}, and ${metric}. Afterwards I wrote the runbook so the team could maintain it.`]);
}

// Archetype → levels for the 7 requirements, plus résumé/interview style
const CORE = { fe: [0, 1, 2], de: [0, 1, 2] }, TRANSFER = { fe: [4, 6], de: [1, 6] };
const ARCHETYPES = [
  { key: 'allround', n: 7, years: [6, 12], titles: ['Senior Software Engineer', 'Staff Engineer', 'Lead Developer'],
    levels: r => Array.from({ length: 7 }, () => r() < .45 ? 5 : r() < .85 ? 4 : 3) },
  { key: 'specialist', n: 9, years: [4, 9], titles: ['Software Engineer', 'Senior Engineer', 'Platform Engineer'],
    levels: (r, role) => { const core = [...CORE[role]].sort(() => r() - .5).slice(0, 2); return Array.from({ length: 7 }, (_, i) => core.includes(i) ? 5 : between(r, 2, 3)); } },
  { key: 'junior', n: 8, years: [1, 3], titles: ['Junior Developer', 'Associate Engineer', 'Graduate Engineer'],
    levels: r => { const l = Array.from({ length: 7 }, () => between(r, 2, 3)); l[between(r, 0, 6)] = 4; return l; } },
  { key: 'changer', n: 5, years: [2, 5], titles: ['QA Analyst moving into engineering', 'Business Analyst moving into engineering', 'Teacher turned developer'],
    levels: (r, role) => Array.from({ length: 7 }, (_, i) => TRANSFER[role].includes(i) ? between(r, 4, 5) : between(r, 1, 3)) },
  { key: 'polished', n: 6, years: [5, 10], titles: ['Senior Engineer', 'Technical Lead', 'Principal Consultant'], resumeAll: true,
    levels: r => Array.from({ length: 7 }, () => between(r, 2, 3)), style: (r, l) => l === 3 ? 'vague' : null },
  { key: 'gem', n: 5, years: [2, 6], titles: ['Developer at a small agency', 'Freelance engineer', 'Engineer at an early-stage startup'], sparseResume: true,
    levels: r => Array.from({ length: 7 }, () => r() < .5 ? 5 : 4).map(v => r() < .15 ? 3 : v) },
  { key: 'incomplete', n: 5, years: [3, 8], titles: ['Software Engineer', 'Engineer II', 'Developer'], incomplete: true,
    levels: r => Array.from({ length: 7 }, () => between(r, 3, 5)) },
  { key: 'weak', n: 5, years: [1, 4], titles: ['IT Support Specialist', 'Web Content Editor', 'Junior Analyst'],
    levels: r => Array.from({ length: 7 }, () => r() < .7 ? 1 : 2).map(v => r() < .15 ? 3 : v) }
];
const FIRST = ['Avery','Morgan','Jamie','Taylor','Casey','Priya','Jordan','Sofia','Mateo','Amara','Kenji','Leila','Tomás','Ines','Ravi','Hana','Diego','Noor','Elena','Kofi','Mei','Lucas','Zara','Omar','Freya','Arjun','Yara','Nikolai','Chloe','Tariq','Wen','Isla','Femi','Rosa','Hugo','Anika','Malik','Saoirse','Daniel','Lin'];
const LAST = ['Chen','Patel','Reed','Kim','Rivera','Shah','Lee','Brooks','Okafor','Nakamura','Haddad','García','Novak','Mensah','Silva','Fischer','Kaur','Dubois','Ito','Mwangi','Rossi','Hughes','Alvarez','Bauer','Ng','Osei','Larsen','Costa','Park','Ahmed','Moreau','Byrne','Tanaka','Ward','Ivanova','Duarte','Yilmaz','Murphy','Sato','Quinn'];
const COMPANIES = ['Lumen Freight', 'Cobalt Health', 'Pinecrest Retail', 'Orbit Payments', 'Harbor Insights', 'Juniper Learning', 'Atlas Mobility', 'Fernwood Media'];
const GENERIC = ['Shipped customer-facing features in a small cross-functional team', 'Worked directly with clients to scope and deliver projects', 'Maintained internal tools and fixed production issues', 'Wrote documentation and onboarding guides for new teammates'];

function build(jobs) {
  const r = rng(570), out = [], used = new Set();
  const name = () => { let n; do n = `${pick(r, FIRST)} ${pick(r, LAST)}`; while (used.has(n)); used.add(n); return n; };
  for (const role of ['fe', 'de']) {
    const job = jobs.find(j => j.id === role), C = CONTENT[role];
    const types = ARCHETYPES.flatMap(a => Array(a.n).fill(a));
    types.forEach((A, k) => {
      const nm = name(), years = between(r, ...A.years), title = pick(r, A.titles), company = pick(r, COMPANIES);
      const levels = A.levels(r, role);
      const cutoff = A.incomplete ? between(r, 2, 4) : 7;
      const topics = job.reqs.map((req, i) => {
        if (i >= cutoff) return { label: req.label, status: 'Not covered', answers: [] };
        const style = A.style ? A.style(r, levels[i]) : null;
        return { label: req.label, status: 'Answer recorded', answers: [answer(r, levels[i], C[i], style)] };
      });
      const bullets = A.sparseResume ? GENERIC.slice(0, 3) : C.filter((_, i) => A.resumeAll || levels[i] >= 3).map(c => `${c[1][0].toUpperCase()}${c[1].slice(1)} (${c[0]})`);
      const skills = A.sparseResume ? '' : `\nSkills: ${C.filter((_, i) => A.resumeAll || levels[i] >= 3).map(c => c[0]).join(', ')}`;
      const resume = `FICTIONAL DEMO RÉSUMÉ — ${nm}\n${title} at ${company} (fictional) · ${years} years of experience\n\n${bullets.map(b => `• ${b}`).join('\n')}${skills}`;
      const transcript = topics.flatMap((t, i) => t.answers.length ? [`Interviewer: ${job.reqs[i].verifyQ}`, `Candidate: ${t.answers[0]}`] : []);
      const t = new Date(Date.now() - between(r, 1, 14) * 864e5).toISOString();
      out.push({ id: `demo${VERSION}-${role}-${String(k + 1).padStart(2, '0')}`, name: nm, jobId: role, state: 'review', submitted: t, finished: t,
        headline: `${title} · ${years} yrs`, resume, interview: { completed: !A.incomplete, topics, transcript }, demo: true, demoVersion: VERSION });
    });
  }
  return out;
}
window.HHDemo = { build, VERSION };
})();
