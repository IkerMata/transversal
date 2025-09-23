<?php
header('Content-Type: application/json');
session_start();

// Cargar todas las preguntas desde el JSON
$data = json_decode(file_get_contents('data.json'), true);
$all = $data['preguntes']; // nota: coincide con tu data.js

$num = isset($_GET['num']) ? intval($_GET['num']) : 10;
if ($num < 1) $num = 1;
if ($num > count($all)) $num = count($all);

// Mezclar y coger N preguntas
shuffle($all);
$pick = array_slice($all, 0, $num);

// Guardar en sesión con correctIndex
// Necesitamos generar correctIndex a partir de la propiedad "correcta"
foreach ($pick as &$p) {
    foreach ($p['respostes'] as $idx => $r) {
        if ($r['correcta'] === true) {
            $p['correctIndex'] = $idx;
            break;
        }
    }
}
$_SESSION['quiz_questions'] = $pick;

// Crear copia sin correctIndex para enviar al cliente
$out = [];
foreach ($pick as $p) {
    $copy = $p;
    unset($copy['correctIndex']);
    $out[] = $copy;
}

echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
