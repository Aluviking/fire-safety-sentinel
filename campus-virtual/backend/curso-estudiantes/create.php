<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$cursoId      = (int) ($body['cursoId'] ?? 0);
$estudianteId = (int) ($body['estudianteId'] ?? 0);
if ($cursoId === 0 || $estudianteId === 0) fail('El curso y el estudiante son requeridos.');

$stmt = db()->prepare('SELECT cupo_maximo FROM cursos WHERE id = ?');
$stmt->execute([$cursoId]);
$curso = $stmt->fetch();
if (!$curso) fail('Curso no encontrado.', 404);

$stmt = db()->prepare('SELECT id FROM curso_estudiantes WHERE curso_id = ? AND estudiante_id = ?');
$stmt->execute([$cursoId, $estudianteId]);
if ($stmt->fetch()) fail('Ese estudiante ya está matriculado en este curso.');

if ($curso['cupo_maximo'] !== null) {
    $stmt = db()->prepare('SELECT COUNT(*) AS total FROM curso_estudiantes WHERE curso_id = ?');
    $stmt->execute([$cursoId]);
    if ((int) $stmt->fetch()['total'] >= (int) $curso['cupo_maximo']) {
        fail('El curso ya alcanzó su cupo máximo.');
    }
}

db()->prepare('INSERT INTO curso_estudiantes (curso_id, estudiante_id) VALUES (?,?)')
    ->execute([$cursoId, $estudianteId]);

respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
