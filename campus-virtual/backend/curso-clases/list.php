<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso_alguno($user, ['academico.cursos', 'academico.cursos_virtuales']);

$cursoId = $_GET['cursoId'] ?? '';
if ($cursoId === '') fail('cursoId requerido.');

$stmt = db()->prepare(
    'SELECT c.*, a.nombre AS aula_nombre
     FROM curso_clases_virtuales c
     LEFT JOIN aulas_recursos a ON a.id = c.aula_recurso_id
     WHERE c.curso_id = ?
     ORDER BY c.fecha_inicio'
);
$stmt->execute([$cursoId]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
