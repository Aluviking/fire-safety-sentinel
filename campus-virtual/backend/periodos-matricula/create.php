<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'institucional.estudiantes', 'editar');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del período es requerido.');

$dup = db()->prepare('SELECT id FROM periodos_matricula WHERE nombre = ?');
$dup->execute([$nombre]);
if ($dup->fetch()) fail('Ese período ya existe.');

db()->prepare('INSERT INTO periodos_matricula (nombre) VALUES (?)')->execute([$nombre]);
$id = (int) db()->lastInsertId();

log_trace($user, 'periodo_matricula_create', "Creó el período $nombre");
respond(['ok' => true, 'periodo' => ['id' => $id, 'nombre' => $nombre]]);
