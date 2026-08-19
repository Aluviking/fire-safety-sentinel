<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query(
    'SELECT u.id, u.nombre, u.email, u.username, u.role, u.avatar_path, u.created_at,
         u.perfil_id, p.nombre AS perfil_nombre, u.identificacion
     FROM users u
     LEFT JOIN perfiles p ON p.id = u.perfil_id
     ORDER BY u.nombre'
)->fetchAll();
respond(['ok' => true, 'users' => $rows]);
