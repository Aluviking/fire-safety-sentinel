<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query('SELECT * FROM audit_trace ORDER BY created_at DESC LIMIT 500')->fetchAll();
respond(['ok' => true, 'trace' => $rows]);
