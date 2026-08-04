<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$creditos    = db()->query('SELECT * FROM pagos_creditos ORDER BY fecha_pago DESC, id DESC')->fetchAll();
$pendientes  = db()->query('SELECT * FROM pagos_pendientes ORDER BY id DESC')->fetchAll();
$realizados  = db()->query('SELECT * FROM pagos_realizados ORDER BY fecha_pago DESC, id DESC')->fetchAll();

respond([
    'ok' => true,
    'pagosCreditos' => $creditos,
    'pagosPendientes' => $pendientes,
    'pagosRealizados' => $realizados,
]);
