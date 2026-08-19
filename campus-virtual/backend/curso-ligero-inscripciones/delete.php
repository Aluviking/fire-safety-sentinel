<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT curso_ligero_id FROM curso_ligero_inscripciones WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Inscripción no encontrada.', 404);

db()->prepare('DELETE FROM curso_ligero_inscripciones WHERE id = ?')->execute([$id]);

$cursoLigeroId = $target['curso_ligero_id'];
db()->prepare(
    'UPDATE cursos_ligeros SET usuarios_inscritos = (SELECT COUNT(*) FROM curso_ligero_inscripciones WHERE curso_ligero_id = ?) WHERE id = ?'
)->execute([$cursoLigeroId, $cursoLigeroId]);

respond(['ok' => true]);
