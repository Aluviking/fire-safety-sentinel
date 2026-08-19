<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

require_acceso_programa($user, (int) $programaId);

$stmt = db()->prepare('SELECT * FROM programa_contenido WHERE programa_id = ? ORDER BY orden, id');
$stmt->execute([$programaId]);
respond(['ok' => true, 'contenido' => $stmt->fetchAll()]);
