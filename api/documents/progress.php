<?php
require __DIR__ . '/../bootstrap.php';

require_auth();

/**
 * Progreso de documentación PHVA por empresa y por fase, para las tarjetas del
 * Dashboard (total por empresa) y las pestañas P/H/V/A de la vista de Empresa
 * (por fase). Cuenta cuántas carpetas distintas de cada empresa+fase ya tienen
 * al menos un documento subido — el total de carpetas posibles lo conoce el
 * frontend (estructura PHVA fija + carpetas personalizadas de cada empresa).
 */
$rows = db()->query(
    "SELECT empresa_id, phva_phase, COUNT(DISTINCT folder_name) AS folders_with_docs
     FROM documents
     GROUP BY empresa_id, phva_phase"
)->fetchAll();

respond(['ok' => true, 'progress' => $rows]);
