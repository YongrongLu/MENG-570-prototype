/* Head Hunters recruiter workspace — structured 1–5 human rubric, not an AI skills test.
   Reads the current candidate portal's in-tab applications; no network/backend needed.
*/
'use strict';
(() => {
const KEY='headhunters-recruiter-v5';
const LEVELS={1:'Strong No',2:'No',3:'Needs Review',4:'Yes',5:'Strong Yes'};
const tone={1:'negative',2:'negative',3:'uncertain',4:'positive',5:'positive'};
let saved={};try{saved=JSON.parse(sessionStorage.getItem(KEY)||'{}')||{};}catch{}
const S={role:saved.role==='de'?'de':'fe',phase:1, view:'all', sort:'name',desc:false,query:'',logic:'all',
 rules:Array.isArray(saved.rules)?saved.rules:[],ratings:saved.ratings||{},advanced:{...saved.advanced,...Object.fromEntries(Object.entries(saved.shortlist||{}).filter(([,selected])=>selected))},notes:saved.notes||{},focus:null};
let pool=[],savePool=()=>{},jobFor=()=>null,analyze=()=>{},esc=s=>String(s),root=null;
const safe=s=>esc(String(s??''));
const getJob=()=>JOBS.find(j=>j.id===S.role);
const reqs=()=>getJob().reqs;
const forRole=()=>pool.filter(a=>a.jobId===S.role);
const rating=(a,idx)=>{
 const own=S.ratings[a.id];
 if(own&&Object.prototype.hasOwnProperty.call(own,idx))return own[idx]===null?null:Number(own[idx]);
 const demo=a.demoRatings;
 if(Array.isArray(demo)&&Number.isInteger(demo[idx]))return demo[idx];
 return null;
};
const getLabel=(value)=>value===null?'Not assessed':LEVELS[value]||'Not assessed';
const persist=()=>{try{sessionStorage.setItem(KEY,JSON.stringify({role:S.role,rules:S.rules,ratings:S.ratings,advanced:S.advanced,notes:S.notes}));}catch{}};
const defaultRules=()=>[{idx:1,min:4,required:true},{idx:0,min:3,required:true}];
const resetRules=()=>{S.rules=defaultRules().filter(r=>r.idx<reqs().length);S.logic='all';persist();};
const isAdvance=a=>!!S.advanced[a.id];
const isGood=(a,r)=>{const v=rating(a,r.idx);return v!==null && v>=r.min;};
const matches=a=>{
 const rules=S.rules.filter(r=>r.required);
 if(!rules.length)return true;
 return S.logic==='all'?rules.every(r=>isGood(a,r)):rules.some(r=>isGood(a,r));
};
const criteriaCount=a=>S.rules.filter(r=>!r.required && isGood(a,r)).length;
const getVisible=()=>{
 let people=forRole().filter(a=>(S.phase===1||isAdvance(a)) && (S.view==='all'||S.view==='matched'&&matches(a)||S.view==='shortlist'&&isAdvance(a)) && a.name.toLowerCase().includes(S.query.toLowerCase()));
 people.sort((a,b)=>{
  let result=0;
  if(S.sort==='name')result=a.name.localeCompare(b.name);
  else if(S.sort==='status')result=(a.state||'').localeCompare(b.state||'');
  else if(S.sort.startsWith('r')){
   const idx=Number(S.sort.slice(1));const ra=rating(a,idx)??0,rb=rating(b,idx)??0;
   result=ra-rb;
  }
  return (S.desc?-result:result)||a.name.localeCompare(b.name);
 });return people;
};
const mkOptions=(selected,items)=>items.map(([value,text])=>`<option value="${safe(value)}" ${String(value)===String(selected)?'selected':''}>${safe(text)}</option>`).join('');
const ratingHtml=(a,idx)=>{
 const v=rating(a,idx);return `<span class="r-rating ${v===null?'r-unrated':tone[v]}" title="${safe(reqs()[idx].label)} — ${safe(getLabel(v))}">${v===null?'—':v} <small>${safe(getLabel(v))}</small></span>`;
};
function sampleEvidence(job,idx,level){
 const req=job.reqs[idx].label;
 const skills={
  fe:[['Migrated a customer dashboard from JavaScript to TypeScript','described type checking and testing changes'],['Built a React inventory table','described virtualization and measured rendering improvements'],['Improved keyboard navigation and WCAG issues','used screen reader testing and documented fixes'],['Added Playwright end-to-end tests to a checkout flow','investigated flaky test cases and release failures'],['Integrated REST services into a frontend','handled retries, caching, and loading states'],['Configured GitHub Actions to run CI checks','added preview deployments and tracked build time'],['Mentored junior engineers through code review','shared review examples and coaching outcomes']],
  de:[['Built Python data pipelines for operational reporting','explained batch design and failure handling'],['Designed SQL data models for a sales reporting system','used CTEs, schema review, and indexing'],['Set up Airflow workflows and dbt transformations','documented retries and backfills'],['Worked on warehouse cost control in Snowflake','tested query changes and compute choices'],['Worked with streaming events and Spark batch jobs','described monitoring and partition trade-offs'],['Deployed a data workflow on AWS','covered access controls and environment setup'],['Added freshness checks to reporting pipelines','set alerts for missing source data']]
 };
 const item=skills[job.id][idx];
 if(level===1)return `I haven't worked directly with ${req} and cannot give a hands-on example.`;
 if(level===2)return `I have read about ${req} and tried a tutorial, but I haven't used it in production.`;
 if(level===3)return `I supported a team using ${req}. I helped with smaller tasks, but another teammate owned the end-to-end work.`;
 if(level===4)return `I personally contributed to a production project. ${item[0]}; I ${item[1]}. I can discuss my specific tasks.`;
 return `I personally owned this work end to end. ${item[0]}, ${item[1]}. I documented the approach, compared the results with the baseline, and coordinated the rollout with the team.`;
}
const originalFixtures=[
 {id:'demo-fe-avery',name:'Avery Chen',role:'fe',ratings:[5,5,4,4,5,3,4]},
 {id:'demo-fe-morgan',name:'Morgan Patel',role:'fe',ratings:[5,3,3,5,4,4,3]},
 {id:'demo-fe-jamie',name:'Jamie Reed',role:'fe',ratings:[3,4,5,3,4,5,5]},
 {id:'demo-fe-taylor',name:'Taylor Kim',role:'fe',ratings:[4,2,3,3,5,4,4]},
 {id:'demo-fe-casey',name:'Casey Rivera',role:'fe',ratings:[4,4,2,4,3,4,3]},
 {id:'demo-de-priya',name:'Priya Shah',role:'de',ratings:[5,5,4,4,4,3,5]},
 {id:'demo-de-jordan',name:'Jordan Lee',role:'de',ratings:[3,4,4,5,4,5,3]},
 {id:'demo-de-sofia',name:'Sofia Brooks',role:'de',ratings:[4,3,5,3,2,4,4]}
];
const firstNames=['Alex','Bailey','Cameron','Dakota','Elliot','Finley','Harper','Indigo','Jules','Kai','Logan','Maya','Noah','Parker','Quinn','Riley','Sage','Tessa','Uma','Zoe'];
const lastNames=['Adams','Bennett','Cruz','Diaz','Evans'];
const generatedFixtures=(role,count,offset)=>Array.from({length:count},(_,i)=>({
 id:`demo-${role}-generated-${String(i+1).padStart(2,'0')}`,
 name:`${firstNames[(offset+i)%firstNames.length]} ${lastNames[Math.floor((offset+i)/firstNames.length)]}`,
 role,
 ratings:Array.from({length:7},(_,j)=>1+((i*7+j*11+Math.floor(i/7)+(role==='de'?2:0))%5))
}));
const fixtures=[...originalFixtures,...generatedFixtures('fe',45,0),...generatedFixtures('de',47,45)];
function loadSamples(){
 for(const f of fixtures){
  if(pool.some(a=>a.id===f.id))continue;
  const job=JOBS.find(j=>j.id===f.role);
  const topics=job.reqs.map((r,i)=>({label:r.label,status:'Answer recorded',answers:[sampleEvidence(job,i,f.ratings[i])]}));
  pool.push({id:f.id,name:f.name,jobId:f.role,submitted:new Date().toISOString(),finished:new Date().toISOString(),state:'review',resume:`Fictional demonstration résumé for ${f.name}. This example candidate is used only to illustrate the screening interface for ${job.title}; the listed experience statements below are synthetic.\n\n${topics.map(t=>t.answers[0]).join('\n')}`,interview:{completed:true,topics,transcript:topics.flatMap(t=>[`Interviewer: ${job.reqs.find(r=>r.label===t.label)?.verifyQ||t.label}`,`Candidate: ${t.answers[0]}`])},demoRatings:[...f.ratings],demo:true});
 }
 savePool();render();
}
function renderRules(){
 return `<section class="rw-sidebar panel"><div class="rw-section-top"><div><p class="eyebrow">RECRUITER CONTROLS</p><h3>Screening rules</h3></div><button type="button" data-act="reset-rules" class="rw-link">Reset</button></div>
  <p class="rw-muted">Select job requirements and set your minimum acceptable 1–5 rating. Unrated candidates do not satisfy required rules, but remain visible under All candidates.</p>
  ${S.rules.map((r,k)=>`<div class="rw-rule"><div class="rw-rule-head"><span>CRITERION ${k+1}</span><button type="button" data-act="remove-rule" data-index="${k}" aria-label="Remove criterion ${k+1}">×</button></div>
  <label>Job requirement<select data-rule="metric" data-index="${k}">${mkOptions(r.idx,reqs().map((item,i)=>[i,item.label]))}</select></label>
  <label>Minimum rating<select data-rule="min" data-index="${k}">${mkOptions(r.min,Object.entries(LEVELS).map(([val,name])=>[val,`${val} · ${name}`]))}</select></label>
  <label>Priority<select data-rule="required" data-index="${k}">${mkOptions(String(r.required),[['true','Required · filters pool'],['false','Preferred · comparison only']])}</select></label>
  </div>`).join('')}
  <button type="button" class="rw-dashed" data-act="add-rule" ${S.rules.length>=reqs().length?'disabled':''}>+ Add requirement</button>
  <div class="rw-logic"><strong>Required rules</strong><div class="rw-segment">${[['all','Match all'],['any','Match any']].map(([v,label])=>`<button data-act="logic" data-val="${v}" aria-pressed="${S.logic===v}">${label}</button>`).join('')}</div></div>
  <p class="rw-muted">Labels indicate how interview statements relate to role requirements. They do not measure technical skill independently.</p></section>`;
}
function renderPhase1(){
 const visible=getVisible(), all=forRole();
 return `<div class="rw-results panel"><div class="rw-section-top rw-result-heading"><div><p class="eyebrow">PHASE 1 · INITIAL SCREENING</p><h2>Screen at scale.</h2><p class="rw-muted">Coarse 1–5 requirement ratings. Adjust the rules and decide who to compare in Phase 2.</p></div><button type="button" data-act="load-demo" class="ghost">${fixtures.some(f=>!pool.some(a=>a.id===f.id))?'Load 100 fictional profiles':'Demo profiles loaded'}</button></div>
 ${toolbar(visible,all)}
 <div class="rw-scroll"><table class="rw-table"><thead><tr><th>Candidate</th><th>Interview</th>${S.rules.map(r=>`<th>${safe(reqs()[r.idx].label)}</th>`).join('')}<th>Required fit</th><th>Next step</th></tr></thead><tbody>
 ${visible.map(a=>`<tr><td><button class="rw-name" data-act="detail" data-id="${safe(a.id)}">${safe(a.name)}</button><small>${a.demo?'Fictional sample':'Portal application'}</small></td><td>${a.interview?'<span class="rw-status ready">Recorded</span>':'<span class="rw-status waiting">Pending</span>'}</td>${S.rules.map(r=>`<td>${ratingHtml(a,r.idx)}</td>`).join('')}
 <td>${matches(a)?'<span class="rw-status ready">Meets selected rules</span>':'<span class="rw-status waiting">Requires review</span>'}${S.rules.some(r=>!r.required)?`<small>${criteriaCount(a)} preferred criteria met</small>`:''}</td><td><div class="rw-actions"><button data-act="detail" data-id="${safe(a.id)}" class="ghost">Evidence ↗</button><button data-act="advance" data-id="${safe(a.id)}" class="rw-small-primary" aria-pressed="${isAdvance(a)}">${isAdvance(a)?'✓ Shortlisted':'+ Shortlist'}</button></div></td></tr>`).join('')||`<tr><td colspan="${S.rules.length+4}" class="rw-empty">No candidates found. Load the fictional examples, change filters, or submit an application in the candidate portal.</td></tr>`}
 </tbody></table></div><p class="rw-caption">These grades are illustrative demo rubric decisions or recruiter-entered assessments—not AI-verified skill scores.</p></div>`;
}
function toolbar(visible,all){
 const matching=all.filter(matches).length;
 return `<div class="rw-stats"><div><small>For this role</small><b>${all.length}</b></div><div><small>Meet required rules</small><b>${matching}</b></div><div><small>Interviews recorded</small><b>${all.filter(a=>!!a.interview).length}</b></div><div><small>Shortlisted</small><b>${all.filter(isAdvance).length}</b></div></div>
 <div class="rw-toolbar"><label>Search <input type="search" data-search placeholder="Candidate name" value="${safe(S.query)}"></label><label>Sort by<select data-sort>${mkOptions(S.sort,[['name','Name'],['status','Interview status'],...reqs().map((r,i)=>[`r${i}`,r.label])])}</select></label><button type="button" data-act="direction" class="ghost">${S.desc?'↓ Desc':'↑ Asc'}</button></div>
 <div class="rw-subtabs">${[['all','All candidates'],['matched','Matching rules'],['shortlist','My shortlist']].map(([val,label])=>`<button data-act="view" data-val="${val}" aria-pressed="${S.view===val}">${label}</button>`).join('')}<span>${visible.length} visible</span></div>`;
}
function renderPhase2(){
 const list=forRole().filter(isAdvance);
 return `<section class="rw-results panel rw-phase2"><div class="rw-section-top"><h2>Compare your shortlist</h2><span class="rw-selected-count">${list.length} selected</span></div>${renderComparison(list)}</section>`;
}
function renderComparison(list){
 if(!list.length)return '<p class="rw-empty">Select candidates in Phase 1 to compare their ratings here.</p>';
 return `<div class="rw-scroll"><table class="rw-table rw-compare-table"><thead><tr><th scope="col">Requirement</th>${list.map(a=>`<th scope="col"><button class="rw-name" data-act="detail" data-id="${safe(a.id)}">${safe(a.name)}</button></th>`).join('')}</tr></thead><tbody>${reqs().map((r,i)=>`<tr><th scope="row">${safe(r.label)}</th>${list.map(a=>`<td>${ratingHtml(a,i)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function renderDetail(){
 const a=pool.find(v=>v.id===S.focus);if(!a)return '';
 const notes=a.interview?.topics||[];
 return `<div class="rw-overlay" role="presentation" data-act="close"><section class="rw-modal" role="dialog" aria-modal="true" aria-labelledby="rw-detail-title"><div class="rw-section-top rw-modal-header"><div><p class="eyebrow">INTERVIEW EVIDENCE · RECRUITER REVIEW</p><h2 id="rw-detail-title">${safe(a.name)}</h2><p class="rw-muted">${safe(jobFor(a)?.title)} · ${a.demo?'Entirely fictional demonstration':'Current portal application'}</p></div><button type="button" class="rw-close" data-act="close" aria-label="Close details">×</button></div>
 <p class="rw-callout">Ratings below use a human-editable, coarse rubric. Interview excerpts are candidate-reported, may contain transcription errors, and have not been independently verified. No automatic hiring recommendation.</p>
 ${reqs().map((r,i)=>{
  const topic=notes.find(t=>t.label===r.label),ans=topic?.answers?.join(' / ')||'No interview response recorded for this criterion.';
  return `<div class="rw-evidence"><div class="rw-evidence-head"><b>${safe(r.label)}</b><label>Rubric rating<select data-rate="${i}" data-id="${safe(a.id)}">${mkOptions(rating(a,i)??'',[['','Not assessed'],...Object.entries(LEVELS).map(([v,n])=>[v,`${v} · ${n}`])])}</select></label></div><details><summary>View linked interview answer</summary><p class="rw-answer">${safe(ans)}</p><p class="rw-muted">Question: ${safe(getJob().reqs[i]?.verifyQ||r.label)}</p></details></div>`;
 }).join('')}
 <label class="rw-note-label">Recruiter notes<textarea data-note="${safe(a.id)}" rows="3" placeholder="Questions to verify, role-specific concerns, next steps…">${safe(S.notes[a.id]||'')}</textarea></label>
 <div class="rw-modal-actions"><a href="#review/${safe(a.id)}" class="ghost button">Original transcript view</a><button class="ghost" data-act="close">Close</button><button class="rw-small-primary" data-act="advance" data-id="${safe(a.id)}">${isAdvance(a)?'Remove from shortlist':'+ Shortlist'}</button></div></section></div>`;
}
function render(){if(!root)return;const all=forRole();
 const phaseBtn=(p,title,desc)=>`<button class="rw-phasebtn" data-act="phase" data-val="${p}" aria-pressed="${S.phase===p}"><span>PHASE ${p}</span><strong>${title}</strong><small>${desc}</small></button>`;
 root.innerHTML=`<section class="rw-page"><div class="rw-section-top rw-intro"><div><p class="eyebrow">HEAD HUNTERS / RECRUITER WORKSPACE</p><h1>Screen broadly.<br>Review deeply.</h1><p class="rw-muted">Two-stage recruiter-led screening, powered by job requirements and linked interview evidence.</p></div><div class="rw-demo-sign">DEMO · HUMAN DECISIONS</div></div>
 <div class="rw-phasebar">${phaseBtn(1,'Initial screening','1–5 rating filters')}${phaseBtn(2,'Compare shortlist','Side-by-side ratings')}</div>
 <div class="rw-roleline"><label>Job position<select data-role>${mkOptions(S.role,JOBS.map(job=>[job.id,job.title]))}</select></label><p>${all.length} application${all.length===1?'':'s'} for this role · Demo data remains in this browser tab</p></div>
 <div class="rw-workspace">${S.phase===1?renderRules():''}${S.phase===1?renderPhase1():renderPhase2()}</div>
 <p class="rw-legal">Candidate data and human-entered ratings are stored only in this browser tab (sessionStorage). This interactive demo has no backend or real candidate verification.</p></section>
 ${S.focus?renderDetail():''}`;
}
function act(node){const action=node.dataset.act,id=node.dataset.id;
 if(action==='phase'){S.phase=Number(node.dataset.val);S.view='all';S.query='';render();}
 else if(action==='load-demo')loadSamples();
 else if(action==='reset-rules'){resetRules();render();}
 else if(action==='remove-rule'){S.rules.splice(Number(node.dataset.index),1);persist();render();}
 else if(action==='add-rule'){const available=reqs().findIndex((_,i)=>!S.rules.some(r=>r.idx===i));if(available>=0){S.rules.push({idx:available,min:3,required:true});persist();render();}}
 else if(action==='logic'){S.logic=node.dataset.val;render();}
 else if(action==='view'){S.view=node.dataset.val;render();}
 else if(action==='direction'){S.desc=!S.desc;render();}
 else if(action==='detail'){S.focus=id;render();}
 else if(action==='close'){S.focus=null;render();}
 else if(action==='back-phase1'){S.phase=1;S.view='all';render();}
 else if(action==='advance'){
  S.advanced[id]=!S.advanced[id];
  persist();render();
 }
}
window.resetRecruiterWorkspace=function(){S.phase=1;S.view='all';S.query='';S.ratings={};S.advanced={};S.notes={};S.focus=null;S.role='fe';resetRules();};
window.renderRecruiterWorkspace=function(element,apps,persistApps,jobLookup,analyzeFn,escapeFn){
 root=element;pool=apps;savePool=persistApps;jobFor=jobLookup;analyze=analyzeFn;esc=escapeFn;
 if(!Array.isArray(saved.rules))resetRules();
 render();
 root.onclick=e=>{
  const a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='close'&&a.classList.contains('rw-overlay')&&e.target!==a)return;
  act(a);
 };
 root.onchange=e=>{
  const n=e.target;
  if(n.matches('[data-role]')){S.role=n.value;S.rules=defaultRules().filter(r=>r.idx<reqs().length);S.view='all';S.phase=1;S.query='';persist();render();}
  if(n.matches('[data-rule]')){const rule=S.rules[Number(n.dataset.index)];if(!rule)return;if(n.dataset.rule==='metric')rule.idx=Number(n.value);if(n.dataset.rule==='min')rule.min=Number(n.value);if(n.dataset.rule==='required')rule.required=n.value==='true';persist();render();}
  if(n.matches('[data-sort]')){S.sort=n.value;render();}
  if(n.matches('[data-rate]')){if(!S.ratings[n.dataset.id])S.ratings[n.dataset.id]={};if(n.value==='')S.ratings[n.dataset.id][n.dataset.rate]=null;else S.ratings[n.dataset.id][n.dataset.rate]=Number(n.value);persist();render();}
 };
 root.oninput=e=>{
  const n=e.target;if(n.matches('[data-search]')){S.query=n.value;const cursor=n.selectionStart;render();const q=root.querySelector('[data-search]');q?.focus();try{q.setSelectionRange(cursor,cursor);}catch{}}
  if(n.matches('[data-note]')){S.notes[n.dataset.note]=n.value;persist();}
 };
};
})();
