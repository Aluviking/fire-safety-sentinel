<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.aulas_virtuales');

$rows = db()->query('SELECT * FROM aulas_virtuales ORDER BY fecha_inicio_sesion DESC, id DESC')->fetchAll();
respond(['ok' => true, 'aulasVirtuales' => $rows]);
