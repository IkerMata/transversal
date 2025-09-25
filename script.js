const contenidor = document.getElementById("questionari");
const marcador = document.getElementById("marcador");
const btnEnviar = document.getElementById("btnEnviar");
const resultatsDiv = document.getElementById("resultats");

let preguntes = [];
let seleccionades = [];

// 1️ Cargar preguntas desde la API
async function carregarPreguntes() {
  try {
    const res = await fetch('getPreguntes.php?num=10', { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Error al cargar preguntas: ${res.status}`);
    preguntes = await res.json();

    // Inicializar array de respuestas seleccionadas
    seleccionades = new Array(preguntes.length).fill(null);

    renderPreguntes();
    renderitzarMarcador();
  } catch (err) {
    contenidor.innerHTML = `<p style="color:red;">No se pudieron cargar las preguntas: ${err.message}</p>`;
  }
}

// 2️ Renderizar preguntas y botones
function renderPreguntes() {
  let html = "";
  preguntes.forEach((p, i) => {
    html += `<h3>${p.pregunta}</h3><div class="respostes">`;
    p.respostes.forEach((r, j) => {
      html += `<button data-q="${i}" data-r="${r.id}"><img src="${r.resposta}" alt="Logo"></button>`;
    });
    html += `</div>`;
  });
  contenidor.innerHTML = html;
}

// 3️ Manejo de clicks
contenidor.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const q = parseInt(btn.dataset.q);
  const r = parseInt(btn.dataset.r);

  if (seleccionades[q] !== null) return; // ya contestada

  seleccionades[q] = r;
  btn.classList.add("seleccionat");

  renderitzarMarcador();

  if (seleccionades.every(x => x !== null)) {
    btnEnviar.classList.remove("hidden");
  }
});

// 4️ Actualizar marcador
function renderitzarMarcador() {
  marcador.textContent = `Preguntes respostes: ${seleccionades.filter(x => x !== null).length} de ${preguntes.length}`;
}

// 5️ Enviar respuestas a finalitza.php
btnEnviar.addEventListener("click", async () => {
  try {
    const res = await fetch('finalitza.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(seleccionades)
    });

    if (!res.ok) throw new Error(`Error al enviar respuestas: ${res.status}`);

    const resultat = await res.json();
    if (resultat.error) {
      resultatsDiv.textContent = `Error: ${resultat.error}`;
    } else {
      resultatsDiv.textContent = `Has encertat ${resultat.correctes} de ${resultat.total}`;
    }
    btnEnviar.classList.add("hidden");
  } catch (err) {
    resultatsDiv.textContent = `No se pudo enviar las respuestas: ${err.message}`;
  }
});

// Inicializar quiz
carregarPreguntes();
