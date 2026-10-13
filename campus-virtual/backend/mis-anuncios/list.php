<?php
require __DIR__ . '/../bootstrap.php';

// Anuncios de TODO lo que el estudiante tiene matriculado (programas,
// asignaturas de su pensum, cursos virtuales, cursos ligeros) — para la
// barra de "últimas noticias" del home. Mismo candado de acceso real que ya
// usa mis-clases/proximas.php (matrícula/inscripción real, no por rol).

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);
if (empty($user['identificacion'])) respond(['ok' => true, 'anuncios' => []]);

$id = $user['identificacion'];

$stmt = db()->prepare(
    "(SELECT 'Programa' AS origen, p.nombre AS origen_nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM programa_anuncios a JOIN programas p ON p.id = a.programa_id
      WHERE EXISTS (
        SELECT 1 FROM matriculas m JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE e.identificacion = ? AND m.estado != 'CANCELADO'
          AND (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %'))
      ))
     UNION ALL
     (SELECT 'Asignatura', asg.nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM asignatura_anuncios a JOIN asignaturas asg ON asg.id = a.asignatura_id
      WHERE EXISTS (
        SELECT 1 FROM programa_asignaturas pa
          JOIN programas p ON p.id = pa.programa_id
          JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
          JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE pa.asignatura_id = asg.id AND e.identificacion = ?
      ))
     UNION ALL
     (SELECT 'Curso', cu.codigo_nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM curso_anuncios a JOIN cursos cu ON cu.id = a.curso_id
      WHERE EXISTS (
        SELECT 1 FROM curso_estudiantes ce JOIN estudiantes e ON e.id = ce.estudiante_id
        WHERE ce.curso_id = cu.id AND e.identificacion = ?
      ))
     UNION ALL
     (SELECT 'Curso ligero', cl.nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM curso_ligero_anuncios a JOIN cursos_ligeros cl ON cl.id = a.curso_ligero_id
      WHERE EXISTS (
        SELECT 1 FROM curso_ligero_inscripciones cli WHERE cli.curso_ligero_id = cl.id AND cli.estudiante_identificacion = ?
      ))
     ORDER BY created_at DESC LIMIT 10"
);
$stmt->execute([$id, $id, $id, $id]);
respond(['ok' => true, 'anuncios' => $stmt->fetchAll()]);
