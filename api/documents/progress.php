<?php
require __DIR__ . '/../bootstrap.php';

require_auth();

/**
 * Progreso de documentación PHVA por empresa, para las tarjetas del Dashboard.
 * Cuenta cuántas carpetas distintas (fase + nombre) de cada empresa ya tienen
 * al menos un documento subido — el total de carpetas posibles (26) lo conoce
 * el frontend (misma estructura PHVA fija que ya usa PortalEmpresa).
 */
$rows = db()->query(
    "SELECT empresa_id, COUNT(DISTINCT CONCAT(phva_phase, ':', folder_name)) AS folders_with_docs
     FROM documents
     GROUP BY empresa_id"
)->fetchAll();

respond(['ok' => true, 'progress' => $rows]);
