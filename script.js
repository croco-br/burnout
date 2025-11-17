
// Dados oficiais (work-related version) - itens agrupados por subescala, com redação oficial do manual
// Fonte: User Manual BAT v2.0 (apêndice - work-related items). Trechos usados sob citação do manual. fileciteturn1file19

const ITEMS = {
  exhaustion: [
    'No trabalho, sinto-me mentalmente exausto(a)',
    'Tudo o que faço no trabalho exige muito esforço',
    'Após um dia de trabalho, acho difícil recuperar minha energia',
    'No trabalho, sinto-me fisicamente exausto(a)',
    'Quando me levanto de manhã, sinto que não tenho energia para começar um novo dia de trabalho',
    'Quero ser ativo(a) no trabalho, mas de alguma forma não consigo',
    'Quando me esforço no trabalho, fico cansado(a) rapidamente',
    'Ao final do meu dia de trabalho, sinto-me mentalmente exausto(a) e esgotado(a)'
  ],
    mentalDistance: [
      'Tenho dificuldade em encontrar entusiasmo pelo meu trabalho',
      'No trabalho, não penso muito sobre o que estou fazendo e funciono no modo automático',
      'Sinto uma forte aversão pelo meu trabalho',
      'Sinto-me indiferente em relação ao meu trabalho',
      'Sou cínico(a) quanto ao significado do meu trabalho para os outros'
    ],
  cognitive: [
    'No trabalho, tenho dificuldade em manter o foco',
    'No trabalho, tenho dificuldade para pensar com clareza',
    'Sou esquecido(a) e distraído(a) no trabalho',
    'Quando estou trabalhando, tenho dificuldade de concentração',
    'Cometo erros no trabalho porque estou com a cabeça em outras coisas'
  ],
  emotional: [
    'No trabalho, sinto que não consigo controlar minhas emoções',
    'Não me reconheço na forma como reajo emocionalmente no trabalho',
    'Durante o trabalho, fico irritado(a) quando as coisas não saem como quero',
    'Fico chateado(a) ou triste no trabalho sem saber o motivo',
    'No trabalho, posso reagir de forma exagerada sem querer'
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
            <label><input type="radio" name="q${idx}" value="1"><span>1<br><small>Nunca</small></span></label>
            <label><input type="radio" name="q${idx}" value="2"><span>2<br><small>Raramente</small></span></label>
            <label><input type="radio" name="q${idx}" value="3"><span>3<br><small>Às vezes</small></span></label>
            <label><input type="radio" name="q${idx}" value="4"><span>4<br><small>Frequentemente</small></span></label>
            <label><input type="radio" name="q${idx}" value="5"><span>5<br><small>Sempre</small></span></label>
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

        document.getElementById('copyBtn').addEventListener('click', ()=>{
          const vals = getAnswers(); if (!allAnswered(vals)){ alert('Por favor, responda todos os itens antes.'); return; }
          const sub = computeSubscales(vals); const totalVal = overallMean(vals);
          let text = `BAT — Média total: ${totalVal}
      Esgotamento: ${sub.exhaustion.mean}
      Distanciamento mental: ${sub.mentalDistance.mean}
      Prejuízo cognitivo: ${sub.cognitive.mean}
      Prejuízo emocional: ${sub.emotional.mean}`;
          document.getElementById('saved').innerText='Salvo localmente.';
          navigator.clipboard.writeText(text).then(()=>alert('Copiado para a área de transferência.')).catch(()=>alert('Falha ao copiar.'));
        });
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
    <div><strong>Total (média):</strong> ${total.toFixed(2)} — <strong>${clsTotal}</strong></div>
    <div class="bar-chart" id="chart">
      ${['exhaustion','mentalDistance','cognitive','emotional'].map(k=>{
        const m = sub[k].mean;
        const pct = ((m-1)/4)*100;
        const color = (k==='exhaustion'? '#f46':'#6ab');
        // rótulos em português
        const labels = {
          exhaustion: 'Esgotamento',
          mentalDistance: 'Distanciamento mental',
          cognitive: 'Prejuízo cognitivo',
          emotional: 'Prejuízo emocional'
        };
        return `<div class="bar" title="${labels[k]}: ${m}"><div style="height:${pct}% ; background:${color}; border-radius:6px 6px 0 0"></div><div class="label">${labels[k]}<br/>${m}</div></div>`;
      }).join('')}
    </div>
    <div style="margin-top:10px">
      <strong>Subescalas:</strong>
      <ul>
        <li>Esgotamento: ${sub.exhaustion.mean} — ${clsEx}</li>
        <li>Distanciamento mental: ${sub.mentalDistance.mean} — ${clsMd}</li>
        <li>Prejuízo cognitivo: ${sub.cognitive.mean} — ${clsCi}</li>
        <li>Prejuízo emocional: ${sub.emotional.mean} — ${clsEm}</li>
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
      document.getElementById('result').innerHTML = '<div style="color:#b33">Por favor, responda todos os itens.</div>';
        if (!allAnswered(vals)){ alert('Por favor, responda todos os itens antes.'); return; }
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
  let text = `BAT — Média total: ${total}
Esgotamento: ${sub.exhaustion.mean}
Distanciamento mental: ${sub.mentalDistance.mean}
Prejuízo cognitivo: ${sub.cognitive.mean}
Prejuízo emocional: ${sub.emotional.mean}`;
      document.getElementById('saved').innerText='Salvo localmente.';
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