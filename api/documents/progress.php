<?php
require __DIR__ . '/../bootstrap.php';

require_auth();

/**
 * Progreso de documentación PHVA por empresa y por fase, para las tarjetas del
 * Dashboard (total por empresa) y las pestañas P/H/V/A de la vista de Empresa
 * (por fase). El total ya no es un número fijo (26): se cuenta directamente
 * desde custom_folders (carpetas + subcarpetas), que es la fuente real de las
 * carpetas de cada empresa+fase en este momento.
 */
$rows = db()->query(
    "SELECT cf.empresa_id, cf.phva_phase,
            COUNT(DISTINCT cf.id) AS total_folders,
            COUNT(DISTINCT d.folder_id) AS folders_with_docs
     FROM custom_folders cf
     LEFT JOIN documents d ON d.folder_id = cf.id
     GROUP BY cf.empresa_id, cf.phva_phase"
)->fetchAll();

respond(['ok' => true, 'progress' => $rows]);
