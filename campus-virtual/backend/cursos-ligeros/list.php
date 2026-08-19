<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.cursos_ligeros');

// usuarios_inscritos se calcula en vivo desde las inscripciones reales
// (curso_ligero_inscripciones) — la columna guardada en la tabla queda
// obsoleta desde que existe la pestaña Usuarios con inscripción real.
$rows = db()->query(
    'SELECT c.*, cert.nombre AS certificado_nombre,
         (SELECT COUNT(*) FROM curso_ligero_inscripciones i WHERE i.curso_ligero_id = c.id) AS usuarios_inscritos
     FROM cursos_ligeros c
     LEFT JOIN certificados_plantillas cert ON cert.id = c.certificado_id
     ORDER BY c.nombre'
)->fetchAll();
respond(['ok' => true, 'cursosLigeros' => $rows]);
