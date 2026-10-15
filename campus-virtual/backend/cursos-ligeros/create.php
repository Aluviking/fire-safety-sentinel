<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente puede crear cursos ligeros, pero queda como dueño SOLO del que
// crea (docente_identificacion/docente_nombre se fuerzan a sí mismo más
// abajo, ignorando lo que venga del body) -- nunca ve ni edita los de otro
// docente (candado real en update.php/delete.php vía require_gestion_curso_ligero()).
require_role($user, ['admin', 'super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del curso es requerido.');

$docenteIdentificacion = $user['role'] === 'docente' ? ($user['identificacion'] ?? null) : ($body['docenteIdentificacion'] ?? null);
$docenteNombre         = $user['role'] === 'docente' ? ($user['nombre'] ?? null) : ($body['docenteNombre'] ?? null);

db()->prepare(
    'INSERT INTO cursos_ligeros (nombre, categoria, docente_identificacion, docente_nombre, estado, usuarios_inscritos)
     VALUES (?,?,?,?,?,?)'
)->execute([
    $nombre, $body['categoria'] ?? null, $docenteIdentificacion, $docenteNombre,
    $body['estado'] ?? 'No publicado', $body['usuariosInscritos'] ?? 0,
]);

respond(['ok' => true, 'cursoLigero' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
