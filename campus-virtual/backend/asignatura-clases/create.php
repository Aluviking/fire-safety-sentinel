<?php
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../zoom-lib.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$asignaturaId = (int) ($body['asignaturaId'] ?? 0);
$titulo       = trim($body['titulo'] ?? '');
$fechaInicio  = $body['fechaInicio'] ?? '';
$fechaFin     = $body['fechaFin'] ?? null;
if ($asignaturaId === 0 || $titulo === '' || $fechaInicio === '') fail('Título y fecha de inicio son requeridos.');
require_gestion_asignatura($user, $asignaturaId);

// O se crea la reunión de verdad en Zoom (con grabación automática en la
// nube), o se guarda un link pegado a mano — nunca las dos cosas a la vez.
$linkReunion = trim($body['linkReunion'] ?? '');
$meetingId = null;
if (!empty($body['crearConZoom'])) {
    try {
        $creada = zoom_crear_clase_virtual($titulo, $fechaInicio, $fechaFin);
    } catch (Exception $e) {
        fail('No se pudo crear la reunión con Zoom: ' . $e->getMessage(), 502);
    }
    $linkReunion = $creada['joinUrl'];
    $meetingId   = $creada['meetingId'];
}

db()->prepare(
    'INSERT INTO asignatura_clases_virtuales
        (asignatura_id, aula_recurso_id, titulo, fecha_inicio, fecha_fin, link_reunion, zoom_meeting_id)
     VALUES (?,?,?,?,?,?,?)'
)->execute([
    $asignaturaId, $body['aulaRecursoId'] ?? null, $titulo, $fechaInicio, $fechaFin,
    $linkReunion ?: null, $meetingId,
]);

respond(['ok' => true, 'clase' => ['id' => (int) db()->lastInsertId(), 'linkReunion' => $linkReunion ?: null]]);
