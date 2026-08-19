<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$cursoLigeroId = $_GET['cursoLigeroId'] ?? '';
if ($cursoLigeroId === '') fail('cursoLigeroId requerido.');

require_acceso_curso_ligero($user, (int) $cursoLigeroId);

$stmt = db()->prepare('SELECT * FROM curso_ligero_contenido WHERE curso_ligero_id = ? ORDER BY orden, id');
$stmt->execute([$cursoLigeroId]);
respond(['ok' => true, 'contenido' => $stmt->fetchAll()]);
