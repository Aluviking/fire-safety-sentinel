<?php
require __DIR__ . '/../bootstrap.php';

// Historial de clases virtuales YA pasadas del estudiante — contraparte de
// proximas.php (mismo candado de acceso, mismas 4 familias combinadas), pero
// con la fecha invertida y orden descendente: para la tarjeta "Historial de
// clases" del panel principal, donde solo tiene sentido ofrecer la
// grabación (la reunión en vivo ya terminó, no "Unirse").

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);
if (empty($user['identificacion'])) respond(['ok' => true, 'clases' => []]);

$id = $user['identificacion'];

$stmt = db()->prepare(
    "(SELECT 'Programa' AS origen, p.nombre AS origen_nombre, c.titulo, c.fecha_inicio, c.fecha_fin, c.link_reunion, c.grabacion_url
      FROM programa_clases_virtuales c JOIN programas p ON p.id = c.programa_id
      WHERE COALESCE(c.fecha_fin, c.fecha_inicio) < NOW() AND EXISTS (
        SELECT 1 FROM matriculas m JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE e.identificacion = ? AND m.estado != 'CANCELADO'
          AND (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %'))
      ))
     UNION ALL
     (SELECT 'Asignatura', asg.nombre, c.titulo, c.fecha_inicio, c.fecha_fin, c.link_reunion, c.grabacion_url
      FROM asignatura_clases_virtuales c JOIN asignaturas asg ON asg.id = c.asignatura_id
      WHERE COALESCE(c.fecha_fin, c.fecha_inicio) < NOW() AND EXISTS (
        SELECT 1 FROM programa_asignaturas pa
          JOIN programas p ON p.id = pa.programa_id
          JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
          JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE pa.asignatura_id = asg.id AND e.identificacion = ?
      ))
     UNION ALL
     (SELECT 'Curso', cu.codigo_nombre, c.titulo, c.fecha_inicio, c.fecha_fin, c.link_reunion, c.grabacion_url
      FROM curso_clases_virtuales c JOIN cursos cu ON cu.id = c.curso_id
      WHERE COALESCE(c.fecha_fin, c.fecha_inicio) < NOW() AND EXISTS (
        SELECT 1 FROM curso_estudiantes ce JOIN estudiantes e ON e.id = ce.estudiante_id
        WHERE ce.curso_id = cu.id AND e.identificacion = ?
      ))
     UNION ALL
     (SELECT 'Curso ligero', cl.nombre, c.titulo, c.fecha_inicio, c.fecha_fin, c.link_reunion, c.grabacion_url
      FROM curso_ligero_clases_virtuales c JOIN cursos_ligeros cl ON cl.id = c.curso_ligero_id
      WHERE COALESCE(c.fecha_fin, c.fecha_inicio) < NOW() AND EXISTS (
        SELECT 1 FROM curso_ligero_inscripciones cli WHERE cli.curso_ligero_id = cl.id AND cli.estudiante_identificacion = ?
      ))
     ORDER BY fecha_inicio DESC LIMIT 10"
);
$stmt->execute([$id, $id, $id, $id]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
