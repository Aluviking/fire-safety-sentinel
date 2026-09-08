<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

if (empty($user['identificacion'])) {
    respond(['ok' => true, 'asignaturas' => [], 'vinculado' => false]);
}

// Las asignaturas de un estudiante son las del pensum de cualquier programa/
// curso/diplomado en el que esté matriculado (tabla programa_asignaturas) —
// mismo puente que mis-programas/list.php. Ya no depende de
// asignatura_estudiantes (matrícula manual aparte por asignatura), que se
// quedó sin UI cuando el contenido de asignaturas pasó a administrarse solo
// desde "Traer/Crear asignatura" en el pensum del programa.
$stmt = db()->prepare(
    "SELECT DISTINCT a.id, a.nombre, a.descripcion, a.imagen_path, a.dias_disponibles
     FROM asignaturas a
     JOIN programa_asignaturas pa ON pa.asignatura_id = a.id
     JOIN programas p ON p.id = pa.programa_id
     JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
     JOIN estudiantes e ON e.id = m.estudiante_id
     WHERE e.identificacion = ?
     ORDER BY a.nombre"
);
$stmt->execute([$user['identificacion']]);
respond(['ok' => true, 'asignaturas' => $stmt->fetchAll(), 'vinculado' => true]);
