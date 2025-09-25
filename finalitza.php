<?php
// Mostrar errores para depuración (solo desarrollo)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'config.php';
header('Content-Type: application/json');
session_start();

// Leer respuestas enviadas desde el frontend
$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Datos JSON incorrectos"]);
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
    if (!isset($stored[$i]['id'])) continue;

    $stmt = $pdo->prepare("SELECT correcta FROM respostes WHERE id = ? AND pregunta_id = ?");
    $stmt->execute([$respostaId, $stored[$i]['id']]);
    $correcta = $stmt->fetchColumn();

    if ($correcta == 1) $correctes++;
}

// Devolver resultado al frontend
echo json_encode([
    "total" => $total,
    "correctes" => $correctes
]);
