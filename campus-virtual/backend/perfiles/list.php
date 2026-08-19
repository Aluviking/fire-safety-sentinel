<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$rows = db()->query('SELECT id, nombre, descripcion, estado FROM perfiles ORDER BY nombre')->fetchAll();
respond(['ok' => true, 'perfiles' => $rows]);
