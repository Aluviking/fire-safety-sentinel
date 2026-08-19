<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

// Una fila real por asistente en `aulas_virtuales` — se agrupa por sesión
// (misma fecha_inicio_sesion + curso + asignatura + docente) para mostrar
// una fila por clase, con el conteo real de asistentes.
$rows = db()->query(
    'SELECT fecha_inicio_sesion, fecha_fin_sesion, nombre_curso, asignatura, docente_nombre,
         COUNT(DISTINCT asistente_identificacion) AS asistentes
     FROM aulas_virtuales
     WHERE fecha_inicio_sesion IS NOT NULL
     GROUP BY fecha_inicio_sesion, nombre_curso, asignatura, docente_nombre
     ORDER BY fecha_inicio_sesion DESC'
)->fetchAll();

respond(['ok' => true, 'sesiones' => $rows]);
