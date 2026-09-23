<?php
require __DIR__ . '/../bootstrap.php';

// Las asignaturas de UN programa/curso/diplomado puntual en el que el
// estudiante está matriculado — para que en su panel las vea agrupadas
// dentro de ese programa (como pide el cliente), en vez de una lista suelta
// de "Asignaturas" con todo mezclado sin importar de qué programa viene cada
// una. require_acceso_programa() ya valida que esté matriculado ahí.

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

$programaId = (int) ($_GET['programaId'] ?? 0);
if ($programaId === 0) fail('programaId requerido.');

require_acceso_programa($user, $programaId);

$stmt = db()->prepare(
    "SELECT a.id, a.nombre, a.descripcion, a.imagen_path, a.dias_disponibles
     FROM asignaturas a
     JOIN programa_asignaturas pa ON pa.asignatura_id = a.id
     WHERE pa.programa_id = ?
     ORDER BY pa.orden, a.nombre"
);
$stmt->execute([$programaId]);
$asignaturas = $stmt->fetchAll();

// El estudiante también necesita ver quién es su docente por asignatura
// (pedido explícito del cliente) — mismo formato que asignaturas/list.php
// (array, porque una asignatura puede tener varios docentes).
$paresDocentes = db()->query(
    'SELECT ad.asignatura_id, d.id AS docente_id, d.nombre_completo AS docente_nombre
     FROM asignatura_docentes ad JOIN docentes d ON d.id = ad.docente_id'
)->fetchAll();
$docentesByAsignatura = [];
foreach ($paresDocentes as $p) {
    $docentesByAsignatura[$p['asignatura_id']][] = ['id' => $p['docente_id'], 'nombre' => $p['docente_nombre']];
}
foreach ($asignaturas as &$a) {
    $a['docentes'] = $docentesByAsignatura[$a['id']] ?? [];
}
unset($a);

respond(['ok' => true, 'asignaturas' => $asignaturas]);
