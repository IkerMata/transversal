document.addEventListener("DOMContentLoaded", () => {

  // --- Referencias al DOM ---
  const contenidorUsuari = document.getElementById("contenidor-usuari");
  const contenidor = document.getElementById("questionari");
  const marcador = document.getElementById("marcador");
  const btnEnviar = document.getElementById("btnEnviar");
  const resultatsDiv = document.getElementById("resultats");
  const adminPanel = document.getElementById("admin-panel");
  const btnAdminMode = document.getElementById("btnAdminMode");
  const btnQuizMode = document.getElementById("btnQuizMode");
  const contenidorQuiz = document.getElementById("quiz-wrapper");
  const salutacio = document.getElementById("salutacio");
  const inputNom = document.getElementById("nom-usuari");
  const btnGuardarNom = document.getElementById("guardar-nom");
  const btnEsborrarNom = document.getElementById("esborrar-nom");
  let preguntes = [];   // Preguntas cargadas
  let seleccionades = []; // Respuestas seleccionadas
  let intervalId = null;
  let temps = 30;
  let jocAcabat = false;
  let timerIniciat = false;

  // ITERACIÓ 3: Objecte estatDeLaPartida segons especificació
  let estatDeLaPartida = {
    contadorPreguntes: 0,
    respostesUsuari: [] // Aquí anirem guardant les respostes
  };

  // --- Función para iniciar quiz ---
  function iniciarQuiz(nom) {
    salutacio.textContent = `Benvingut/da, ${nom}!`;
    contenidorUsuari.style.display = "none";
    contenidorQuiz.style.display = "block";
    marcador.style.display = "block";
    btnEnviar.style.display = "inline-block";
    carregarPreguntes();
  }

  // --- Funciones del Timer ---
  function iniciarTimer() {
    // Evitar múltiples timers
    if (timerIniciat) {
      console.log("Timer ya iniciado, ignorando..."); // Debug
      return;
    }
    
    // Parar cualquier timer existente antes de iniciar uno nuevo
    aturarTimer();
    
    console.log("Iniciando timer..."); // Debug
    timerIniciat = true;
    jocAcabat = false;
    temps = 30; // 30 segundos para modo F1
    actualitzarDisplayTimer();
    
    intervalId = setInterval(() => {
      console.log("Timer tick:", temps); // Debug
      temps--;
      actualitzarDisplayTimer();
      
      if (temps <= 0) {
        console.log("Timer acabado!"); // Debug
        finalitzarJocPerTemps();
        return; // Salir del interval
      }
    }, 1000);
  }

  function aturarTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    timerIniciat = false;
  }

  function actualitzarDisplayTimer() {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = `Temps restant: ${temps}s`;
    if (temps <= 10) {
      timerElement.style.color = "red";
    } else {
      timerElement.style.color = "black";
    }
  }

  function finalitzarJocPerTemps() {
    jocAcabat = true;
    aturarTimer();
    
    // Mostrar alerta de tiempo agotado
    alert("El temps s'ha acabat!");
    
    // Ocultar TODO excepto los resultados
    contenidor.style.display = "none";
    marcador.style.display = "none";
    btnEnviar.style.display = "none";
    document.getElementById("timer").style.display = "none";
    
    // Limpiar y mostrar solo los resultados
    mostrarResultatsFinals();
  }

  // --- Mostrar solo resultados finales ---
  async function mostrarResultatsFinals() {
    try {
      const res = await fetch('finalitza.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(seleccionades)
      });
      if (!res.ok) throw new Error(`Error al enviar respuestas: ${res.status}`);
      const resultat = await res.json();
      
      const preguntesRespostes = seleccionades.filter(x => x !== null).length;
      
      // Limpiar completamente y mostrar solo resultados
      resultatsDiv.innerHTML = `
        <div style="text-align: center; font-size: 24px; margin-top: 50px;">
          <h2>Resultats Finals</h2>
          <p style="font-size: 20px;">Has respost <strong>${preguntesRespostes}</strong> preguntes</p>
          <p style="font-size: 20px;">Has encertat <strong>${resultat.correctes}</strong> de <strong>${resultat.total}</strong></p>
          <br>
          <button onclick='location.reload()' style='padding: 15px 30px; font-size: 18px; background: #007cba; color: white; border: none; cursor: pointer; border-radius: 5px;'>Jugar de nou</button>
        </div>
      `;
    } catch (err) {
      resultatsDiv.innerHTML = `
        <div style="text-align: center; font-size: 20px; margin-top: 50px;">
          <p style="color: red;">Error: No se pudo calcular els resultats</p>
          <button onclick='location.reload()' style='padding: 15px 30px; font-size: 18px; background: #007cba; color: white; border: none; cursor: pointer; border-radius: 5px;'>Jugar de nou</button>
        </div>
      `;
    }
  }

  // --- Comprobar si hay nombre guardado ---
  const nomGuardat = localStorage.getItem("nomUsuari"); 
  if (nomGuardat) {
    iniciarQuiz(nomGuardat);
  } else {
    contenidorUsuari.style.display = "block";
    contenidorQuiz.style.display = "none";
  }

  // --- Guardar nombre ---
  btnGuardarNom.addEventListener("click", () => {
    const nom = inputNom.value.trim();
    if (!nom) return alert("Introdueix un nom vàlid!");
    localStorage.setItem("nomUsuari", nom);
    iniciarQuiz(nom);
  });

  // --- Borrar nombre ---
  btnEsborrarNom.addEventListener('click', () => {
    localStorage.removeItem("nomUsuari");
    contenidorUsuari.style.display = "block";
    contenidorQuiz.style.display = "none";
    inputNom.value = "";
  });


  // --- Cargar preguntas del backend ---
  async function carregarPreguntes() {
    try {
      const res = await fetch('getPreguntes.php?num=10', { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`Error al cargar preguntas: ${res.status}`);
      preguntes = await res.json();

      // Normalizar campos
      preguntes = preguntes.map(p => ({
        pregunta: p.pregunta || p.text,
        respostes: p.respostes || p.respuestas
      }));

      seleccionades = new Array(preguntes.length).fill(null);
      
      // ITERACIÓ 3: Inicialitzar estatDeLaPartida
      estatDeLaPartida.contadorPreguntes = 0;
      estatDeLaPartida.respostesUsuari = [];
      
      renderPreguntes();
      renderitzarMarcador();
      
      // Iniciar el timer cuando se cargan las preguntas
      iniciarTimer();
    } catch (err) {
      contenidor.innerHTML = `<p style="color:red;">No se pudieron cargar las preguntas: ${err.message}</p>`;
    }
  }

  // --- Calcular resultados finales ---
  async function calcularResultatsFinals() {
    try {
      const res = await fetch('finalitza.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(seleccionades)
      });
      if (!res.ok) throw new Error(`Error al enviar respuestas: ${res.status}`);
      const resultat = await res.json();
      
      const preguntesRespostes = seleccionades.filter(x => x !== null).length;
      resultatsDiv.innerHTML = resultat.error ? 
        `Error: ${resultat.error}` : 
        `Has respost ${preguntesRespostes} preguntes i has encertat ${resultat.correctes} de ${resultat.total}`;
    } catch (err) {
      resultatsDiv.textContent = `No se pudo enviar las respuestas: ${err.message}`;
    }
  }

  // --- Renderizar preguntas ---
  function renderPreguntes() {
    let html = "";
    preguntes.forEach((p, i) => {
      html += `<h3>${p.pregunta}</h3><div class="respostes">`;
      let respostesBarrejades = [...p.respostes].sort(() => Math.random() - 0.5);
      respostesBarrejades.forEach(r => {
        let imgSrc = r.resposta || "imagenes/default.png";
        html += `<button data-q="${i}" data-r="${r.id}"><img src="${imgSrc}" alt="Logo" width="60"></button>`;
      });
      html += `</div>`;
    });
    contenidor.innerHTML = html;
  }

  // --- Click en respuestas ---
  contenidor.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn || jocAcabat) return;
    const q = parseInt(btn.dataset.q);
    const r = parseInt(btn.dataset.r);
    if (seleccionades[q] !== null) return;
    
    seleccionades[q] = r;
    btn.classList.add("seleccionat");
    
    // ITERACIÓ 3: Actualitzar estatDeLaPartida quan l'usuari respongui
    estatDeLaPartida.respostesUsuari[q] = r;
    estatDeLaPartida.contadorPreguntes = seleccionades.filter(x => x !== null).length;
    
    renderitzarMarcador();
    
    // En modo F1, mostrar el botón enviar cuando se responda al menos una pregunta
    if (seleccionades.some(x => x !== null)) {
      btnEnviar.classList.remove("hidden");
    }
  });

  // ITERACIÓ 3: Funció renderitzarMarcador que llegeix estatDeLaPartida
  function renderitzarMarcador() {
    const totalPreguntes = preguntes.length;
    const preguntesRespostes = estatDeLaPartida.contadorPreguntes;
    marcador.textContent = `Preguntes respostes: ${preguntesRespostes} de ${totalPreguntes}`;
  }

  // --- Enviar respuestas ---
  btnEnviar.addEventListener("click", async () => {
    aturarTimer();
    jocAcabat = true;
    
    try {
      const res = await fetch('finalitza.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(seleccionades)
      });
      if (!res.ok) throw new Error(`Error al enviar respuestas: ${res.status}`);
      const resultat = await res.json();
      
      const preguntesRespostes = seleccionades.filter(x => x !== null).length;
      resultatsDiv.innerHTML = resultat.error ? 
        `Error: ${resultat.error}` : 
        `Has respost ${preguntesRespostes} preguntes i has encertat ${resultat.correctes} de ${resultat.total}`;
      
      btnEnviar.classList.add("hidden");
      
      // Deshabilitar todos los botones
      const buttons = contenidor.querySelectorAll("button");
      buttons.forEach(btn => {
        btn.disabled = true;
      });
    } catch (err) {
      resultatsDiv.textContent = `No se pudo enviar las respuestas: ${err.message}`;
    }
  });

  // ---------------- ADMIN ----------------

  if(btnAdminMode) {
    btnAdminMode.addEventListener("click", () => {
      adminPanel.style.display = "block";
      contenidor.style.display = "none";
      marcador.style.display = "none";
      btnEnviar.style.display = "none";
      carregarAdmin(true);
    });
  }

  if(btnQuizMode) {
    btnQuizMode.addEventListener("click", () => {
      adminPanel.style.display = "none";
      contenidor.style.display = "block";
      marcador.style.display = "block";
      btnEnviar.style.display = "inline-block";
      carregarPreguntes();
    });
  }

  async function carregarAdmin(adminMode = false) {
    try {
      const res = await fetch('admin.php');
      if (!res.ok) throw new Error(`Error al cargar admin: ${res.status}`);
      const dades = await res.json();
      renderAdmin(dades, adminMode);
    } catch (err) {
      adminPanel.innerHTML = `<p style="color:red;">No se puede cargar admin: ${err.message}</p>`;
    }
  }

  function renderAdmin(preguntesAdmin, adminMode = false) {
    adminPanel.innerHTML = "<h2>Panel Admin</h2>";

    if(adminMode){
      const btnNova = document.createElement("button");
      btnNova.textContent = "Nueva Pregunta";
      btnNova.style.marginBottom = "10px";
      btnNova.addEventListener("click", novaPregunta);
      adminPanel.appendChild(btnNova);
    }

    preguntesAdmin.forEach(p => {
      const div = document.createElement("div");
      div.className = "pregunta-admin";

      if(adminMode){
        const titol = document.createElement("div");
        titol.innerHTML = `<strong>${p.text}</strong>`;
        div.appendChild(titol);

        const divBotons = document.createElement("div");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => editarPregunta(p.id));
        divBotons.appendChild(btnEditar);

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", () => eliminarPregunta(p.id));
        divBotons.appendChild(btnEliminar);

        div.appendChild(divBotons);
      }

      const separador = document.createElement("hr");
      div.appendChild(separador);
      adminPanel.appendChild(div);
    });
  }

  // --- CRUD Preguntas ---
  function novaPregunta() {
    const text = prompt("Texto de la nueva pregunta:");
    if (!text) return;
    fetch('admin.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({action:"crearPregunta", text})
    }).then(() => carregarAdmin(true));
  }

  window.eliminarPregunta = (id) => {
    if(!confirm("Seguro que quieres eliminar esta pregunta?")) return;
    fetch('admin.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({action:"eliminarPregunta", id})
    }).then(() => carregarAdmin(true));
  };

  // --- CRUD Respuestas ---
  function novaResposta(pregunta_id) {
    const es_correcta = confirm("Es la respuesta correcta?");
    fetch('admin.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({action:"crearResposta", pregunta_id, text:"", es_correcta: es_correcta?1:0})
    }).then(() => editarPregunta(pregunta_id));
  }

  window.eliminarResposta = (id, pregunta_id) => {
    if(!confirm("Seguro que quieres eliminar esta respuesta?")) return;
    fetch('admin.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({action:"eliminarResposta", id})
    }).then(() => editarPregunta(pregunta_id));
  };

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

          const labelCorrecta = document.createElement("label");
          labelCorrecta.style.marginLeft = "5px";
          const inputCorrecta = document.createElement("input");
          inputCorrecta.type = "checkbox";
          inputCorrecta.checked = r.es_correcta ? true : false;
          inputCorrecta.id = `correcta_${r.id}`;
          labelCorrecta.appendChild(inputCorrecta);
          labelCorrecta.appendChild(document.createTextNode(" Correcta"));
          div.appendChild(labelCorrecta);

          const inputFile = document.createElement("input");
          inputFile.type = "file";
          inputFile.accept = "image/*";
          inputFile.id = `imatge_${r.id}`;
          inputFile.style.marginLeft = "10px";
          div.appendChild(inputFile);

          const btnEliminarResp = document.createElement("button");
          btnEliminarResp.textContent = "Eliminar";
          btnEliminarResp.style.marginLeft = "10px";
          btnEliminarResp.addEventListener("click", () => eliminarResposta(r.id, id));
          div.appendChild(btnEliminarResp);

          llista.appendChild(div);
        });

        adminPanel.appendChild(llista);

        const btnNovaResp = document.createElement("button");
        btnNovaResp.textContent = "Nueva Respuesta";
        btnNovaResp.addEventListener("click", () => novaResposta(id));
        adminPanel.appendChild(btnNovaResp);

        const btnGuardar = document.createElement("button");
        btnGuardar.textContent = "Guardar";
        btnGuardar.style.display = "block";
        btnGuardar.style.marginTop = "10px";
        btnGuardar.addEventListener("click", () => {
          // Guardar pregunta
          fetch('admin.php', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({action:"editarPregunta", id, text: inputPreg.value})
          }).then(() => {
            // Guardar respuestas con imagen
            p.respuestas.forEach(r => {
              const es_correcta = document.getElementById(`correcta_${r.id}`).checked ? 1 : 0;
              const fileInput = document.getElementById(`imatge_${r.id}`);

              const formData = new FormData();
              formData.append("action", "editarResposta");
              formData.append("id", r.id);
              formData.append("es_correcta", es_correcta);
              if(fileInput && fileInput.files.length > 0) {
                formData.append("imatge", fileInput.files[0]);
              }

              fetch("admin.php", {method:"POST", body: formData});
            });

            setTimeout(() => carregarAdmin(true), 500);
          });
        });
        adminPanel.appendChild(btnGuardar);
      });
  };

  // --- Inicializar ---
  adminPanel.style.display = "none";

});
