<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.cursos_ligeros');

$cursoLigeroId = $_GET['cursoLigeroId'] ?? '';
if ($cursoLigeroId === '') fail('cursoLigeroId requerido.');

$stmt = db()->prepare('SELECT * FROM curso_ligero_anuncios WHERE curso_ligero_id = ? ORDER BY created_at DESC');
$stmt->execute([$cursoLigeroId]);
respond(['ok' => true, 'anuncios' => $stmt->fetchAll()]);
