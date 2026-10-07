<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

// Se agregan también los docentes asignados directamente a una asignatura
// del pensum de este programa (tabla aparte, asignatura_docentes) — mismo
// motivo que programa-clases/list.php: un docente de "TAE 12B" no aparecía
// aquí aunque sí dicta clase dentro de este programa. `origen_nombre` indica
// de qué asignatura viene cada fila (null = asignado directo al programa);
// esas filas son de solo lectura aquí, se gestionan desde la asignatura.
$stmt = db()->prepare(
    "(SELECT pd.id, pd.docente_id, d.identificacion, d.nombre_completo, NULL AS origen_nombre
      FROM programa_docentes pd
      JOIN docentes d ON d.id = pd.docente_id
      WHERE pd.programa_id = ?)
     UNION ALL
     (SELECT ad.id, ad.docente_id, d.identificacion, d.nombre_completo, asg.nombre AS origen_nombre
      FROM asignatura_docentes ad
      JOIN docentes d ON d.id = ad.docente_id
      JOIN programa_asignaturas pa ON pa.asignatura_id = ad.asignatura_id
      JOIN asignaturas asg ON asg.id = ad.asignatura_id
      WHERE pa.programa_id = ?)
     ORDER BY nombre_completo"
);
$stmt->execute([$programaId, $programaId]);
respond(['ok' => true, 'docentes' => $stmt->fetchAll()]);
