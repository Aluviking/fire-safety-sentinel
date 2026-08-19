<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.cursos_ligeros');

$cursoLigeroId = $_GET['cursoLigeroId'] ?? '';
if ($cursoLigeroId === '') fail('cursoLigeroId requerido.');

$stmt = db()->prepare(
    'SELECT c.*, a.nombre AS aula_nombre
     FROM curso_ligero_clases_virtuales c
     LEFT JOIN aulas_recursos a ON a.id = c.aula_recurso_id
     WHERE c.curso_ligero_id = ?
     ORDER BY c.fecha_inicio'
);
$stmt->execute([$cursoLigeroId]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
