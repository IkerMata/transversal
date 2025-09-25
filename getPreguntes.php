<?php
require 'config.php';
header('Content-Type: application/json');

// Número de preguntas solicitadas
$num = isset($_GET['num']) ? intval($_GET['num']) : 10;

// 1️ Seleccionar preguntas aleatorias
$stmt = $pdo->prepare("SELECT * FROM preguntes ORDER BY RAND() LIMIT ?");
$stmt->bindValue(1, $num, PDO::PARAM_INT);
$stmt->execute();
$preguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2️ Para cada pregunta, traer sus respuestas
$result = [];
foreach ($preguntas as $p) {
    $stmt2 = $pdo->prepare("SELECT id, resposta FROM respostes WHERE pregunta_id = ?");
    $stmt2->execute([$p['id']]);
    $respuestas = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    $result[] = [
        "id" => $p['id'],
        "pregunta" => $p['pregunta'],
        "respostes" => $respuestas // No enviamos campo 'correcta' para ocultarlo
    ];
}

// 3️ Guardar las preguntas en sesión para luego comparar respuestas
session_start();
$_SESSION['quiz_questions'] = $preguntas;

echo json_encode($result);


