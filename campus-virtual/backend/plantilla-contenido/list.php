<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$plantillaId = $_GET['plantillaId'] ?? '';
if ($plantillaId === '') fail('plantillaId requerido.');

$stmt = db()->prepare('SELECT * FROM plantilla_contenido WHERE plantilla_id = ? ORDER BY orden, id');
$stmt->execute([$plantillaId]);
respond(['ok' => true, 'contenido' => $stmt->fetchAll()]);
