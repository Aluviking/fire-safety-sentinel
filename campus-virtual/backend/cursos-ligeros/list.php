<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.cursos_ligeros');

// usuarios_inscritos se calcula en vivo desde las inscripciones reales
// (curso_ligero_inscripciones) — la columna guardada en la tabla queda
// obsoleta desde que existe la pestaña Usuarios con inscripción real.
// Un docente solo ve SUS propios cursos ligeros, no los de todos.
$soloPropios = $user['role'] === 'docente';
$sql = 'SELECT c.*, cert.nombre AS certificado_nombre,
            (SELECT COUNT(*) FROM curso_ligero_inscripciones i WHERE i.curso_ligero_id = c.id) AS usuarios_inscritos
        FROM cursos_ligeros c
        LEFT JOIN certificados_plantillas cert ON cert.id = c.certificado_id'
     . ($soloPropios ? ' WHERE c.docente_identificacion = ?' : '')
     . ' ORDER BY c.nombre';
$stmt = db()->prepare($sql);
$stmt->execute($soloPropios ? [$user['identificacion']] : []);
respond(['ok' => true, 'cursosLigeros' => $stmt->fetchAll()]);
