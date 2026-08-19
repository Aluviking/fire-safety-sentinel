<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$cursoId = $_GET['cursoId'] ?? '';
if ($cursoId === '') fail('cursoId requerido.');

require_acceso_curso($user, (int) $cursoId);

$stmt = db()->prepare('SELECT * FROM curso_contenido WHERE curso_id = ? ORDER BY orden, id');
$stmt->execute([$cursoId]);
respond(['ok' => true, 'contenido' => $stmt->fetchAll()]);
