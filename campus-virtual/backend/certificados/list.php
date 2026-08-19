<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query('SELECT id, nombre, predeterminado, (imagen_path IS NOT NULL) AS tiene_imagen, created_at FROM certificados_plantillas ORDER BY created_at DESC')->fetchAll();
respond(['ok' => true, 'certificados' => $rows]);
