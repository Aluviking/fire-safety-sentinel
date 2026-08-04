<?php
require __DIR__ . '/../bootstrap.php';

$user = current_user();
if (!$user) fail('No autenticado.', 401);
respond(['ok' => true, 'user' => $user]);
