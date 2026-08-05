<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query('SELECT * FROM aulas_virtuales ORDER BY fecha_inicio_sesion DESC, id DESC')->fetchAll();
respond(['ok' => true, 'aulasVirtuales' => $rows]);
