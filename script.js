
// Dados oficiais (work-related version) - itens agrupados por subescala, com redação oficial do manual
// Fonte: User Manual BAT v2.0 (apêndice - work-related items). Trechos usados sob citação do manual. fileciteturn1file19

const ITEMS = {
  exhaustion: [
    'At work, I feel mentally exhausted',
    'Everything I do at work requires a great deal of effort',
    'After a day at work, I find it hard to recover my energy',
    'At work, I feel physically exhausted',
    'When I get up in the morning, I lack the energy to start a new day at work',
    'I want to be active at work, but somehow I am unable to manage',
    'When I exert myself at work, I quickly get tired',
    'At the end of my working day, I feel mentally exhausted and drained'
  ],
  mentalDistance: [
    'I struggle to find any enthusiasm for my work',
    'At work, I do not think much about what I am doing and I function on autopilot',
    'I feel a strong aversion towards my job',
    'I feel indifferent about my job',
    'I\'m cynical about what my work means to others'
  ],
  cognitive: [
    'At work, I have trouble staying focused',
    'At work I struggle to think clearly',
    'I\'m forgetful and distracted at work',
    'When I\'m working, I have trouble concentrating',
    'I make mistakes in my work because I have my mind on other things'
  ],
  emotional: [
    'At work, I feel unable to control my emotions',
    'I do not recognize myself in the way I react emotionally at work',
    'During my work I become irritable when things don\'t go my way',
    'I get upset or sad at work without knowing why',
    'At work I may overreact unintentionally'
  ]
};

// Plano de cortes (BAT-23) - valores retirados do manual (total-core e subescalas). Referência nas notas do documento.
const CUTS = {
  total: { green: 2.58, orange: 3.01 },
  exhaustion: { green: 3.05, orange: 3.30 },
  mentalDistance: { green: 2.49, orange: 3.09 },
  emotional: { green: 2.09, orange: 2.89 },
  cognitive: { green: 2.69, orange: 3.09 }
};

const NUM_ITEMS = Object.values(ITEMS).reduce((s,arr)=>s+arr.length,0); // 23

function buildForm(){
  const qContainer = document.getElementById('questions');
  let idx = 1;
  for (const [scale, arr] of Object.entries(ITEMS)){
    arr.forEach(text => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question';
      qDiv.innerHTML = `
        <div class="q-text"><strong>${idx}.</strong> ${text}</div>
        <div class="options" data-q="${idx}">
          <label><input type="radio" name="q${idx}" value="1"><span>1</span></label>
          <label><input type="radio" name="q${idx}" value="2"><span>2</span></label>
          <label><input type="radio" name="q${idx}" value="3"><span>3</span></label>
          <label><input type="radio" name="q${idx}" value="4"><span>4</span></label>
          <label><input type="radio" name="q${idx}" value="5"><span>5</span></label>
        </div>
      `;
      qContainer.appendChild(qDiv);
      idx++;
    });
  }
}

function getAnswers(){
  const vals = [];
  for (let i=1;i<=NUM_ITEMS;i++){
    const radios = document.getElementsByName('q'+i);
    let v = 0;
    for (const r of radios) if (r.checked) { v = parseInt(r.value); break; }
    vals.push(v);
  }
  return vals;
}

function allAnswered(vals){ return vals.every(v => v>=1 && v<=5); }

function mean(array){ return array.reduce((a,b)=>a+b,0)/array.length; }

function classifyScale(value, cuts){
  if (value <= cuts.green) return 'Green';
  if (value <= cuts.orange) return 'Orange';
  return 'Red';
}

function computeSubscales(vals){
  // Map flat answers into subscales according to ITEMS order
  const map = {};
  let pos = 0;
  for (const [scale, arr] of Object.entries(ITEMS)){
    const len = arr.length;
    const slice = vals.slice(pos, pos+len);
    map[scale] = { values: slice, mean: parseFloat(mean(slice).toFixed(2)) };
    pos += len;
  }
  return map;
}

function overallMean(vals){ return parseFloat((vals.reduce((a,b)=>a+b,0)/NUM_ITEMS).toFixed(2)); }

function renderResult(vals){
  const resDiv = document.getElementById('result');
  const sub = computeSubscales(vals);
  const total = overallMean(vals);

  // classifications
  const clsTotal = classifyScale(total, CUTS.total);
  const clsEx = classifyScale(sub.exhaustion.mean, CUTS.exhaustion);
  const clsMd = classifyScale(sub.mentalDistance.mean, CUTS.mentalDistance);
  const clsEm = classifyScale(sub.emotional.mean, CUTS.emotional);
  const clsCi = classifyScale(sub.cognitive.mean, CUTS.cognitive);

  // build HTML
  resDiv.innerHTML = `
    <div><strong>Total (mean):</strong> ${total.toFixed(2)} — <strong>${clsTotal}</strong></div>
    <div class="bar-chart" id="chart">
      ${['exhaustion','mentalDistance','cognitive','emotional'].map(k=>{
        const m = sub[k].mean;
        const pct = ((m-1)/4)*100;
        const color = (k==='exhaustion'? '#f46':'#6ab');
        return `<div class="bar" title="${k}: ${m}"><div style="height:${pct}% ; background:${color}; border-radius:6px 6px 0 0"></div><div class="label">${k}<br/>${m}</div></div>`;
      }).join('')}
    </div>
    <div style="margin-top:10px">
      <strong>Subscales:</strong>
      <ul>
        <li>Exhaustion: ${sub.exhaustion.mean} — ${clsEx}</li>
        <li>Mental distance: ${sub.mentalDistance.mean} — ${clsMd}</li>
        <li>Cognitive impairment: ${sub.cognitive.mean} — ${clsCi}</li>
        <li>Emotional impairment: ${sub.emotional.mean} — ${clsEm}</li>
      </ul>
    </div>
  `;
}

// Events
window.addEventListener('DOMContentLoaded', ()=>{
  buildForm();

  document.getElementById('calc').addEventListener('click', ()=>{
    const vals = getAnswers();
    if (!allAnswered(vals)){
      document.getElementById('result').innerHTML = '<div style="color:#b33">Please answer all items.</div>';
      return;
    }
    renderResult(vals);
  });

  document.getElementById('reset').addEventListener('click', ()=>{
    for (let i=1;i<=NUM_ITEMS;i++){ const radios = document.getElementsByName('q'+i); for (const r of radios) r.checked=false; }
    document.getElementById('result').innerHTML=''; document.getElementById('saved').innerText='';
  });

  document.getElementById('copyBtn').addEventListener('click', ()=>{
    const vals = getAnswers(); if (!allAnswered(vals)){ alert('Please answer all items first.'); return; }
    const sub = computeSubscales(vals); const total = overallMean(vals);
    let text = `BAT — Total mean: ${total}
Exhaustion: ${sub.exhaustion.mean}
Mental distance: ${sub.mentalDistance.mean}
Cognitive: ${sub.cognitive.mean}
Emotional: ${sub.emotional.mean}`;
    navigator.clipboard.writeText(text).then(()=>alert('Copied to clipboard.')).catch(()=>alert('Copy failed.'));
  });

  document.getElementById('saveJson').addEventListener('click', ()=>{
    const vals = getAnswers(); if (!allAnswered(vals)){ alert('Please answer all items first.'); return; }
    const sub = computeSubscales(vals); const total = overallMean(vals);
    const payload = {date: new Date().toISOString(), total, sub};
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='bat_result.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); document.getElementById('saved').innerText='Saved locally.';
  });
});