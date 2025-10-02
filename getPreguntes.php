<?php
// Mostrar errores (solo para desarrollo)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'config.php';
header('Content-Type: application/json');
session_start();

try {
    // Número de preguntas a obtener
    $num = isset($_GET['num']) ? intval($_GET['num']) : 10;

    // 1️⃣ Obtener preguntas aleatorias
    $stmt = $pdo->prepare("SELECT * FROM preguntes ORDER BY RAND() LIMIT ?");
    $stmt->bindValue(1, $num, PDO::PARAM_INT);
    $stmt->execute();
    $preguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$preguntas) {
        echo json_encode([]);
        exit;
    }

    $result = [];
    foreach ($preguntas as $p) {
        // 2️⃣ Obtener respuestas de cada pregunta
        $stmt2 = $pdo->prepare("SELECT id, resposta FROM respostes WHERE pregunta_id = ?");
        $stmt2->execute([$p['id']]);
        $respuestas = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        $result[] = [
            "id" => $p['id'],
            "pregunta" => $p['pregunta'],
            "respostes" => $respuestas // NO enviamos "correcta" al front
        ];
    }

    // 3️⃣ Guardar preguntas en sesión para luego comprobar respuestas
    $_SESSION['quiz_questions'] = $preguntas;

    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al cargar preguntas: " . $e->getMessage()]);
}
