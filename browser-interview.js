'use strict';
let activeInterview = null;
function stopInterview() { activeInterview?.(); }
window.addEventListener('pagehide', stopInterview);
// Ordered, editable demo branches. No model calls or semantic evaluation.
function demoFollowUp(answer, topic, stage) {
  const text = answer.toLowerCase().replace(/[’]/g, "'");
  if (/\b(skip|next question|move on)\b/.test(text)) return null;
  if (/\b(no experience|never|haven't|have not|not yet|don't have|do not have)\b/.test(text)) {
    return stage === 0 ? "That's helpful to know. What related experience could you draw on to get started, and what would you learn first?" : null;
  }
  if (stage > 0) return null;
  if (/\b(team|we|together|colleague|collaborat\w*)\b/.test(text)) return 'You mentioned working with others. What part did you personally own, and how did you coordinate with the team?';
  if (/\b(slow|performance|latency|optimiz\w*|speed)\b/.test(text)) return 'You mentioned performance. How did you identify the bottleneck, and what changed after your fix?';
  if (/\b(fail\w*|error\w*|bug\w*|incident|broke|broken)\b/.test(text)) return 'You mentioned a problem. How did you find the root cause, and what did you do to prevent it happening again?';
  if (/\b(learn\w*|course|class|school|university|tutorial)\b/.test(text)) return 'You mentioned learning this. How did you apply it in a project, and what would you do differently next time?';
  if (/\b(\d+|percent|reduc\w*|improv\w*|increas\w*)\b/.test(text)) return 'What did you compare that result against, and how did you measure your own contribution?';
  if (text.trim().split(/\s+/).length < 15) return `Could you give me one specific example involving ${topic.label}, including what you did and what happened?`;
  return 'Walk me through one decision you made in that example. What alternatives did you consider, and what was the outcome?';
}

function runInterview(job, res, matchPct, onComplete) {
  stopInterview();
  const topics = [...res.gaps.map(t=>({...t,gap:true})),
    {label:'Relevant experience',gap:!res.yearsOk,gapQ:'Walk me through your relevant experience, including how long you spent in each role.',verifyQ:'Which recent role best prepared you for this position, and why?'},
    ...res.met.map(t=>({...t,gap:false}))];
  const root = document.getElementById('interview');
  root.innerHTML = `<div class="panel voice-panel"><h3>Resume Review Interview</h3>
    <p class="note">No API key needed. This demo selects prepared follow-ups from words in your answers; it is not a live AI interviewer. Browser speech recognition may send audio to your browser provider. Your résumé is not sent to OpenAI in this mode.</p>
    <label><input type="checkbox" id="browser-consent"> I agree to use my browser's speech recognition for this demo.</label>
    <div class="camera-card"><video id="browser-camera" autoplay muted playsinline></video><div class="camera-caption">You · Live preview only</div></div>
    <button class="ghost" id="browser-camera-toggle">Enable camera</button><p class="note" id="browser-camera-status">Camera is off. Video is never recorded.</p>
    <div class="voice-orb" id="browser-orb" aria-hidden="true">◉</div>
    <p id="browser-status" role="status">Ready when you are</p>
    <p id="browser-question" class="spoken-question" aria-live="polite">Questions will appear here and be read aloud.</p>
    <div class="voice-controls"><button class="primary" id="browser-start">Begin interview</button><button class="ghost" id="browser-listen" disabled>Speak answer</button><button class="ghost" id="browser-repeat" disabled>Repeat question</button><button class="ghost" id="browser-end" disabled>End interview</button></div>
    <label for="browser-answer">Your answer (speech appears here; you can also type or edit it)</label>
    <textarea id="browser-answer" rows="4" disabled></textarea>
    <div class="voice-controls"><button class="primary" id="browser-submit" disabled>Finish answer</button><button class="ghost" id="browser-skip" disabled>Skip topic</button></div>
    <p id="browser-error" class="error" role="alert"></p>
    <p class="note">Click Speak answer, then Finish answer when done. One follow-up per topic; 10-minute limit. Use headphones. If recognition is unavailable, type your answer.</p>
    <span id="browser-progress" hidden></span><ul id="browser-topics" hidden></ul><div id="browser-report" hidden></div>
    </div>`;
  const el = id=>document.getElementById(`browser-${id}`);
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition, listening=false, running=false, disposed=false, speaking=false, index=0, stage=0, timer, speechGeneration=0;
  const transcript=[], notes=new Map();
  let cameraStream=null, cameraRequest=0;
  function stopCamera(){cameraRequest++;cameraStream?.getTracks().forEach(t=>t.stop());cameraStream=null;el('camera').srcObject=null;el('camera-toggle').textContent='Enable camera';el('camera-status').textContent='Camera is off. Video is never recorded.';}
  el('camera-toggle').onclick=async()=>{
    if(cameraStream){stopCamera();return;}
    const request=++cameraRequest;el('camera-toggle').disabled=true;
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera access requires localhost or HTTPS.');
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});
      if(disposed||request!==cameraRequest){stream.getTracks().forEach(t=>t.stop());return;}
      cameraStream=stream;el('camera').srcObject=stream;el('camera').play().catch(()=>{});
      el('camera-toggle').textContent='Turn camera off';el('camera-status').textContent='Camera is on. Preview only — no audio capture or video recording.';
    }catch(error){if(!disposed&&request===cameraRequest)el('camera-status').textContent='Camera unavailable. You can continue without it. '+error.message;}
    finally{if(!disposed)el('camera-toggle').disabled=false;}
  };
  function status(message){el('status').textContent=message;}
  function renderTopics(){
    el('progress').textContent=`${notes.size} / ${topics.length}`;
    el('topics').replaceChildren(...topics.map((t,i)=>{const li=document.createElement('li');li.textContent=`${t.label} — ${notes.has(i)?notes.get(i).status:(running&&i===index?'Current topic':'Not covered')}`;return li;}));
  }
  function stopListening(){
    const current=recognition; recognition=null; listening=false;
    if(current){current.onresult=null;current.onend=null;current.onerror=null;current.abort();}
    el('listen').textContent='Speak answer';
  }
  function cancelSpeech(){speechGeneration++;window.speechSynthesis?.cancel();speaking=false;}
  function speak(question){
    stopListening();cancelSpeech();el('question').textContent=question;
    if(!window.speechSynthesis){status('Read the question, then speak or type your answer.');return;}
    const generation=speechGeneration;
    const utterance=new SpeechSynthesisUtterance(question);utterance.lang='en-US';utterance.rate=0.96;
    speaking=true;el('listen').disabled=true;status('Interviewer speaking…');
    const done=()=>{if(disposed||!running||generation!==speechGeneration)return;speaking=false;el('listen').disabled=!Recognition;status('Your turn — click Speak answer or type.');};
    utterance.onend=done;utterance.onerror=done;window.speechSynthesis.speak(utterance);
  }
  function ask(){
    el('answer').value='';stage=0;renderTopics();
    const t=topics[index];speak(`${index===0?`Welcome to your mock interview for ${job.title}. Let's start. `:'Moving to the next topic. '}${t.gap?t.gapQ:t.verifyQ}`);
  }
  function finish(showReport=true){
    const wasRunning=running;running=false;stopCamera();clearTimeout(timer);stopListening();cancelSpeech();el('orb').classList.remove('live');
    ['listen','repeat','end','submit','skip','answer'].forEach(id=>el(id).disabled=true);
    el('start').disabled=false;el('start').textContent='Start a new demo';status('Interview ended');
    if(!showReport)return;
    if(wasRunning&&onComplete){
      const pending=el('answer').value.trim();
      if(pending&&index<topics.length){const record=notes.get(index)||{status:'Partial answer',answers:[]};record.answers.push(pending);notes.set(index,record);transcript.push(`Interviewer: ${el('question').textContent}`,`Candidate: ${pending}`);}
      onComplete({topics:topics.map((t,i)=>({label:t.label,status:notes.get(i)?.status||'Not covered',answers:notes.get(i)?.answers||[]})),transcript:[...transcript],completed:index>=topics.length});
    }
  }
  activeInterview=()=>{finish(false);disposed=true;};
  function advance(){index++;if(index>=topics.length){finish();}else ask();}
  el('start').onclick=()=>{
    if(running)return;
    if(!el('consent').checked){el('error').textContent='Please agree to browser speech recognition before starting.';return;}
    running=true;index=0;stage=0;notes.clear();transcript.length=0;el('report').replaceChildren();el('start').disabled=true;
    ['repeat','end','submit','skip','answer'].forEach(id=>el(id).disabled=false);
    el('listen').disabled=!Recognition;el('error').textContent=Recognition?'':'Speech recognition is unavailable in this browser. You can type your answers.';
    el('orb').classList.add('live');timer=setTimeout(()=>finish(),600000);ask();
  };
  el('listen').onclick=()=>{
    if(!running||speaking||!Recognition)return;
    if(listening){stopListening();status('Microphone stopped. Review your answer, then click Finish answer.');return;}
    el('error').textContent='';const prefix=el('answer').value.trim();recognition=new Recognition();const current=recognition;
    current.lang='en-US';current.continuous=true;current.interimResults=true;
    current.onresult=event=>{if(!running||recognition!==current)return;const text=Array.from(event.results,r=>r[0].transcript).join(' ');el('answer').value=[prefix,text].filter(Boolean).join(' ');};
    current.onend=()=>{if(recognition!==current)return;recognition=null;listening=false;el('listen').textContent='Speak answer';status('Microphone stopped. Review your answer, then click Finish answer.');};
    current.onerror=event=>{if(recognition!==current)return;el('error').textContent=event.error==='not-allowed'?'Microphone access was denied. Allow it in browser settings, or type your answer.':`Speech recognition stopped (${event.error}). Retry or type your answer.`;};
    try{current.start();listening=true;el('listen').textContent='Stop listening';status('Listening…');}catch{stopListening();el('error').textContent='Could not start speech recognition. Retry or type your answer.';}
  };
  el('repeat').onclick=()=>speak(el('question').textContent);
  el('submit').onclick=()=>{
    if(!running)return;stopListening();cancelSpeech();el('listen').disabled=!Recognition;
    const answer=el('answer').value.trim();if(!answer){el('error').textContent='Speak or type an answer, or skip this topic.';return;}
    el('error').textContent='';transcript.push(`Interviewer: ${el('question').textContent}`,`Candidate: ${answer}`);
    const record=notes.get(index)||{status:'Answer recorded',answers:[]};record.answers.push(answer);notes.set(index,record);
    const follow=demoFollowUp(answer,topics[index],stage);
    if(follow){stage++;el('answer').value='';renderTopics();speak(follow);}else advance();
  };
  el('skip').onclick=()=>{if(!running)return;stopListening();cancelSpeech();el('listen').disabled=!Recognition;const record=notes.get(index)||{answers:[]};record.status='Skipped';notes.set(index,record);transcript.push(`Interviewer: ${el('question').textContent}`,'Candidate: [Skipped topic]');advance();};
  el('end').onclick=()=>finish();
  renderTopics();
}
