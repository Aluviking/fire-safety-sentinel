<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

// "Matriculados" cuenta estudiantes reales vía el pensum (programa_asignaturas
// + matriculas) — ya no vía asignatura_estudiantes, que se quedó sin UI desde
// que el contenido de asignaturas pasó a administrarse solo desde el pensum.
// Un docente solo ve SUS asignaturas asignadas (asignatura_docentes).
$sql = "SELECT a.*, (
        SELECT COUNT(DISTINCT e.id)
        FROM programa_asignaturas pa
        JOIN programas p ON p.id = pa.programa_id
        JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
        JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE pa.asignatura_id = a.id
     ) AS matriculados
     FROM asignaturas a";
$params = [];
if ($user['role'] === 'docente') {
    $sql .= ' WHERE EXISTS (
        SELECT 1 FROM asignatura_docentes ad JOIN docentes d ON d.id = ad.docente_id
        WHERE ad.asignatura_id = a.id AND d.identificacion = ?
    )';
    $params[] = $user['identificacion'] ?? '';
}
$sql .= ' ORDER BY a.nombre';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$asignaturas = $stmt->fetchAll();

$pares = db()->query(
    'SELECT pa.asignatura_id, p.id AS programa_id, p.nombre AS programa_nombre
     FROM programa_asignaturas pa JOIN programas p ON p.id = pa.programa_id'
)->fetchAll();
$byAsignatura = [];
foreach ($pares as $p) {
    $byAsignatura[$p['asignatura_id']][] = ['id' => $p['programa_id'], 'nombre' => $p['programa_nombre']];
}

$paresDocentes = db()->query(
    'SELECT ad.asignatura_id, d.id AS docente_id, d.nombre_completo AS docente_nombre, d.identificacion AS docente_identificacion
     FROM asignatura_docentes ad JOIN docentes d ON d.id = ad.docente_id'
)->fetchAll();
$docentesByAsignatura = [];
foreach ($paresDocentes as $p) {
    $docentesByAsignatura[$p['asignatura_id']][] = [
        'id' => $p['docente_id'], 'nombre' => $p['docente_nombre'], 'identificacion' => $p['docente_identificacion'],
    ];
}

foreach ($asignaturas as &$a) {
    $a['programas'] = $byAsignatura[$a['id']] ?? [];
    $a['docentes'] = $docentesByAsignatura[$a['id']] ?? [];
}
unset($a);

respond(['ok' => true, 'asignaturas' => $asignaturas]);
