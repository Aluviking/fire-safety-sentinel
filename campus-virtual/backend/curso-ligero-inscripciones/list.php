<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.cursos_ligeros');

$cursoLigeroId = $_GET['cursoLigeroId'] ?? '';
if ($cursoLigeroId === '') fail('cursoLigeroId requerido.');

// Un docente solo ve a los estudiantes de SUS cursos ligeros —
// admin/super_admin/equipo/administrativo siguen viendo cualquiera, como siempre.
if ($user['role'] === 'docente') require_gestion_curso_ligero($user, (int) $cursoLigeroId);

$stmt = db()->prepare(
    'SELECT i.*, e.nombre_completo
     FROM curso_ligero_inscripciones i
     LEFT JOIN estudiantes e ON e.identificacion = i.estudiante_identificacion
     WHERE i.curso_ligero_id = ?
     ORDER BY e.nombre_completo'
);
$stmt->execute([$cursoLigeroId]);
respond(['ok' => true, 'inscripciones' => $stmt->fetchAll()]);
