<?php
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../zoom-lib.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT programa_id, zoom_meeting_id, grabacion_url, es_prueba, creado_por_identificacion FROM programa_clases_virtuales WHERE id = ?');
$actual->execute([$id]);
$row = $actual->fetch();
if (!$row) fail('Clase no encontrada.', 404);
require_gestion_programa($user, (int) $row['programa_id']);
require_dueno_o_compartido($user, $row['creado_por_identificacion']);

// Si ya tiene grabación Y no es de prueba, los estudiantes que tenían
// acceso deben seguir viéndola — en vez de borrarla de verdad, se "archiva":
// desaparece de este listado (admin/docente) pero sigue existiendo para
// quien ya la veía. Una marcada como prueba siempre se borra de verdad.
if (!empty($row['grabacion_url']) && empty($row['es_prueba'])) {
    db()->prepare('UPDATE programa_clases_virtuales SET archivado = 1 WHERE id = ?')->execute([$id]);
    respond(['ok' => true, 'archivado' => true]);
}

zoom_borrar_reunion($row['zoom_meeting_id']);
db()->prepare('DELETE FROM programa_clases_virtuales WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
