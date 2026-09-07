<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$empresaId = $_GET['empresaId'] ?? '';
if ($empresaId === '') fail('empresaId requerido.');

$stmt = db()->prepare('SELECT * FROM curso_empresa_empleados WHERE empresa_id = ? ORDER BY apellidos, nombres');
$stmt->execute([$empresaId]);
respond(['ok' => true, 'empleados' => $stmt->fetchAll()]);
