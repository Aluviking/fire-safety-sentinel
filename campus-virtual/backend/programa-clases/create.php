<?php
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../zoom-lib.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body        = json_body();
$programaId  = (int) ($body['programaId'] ?? 0);
$titulo      = trim($body['titulo'] ?? '');
$fechaInicio = $body['fechaInicio'] ?? '';
$fechaFin    = $body['fechaFin'] ?? null;
if ($programaId === 0 || $titulo === '' || $fechaInicio === '') fail('Título y fecha de inicio son requeridos.');
require_gestion_programa($user, $programaId);

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

// Una clase de prueba siempre se puede borrar de verdad, aunque ya tenga
// grabación — una real, no (ver programa-clases/delete.php).
$esPrueba = !empty($body['esPrueba']) ? 1 : 0;
// Si la crea un Docente, queda marcada como suya — un colega docente
// asignado al mismo programa no la va a ver. Lo de Admin/Super Admin (NULL)
// es institucional, visible para cualquier docente asignado.
$creadoPor = $user['role'] === 'docente' ? ($user['identificacion'] ?? null) : null;

db()->prepare(
    'INSERT INTO programa_clases_virtuales
        (programa_id, aula_recurso_id, titulo, fecha_inicio, fecha_fin, link_reunion, zoom_meeting_id, es_prueba, creado_por_identificacion)
     VALUES (?,?,?,?,?,?,?,?,?)'
)->execute([
    $programaId, $body['aulaRecursoId'] ?? null, $titulo, $fechaInicio, $fechaFin,
    $linkReunion ?: null, $meetingId, $esPrueba, $creadoPor,
]);

respond(['ok' => true, 'clase' => ['id' => (int) db()->lastInsertId(), 'linkReunion' => $linkReunion ?: null]]);
