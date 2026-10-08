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

// grabacionUrl: para cargar a mano la grabación de una clase que ya pasó
// (ej. se perdió el aviso automático del webhook, o la reunión se borró y
// se recrea solo para dejar la grabación disponible) — opcional, normalmente
// la llena sola el webhook de Zoom cuando termina de procesar.
$grabacionUrl = trim($body['grabacionUrl'] ?? '');
// esPrueba: una clase de prueba siempre se puede borrar de verdad, aunque ya
// tenga grabación — una real, no (require_gestion_* ya exige permiso para
// borrar cualquiera de las dos, esto solo decide CÓMO se borra).
$esPrueba = !empty($body['esPrueba']) ? 1 : 0;
// Si la crea un Docente, queda marcada como suya — un colega docente
// asignado a la misma asignatura no la va a ver. Lo de Admin/Super Admin
// (NULL) es institucional, visible para cualquier docente asignado.
$creadoPor = $user['role'] === 'docente' ? ($user['identificacion'] ?? null) : null;

db()->prepare(
    'INSERT INTO asignatura_clases_virtuales
        (asignatura_id, aula_recurso_id, titulo, fecha_inicio, fecha_fin, link_reunion, zoom_meeting_id, grabacion_url, es_prueba, creado_por_identificacion)
     VALUES (?,?,?,?,?,?,?,?,?,?)'
)->execute([
    $asignaturaId, $body['aulaRecursoId'] ?? null, $titulo, $fechaInicio, $fechaFin,
    $linkReunion ?: null, $meetingId, $grabacionUrl ?: null, $esPrueba, $creadoPor,
]);

respond(['ok' => true, 'clase' => ['id' => (int) db()->lastInsertId(), 'linkReunion' => $linkReunion ?: null]]);
