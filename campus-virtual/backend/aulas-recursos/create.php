<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del aula es requerido.');

$stmt = db()->prepare('SELECT id FROM aulas_recursos WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe un aula con ese nombre.');

db()->prepare('INSERT INTO aulas_recursos (nombre, capacidad_maxima) VALUES (?, ?)')
    ->execute([$nombre, $body['capacidadMaxima'] ?? null]);

respond(['ok' => true, 'aula' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
