<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') {
    require_permiso($user, 'institucional.codeudores');
}

$rows = db()->query('SELECT * FROM codeudores ORDER BY nombre_completo')->fetchAll();
respond(['ok' => true, 'codeudores' => $rows]);
