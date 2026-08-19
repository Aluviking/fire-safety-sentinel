<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query(
    'SELECT p.id, p.asignatura_id, a.nombre AS asignatura, p.fecha, p.estado, p.created_at
     FROM plantillas_educacion_virtual p
     LEFT JOIN asignaturas a ON a.id = p.asignatura_id
     ORDER BY p.created_at DESC'
)->fetchAll();
respond(['ok' => true, 'plantillas' => $rows]);
