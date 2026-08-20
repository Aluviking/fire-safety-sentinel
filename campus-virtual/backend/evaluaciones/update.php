<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.evaluaciones', 'editar');

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT identificacion_estudiante, codigo_curso, asignatura, periodo, parametro FROM evaluaciones WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Evaluación no encontrada.', 404);

if ($user['role'] === 'docente') {
    $tiene = !empty($user['identificacion'])
        && docente_tiene_asignatura_periodo($user['identificacion'], $target['asignatura'] ?? '', $target['periodo'] ?? null);
    if (!$tiene) fail('No autorizado.', 403);
}

$fields = [];
$values = [];
if (array_key_exists('nota', $body))          { $fields[] = 'nota = ?';          $values[] = $body['nota'] !== '' ? $body['nota'] : null; }
if (array_key_exists('inasistencias', $body)) { $fields[] = 'inasistencias = ?'; $values[] = $body['inasistencias'] !== '' ? $body['inasistencias'] : null; }
if (array_key_exists('observaciones', $body)) { $fields[] = 'observaciones = ?'; $values[] = $body['observaciones'] !== '' ? $body['observaciones'] : null; }
if (empty($fields)) fail('Nada para actualizar.');

$values[] = $id;
db()->prepare('UPDATE evaluaciones SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($values);

log_trace(
    $user, 'evaluacion_update',
    "Editó evaluación de {$target['identificacion_estudiante']} en {$target['codigo_curso']} ({$target['parametro']})"
);
respond(['ok' => true]);
