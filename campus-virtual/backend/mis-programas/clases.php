<?php
require __DIR__ . '/../bootstrap.php';

// Las clases virtuales (con su link de Zoom y, apenas quede lista, la
// grabación) de UN programa/curso/diplomado en el que el estudiante está
// matriculado — mismo candado de acceso que mis-programas/asignaturas.php.
// No se reutiliza programa-clases/list.php porque ese exige permiso de
// módulo administrativo (academico.programas), que un estudiante nunca
// tiene — aquí se valida por matrícula real en su lugar.

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

$programaId = (int) ($_GET['programaId'] ?? 0);
if ($programaId === 0) fail('programaId requerido.');

require_acceso_programa($user, $programaId);

$stmt = db()->prepare(
    'SELECT id, titulo, fecha_inicio, fecha_fin, link_reunion, grabacion_url
     FROM programa_clases_virtuales
     WHERE programa_id = ?
     ORDER BY fecha_inicio'
);
$stmt->execute([$programaId]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
