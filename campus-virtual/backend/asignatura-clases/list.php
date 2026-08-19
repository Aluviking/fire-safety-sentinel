<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

$asignaturaId = $_GET['asignaturaId'] ?? '';
if ($asignaturaId === '') fail('asignaturaId requerido.');

$stmt = db()->prepare(
    'SELECT c.*, a.nombre AS aula_nombre
     FROM asignatura_clases_virtuales c
     LEFT JOIN aulas_recursos a ON a.id = c.aula_recurso_id
     WHERE c.asignatura_id = ?
     ORDER BY c.fecha_inicio'
);
$stmt->execute([$asignaturaId]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
