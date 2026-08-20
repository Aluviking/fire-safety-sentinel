<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM matriculas WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) fail('Matrícula no encontrada.', 404);

// El nombre del programa queda fijo (es el prefijo antes de " - "); solo se
// puede editar la jornada, el estado, el nivel y el período.
$nombrePrograma = $row['programa'];
$guionPos       = strrpos($row['programa'], ' - ');
if ($guionPos !== false) $nombrePrograma = substr($row['programa'], 0, $guionPos);

$jornada = array_key_exists('jornada', $body) ? trim($body['jornada']) : null;
$programaTexto = $jornada !== null && $jornada !== '' ? "$nombrePrograma - $jornada" : $row['programa'];

db()->prepare(
    'UPDATE matriculas SET programa = ?, estado = ?, nivel = ?, periodo = ? WHERE id = ?'
)->execute([
    $programaTexto,
    array_key_exists('estado', $body) ? $body['estado'] : $row['estado'],
    array_key_exists('nivel', $body) ? $body['nivel'] : $row['nivel'],
    array_key_exists('periodo', $body) ? $body['periodo'] : $row['periodo'],
    $id,
]);

log_trace($user, 'programa_update', "Editó una matrícula de $nombrePrograma");
respond(['ok' => true]);
