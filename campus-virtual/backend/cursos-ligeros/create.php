<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del curso es requerido.');

db()->prepare(
    'INSERT INTO cursos_ligeros (nombre, categoria, docente_identificacion, docente_nombre, estado, usuarios_inscritos)
     VALUES (?,?,?,?,?,?)'
)->execute([
    $nombre, $body['categoria'] ?? null, $body['docenteIdentificacion'] ?? null, $body['docenteNombre'] ?? null,
    $body['estado'] ?? 'No publicado', $body['usuariosInscritos'] ?? 0,
]);

respond(['ok' => true, 'cursoLigero' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
