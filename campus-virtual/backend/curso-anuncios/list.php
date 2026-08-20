<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso_alguno($user, ['academico.cursos', 'academico.cursos_virtuales']);

$cursoId = $_GET['cursoId'] ?? '';
if ($cursoId === '') fail('cursoId requerido.');

$stmt = db()->prepare('SELECT * FROM curso_anuncios WHERE curso_id = ? ORDER BY created_at DESC');
$stmt->execute([$cursoId]);
respond(['ok' => true, 'anuncios' => $stmt->fetchAll()]);
