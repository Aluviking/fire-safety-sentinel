<?php
require __DIR__ . '/../bootstrap.php';

// Ya NO se usa la tabla asignatura_estudiantes (matrícula manual aparte, sin
// UI desde que el contenido de asignaturas pasó a administrarse solo desde
// el pensum del programa) — el estudiante hereda el acceso a una asignatura
// por estar matriculado en un programa que la trae en su pensum, mismo
// puente que ya usa require_acceso_asignatura() en bootstrap.php.

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

$asignaturaId = (int) ($_GET['asignaturaId'] ?? 0);
if ($asignaturaId === 0) fail('asignaturaId requerido.');

// Un docente solo ve los estudiantes de las asignaturas que de verdad dicta.
if ($user['role'] === 'docente') require_gestion_asignatura($user, $asignaturaId);

$stmt = db()->prepare(
    "SELECT m.id, e.id AS estudiante_id, m.estado, m.created_at, e.identificacion, e.nombre_completo, p.nombre AS programa_nombre,
            m.mostrar_notas, m.mostrar_certificado
     FROM programa_asignaturas pa
     JOIN programas p ON p.id = pa.programa_id
     JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
     JOIN estudiantes e ON e.id = m.estudiante_id
     WHERE pa.asignatura_id = ?
     ORDER BY e.nombre_completo"
);
$stmt->execute([$asignaturaId]);
respond(['ok' => true, 'matriculados' => $stmt->fetchAll()]);
