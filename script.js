document.addEventListener("DOMContentLoaded", () => {

  // -------------------- Referències al DOM --------------------
  const contenidor = document.getElementById("questionari");
  const marcador = document.getElementById("marcador");
  const btnEnviar = document.getElementById("btnEnviar");
  const resultatsDiv = document.getElementById("resultats");
  const adminPanel = document.getElementById("admin-panel");
  const btnAdminMode = document.getElementById("btnAdminMode");
  const btnQuizMode = document.getElementById("btnQuizMode");

  let preguntes = [];      // Array de preguntes carregades des de l'API
  let seleccionades = [];   // Array amb les respostes seleccionades per l'usuari

  // ====================== QUIZ ======================

  /** Carrega les preguntes des del backend (getPreguntes.php) */
  async function carregarPreguntes() {
    try {
      const res = await fetch('getPreguntes.php?num=10', { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`Error al cargar preguntas: ${res.status}`);
      preguntes = await res.json();

      // Normalitzar camps
      preguntes = preguntes.map(p => ({
        pregunta: p.pregunta || p.text,
        respostes: p.respostes || p.respuestas
      }));

      // Inicialitzar array de respostes seleccionades
      seleccionades = new Array(preguntes.length).fill(null);

      renderPreguntes();
      renderitzarMarcador();
    } catch (err) {
      contenidor.innerHTML = `<p style="color:red;">No se pudieron cargar las preguntas: ${err.message}</p>`;
    }
  }

  /** Renderitza les preguntes i les respostes amb imatges */
  function renderPreguntes() {
    let html = "";
    preguntes.forEach((p, i) => {
      html += `<h3>${p.pregunta}</h3><div class="respostes">`;

      // Barregem les respostes aleatòriament per que la correcta no sigui sempre la primera
      let respostesBarrejades = [...p.respostes].sort(() => Math.random() - 0.5);

      respostesBarrejades.forEach((r) => {
        let imgSrc = r.resposta || "imagenes/default.png"; // fallback si no hi ha imatge
        html += `<button data-q="${i}" data-r="${r.id}">
                   <img src="${imgSrc}" alt="Logo" width="60">
                 </button>`;
      });
      html += `</div>`;
    });
    contenidor.innerHTML = html;
  }

  /** Gestiona el click sobre les respostes */
  contenidor.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const q = parseInt(btn.dataset.q);
    const r = parseInt(btn.dataset.r);
    if (seleccionades[q] !== null) return; // ja està respondida
    seleccionades[q] = r;
    btn.classList.add("seleccionat");
    renderitzarMarcador();
    if (seleccionades.every(x => x !== null)) btnEnviar.classList.remove("hidden");
  });

  /** Mostra el marcador de preguntes contestades */
  function renderitzarMarcador() {
    marcador.textContent = `Preguntes respostes: ${seleccionades.filter(x => x !== null).length} de ${preguntes.length}`;
  }

  /** Envia les respostes a finalitza.php i mostra resultat */
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
      resultatsDiv.textContent = resultat.error ? `Error: ${resultat.error}` : `Has encertat ${resultat.correctes} de ${resultat.total}`;
      btnEnviar.classList.add("hidden");
    } catch (err) {
      resultatsDiv.textContent = `No se pudo enviar las respuestas: ${err.message}`;
    }
  });

  // ====================== Toggle Admin / Quiz ======================

  /** Mostra el mode Admin SPA */
  if(btnAdminMode) {
    btnAdminMode.addEventListener("click", () => {
      adminPanel.style.display = "block";
      contenidor.style.display = "none";
      marcador.style.display = "none";
      btnEnviar.style.display = "none";
      carregarAdmin(true);
    });
  }

  /** Mostra el mode Quiz SPA */
  if(btnQuizMode) {
    btnQuizMode.addEventListener("click", () => {
      adminPanel.style.display = "none";
      contenidor.style.display = "block";
      marcador.style.display = "block";
      btnEnviar.style.display = "inline-block";
      carregarPreguntes();
    });
  }

  // ====================== ADMIN SPA ======================

  /** Carrega les preguntes per al mode admin */
  async function carregarAdmin(adminMode = false) {
    try {
      const res = await fetch('admin.php');
      if (!res.ok) throw new Error(`Error al carregar admin: ${res.status}`);
      const dades = await res.json();
      renderAdmin(dades, adminMode);
    } catch (err) {
      adminPanel.innerHTML = `<p style="color:red;">No es pot carregar admin: ${err.message}</p>`;
    }
  }

  /** Renderitza llistat de preguntes amb botons Editar/Eliminar */
  function renderAdmin(preguntesAdmin, adminMode = false) {
    adminPanel.innerHTML = "<h2>Panel Admin</h2>";

    if(adminMode){
      const btnNova = document.createElement("button");
      btnNova.textContent = "Nova Pregunta";
      btnNova.style.marginBottom = "10px";
      btnNova.addEventListener("click", novaPregunta);
      adminPanel.appendChild(btnNova);
    }

    preguntesAdmin.forEach(p => {
      const div = document.createElement("div");
      div.className = "pregunta-admin";
      if(adminMode){
        div.innerHTML = `
          <div><strong>${p.text}</strong></div>
          <div>
            <button onclick="editarPregunta(${p.id})">Editar</button>
            <button onclick="eliminarPregunta(${p.id})">Eliminar</button>
          </div>
          <hr>
        `;
      }
      adminPanel.appendChild(div);
    });
  }

  // ---------------- Funcions CRUD Preguntes ----------------

  /** Crea nova pregunta */
  function novaPregunta() {
    const text = prompt("Text de la nova pregunta:");
    if (!text) return;
    fetch('admin.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({action:"crearPregunta", text})
    })
    .then(r => r.json())
    .then(() => carregarAdmin(true));
  }

  /** Edita una pregunta existent i les seves respostes */
  window.editarPregunta = (id) => {
    fetch('admin.php')
      .then(r => r.json())
      .then(preguntesAdmin => {
        const p = preguntesAdmin.find(x => x.id === id);
        if (!p) return;

        adminPanel.innerHTML = `<h2>Editar Pregunta</h2>`;
        const inputPreg = document.createElement("input");
        inputPreg.value = p.text;
        inputPreg.style.width = "80%";
        adminPanel.appendChild(inputPreg);

        const llista = document.createElement("div");
        llista.style.marginTop = "10px";
        p.respuestas.forEach(r => {
          const div = document.createElement("div");
          div.innerHTML = `
            <input type="text" value="${r.text}" id="resposta_${r.id}" style="width:60%">
            Correcta <input type="checkbox" id="correcta_${r.id}" ${r.es_correcta ? "checked" : ""}>
            <button onclick="eliminarResposta(${r.id}, ${id})">Eliminar</button>
          `;
          llista.appendChild(div);
        });
        adminPanel.appendChild(llista);

        const btnNovaResp = document.createElement("button");
        btnNovaResp.textContent = "Nova Resposta";
        btnNovaResp.addEventListener("click", () => novaResposta(id));
        adminPanel.appendChild(btnNovaResp);

        const btnGuardar = document.createElement("button");
        btnGuardar.textContent = "Guardar";
        btnGuardar.style.display = "block";
        btnGuardar.style.marginTop = "10px";
        btnGuardar.addEventListener("click", () => {
          fetch('admin.php', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({action:"editarPregunta", id, text: inputPreg.value})
          }).then(() => {
            p.respuestas.forEach(r => {
              const text = document.getElementById(`resposta_${r.id}`).value;
              const es_correcta = document.getElementById(`correcta_${r.id}`).checked ? 1 : 0;
              fetch('admin.php', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({action:"editarResposta", id: r.id, text, es_correcta})
              });
            });
            carregarAdmin(true);
          });
        });
        adminPanel.appendChild(btnGuardar);
      });
  };

  /** Elimina pregunta */
  window.eliminarPregunta = (id) => {
    if(!confirm("Segur que vols eliminar aquesta pregunta?")) return;
    fetch('admin.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({action:"eliminarPregunta", id})
    }).then(r => r.json()).then(() => carregarAdmin(true));
  };

  // ---------------- Funcions CRUD Respostes ----------------

  /** Crea nova resposta per a una pregunta */
  function novaResposta(pregunta_id) {
    const text = prompt("Text de la nova resposta:");
    if (!text) return;
    const es_correcta = confirm("És la resposta correcta?");
    fetch('admin.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({action:"crearResposta", pregunta_id, text, es_correcta: es_correcta?1:0})
    }).then(r => r.json()).then(() => editarPregunta(pregunta_id));
  }

  /** Elimina resposta d'una pregunta */
  window.eliminarResposta = (id, pregunta_id) => {
    if(!confirm("Segur que vols eliminar aquesta resposta?")) return;
    fetch('admin.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({action:"eliminarResposta", id})
    }).then(r => r.json()).then(() => editarPregunta(pregunta_id));
  };

  // ====================== Inicialitzar ======================
  adminPanel.style.display = "none";
  contenidor.style.display = "block"; 
  marcador.style.display = "block";
  btnEnviar.style.display = "inline-block";

  carregarPreguntes();
});
