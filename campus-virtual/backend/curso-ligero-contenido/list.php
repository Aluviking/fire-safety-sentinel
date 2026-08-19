<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$cursoLigeroId = $_GET['cursoLigeroId'] ?? '';
if ($cursoLigeroId === '') fail('cursoLigeroId requerido.');

$stmt = db()->prepare('SELECT * FROM curso_ligero_contenido WHERE curso_ligero_id = ? ORDER BY orden, id');
$stmt->execute([$cursoLigeroId]);
respond(['ok' => true, 'contenido' => $stmt->fetchAll()]);
