<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'informes.gestion_financiera');

$totales = db()->query(
    'SELECT
        (SELECT COALESCE(SUM(valor_pagado), 0) FROM pagos_realizados WHERE estado IS NULL OR estado NOT LIKE "%nulad%") AS total_recaudado,
        (SELECT COALESCE(SUM(valor_producto), 0) FROM pagos_pendientes) AS total_pendiente,
        (SELECT COALESCE(SUM(valor_credito), 0) FROM creditos WHERE anulado IS NULL OR anulado <> "Si") AS total_creditos_activos,
        (SELECT COUNT(*) FROM creditos WHERE anulado = "Si") AS creditos_anulados,
        (SELECT COUNT(*) FROM creditos WHERE paz_y_salvo = "Si") AS creditos_paz_y_salvo,
        (SELECT COALESCE(SUM(valor_producto), 0) FROM notas_credito) AS total_notas_credito,
        (SELECT COUNT(*) FROM modificaciones_creditos) AS total_modificaciones'
)->fetch();

$modificaciones = db()->query('SELECT * FROM modificaciones_creditos ORDER BY id DESC')->fetchAll();

respond(['ok' => true, 'totales' => $totales, 'modificaciones' => $modificaciones]);
