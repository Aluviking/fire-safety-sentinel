<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

// Se agregan también las clases creadas directamente en una asignatura del
// pensum de este programa (tabla aparte, asignatura_clases_virtuales) — sin
// esto, una clase programada desde "TAE 12B" (por ejemplo) parecía no existir
// al mirar el programa que la contiene, aunque sí se haya guardado bien y los
// estudiantes sí la vean. `origen_api_base`/`origen_nombre` le dicen al
// front de dónde viene cada fila realmente, para poder borrarla desde el
// endpoint correcto y mostrar su asignatura de origen.
$stmt = db()->prepare(
    "(SELECT c.id, c.aula_recurso_id, c.titulo, c.fecha_inicio, c.fecha_fin, c.link_reunion, c.zoom_meeting_id, c.grabacion_url,
             a.nombre AS aula_nombre, NULL AS origen_nombre, NULL AS origen_api_base
      FROM programa_clases_virtuales c
      LEFT JOIN aulas_recursos a ON a.id = c.aula_recurso_id
      WHERE c.programa_id = ?)
     UNION ALL
     (SELECT ac.id, ac.aula_recurso_id, ac.titulo, ac.fecha_inicio, ac.fecha_fin, ac.link_reunion, ac.zoom_meeting_id, ac.grabacion_url,
             aa.nombre AS aula_nombre, asg.nombre AS origen_nombre, '/asignatura-clases' AS origen_api_base
      FROM asignatura_clases_virtuales ac
      JOIN programa_asignaturas pa ON pa.asignatura_id = ac.asignatura_id
      JOIN asignaturas asg ON asg.id = ac.asignatura_id
      LEFT JOIN aulas_recursos aa ON aa.id = ac.aula_recurso_id
      WHERE pa.programa_id = ?)
     ORDER BY fecha_inicio"
);
$stmt->execute([$programaId, $programaId]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
