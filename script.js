/**
 * BAT - Burnout Assessment Tool
 * JavaScript Implementation
 * 
 * This script implements the BAT questionnaire with:
 * - 23 core items (exhaustion, mental distance, cognitive, emotional)
 * - 10 secondary symptoms
 * - Calculation based on mean scores
 * - Classification using official BAT 2.0 cutoff points
 */

// ============================================================================
// CONSTANTS AND DATA
// ============================================================================

/**
 * Question items organized by subscale
 * All questions are in Portuguese (official translation)
 */
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
  ],
  secondary: [
    'Tenho dificuldade para adormecer ou para permanecer dormindo',
    'Tendo tendência a me preocupar',
    'Sinto-me tenso(a) e estressado(a)',
    'Sinto-me ansioso(a) e/ou sofro ataques de pânico',
    'Barulho e multidões me incomodam',
    'Sofro de palpitações ou dor no peito',
    'Sofro de problemas estomacais e/ou intestinais',
    'Sofro de dores de cabeça',
    'Sofro de dores musculares (por exemplo, no pescoço, ombro ou costas)',
    'Adoeço com frequência'
  ]
};

/**
 * Cutoff points from BAT 2.0 Manual
 * Structure: { green: upper limit for low risk, orange: upper limit for medium risk }
 * Values above orange threshold indicate high risk
 */
const CUTS = {
  total: { green: 2.58, orange: 3.01 },
  exhaustion: { green: 3.05, orange: 3.30 },
  mentalDistance: { green: 2.49, orange: 3.09 },
  emotional: { green: 2.09, orange: 2.89 },
  cognitive: { green: 2.69, orange: 3.09 }
  // Note: Secondary symptoms use total cutoffs as per implementation plan
};

/**
 * Human-readable labels for subscales
 */
const LABELS = {
  exhaustion: 'Esgotamento',
  mentalDistance: 'Distanciamento mental',
  cognitive: 'Prejuízo cognitivo',
  emotional: 'Prejuízo emocional',
  secondary: 'Sintomas secundários'
};

// Total number of items in the questionnaire
const NUM_ITEMS = Object.values(ITEMS).reduce((sum, arr) => sum + arr.length, 0);

// Store last calculation result for export functionality
let LAST_RESULT = null;

// ============================================================================
// FORM BUILDING
// ============================================================================

/**
 * Builds the questionnaire form dynamically from ITEMS constant
 */
function buildForm() {
  const qContainer = document.getElementById('questions');
  qContainer.innerHTML = '';
  let idx = 1;

  for (const [scale, arr] of Object.entries(ITEMS)) {
    arr.forEach(text => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question';
      qDiv.innerHTML = `
        <div class="q-text"><strong>${idx}.</strong> ${text}</div>
        <div class="options" data-q="${idx}" role="radiogroup" 
             aria-label="Questão ${idx}">
          <label>
            <input type="radio" name="q${idx}" value="1" 
                   aria-label="Nunca">
            <span>1<br><small>Nunca</small></span>
          </label>
          <label>
            <input type="radio" name="q${idx}" value="2" 
                   aria-label="Raramente">
            <span>2<br><small>Raramente</small></span>
          </label>
          <label>
            <input type="radio" name="q${idx}" value="3" 
                   aria-label="Às vezes">
            <span>3<br><small>Às vezes</small></span>
          </label>
          <label>
            <input type="radio" name="q${idx}" value="4" 
                   aria-label="Frequentemente">
            <span>4<br><small>Frequentemente</small></span>
          </label>
          <label>
            <input type="radio" name="q${idx}" value="5" 
                   aria-label="Sempre">
            <span>5<br><small>Sempre</small></span>
          </label>
        </div>
      `;
      qContainer.appendChild(qDiv);
      idx++;
    });
  }
}

// ============================================================================
// DATA COLLECTION AND VALIDATION
// ============================================================================

/**
 * Collects all answers from the form
 * @returns {number[]} Array of answer values (0 if not answered, 1-5 if answered)
 */
function getAnswers() {
  const vals = [];
  for (let i = 1; i <= NUM_ITEMS; i++) {
    const radios = document.getElementsByName('q' + i);
    let v = 0;
    for (const r of radios) {
      if (r.checked) {
        v = parseInt(r.value);
        break;
      }
    }
    vals.push(v);
  }
  return vals;
}

/**
 * Checks if all questions have been answered
 * @param {number[]} vals - Array of answer values
 * @returns {boolean} True if all questions answered
 */
function allAnswered(vals) {
  return vals.every(v => v >= 1 && v <= 5);
}

// ============================================================================
// CALCULATIONS
// ============================================================================

/**
 * Calculates the mean of an array of numbers
 * @param {number[]} array - Array of numbers
 * @returns {number} Mean value
 */
function mean(array) {
  return array.reduce((a, b) => a + b, 0) / array.length;
}

/**
 * Classifies a score based on cutoff points
 * @param {number} value - Score to classify
 * @param {Object} cuts - Cutoff points {green, orange}
 * @returns {string} 'Verde', 'Laranja', or 'Vermelho'
 */
function classifyScale(value, cuts) {
  if (value <= cuts.green) return 'Verde';
  if (value <= cuts.orange) return 'Laranja';
  return 'Vermelho';
}

/**
 * Computes subscale means from answer array
 * @param {number[]} vals - Array of all answers
 * @returns {Object} Map of subscale names to {values, mean}
 */
function computeSubscales(vals) {
  const map = {};
  let pos = 0;

  for (const [scale, arr] of Object.entries(ITEMS)) {
    const len = arr.length;
    const slice = vals.slice(pos, pos + len);
    map[scale] = {
      values: slice,
      mean: parseFloat(mean(slice).toFixed(2))
    };
    pos += len;
  }

  return map;
}

/**
 * Calculates overall mean across all items
 * @param {number[]} vals - Array of all answers
 * @returns {number} Overall mean score
 */
function overallMean(vals) {
  return parseFloat((vals.reduce((a, b) => a + b, 0) / NUM_ITEMS).toFixed(2));
}

// ============================================================================
// RESULTS DISPLAY
// ============================================================================

/**
 * Maps classification to CSS class name
 * @param {string} classification - 'Verde', 'Laranja', or 'Vermelho'
 * @returns {string} CSS class name
 */
function mapClass(classification) {
  if (classification === 'Verde') return 'green';
  if (classification === 'Laranja') return 'orange';
  return 'red';
}

/**
 * Maps classification to risk label text
 * @param {string} classification - 'Verde', 'Laranja', or 'Vermelho'
 * @returns {string} Risk label text
 */
function riskLabel(classification) {
  if (classification === 'Verde') return 'Baixo risco';
  if (classification === 'Laranja') return 'Risco médio';
  return 'Alto risco';
}

/**
 * Renders the results section with scores and classifications
 * @param {number[]} vals - Array of all answers
 */
function renderResult(vals) {
  const resDiv = document.getElementById('result');
  const sub = computeSubscales(vals);
  const total = overallMean(vals);

  // Classify total score
  const clsTotal = classifyScale(total, CUTS.total);

  // Classify each subscale using specific or default cutoffs
  const classes = {};
  for (const [k, v] of Object.entries(sub)) {
    const cuts = CUTS[k] || CUTS.total;
    classes[k] = classifyScale(v.mean, cuts);
  }

  // Store result for export functionality
  LAST_RESULT = {
    date: new Date().toISOString(),
    total,
    sub,
    classes
  };

  // Build results HTML
  const ordered = ['exhaustion', 'mentalDistance', 'cognitive', 'emotional', 'secondary'];

  resDiv.innerHTML = `
    <div style="font-size: 1.1rem; margin-bottom: 16px;">
      <strong>Resultado Geral (média):</strong> 
      ${total.toFixed(2)} 
      <span class="badge ${mapClass(clsTotal)}">${riskLabel(clsTotal)}</span>
    </div>

    <div style="margin-top: 16px;">
      <strong>Subescalas:</strong>
      <ul>
        ${ordered.map(k => {
    if (!sub[k]) return '';
    const m = sub[k].mean;
    const cls = classes[k];
    return `
            <li>
              <strong>${LABELS[k]}:</strong> ${m.toFixed(2)} 
              <span class="badge ${mapClass(cls)}">${riskLabel(cls)}</span>
            </li>
          `;
  }).join('')}
      </ul>
    </div>
  `;

  // Scroll to results
  resDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}



// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Initialize the application when DOM is ready
 */
window.addEventListener('DOMContentLoaded', () => {
  buildForm();

  // Calculate button
  document.getElementById('calc').addEventListener('click', () => {
    const vals = getAnswers();

    if (!allAnswered(vals)) {
      const resDiv = document.getElementById('result');
      resDiv.innerHTML = `
        <div style="color: #e74c3c; font-weight: 600;">
          ⚠️ Por favor, responda todas as ${NUM_ITEMS} questões antes de calcular.
        </div>
      `;
      resDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    renderResult(vals);
  });

  // Reset button
  document.getElementById('reset').addEventListener('click', () => {
    // Clear all radio buttons
    for (let i = 1; i <= NUM_ITEMS; i++) {
      const radios = document.getElementsByName('q' + i);
      for (const r of radios) {
        r.checked = false;
      }
    }

    // Clear results
    document.getElementById('result').innerHTML = '';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


});