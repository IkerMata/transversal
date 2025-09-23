<?php
header('Content-Type: application/json');
session_start();

// Leer las respuestas enviadas por el front
$answers = json_decode(file_get_contents('php://input'), true);

if (!is_array($answers)) {
    http_response_code(400);
    echo json_encode(["error" => "Formato de respuestas incorrecto"]);
    exit;
}

// Recuperar las preguntas guardadas en sesión con correctIndex
$stored = $_SESSION['quiz_questions'] ?? null;

if (!$stored) {
    http_response_code(400);
    echo json_encode(["error" => "No hay preguntas en sesión"]);
    exit;
}

$total = count($stored);
$correctes = 0;

// Comparar respuestas del usuario con correctIndex
for ($i = 0; $i < $total; $i++) {
    $correctIndex = $stored[$i]['correctIndex'];
    if (isset($answers[$i]) && $answers[$i] === $correctIndex) {
        $correctes++;
    }
}

// Devolver resultado al front
echo json_encode([
    "total" => $total,
    "correctes" => $correctes
]);
