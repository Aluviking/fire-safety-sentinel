<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.banco_preguntas');

$rows = db()->query('SELECT * FROM banco_etiquetas ORDER BY nombre')->fetchAll();
respond(['ok' => true, 'etiquetas' => $rows]);
