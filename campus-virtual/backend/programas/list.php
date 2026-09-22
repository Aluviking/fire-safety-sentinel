<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

// Un docente solo ve los programas/cursos donde está asignado directamente
// (programa_docentes) o donde tiene alguna asignatura asignada dentro de su
// pensum (asignatura_docentes) — admin/super_admin/equipo ven todos, igual
// que antes.
$sql = 'SELECT p.*, (SELECT COUNT(*) FROM programa_estudiantes pe WHERE pe.programa_id = p.id) AS matriculados
        FROM programas p';
$params = [];
if ($user['role'] === 'docente') {
    $sql .= ' WHERE (
        EXISTS (SELECT 1 FROM programa_docentes pd JOIN docentes d ON d.id = pd.docente_id
                WHERE pd.programa_id = p.id AND d.identificacion = ?)
        OR EXISTS (SELECT 1 FROM programa_asignaturas pa
                   JOIN asignatura_docentes ad ON ad.asignatura_id = pa.asignatura_id
                   JOIN docentes d2 ON d2.id = ad.docente_id
                   WHERE pa.programa_id = p.id AND d2.identificacion = ?)
    )';
    $identificacion = $user['identificacion'] ?? '';
    $params = [$identificacion, $identificacion];
}
$sql .= ' ORDER BY p.nombre';

$stmt = db()->prepare($sql);
$stmt->execute($params);
respond(['ok' => true, 'programas' => $stmt->fetchAll()]);
