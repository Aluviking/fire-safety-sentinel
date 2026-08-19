<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$id = $_GET['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT id, nombre, descripcion, estado FROM perfiles WHERE id = ?');
$stmt->execute([$id]);
$perfil = $stmt->fetch();
if (!$perfil) fail('Perfil no encontrado.', 404);

$stmt = db()->prepare('SELECT modulo, puede_ver, puede_editar FROM perfil_permisos WHERE perfil_id = ?');
$stmt->execute([$id]);
$permisos = [];
foreach ($stmt->fetchAll() as $row) {
    $permisos[$row['modulo']] = ['ver' => (bool) $row['puede_ver'], 'editar' => (bool) $row['puede_editar']];
}
$perfil['permisos'] = $permisos;

respond(['ok' => true, 'perfil' => $perfil]);
