<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

$stmt = db()->prepare('SELECT * FROM programa_anuncios WHERE programa_id = ? ORDER BY created_at DESC');
$stmt->execute([$programaId]);
respond(['ok' => true, 'anuncios' => $stmt->fetchAll()]);
