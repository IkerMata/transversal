<?php
require 'config.php';
header('Content-Type: application/json');
session_start();

// Leer respuestas enviadas desde el front
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Formato de datos incorrecto"]);
    exit;
}

// Recuperar preguntas almacenadas en sesión
$stored = $_SESSION['quiz_questions'] ?? null;
if (!$stored) {
    http_response_code(400);
    echo json_encode(["error" => "No hay preguntas en sesión"]);
    exit;
}

$total = count($stored);
$correctes = 0;

// Comparar cada respuesta enviada con la correcta
foreach ($data as $i => $respostaId) {
    // Buscamos la respuesta correcta en la BD
    $stmt = $pdo->prepare("SELECT correcta FROM respostes WHERE id = ? AND pregunta_id = ?");
    $stmt->execute([$respostaId, $stored[$i]['id']]);
    $correcta = $stmt->fetchColumn();

    if ($correcta == 1) $correctes++;
}

// Devolver resultado al front
echo json_encode([
    "total" => $total,
    "correctes" => $correctes
]);
