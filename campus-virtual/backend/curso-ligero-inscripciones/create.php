<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body            = json_body();
$cursoLigeroId   = (int) ($body['cursoLigeroId'] ?? 0);
$identificacion  = trim($body['estudianteIdentificacion'] ?? '');
if ($cursoLigeroId === 0 || $identificacion === '') fail('El estudiante es requerido.');

$stmt = db()->prepare('SELECT id FROM curso_ligero_inscripciones WHERE curso_ligero_id = ? AND estudiante_identificacion = ?');
$stmt->execute([$cursoLigeroId, $identificacion]);
if ($stmt->fetch()) fail('Ese estudiante ya está inscrito en este curso.');

db()->prepare('INSERT INTO curso_ligero_inscripciones (curso_ligero_id, estudiante_identificacion, estado_acceso) VALUES (?,?,?)')
    ->execute([$cursoLigeroId, $identificacion, 'Activo']);

// El contador de "Usuarios" en el listado de Cursos ligeros queda sincronizado
// con las inscripciones reales, en vez de ser un número editado a mano.
db()->prepare(
    'UPDATE cursos_ligeros SET usuarios_inscritos = (SELECT COUNT(*) FROM curso_ligero_inscripciones WHERE curso_ligero_id = ?) WHERE id = ?'
)->execute([$cursoLigeroId, $cursoLigeroId]);

respond(['ok' => true, 'inscripcion' => ['id' => (int) db()->lastInsertId()]]);
