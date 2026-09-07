<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

$stmt = db()->prepare(
    'SELECT ce.*, (SELECT COUNT(*) FROM curso_empresa_empleados cee WHERE cee.empresa_id = ce.id) AS empleados_cargados
     FROM curso_empresas ce WHERE ce.programa_id = ? ORDER BY ce.created_at DESC'
);
$stmt->execute([$programaId]);
respond(['ok' => true, 'empresas' => $stmt->fetchAll()]);
