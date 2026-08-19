<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del aula es requerido.');

$dup = db()->prepare('SELECT id FROM aulas_recursos WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otra aula con ese nombre.');

db()->prepare('UPDATE aulas_recursos SET nombre = ?, capacidad_maxima = ? WHERE id = ?')
    ->execute([$nombre, $body['capacidadMaxima'] ?? null, $id]);

log_trace($user, 'aula_recurso_update', "Editó el aula $nombre");
respond(['ok' => true]);
