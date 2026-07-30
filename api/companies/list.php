<?php
require __DIR__ . '/../bootstrap.php';

require_auth();
$rows = db()->query('SELECT * FROM companies ORDER BY nombre')->fetchAll();
respond(['ok' => true, 'companies' => $rows]);
