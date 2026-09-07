<?php
require __DIR__ . '/../bootstrap.php';

// PÚBLICO a propósito — lo consume el formulario de inscripción, que lo
// llena gente sin cuenta todavía. Solo expone id+nombre, nada sensible.
// Las 3 categorías son la misma tabla `programas`, separadas por el prefijo
// real del nombre (CURSO / TECNICO / DIPLOMADO).

$tecnicos = db()->query(
    "SELECT id, nombre FROM programas WHERE estado = 'Activo' AND nombre LIKE 'TECNICO%' ORDER BY nombre"
)->fetchAll();

$diplomados = db()->query(
    "SELECT id, nombre FROM programas WHERE estado = 'Activo' AND nombre LIKE 'DIPLOMADO%' ORDER BY nombre"
)->fetchAll();

$cursos = db()->query(
    "SELECT id, nombre FROM programas WHERE estado = 'Activo' AND nombre LIKE 'CURSO%' ORDER BY nombre"
)->fetchAll();

respond(['ok' => true, 'programas' => $tecnicos, 'diplomados' => $diplomados, 'cursos' => $cursos]);
