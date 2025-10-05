# Projecte Transversal – Endevina el Logo

## Descripció del Projecte  
**Endevina el Logo** és una aplicació web interactiva desenvolupada amb **PHP** i **JavaScript** que desafia els usuaris a identificar logotips de marques reconegudes.  
El joc mostra una sèrie d’imatges amb opcions múltiples, on el jugador ha de seleccionar la resposta correcta.  

Quan l’usuari arriba al final del joc, es mostra una **puntuació final** que reflecteix el seu rendiment i percentatge d’encerts.

---

## Objectiu de l’Aplicació  
L’objectiu principal és oferir una experiència d’aprenentatge divertida i visual que posi a prova la memòria i la rapidesa mental dels usuaris.  

L’aplicació:  
- Presenta logotips aleatoris de marques conegudes.  
- Permet escollir la resposta correcta entre diverses opcions.  
- Calcula la puntuació final en acabar la partida.  
- Mostra els resultats d’una manera clara i dinàmica.  

---

## Estructura del Repositori  

El projecte està organitzat dins la carpeta `transversal/`, amb la següent estructura:

```
transversal/
│
├── index.html         → Pàgina principal del joc
├── style.css          → Estils generals de la interfície
├── normalize.css      → Restabliment d’estils per a tots els navegadors
├── script.js          → Lògica del joc (control de preguntes i puntuació)
├── getPreguntes.php   → Genera i retorna les preguntes (logotips i opcions)
├── finalizat.php      → Calcula i mostra la puntuació final
├── admin.php          → Panell d’administració per gestionar les preguntes
└── /img/              → Carpeta amb les imatges dels logotips
```

---

## Alineació amb els Objectius de Desenvolupament Sostenible (ODS)  
Aquest projecte contribueix a l’**ODS 4: Educació de Qualitat**, ja que:  

- **Fomenta l’aprenentatge lúdic:** El joc estimula la memòria visual i el reconeixement de marques, promovent l’aprenentatge d’una manera divertida.  
- **Desenvolupa habilitats cognitives:** Millora l’atenció, la concentració i la rapidesa mental.  
- **Accessibilitat universal:** L’aplicació és 100% web i pot utilitzar-se des de qualsevol navegador o dispositiu, facilitant el seu ús en entorns educatius o recreatius.  

---

## Tecnologies Utilitzades  
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** PHP  
- **Emmagatzematge de dades:** JSON  

---

## Lliurables DigiSos  

### Repositori públic GitHub  
[https://github.com/IkerMata/transversal](https://github.com/IkerMata/transversal)

### Aplicació desplegada (Vercel/Netlify)  
<img width="1920" height="1080" alt="Captura de pantalla (6)" src="https://github.com/user-attachments/assets/4e9111c0-f902-495c-a35c-e26ce961e8e2" />


### Captura SonarCloud  
<img width="1920" height="1080" alt="Captura de pantalla (7)" src="https://github.com/user-attachments/assets/38c5ed6c-a8de-4989-b235-8543ba036b8d" />

**Resultats de l’anàlisi de SonarCloud:**  

- **Errors tipus E (crítics):** Presència de credencials de la base de dades dins del codi PHP. És un risc de seguretat i es recomana utilitzar variables d’entorn.  
- **Errors tipus B (mitjans):** Bones pràctiques de JavaScript, com:
  - Reemplaçar `parseInt` per `Number.parseInt`.  
  - Evitar noms duplicats.  
  - Moure la funció `novaResposta` fora d’altres àmbits.  
- **Errors tipus A (baixos):** Neteja de codi, com eliminar espais innecessaris o línies en blanc.  

> Aquesta anàlisi mostra que el projecte ha estat revisat i les àrees de millora són identificades de manera clara.


### Historial Git  
<img width="1920" height="1080" alt="Captura de pantalla (8)" src="https://github.com/user-attachments/assets/2fb2e82e-6c12-427a-b00d-1342e28ad475" />


---

## Autor  
**Iker Mata**  
Projecte desenvolupat com a part del **Projecte Transversal** dins de l’assignatura **DigiSos**.  
