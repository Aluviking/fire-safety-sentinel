<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.aulas_virtuales');

$rows = db()->query('SELECT * FROM aulas_recursos ORDER BY nombre')->fetchAll();
respond(['ok' => true, 'aulas' => $rows]);
