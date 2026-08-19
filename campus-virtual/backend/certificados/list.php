<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.certificados');

$rows = db()->query(
    "SELECT id, nombre, predeterminado, (imagen_path IS NOT NULL) AS tiene_imagen,
        LOWER(SUBSTRING_INDEX(imagen_path, '.', -1)) AS extension, created_at
     FROM certificados_plantillas ORDER BY created_at DESC"
)->fetchAll();
respond(['ok' => true, 'certificados' => $rows]);
