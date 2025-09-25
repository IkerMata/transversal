<?php
require 'config.php';
session_start();

// Si es una petición AJAX
if (isset($_GET['api'])) {
    header('Content-Type: application/json');

    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET': // Listar preguntas
            $stmt = $pdo->query("SELECT * FROM preguntes");
            $preguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Añadir respuestas a cada pregunta
            foreach ($preguntas as &$p) {
                $stmt2 = $pdo->prepare("SELECT id, resposta, correcta FROM respostes WHERE pregunta_id = ?");
                $stmt2->execute([$p['id']]);
                $p['respostes'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
            }

            echo json_encode($preguntas);
            break;

        case 'POST': // Crear pregunta
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data || !isset($data['pregunta']) || !isset($data['respostes'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Datos incompletos']);
                exit;
            }

            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT INTO preguntes (pregunta) VALUES (?)");
            $stmt->execute([$data['pregunta']]);
            $idPregunta = $pdo->lastInsertId();

            $stmt2 = $pdo->prepare("INSERT INTO respostes (pregunta_id, resposta, correcta) VALUES (?, ?, ?)");
            foreach ($data['respostes'] as $r) {
                $stmt2->execute([$idPregunta, $r['resposta'], $r['correcta'] ? 1 : 0]);
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'id' => $idPregunta]);
            break;

        case 'PUT': // Editar pregunta
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data || !isset($data['id']) || !isset($data['pregunta']) || !isset($data['respostes'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Datos incompletos']);
                exit;
            }

            $pdo->beginTransaction();
            $stmt = $pdo->prepare("UPDATE preguntes SET pregunta=? WHERE id=?");
            $stmt->execute([$data['pregunta'], $data['id']]);

            // Borrar respuestas antiguas
            $stmt2 = $pdo->prepare("DELETE FROM respostes WHERE pregunta_id=?");
            $stmt2->execute([$data['id']]);

            // Insertar respuestas nuevas
            $stmt3 = $pdo->prepare("INSERT INTO respostes (pregunta_id, resposta, correcta) VALUES (?, ?, ?)");
            foreach ($data['respostes'] as $r) {
                $stmt3->execute([$data['id'], $r['resposta'], $r['correcta'] ? 1 : 0]);
            }

            $pdo->commit();
            echo json_encode(['success' => true]);
            break;

        case 'DELETE': // Eliminar pregunta
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data || !isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Falta id']);
                exit;
            }

            $pdo->beginTransaction();
            $stmt = $pdo->prepare("DELETE FROM respostes WHERE pregunta_id=?");
            $stmt->execute([$data['id']]);
            $stmt2 = $pdo->prepare("DELETE FROM preguntes WHERE id=?");
            $stmt2->execute([$data['id']]);
            $pdo->commit();

            echo json_encode(['success' => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Admin Quiz</title>
<style>
table, th, td { border: 1px solid black; border-collapse: collapse; padding:5px; }
button { margin: 2px; }
</style>
</head>
<body>
<h1>Administrador de Preguntas</h1>

<div id="tabla"></div>

<h2>Añadir / Editar Pregunta</h2>
<form id="formPregunta">
    <input type="hidden" id="preguntaId">
    <label>Pregunta: <input type="text" id="preguntaTexto" required></label><br>
    <div id="respuestas">
        <label>Respuesta 1: <input type="text" class="respostaTexto" required> Correcta <input type="checkbox" class="respostaCorrecta"></label><br>
        <label>Respuesta 2: <input type="text" class="respostaTexto" required> Correcta <input type="checkbox" class="respostaCorrecta"></label><br>
        <label>Respuesta 3: <input type="text" class="respostaTexto" required> Correcta <input type="checkbox" class="respostaCorrecta"></label><br>
        <label>Respuesta 4: <input type="text" class="respostaTexto" required> Correcta <input type="checkbox" class="respostaCorrecta"></label><br>
    </div>
    <button type="submit">Guardar</button>
</form>

<script>
async function cargarPreguntas() {
    const res = await fetch('admin.php?api=1');
    const preguntas = await res.json();
    const tabla = document.getElementById('tabla');
    tabla.innerHTML = '<table><tr><th>ID</th><th>Pregunta</th><th>Respuestas</th><th>Acciones</th></tr>' +
        preguntas.map(p => `<tr>
            <td>${p.id}</td>
            <td>${p.pregunta}</td>
            <td>${p.respostes.map(r=> r.resposta + (r.correcta?' ✅':'')).join('<br>')}</td>
            <td>
                <button onclick="editar(${p.id})">Editar</button>
                <button onclick="eliminar(${p.id})">Eliminar</button>
            </td>
        </tr>`).join('') + '</table>';
}

async function guardarPregunta(e) {
    e.preventDefault();
    const id = document.getElementById('preguntaId').value;
    const pregunta = document.getElementById('preguntaTexto').value;
    const resText = Array.from(document.querySelectorAll('.respostaTexto')).map(i=>i.value);
    const resCorrecta = Array.from(document.querySelectorAll('.respostaCorrecta')).map(i=>i.checked);
    const respostes = resText.map((t,i)=>({resposta:t, correcta:resCorrecta[i]}));

    const method = id ? 'PUT' : 'POST';
    const body = JSON.stringify(id ? {id, pregunta, respostes} : {pregunta, respostes});
    await fetch('admin.php?api=1', {method, headers:{'Content-Type':'application/json'}, body});
    cargarPreguntas();
    document.getElementById('formPregunta').reset();
    document.getElementById('preguntaId').value = '';
}

async function editar(id) {
    const res = await fetch('admin.php?api=1');
    const preguntas = await res.json();
    const p = preguntas.find(x=>x.id==id);
    document.getElementById('preguntaId').value = p.id;
    document.getElementById('preguntaTexto').value = p.pregunta;
    const textos = document.querySelectorAll('.respostaTexto');
    const correctas = document.querySelectorAll('.respostaCorrecta');
    p.respostes.forEach((r,i)=>{
        textos[i].value = r.resposta;
        correctas[i].checked = r.correcta==1;
    });
}

async function eliminar(id) {
    if(!confirm('Seguro que quieres eliminar?')) return;
    await fetch('admin.php?api=1', {
        method:'DELETE',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({id})
    });
    cargarPreguntas();
}

document.getElementById('formPregunta').addEventListener('submit', guardarPregunta);
cargarPreguntas();
</script>
</body>
</html>
