<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso_alguno($user, ['academico.cursos', 'academico.cursos_virtuales']);

// Un docente solo ve SUS propios cursos, no los de todos — el resto de
// roles (admin/super_admin/equipo) sigue viendo el catálogo completo.
$soloPropios = $user['role'] === 'docente';
$sql = 'SELECT c.*, (SELECT COUNT(*) FROM curso_estudiantes ce WHERE ce.curso_id = c.id) AS matriculados
        FROM cursos c'
     . ($soloPropios ? ' WHERE c.docente_identificacion = ?' : '')
     . ' ORDER BY c.fecha_inicio DESC, c.id DESC';
$stmt = db()->prepare($sql);
$stmt->execute($soloPropios ? [$user['identificacion']] : []);
respond(['ok' => true, 'cursos' => $stmt->fetchAll()]);
