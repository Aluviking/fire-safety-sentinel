<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT programa_id, asignatura_id FROM programa_asignaturas WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();

if ($row) {
    // Limpia prerrequisitos de este programa que involucren la asignatura que
    // se está quitando del pensum (en cualquiera de los dos lados), para no
    // dejar referencias sueltas a algo que ya no pertenece a este pensum.
    db()->prepare(
        'DELETE FROM programa_asignatura_prerequisitos WHERE programa_id = ? AND (asignatura_id = ? OR prerequisito_asignatura_id = ?)'
    )->execute([$row['programa_id'], $row['asignatura_id'], $row['asignatura_id']]);
}

db()->prepare('DELETE FROM programa_asignaturas WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
