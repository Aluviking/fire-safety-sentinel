<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del curso es requerido.');

db()->prepare(
    'UPDATE cursos_ligeros SET nombre = ?, categoria = ?, docente_identificacion = ?, docente_nombre = ?,
        estado = ?, usuarios_inscritos = ? WHERE id = ?'
)->execute([
    $nombre, $body['categoria'] ?? null, $body['docenteIdentificacion'] ?? null, $body['docenteNombre'] ?? null,
    $body['estado'] ?? 'No publicado', $body['usuariosInscritos'] ?? 0,
    $id,
]);

log_trace($user, 'curso_ligero_update', "Editó el curso ligero $nombre");
respond(['ok' => true]);
