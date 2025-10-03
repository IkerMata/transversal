document.addEventListener("DOMContentLoaded", () => {
    
  // --- Referencias al DOM ---
  const contenidorUsuari = document.getElementById("contenidor-usuari");
  const contenidor = document.getElementById("questionari");
  const marcador = document.getElementById("marcador");
  const btnEnviar = document.getElementById("btnEnviar");
  const adminPanel = document.getElementById("admin-panel");
  const btnAdminMode = document.getElementById("btnAdminMode");
  const btnQuizMode = document.getElementById("btnQuizMode");
  const contenidorQuiz = document.getElementById("quiz-wrapper");
  const salutacio = document.getElementById("salutacio");
  const inputNom = document.getElementById("nom-usuari");
  const btnGuardarNom = document.getElementById("guardar-nom");
  const btnEsborrarNom = document.getElementById("esborrar-nom");
  const topNav = document.getElementById("top-nav"); 

  let preguntes = [];   
  let seleccionades = []; 
  let intervalId = null;
  let temps = 30;
  let jocAcabat = false;
  let timerIniciat = false;
  let timerPausat = false; 

  let estatDeLaPartida = {
      preguntaActualIndex: 0,
      contadorPreguntes: 0, 
      respostesUsuari: [] 
  };

// -------------------------------------------------------------
// --- FUNCIONES DE GESTIÓN DE ESTADO (LOGIN/LOGOUT) ---
// -------------------------------------------------------------

  // Función unificada para ir a la pantalla de login/cambiar nombre
  function tornarALogin() {
      // Detener cualquier timer en curso
      aturarTimer(); 
      
      // Limpiar el estado de usuario para forzar el login
      localStorage.removeItem("nomUsuari");
      localStorage.removeItem("isAdmin"); 
      
      // Mostrar solo el contenedor de usuario (login)
      contenidorUsuari.style.display = "block";
      contenidorQuiz.style.display = "none";
      adminPanel.style.display = "none";
      
      // Ocultar elementos del juego y admin
      if(marcador) marcador.style.display = "none";
      if(btnEnviar) btnEnviar.style.display = "none";
      const timerElement = document.getElementById("timer");
      if(timerElement) timerElement.style.display = "none";
      if(topNav) topNav.style.display = "none"; 
      
      inputNom.value = "";
      salutacio.textContent = ""; 
      
      // Limpiar resultados (si se llama desde la pantalla de resultados)
      document.getElementById("resultats").innerHTML = ""; 
      
      actualizarBotones();
  }
  // Hacemos la función global para que pueda ser llamada desde el HTML dinámico de resultados
  window.tornarALogin = tornarALogin;


  function actualizarBotones() {
      const nomGuardat = localStorage.getItem("nomUsuari");
      const esAdmin = localStorage.getItem("isAdmin") === "true"; 
  
      // Ocultar todos los botones de modo por defecto
      if(btnAdminMode) btnAdminMode.style.display = "none";
      if(btnQuizMode) btnQuizMode.style.display = "none";
  
      if (adminPanel.style.display === "block") {
          // Si estamos en el panel de admin, mostrar "Tornar al Quiz"
          if(btnQuizMode) btnQuizMode.style.display = "inline-block";
      } else if (nomGuardat && esAdmin) { 
          // Si estamos en el quiz y somos admin, mostrar "Mode Admin"
          if(btnAdminMode) btnAdminMode.style.display = "inline-block";
      }
  }
  
  function inicializarEstado(nom) {
      const esAdmin = localStorage.getItem("isAdmin") === "true";
      
      contenidorUsuari.style.display = "none";

      if (esAdmin) {
          // Modo Admin
          contenidorQuiz.style.display = "none";
          adminPanel.style.display = "block";
          
          if(marcador) marcador.style.display = "none";
          if(btnEnviar) btnEnviar.style.display = "none";
          const timerElement = document.getElementById("timer");
          if(timerElement) timerElement.style.display = "none";
          
          salutacio.innerHTML = `Panel de Administrador, **${nom}**!`;
          carregarAdmin(true); 
          
          // Mostrar el top-nav en modo admin (contiene el saludo)
          if (topNav) topNav.style.display = "flex"; 
      } else {
          // Modo Quiz
          iniciarQuiz(nom);
      }
      
      actualizarBotones(); 
  }
  
  function iniciarQuiz(nom) {
      salutacio.innerHTML = `Benvingut/da, **${nom}**!`; 
      contenidorQuiz.style.display = "block";
      marcador.style.display = "block";
      btnEnviar.style.display = "block"; // Botón de siguiente pregunta visible
      adminPanel.style.display = "none"; 

      // Ocultar el top-nav completamente para quitar el botón Esborrar nom durante el juego
      if (topNav) topNav.style.display = "none"; 

      carregarPreguntes(); 
  }
  
// -------------------------------------------------------------
// --- FLUJO DE INICIO: COMPROBACIÓN DE LOCAL STORAGE ---
// -------------------------------------------------------------

  const nomGuardat = localStorage.getItem("nomUsuari"); 
  
  if (nomGuardat) {
      inicializarEstado(nomGuardat); 
  } else {
      // Estado inicial de login
      contenidorUsuari.style.display = "block";
      
      contenidorQuiz.style.display = "none";
      adminPanel.style.display = "none";
      if(marcador) marcador.style.display = "none";
      if(btnEnviar) btnEnviar.style.display = "none";
      const timerElement = document.getElementById("timer");
      if(timerElement) timerElement.style.display = "none";
      if(topNav) topNav.style.display = "none"; 

      actualizarBotones(); 
  }
  
// -------------------------------------------------------------
// --- LISTENERS ---
// -------------------------------------------------------------

  btnGuardarNom.addEventListener("click", () => {
      const nom = inputNom.value.trim();
      if (!nom) return alert("Introdueix un nom vàlid!");
      
      localStorage.setItem("nomUsuari", nom);
      
      // Si el nombre es 'admin', activar el modo administrador
      if (nom.toLowerCase() === 'admin') {
          localStorage.setItem("isAdmin", "true");
      } else {
          localStorage.removeItem("isAdmin"); 
      }
      
      inicializarEstado(nom); 
  });

  // Botón "Esborrar nom" (logout/resetear)
  if(btnEsborrarNom) {
      btnEsborrarNom.addEventListener('click', () => {
           // Forzamos recarga para resetear todo el estado
           location.reload(); 
      });
  }

  // Botón "Mode Admin"
  if(btnAdminMode) {
      btnAdminMode.addEventListener("click", () => {
          pausarTimer();
          adminPanel.style.display = "block";
          contenidorQuiz.style.display = "none"; 
          carregarAdmin(true);
          actualizarBotones();
      });
  }

  // Botón "Tornar al Quiz" (CORRECCIÓN APLICADA AQUÍ)
  if(btnQuizMode) {
      btnQuizMode.addEventListener("click", () => {
          // Asegurarse de que el modo Quiz es el destino al recargar
          localStorage.removeItem("isAdmin");
          // Forzar recarga completa para resetear el estado y volver al quiz
          location.reload(); 
      });
  }

  // --- Enviar/Següent Pregunta ---
  btnEnviar.addEventListener("click", async () => {
      const preguntaActual = estatDeLaPartida.preguntaActualIndex;

      // 1. Verificar si la pregunta actual ha sido respondida
      if (seleccionades[preguntaActual] === null) {
          alert("Si us plau, selecciona una resposta abans de continuar.");
          return;
      }

      // 2. Comprobar si es la última pregunta
      if (preguntaActual === preguntes.length - 1) {
          // Es la última, finalizar el juego
          aturarTimer();
          jocAcabat = true;
          mostrarResultatsFinals();
          btnEnviar.style.display = "none"; 
      } else {
          // Avanzar a la siguiente pregunta
          estatDeLaPartida.preguntaActualIndex++;
          renderPreguntes(); 
      }
  });

  // --- Click en respuestas ---
  contenidor.addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn || jocAcabat) return;

      const q = parseInt(btn.dataset.q); 
      const r = parseInt(btn.dataset.r); 
      
      // Desmarcar la respuesta previa
      contenidor.querySelectorAll(`button[data-q="${q}"]`).forEach(b => {
          b.classList.remove("seleccionat");
      });

      // Guardar la nueva selección y marcar el botón
      seleccionades[q] = r;
      btn.classList.add("seleccionat");
      
      // Actualizar el estado y el marcador
      estatDeLaPartida.respostesUsuari[q] = r;
      estatDeLaPartida.contadorPreguntes = seleccionades.filter(x => x !== null).length;
      
      renderitzarMarcador();
  });


// -------------------------------------------------------------
// --- FUNCIONES DEL JUEGO (Quiz, Timer) ---
// -------------------------------------------------------------
  
  function iniciarTimer() {
      const timerElement = document.getElementById("timer");
      if(timerElement) timerElement.style.display = "block"; 
      if (timerIniciat) return;
      aturarTimer();
      timerIniciat = true;
      jocAcabat = false;
      temps = 30; 
      actualitzarDisplayTimer();
      intervalId = setInterval(() => {
          temps--;
          actualitzarDisplayTimer();
          if (temps <= 0) {
              finalitzarJocPerTemps();
              return;
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

  function pausarTimer() {
      if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
      }
      timerPausat = true;
  }

  function actualitzarDisplayTimer() {
      const timerElement = document.getElementById("timer");
      if (!timerElement) return; 
      timerElement.textContent = `Temps restant: ${temps}s`;
      timerElement.style.color = (temps <= 10) ? "red" : "black";
  }

  function finalitzarJocPerTemps() {
      jocAcabat = true;
      aturarTimer();
      alert("El temps s'ha acabat!");
      contenidor.style.display = "none";
      marcador.style.display = "none";
      btnEnviar.style.display = "none";
      const timerElement = document.getElementById("timer");
      if(timerElement) timerElement.style.display = "none";
      mostrarResultatsFinals();
  }

  // Renderiza resultados y maneja los botones finales
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
          
          contenidorQuiz.style.display = "none";
          
          document.getElementById("resultats").innerHTML = `
              <div style="text-align: center; font-size: 24px; margin-top: 50px; font-family: Arial, sans-serif; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); max-width: 600px; width: 90%; margin: 50px auto;">
                  <h2 style="color: #333;">Resultats Finals</h2>
                  <p style="font-size: 28px; margin: 30px 0;">Has encertat <strong style="color: #007cba;">${resultat.correctes}</strong> de <strong>${resultat.total}</strong></p>
                  <br>
                  <div style="display: flex; justify-content: center; gap: 20px;">
                      <button id="btnJugarDeNou" style='padding: 15px 30px; font-size: 18px; background: #007cba; color: white; border: none; cursor: pointer; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);'>Jugar de nou</button>
                      <button id="btnCanviarNom" style='padding: 15px 30px; font-size: 18px; background: #00bfa6; color: white; border: none; cursor: pointer; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);'>Canviar Nom</button>
                  </div>
              </div>
          `;
          
          // Listener para Jugar de Nou (recarga la página)
          document.getElementById("btnJugarDeNou").addEventListener('click', () => {
               location.reload(); 
          });

          // Listener para Canviar Nom (llama a la función corregida, que va directo al login)
          document.getElementById("btnCanviarNom").addEventListener('click', () => {
               tornarALogin();
          });

      } catch (err) {
          document.body.innerHTML = `<div style="text-align: center; font-size: 20px; margin-top: 100px; font-family: Arial, sans-serif;"><p style="color: red;">Error: No se pudo calcular els resultats</p><button onclick='location.reload()' style='padding: 20px 40px; font-size: 18px; background: #007cba; color: white; border: none; cursor: pointer; border-radius: 8px;'>Jugar de nou</button></div>`;
      }
  }


  async function carregarPreguntes() {
      try {
          const res = await fetch('getPreguntes.php?num=10', { credentials: 'same-origin' });
          if (!res.ok) throw new Error(`Error al cargar preguntas: ${res.status}`);
          preguntes = await res.json();

          preguntes = preguntes.map(p => ({
              pregunta: p.pregunta || p.text,
              respostes: p.respostes || p.respuestas
          }));

          seleccionades = new Array(preguntes.length).fill(null);
          estatDeLaPartida.contadorPreguntes = 0;
          estatDeLaPartida.preguntaActualIndex = 0; 
          estatDeLaPartida.respostesUsuari = [];
          
          renderPreguntes();
          renderitzarMarcador();
          
          iniciarTimer();
      } catch (err) {
          contenidor.innerHTML = `<p style="color:red;">No se pudieron cargar las preguntas: ${err.message}</p>`;
      }
  }

  // --- Renderizar UNA SOLA pregunta ---
  function renderPreguntes() {
      const index = estatDeLaPartida.preguntaActualIndex;
      const p = preguntes[index];
      
      if (!p) {
          aturarTimer();
          jocAcabat = true;
          mostrarResultatsFinals();
          return;
      }

      let html = "";
      const i = index; 
      
      html += `<h3>${p.pregunta}</h3><div class="respostes">`;
      let respostesBarrejades = [...p.respostes].sort(() => Math.random() - 0.5);
      respostesBarrejades.forEach(r => {
          let imgSrc = r.resposta || "imagenes/default.png";
          const isSelected = seleccionades[i] === r.id ? "seleccionat" : "";
          html += `<button class="${isSelected}" data-q="${i}" data-r="${r.id}"><img src="${imgSrc}" alt="Logo" width="60"></button>`;
      });
      html += `</div>`;
      
      contenidor.innerHTML = html;

      // Actualizar el texto del botón Enviar/Siguiente
      btnEnviar.textContent = (index === preguntes.length - 1) ? "Finalitzar Quiz" : "Següent Pregunta";
      btnEnviar.style.display = "block"; // Asegurarse de que esté visible
  }

  function renderitzarMarcador() {
      const totalPreguntes = preguntes.length;
      const preguntesRespostes = estatDeLaPartida.contadorPreguntes;
      marcador.textContent = `Preguntes respostes: ${preguntesRespostes} de ${totalPreguntes}`;
  }

// -------------------------------------------------------------
// --- FUNCIONES ADMIN (CRUD) ---
// -------------------------------------------------------------

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

  function novaPregunta() {
      const text = prompt("Texto de la nueva pregunta:");
      if (!text) return;
      fetch('admin.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:"crearPregunta", text}) }).then(() => carregarAdmin(true));
  }

  window.eliminarPregunta = (id) => {
      if(!confirm("Seguro que quieres eliminar esta pregunta?")) return;
      fetch('admin.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:"eliminarPregunta", id}) }).then(() => carregarAdmin(true));
  };

  function novaResposta(pregunta_id) {
      const es_correcta = confirm("Es la respuesta correcta?");
      fetch('admin.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:"crearResposta", pregunta_id, text:"", es_correcta: es_correcta?1:0}) }).then(() => editarPregunta(pregunta_id));
  }

  window.eliminarResposta = (id, pregunta_id) => {
      if(!confirm("Seguro que quieres eliminar esta respuesta?")) return;
      fetch('admin.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:"eliminarResposta", id}) }).then(() => editarPregunta(pregunta_id));
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
            
            fetch('admin.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:"editarPregunta", id, text: inputPreg.value}) }).then(() => {
              
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
});