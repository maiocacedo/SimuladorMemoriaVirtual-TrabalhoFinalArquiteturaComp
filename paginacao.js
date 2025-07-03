// referências ao DOM
const memoryContainer      = document.getElementById('memoryContainer');
const pageTablesContainer  = document.getElementById('pageTablesContainer');
const eventLog             = document.getElementById('eventLog');
const startBtn             = document.getElementById('startBtn');
const stopBtn              = document.getElementById('stopBtn');

// configuração da paginação
const FRAME_COUNT    = 6;
const PAGE_SIZE      = 1024;
const REFERENCE_COUNT = 100;  // número de acessos antes de terminar

// definição de processos e subrotinas
const processes = [
  {
    name: 'Processo 1',
    subroutines: [
      { name: 'Sub A', size: 3500 },
      { name: 'Sub B', size: 1800 }
    ]
  },
  {
    name: 'Processo 2',
    subroutines: [
      { name: 'Sub C', size: 5200 },
      { name: 'Sub D', size: 2400 }
    ]
  }
];

// lista achatada para facilitar picks aleatórios
const flatSubs = processes.flatMap(proc =>
  proc.subroutines.map(sub => ({
    procName: proc.name,
    name:    sub.name,
    size:    sub.size
  }))
);

// estado da simulação
let freeFrames    = [];
let frameQueue    = [];
let pageTables    = {};
let frameTable    = Array(FRAME_COUNT).fill(null);
let simIntervalId = null;

// inicializa UI: frames e tabelas vazias
function initUI() {
  // frames físicos
  memoryContainer.innerHTML = '';
  for (let i = 0; i < FRAME_COUNT; i++) {
    const slot = document.createElement('div');
    slot.classList.add('frame-slot');
    slot.textContent = `Frame ${i}`;
    memoryContainer.appendChild(slot);
  }

  // limpa container de tabelas e log
  pageTablesContainer.innerHTML = '';
  eventLog.innerHTML = '';

  // cria uma tabela por processo
  processes.forEach(proc => {
    const tbl = document.createElement('table');
    tbl.className = 'page-table';
    tbl.id        = `tbl-${proc.name.replace(/\s+/g,'-')}`;
    tbl.innerHTML = `
      <caption>${proc.name}</caption>
      <thead>
        <tr>
          <th>Subrotina</th>
          <th>Página nº</th>
          <th>Endereço virtual</th>
          <th>Frame</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    pageTablesContainer.appendChild(tbl);
  });
}

// adiciona um evento no log, e coloca na cor especificada
function logEvent(text, color) {
  const li = document.createElement('li');
  li.textContent = text;
  li.style.color = color;
  li.style.fontSize = '14px';
  eventLog.appendChild(li);
  eventLog.scrollTop = eventLog.scrollHeight;
}

// atualiza as linhas de todas as tabelas de páginas 
function updatePageTablesUI() {
  processes.forEach(proc => {
    const tbl = document.getElementById(`tbl-${proc.name.replace(/\s+/g,'-')}`);
    const tb  = tbl.querySelector('tbody');
    tb.innerHTML = '';

    // itera pelas subrotinas do processo
    proc.subroutines.forEach(sub => {
      const pages = pageTables[proc.name][sub.name];
      pages.forEach((f, idx) => {
        const start = idx * PAGE_SIZE;
        const end   = (idx + 1) * PAGE_SIZE - 1;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${sub.name}</td>
          <td>${idx}</td>
          <td>${start}–${end}</td>
          <td>${f === null ? '—' : 'F'+f}</td>
        `;
        tb.appendChild(tr);
      });
    });
  });
}

// atualiza um único frame físico na UI, pelo index (idx)
function updateFrameUI(idx) {
  const slot = memoryContainer.children[idx];
  const entry = frameTable[idx];
  if (entry) {
    const [pName, sName, pg] = entry;
    slot.textContent       = `F${idx}: ${pName}/${sName}[${pg}]`;
    slot.style.background  = 'linear-gradient(135deg, var(--sub-color-2), var(--sub-color-3))';
    slot.style.color = 'var(--text-secondary)';
    slot.style.fontWeight = 'bold';
  } else {
    slot.textContent      = `Frame ${idx}`;
    slot.style.background = '';
  }
}

// inicia simulação 
function startSimulation() {
  if (simIntervalId !== null) return;  // já em execução

  // reset de estado
  freeFrames    = Array.from({ length: FRAME_COUNT }, (_, i) => i);
  frameQueue    = [];
  pageTables    = {};
  processes.forEach(proc => {
    pageTables[proc.name] = {};
    proc.subroutines.forEach(sub => {
      const count = Math.ceil(sub.size / PAGE_SIZE);
      pageTables[proc.name][sub.name] = Array(count).fill(null);
    });
  });
  frameTable    = Array(FRAME_COUNT).fill(null);

  initUI(); // reinicializa UI

  
  logEvent('*** Iniciando simulação de paginação ***', 'blue');
  logEvent(`Total de frames: ${FRAME_COUNT}, Tamanho da página: ${PAGE_SIZE} bytes`, 'blue');

  // gera a sequência de acessos (refString) antes de começar
  const referenceString = Array.from({ length: REFERENCE_COUNT }, () => {
    const e = flatSubs[Math.floor(Math.random() * flatSubs.length)];
    const pageCount = Math.ceil(e.size / PAGE_SIZE);
    const p = Math.floor(Math.random() * pageCount);
    return [e.procName, e.name, p];
  });

  let refIndex = 0;
  // inicializa as tabelas de páginas na UI
  simIntervalId = setInterval(() => {
    const [procName, subName, pageNum] = referenceString[refIndex];
    const table = pageTables[procName][subName];

  
    if (table[pageNum] === null) {
      // falta de página
      let frame;
      // verifica se há frames livres
      if (freeFrames.length > 0) {
        frame = freeFrames.shift();
      } else { 
        // não há frames livres
        // escolhe um frame da fila para substituir
        const victimFrame = frameQueue.shift();
        const [vProc, vSub, vPg] = frameTable[victimFrame];
        pageTables[vProc][vSub][vPg] = null;
        logEvent(`Substituindo ${vSub}[${vPg}] de ${vProc} em frame ${victimFrame}`, 'rgb(237, 154, 1)'); // mensagem substituição
        frame = victimFrame;
      }
      // carrega a página na memória
      table[pageNum]        = frame;
      frameTable[frame]     = [procName, subName, pageNum];
      frameQueue.push(frame);
      updateFrameUI(frame);
      updatePageTablesUI();
      logEvent(`Page fault: ${procName}/${subName}[${pageNum}] → frame ${frame}`, 'rgb(251, 238, 53)');// mensagem page fault
    } else {
      // já está na memória (hit)
      logEvent(`Hit: ${procName}/${subName}[${pageNum}] já em frame ${table[pageNum]}`, 'rgb(48, 252, 41)'); // mensagem hit
    }

    refIndex++; // avança para o próximo acesso
    // verifica se chegou ao fim da sequência de referências
    if (refIndex >= referenceString.length) {
      // fim das referências → para sozinho
      clearInterval(simIntervalId);
      simIntervalId = null;
      logEvent('*** Simulação concluída. ***'); // mensagem fim simulação
      startBtn.disabled = false; 
      stopBtn.disabled  = true;
    }
  }, 500);

  startBtn.disabled = true;
  stopBtn.disabled  = false;
}

// para simulação manual
function stopSimulation() {
  if (simIntervalId !== null) {
    clearInterval(simIntervalId);
    simIntervalId = null;
    logEvent('Simulação parada pelo usuário.'); // mensagem parada
    startBtn.disabled = false;
    stopBtn.disabled  = true;
  }
}

// eventos dos botões
startBtn.addEventListener('click',  startSimulation);
stopBtn .addEventListener('click',  stopSimulation);
document.getElementById('home')
        .addEventListener('click', () => location.href = 'index.html');

// ao iniciar a página
stopBtn.disabled = true;
