<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query(
    'SELECT
        e.identificacion,
        e.nombre_completo,
        COALESCE(c.total_creditos, 0)   AS total_creditos,
        COALESCE(c.creditos_activos, 0) AS creditos_activos,
        COALESCE(c.creditos_anulados, 0) AS creditos_anulados,
        COALESCE(pp.total_pendiente, 0) AS total_pendiente
     FROM estudiantes e
     LEFT JOIN (
        SELECT identificacion_estudiante,
               SUM(valor_credito) AS total_creditos,
               SUM(CASE WHEN (paz_y_salvo IS NULL OR paz_y_salvo <> "Si")
                         AND (anulado IS NULL OR anulado <> "Si") THEN 1 ELSE 0 END) AS creditos_activos,
               SUM(CASE WHEN anulado = "Si" THEN 1 ELSE 0 END) AS creditos_anulados
        FROM creditos
        GROUP BY identificacion_estudiante
     ) c ON c.identificacion_estudiante = e.identificacion
     LEFT JOIN (
        SELECT identificacion, SUM(valor_producto) AS total_pendiente
        FROM pagos_pendientes
        GROUP BY identificacion
     ) pp ON pp.identificacion = e.identificacion
     WHERE c.total_creditos IS NOT NULL OR pp.total_pendiente IS NOT NULL
     ORDER BY total_pendiente DESC, total_creditos DESC'
)->fetchAll();

respond(['ok' => true, 'cartera' => $rows]);
