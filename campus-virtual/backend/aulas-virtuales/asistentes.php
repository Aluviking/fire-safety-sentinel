<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.aulas_virtuales');

$fecha      = $_GET['fecha'] ?? '';
$curso      = $_GET['curso'] ?? '';
$asignatura = $_GET['asignatura'] ?? '';
$docente    = $_GET['docente'] ?? '';
if ($fecha === '') fail('fecha requerida.');

$stmt = db()->prepare(
    'SELECT asistente_nombre, asistente_identificacion, asistente_externo, fecha_ingreso_real, fecha_salida_real
     FROM aulas_virtuales
     WHERE fecha_inicio_sesion = ? AND nombre_curso <=> ? AND asignatura <=> ? AND docente_nombre <=> ?
     ORDER BY asistente_nombre'
);
$stmt->execute([$fecha, $curso !== '' ? $curso : null, $asignatura !== '' ? $asignatura : null, $docente !== '' ? $docente : null]);

respond(['ok' => true, 'asistentes' => $stmt->fetchAll()]);
