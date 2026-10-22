<?php
/**
 * Script de migración ÚNICA -- pensado para correrse una sola vez por SSH
 * (nunca por URL, por eso el candado de abajo), no queda enganchado al
 * deploy normal. Deja en 2026-2 a todos los matriculados que hoy tienen el
 * periodo en blanco (los que ya tengan algo asignado -- ej. 2027-1 -- no se
 * tocan). Se borra junto con el workflow que lo dispara una vez confirmado.
 */
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('Solo desde CLI.');
}

$config = require __DIR__ . '/../config.php';
$pdo = new PDO(
    "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
    $config['db_user'], $config['db_pass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$stmt = $pdo->prepare("UPDATE matriculas SET periodo = '2026-2' WHERE periodo IS NULL OR periodo = ''");
$stmt->execute();
echo "Matrículas actualizadas a 2026-2: " . $stmt->rowCount() . PHP_EOL;
