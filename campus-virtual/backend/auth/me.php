<?php
require __DIR__ . '/../bootstrap.php';

$user = current_user();
if (!$user) fail('No autenticado.', 401);
$permisos = user_permisos($user);
respond(['ok' => true, 'user' => $user, 'permisos' => $permisos]);
