<?php
require __DIR__ . '/../bootstrap.php';

// "Historial" propio de un Docente — a diferencia de /audit/list.php (que es
// la auditoría administrativa completa, exclusiva de Super Admin), esto es
// un feed real de actividad (anuncios publicados + clases virtuales
// programadas) dentro de SUS programas/asignaturas/cursos/cursos ligeros.
// Ninguna de esas tablas guarda quién creó cada fila, así que se filtra por
// dueño del contenido (igual que el resto del sistema), no por autor exacto.

$user = require_auth();
if ($user['role'] !== 'docente') fail('No autorizado.', 403);
if (empty($user['identificacion'])) respond(['ok' => true, 'movimientos' => []]);

$id = $user['identificacion'];

$stmt = db()->prepare(
    "(SELECT 'Anuncio' AS tipo, 'Programa' AS origen, p.nombre AS origen_nombre, a.titulo, a.mensaje AS detalle, a.created_at AS fecha
      FROM programa_anuncios a JOIN programas p ON p.id = a.programa_id
      WHERE EXISTS (
        SELECT 1 FROM programa_docentes pd JOIN docentes d ON d.id = pd.docente_id WHERE pd.programa_id = p.id AND d.identificacion = ?
        UNION
        SELECT 1 FROM programa_asignaturas pa JOIN asignatura_docentes ad ON ad.asignatura_id = pa.asignatura_id
          JOIN docentes d ON d.id = ad.docente_id WHERE pa.programa_id = p.id AND d.identificacion = ?
      ))
     UNION ALL
     (SELECT 'Anuncio', 'Asignatura', asg.nombre, a.titulo, a.mensaje, a.created_at
      FROM asignatura_anuncios a JOIN asignaturas asg ON asg.id = a.asignatura_id
      JOIN asignatura_docentes ad ON ad.asignatura_id = asg.id JOIN docentes d ON d.id = ad.docente_id
      WHERE d.identificacion = ?)
     UNION ALL
     (SELECT 'Anuncio', 'Curso', c.codigo_nombre, a.titulo, a.mensaje, a.created_at
      FROM curso_anuncios a JOIN cursos c ON c.id = a.curso_id
      WHERE c.docente_identificacion = ?)
     UNION ALL
     (SELECT 'Anuncio', 'Curso ligero', cl.nombre, a.titulo, a.mensaje, a.created_at
      FROM curso_ligero_anuncios a JOIN cursos_ligeros cl ON cl.id = a.curso_ligero_id
      WHERE cl.docente_identificacion = ?)
     UNION ALL
     (SELECT 'Clase virtual', 'Programa', p.nombre, c.titulo, NULL, c.fecha_inicio
      FROM programa_clases_virtuales c JOIN programas p ON p.id = c.programa_id
      WHERE EXISTS (
        SELECT 1 FROM programa_docentes pd JOIN docentes d ON d.id = pd.docente_id WHERE pd.programa_id = p.id AND d.identificacion = ?
        UNION
        SELECT 1 FROM programa_asignaturas pa JOIN asignatura_docentes ad ON ad.asignatura_id = pa.asignatura_id
          JOIN docentes d ON d.id = ad.docente_id WHERE pa.programa_id = p.id AND d.identificacion = ?
      ))
     UNION ALL
     (SELECT 'Clase virtual', 'Asignatura', asg.nombre, c.titulo, NULL, c.fecha_inicio
      FROM asignatura_clases_virtuales c JOIN asignaturas asg ON asg.id = c.asignatura_id
      JOIN asignatura_docentes ad ON ad.asignatura_id = asg.id JOIN docentes d ON d.id = ad.docente_id
      WHERE d.identificacion = ?)
     UNION ALL
     (SELECT 'Clase virtual', 'Curso', cu.codigo_nombre, c.titulo, NULL, c.fecha_inicio
      FROM curso_clases_virtuales c JOIN cursos cu ON cu.id = c.curso_id
      WHERE cu.docente_identificacion = ?)
     UNION ALL
     (SELECT 'Clase virtual', 'Curso ligero', cl.nombre, c.titulo, NULL, c.fecha_inicio
      FROM curso_ligero_clases_virtuales c JOIN cursos_ligeros cl ON cl.id = c.curso_ligero_id
      WHERE cl.docente_identificacion = ?)
     ORDER BY fecha DESC LIMIT 200"
);
$stmt->execute(array_fill(0, 10, $id));
respond(['ok' => true, 'movimientos' => $stmt->fetchAll()]);
