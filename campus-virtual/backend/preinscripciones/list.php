<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'institucional.inscritos');

$rows = db()->query('SELECT * FROM preinscripciones ORDER BY created_at DESC')->fetchAll();
respond(['ok' => true, 'preinscripciones' => $rows]);
