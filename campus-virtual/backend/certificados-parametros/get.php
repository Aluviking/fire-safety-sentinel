<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.parametros_certificados');

$stmt = db()->query('SELECT * FROM certificados_parametros WHERE id = 1');
$row = $stmt->fetch();
if (!$row) {
    // INSERT IGNORE (no INSERT a secas) -- si dos personas abren esta
    // pantalla por primera vez casi al mismo tiempo, la segunda consulta no
    // debe explotar por llave duplicada, mismo candado que ya usa update.php.
    db()->exec('INSERT IGNORE INTO certificados_parametros (id) VALUES (1)');
    $stmt = db()->query('SELECT * FROM certificados_parametros WHERE id = 1');
    $row = $stmt->fetch();
}

respond(['ok' => true, 'parametros' => $row]);
