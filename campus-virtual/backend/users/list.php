<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query('SELECT id, nombre, email, username, role, avatar_path, created_at FROM users ORDER BY nombre')->fetchAll();
respond(['ok' => true, 'users' => $rows]);
