// referências do .html
const queueListEl = document.getElementById("queueList");
const activeListEl = document.getElementById("activeList");
const completedListEl = document.getElementById("completedList");
const memoryEl = document.getElementById("memoryContainer");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
document.getElementById("home").onclick = function () {
        location.href = "index.html";
    };


// paleta 
const subColors = ["#8DF82B", "#2BF4F8"];

// estado das subrotinas
let queuedSubroutines = [];
let durations = {};
let activeSubroutines = {}; 
let completedSubroutines = [];
let listIntervalId;

// Reseta o estado das subrotinas e limpa a memória
function resetState() {
  queuedSubroutines = [];
  durations = {};
  activeSubroutines = {};
  completedSubroutines = [];
  clearInterval(listIntervalId);
}

// Limpa a memória visual
function clearMemory() {
  memoryEl.innerHTML = "";
}

// Configura as subrotinas com nomes e tempos aleatórios (0.5 a 15.0 segundos)
function configureSubroutines() {
  // nomes e tempos aleatórios
  queuedSubroutines = Array.from(
    { length: 15 },
    (_, i) => `Subrotina ${i + 1}`
  );
  queuedSubroutines.forEach((name) => {
    // tempo aleatório entre 5.0 e 15.0 segundos
    durations[name] = parseFloat((Math.random() * 10 + 5).toFixed(1));
  });
}

// Atualiza as listas de subrotinas (fila, ativas e concluídas) de acordo com o estado atual
function updateLists() {
  // Fila (máx. 10)
  queueListEl.innerHTML = "";
  queuedSubroutines.slice(0, 10).forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    queueListEl.appendChild(li);
  });

  // Ativas
  activeListEl.innerHTML = "";
  Object.values(activeSubroutines).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.name;
    li.style.color = "var(--text-main)"; // cor principal
    activeListEl.appendChild(li);
  });
  // Concluídas
  completedListEl.innerHTML = "";
  completedSubroutines.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.style.color = "var(--sub-color-3)"; 
    completedListEl.appendChild(li);
  });
}

// Inicia a simulação, configurando subrotinas e desenhando a rotina principal
function iniciar() {
  resetState();
  clearMemory();
  configureSubroutines();
  drawMainRoutine();
  // dispara até 5 subrotinas iniciais
  for (let i = 0; i < 5; i++) {
    if (queuedSubroutines.length) {
      executarSubrotina(queuedSubroutines.shift(), i);
    }
  }
  listIntervalId = setInterval(updateLists, 500);
}

// Cancela a execução das subrotinas, limpa a memória e reseta o estado
function parar() {
  
  // cancela timers das subrotinas ativas
  Object.values(activeSubroutines).forEach((item) =>
    clearInterval(item.timerId)
  );
  resetState();
  updateLists();
}

// Desenha a rotina principal na memória
function drawMainRoutine() {
  const mainDiv = document.createElement("div");
  mainDiv.className = "main";
  mainDiv.textContent = "Rotina Principal";
  memoryEl.appendChild(mainDiv);
}

// Executa uma subrotina, escolhendo cor e gradiente aleatórios
function executarSubrotina(name, index) {

  // escolhe cor e gradiente
  const color = subColors[Math.floor(Math.random() * subColors.length)];
  const next = subColors[(subColors.indexOf(color) + 1) % subColors.length];
  const subDiv = document.createElement("div");
  subDiv.className = "sub";
  subDiv.style.background = `linear-gradient(135deg, ${color}, ${next})`;

  // título
  const title = document.createElement("div");
  title.textContent = name;
  subDiv.appendChild(title);

  // contador
  const timerEl = document.createElement("div");
  let timeRemaining = durations[name];
  timerEl.textContent = `${timeRemaining.toFixed(1)}s`;
  subDiv.appendChild(timerEl);

  memoryEl.appendChild(subDiv);

  // Timer para a subrotina
  const timerId = setInterval(() => {
    timeRemaining -= 0.1;
    if (timeRemaining > 0) {
      timerEl.textContent = `${timeRemaining.toFixed(1)}s`; // atualiza o contador
    } else {
      clearInterval(timerId); // limpa o timer
      finalizarSubrotina(name, index, subDiv); // finaliza a subrotina
    }
  }, 100);

  activeSubroutines[index] = { name, el: subDiv, timerId }; // armazena a subrotina ativa
}

// Finaliza uma subrotina, removendo-a da memória e atualizando o estado
function finalizarSubrotina(name, index, el) {
  el.remove();
  delete activeSubroutines[index]; // remove a subrotina ativa
  completedSubroutines.push(name); // adiciona à lista de concluídas
  if (queuedSubroutines.length) {
    const next = queuedSubroutines.shift(); // pega a próxima subrotina da fila
    executarSubrotina(next, index); // executa a próxima subrotina
  }
}

// Adiciona os eventos de clique aos botões
startBtn.addEventListener("click", iniciar);
stopBtn.addEventListener("click", parar);
