<?php
header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ---------- CONFIGURACIÓ DB ----------
$host = "localhost";
$dbname = "a24ikematgar_Projecte0";  // ← posa el teu nom real
$user = "a24ikematgar_Projecte0"; 
$pass = "ydkNfHItM(2q4yyO";         

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error connexió BD: " . $e->getMessage()]);
    exit;
}

// ---------- PROCESSAR ACCIONS POST ----------
$input = json_decode(file_get_contents('php://input'), true);

if ($input && isset($input['action'])) {
    try {
        switch ($input['action']) {

            // ---------------- Preguntes ----------------
            case "crearPregunta":
                $stmt = $pdo->prepare("INSERT INTO preguntes (pregunta) VALUES (?)");
                $stmt->execute([$input['text']]);
                echo json_encode(["success"=>true]);
                exit;

            case "editarPregunta":
                $stmt = $pdo->prepare("UPDATE preguntes SET pregunta=? WHERE id=?");
                $stmt->execute([$input['text'], $input['id']]);
                echo json_encode(["success"=>true]);
                exit;

            case "eliminarPregunta":
                $stmt = $pdo->prepare("DELETE FROM preguntes WHERE id=?");
                $stmt->execute([$input['id']]);
                echo json_encode(["success"=>true]);
                exit;

            // ---------------- Respostes ----------------
            case "crearResposta":
                $stmt = $pdo->prepare("INSERT INTO respostes (pregunta_id, resposta, correcta) VALUES (?,?,?)");
                $stmt->execute([$input['pregunta_id'], $input['text'], $input['es_correcta']]);
                echo json_encode(["success"=>true]);
                exit;

            case "editarResposta":
                $stmt = $pdo->prepare("UPDATE respostes SET resposta=?, correcta=? WHERE id=?");
                $stmt->execute([$input['text'], $input['es_correcta'], $input['id']]);
                echo json_encode(["success"=>true]);
                exit;

            case "eliminarResposta":
                $stmt = $pdo->prepare("DELETE FROM respostes WHERE id=?");
                $stmt->execute([$input['id']]);
                echo json_encode(["success"=>true]);
                exit;

            default:
                http_response_code(400);
                echo json_encode(["error"=>"Acció desconeguda"]);
                exit;
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error"=>"Error CRUD: ".$e->getMessage()]);
        exit;
    }
}

// ---------- CARREGAR PREGUNTES I RESPOSTES ----------
try {
    $stmt = $pdo->query("SELECT id, pregunta AS text FROM preguntes");
    $preguntes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($preguntes as &$p) {
        $stmtR = $pdo->prepare("SELECT id, resposta AS text, correcta AS es_correcta FROM respostes WHERE pregunta_id = ?");
        $stmtR->execute([$p['id']]);
        $p['respuestas'] = $stmtR->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($preguntes);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error"=>"Error carregant admin: ".$e->getMessage()]);
}
