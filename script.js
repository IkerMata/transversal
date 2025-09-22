import { preguntes } from './data.js';

let contenidor = document.getElementById("questionari");

let htmlString = "";

for (let i = 0; i < preguntes.preguntes.length; i++) {
  const pregunta = preguntes.preguntes[i];
  
  htmlString += `<h3>${pregunta.pregunta}</h3>`;
  htmlString += '<div class="respostes">';
  
  for (let j = 0; j < pregunta.respostes.length; j++) {
    const resposta = pregunta.respostes[j];
    const correctaClass = resposta.correcta ? 'correcta' : ''; 
    
    htmlString += `
      <button class="${correctaClass}" data-pregunta="${pregunta.id}" data-resposta="${resposta.id}">
        <img src="${resposta.resposta}" alt="Resposta ${resposta.id}" style="height:40px;">
      </button>
    `;
  }
  htmlString += '</div>';
}

contenidor.innerHTML = htmlString;
