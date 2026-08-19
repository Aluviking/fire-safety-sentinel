<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'informes.consolidado_notas');

$notasFinales   = db()->query('SELECT * FROM notas_finales ORDER BY id DESC')->fetchAll();
$homologaciones = db()->query('SELECT * FROM homologaciones ORDER BY id DESC')->fetchAll();

respond(['ok' => true, 'notasFinales' => $notasFinales, 'homologaciones' => $homologaciones]);
