<?php
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../zoom-lib.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin', 'docente']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT zoom_meeting_id, grabacion_url, es_prueba FROM curso_clases_virtuales WHERE id = ?');
$actual->execute([$id]);
$row = $actual->fetch();

// Si ya tiene grabación Y no es de prueba, los estudiantes que tenían
// acceso deben seguir viéndola — en vez de borrarla de verdad, se "archiva":
// desaparece de este listado (admin/docente) pero sigue existiendo para
// quien ya la veía. Una marcada como prueba siempre se borra de verdad.
if ($row && !empty($row['grabacion_url']) && empty($row['es_prueba'])) {
    db()->prepare('UPDATE curso_clases_virtuales SET archivado = 1 WHERE id = ?')->execute([$id]);
    respond(['ok' => true, 'archivado' => true]);
}

zoom_borrar_reunion($row['zoom_meeting_id'] ?? null);
db()->prepare('DELETE FROM curso_clases_virtuales WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
