<?php
// Configuración de la base de datos
$host = "localhost";
$dbname = "a24ikematgar_Projecte0";
$user = "a24ikematgar_Projecte0";
$pass = "ydkNfHItM(2q4yyO";

// Crear conexión mysqli
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
