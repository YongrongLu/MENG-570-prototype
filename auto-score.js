/* Head Hunters — rule-based auto-suggested ratings (1–5).
   Transparent heuristics over the résumé and the linked interview answer.
   Suggestions are a starting point: the recruiter confirms or overrides each one.
   No model calls, no network. Edit the patterns below to tune behaviour.
*/
'use strict';
(() => {
const P = {
  // "I read about it / did a course" → exposure without practice
  learning: /\b(read about|tutorial|online course|took a course|course on|bootcamp|class project|side project|haven't used it in production|not in production|only in school)\b/i,
  // "No experience" → no evidence
  none: /\b(no experience|never used|never worked|haven't worked|have not worked|not really|don't have|do not have|not familiar)\b/i,
  // Supporting role, someone else owned it
  support: /\b(supported|helped with|another teammate owned|smaller tasks|mostly reviewing|mostly did the reviewing|fixed small|rather than designing|shadowed|assisted)\b/i,
  // First-person ownership of the work
  ownership: /\b(i personally|i independently|my part of|owned this|end to end|i (personally |independently |single-handedly |also )?(owned|led|built|designed|implemented|migrated|set up|configured|added|wrote|introduced|rebuilt|automated|shipped|deployed|created|developed|ran|refactored|mentored|rolled out))\b/i,
  production: /\b(in production|production (app|project|system|service|code)|shipped)\b/i,
  // A quantified outcome (number + unit, before/after, or baseline)
  quantified: /(\b\d+(\.\d+)?\s*(%|percent|x\b|ms\b|seconds?\b|minutes?\b|hours?\b|days?\b|tb\b|gb\b|million\b|k\b))|\bfrom \d|\bbaseline\b/i
};
// Technologies that are NOT this rubric's skills. A negative/learning statement about one of these
// ("never used Vue") must not lower the score of an unrelated requirement.
const ALT = ['vue','vue.js','angular','svelte','ember','jquery','backbone','flutter','swift','kotlin','java','c#','.net','php','ruby','rails','golang','scala','rust','c++','excel','tableau','power bi','looker','mongodb','oracle','hadoop','hive','teradata','informatica','ssis','kubernetes','docker','terraform','jira'];
// Split an answer into clauses at sentence ends and contrast/sequence words.
const clauses = t => t.split(/(?<=[.!?;])\s+|\s*,?\s*\b(?:but|however|although|though|whereas|later|then|afterwards|since then|now)\b\s*/i).map(c => c.trim()).filter(Boolean);
const LABEL = {1:'Strong No',2:'No',3:'Needs Review',4:'Yes',5:'Strong Yes'};

function hit(text, kw) {
  const e = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${e}($|[^a-z0-9])`, 'i').test(text || '');
}
const words = t => (t.trim().match(/\S+/g) || []).length;

/* ctx.otherKws: keywords of the role's other requirements (used to ignore negatives about them).
   Returns {score:1-5|null, confidence:'high'|'medium'|'low', reasons:[...], flag:null|'mismatch'|'beyond'} */
function suggest(app, req, ctx = {}) {
  const resumeHits = req.kws.filter(k => hit(app.resume, k));
  const topic = app.interview?.topics?.find(t => t.label === req.label);
  const skipped = topic?.status === 'Skipped';
  const answer = (topic?.answers || []).join(' ').trim();
  const reasons = [];
  if (resumeHits.length) reasons.push(`Résumé mentions ${resumeHits.slice(0, 2).join(', ')}`);

  let score, confidence;
  if (!answer) {
    reasons.push(skipped ? 'Topic skipped in interview' : 'Not covered in interview');
    if (!resumeHits.length) return { score: null, confidence: 'low', reasons: [...reasons, 'Not enough evidence to suggest'], flag: null };
    score = 3; confidence = 'low';
  } else {
    // Clause-level reading: each statement is judged on what it is about.
    const others = [...ALT, ...(ctx.otherKws || [])];
    const own = c => req.kws.some(k => hit(c, k));
    const aboutOther = (c, list) => !own(c) && list.some(k => hit(c, k));
    const parts = clauses(answer);
    const neg = parts.filter(c => !aboutOther(c, others));                 // negatives must be about this skill or unspecific
    const pos = parts.filter(c => !aboutOther(c, ALT) && !P.none.test(c) && !P.learning.test(c) && !P.support.test(c));
    const hasLearning = neg.some(c => P.learning.test(c)), hasNone = neg.some(c => P.none.test(c)), hasSupport = neg.some(c => P.support.test(c));
    const owned = pos.some(c => P.ownership.test(c) || P.production.test(c)), quant = pos.some(c => P.quantified.test(c));
    const answerHits = req.kws.filter(k => hit(answer, k));
    if (owned || quant) {
      // Hands-on evidence outweighs earlier learning or a remark about another tool.
      score = 2; confidence = 'medium';
      if (answerHits.length || resumeHits.length) { score++; if (answerHits.length) reasons.push('Answer names the skill'); }
      if (owned) { score++; reasons.push('First-person ownership'); }
      if (quant) { score++; reasons.push('Quantified outcome'); }
      if (hasLearning) reasons.push('Started from learning, then hands-on');
      if (hasNone) { confidence = 'low'; reasons.push('Contradictory statements — check'); }
      else if (words(answer) >= 25) confidence = 'high';
      if (words(answer) < 12) { score = Math.min(score, 3); confidence = 'low'; reasons.push('Very short answer'); }
    } else if (hasLearning) {
      score = 2; confidence = 'medium'; reasons.push('Learning exposure only');
    } else if (hasNone) {
      score = 1; confidence = 'medium'; reasons.push('Says no hands-on experience');
    } else if (hasSupport) {
      score = 3; confidence = 'medium'; reasons.push('Supporting role, not owner');
    } else {
      score = 2; confidence = 'medium';
      if (answerHits.length || resumeHits.length) { score++; if (answerHits.length) reasons.push('Answer names the skill'); }
      const n = words(answer);
      if (n < 12) { confidence = 'low'; reasons.push('Very short answer'); }
      else if (n >= 25) confidence = 'high';
    }
  }
  score = Math.max(1, Math.min(5, score));
  let flag = null;
  if (resumeHits.length && answer && score <= 2) { flag = 'mismatch'; reasons.push('Résumé claim not backed by interview'); }
  if (!resumeHits.length && score >= 4) { flag = 'beyond'; reasons.push('Strong evidence not on résumé'); }
  return { score, confidence, reasons, flag };
}

window.HHScore = { suggest, LABEL };
})();
