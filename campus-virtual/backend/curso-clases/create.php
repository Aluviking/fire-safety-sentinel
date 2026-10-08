<?php
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../zoom-lib.php';

$user = require_auth();
// Docente tiene edición completa en Cursos, igual que Super Admin — mismo
// pedido explícito del cliente ya aplicado en Programas/Asignaturas.
require_role($user, ['admin', 'super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body        = json_body();
$cursoId     = (int) ($body['cursoId'] ?? 0);
$titulo      = trim($body['titulo'] ?? '');
$fechaInicio = $body['fechaInicio'] ?? '';
$fechaFin    = $body['fechaFin'] ?? null;
if ($cursoId === 0 || $titulo === '' || $fechaInicio === '') fail('Título y fecha de inicio son requeridos.');

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
// grabación — una real, no (ver curso-clases/delete.php).
$esPrueba = !empty($body['esPrueba']) ? 1 : 0;

db()->prepare(
    'INSERT INTO curso_clases_virtuales
        (curso_id, aula_recurso_id, titulo, fecha_inicio, fecha_fin, link_reunion, zoom_meeting_id, es_prueba)
     VALUES (?,?,?,?,?,?,?,?)'
)->execute([
    $cursoId, $body['aulaRecursoId'] ?? null, $titulo, $fechaInicio, $fechaFin,
    $linkReunion ?: null, $meetingId, $esPrueba,
]);

respond(['ok' => true, 'clase' => ['id' => (int) db()->lastInsertId(), 'linkReunion' => $linkReunion ?: null]]);
