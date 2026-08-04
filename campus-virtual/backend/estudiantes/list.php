<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$estudiantes = db()->query('SELECT * FROM estudiantes ORDER BY nombre_completo')->fetchAll();

$matriculas = db()->query('SELECT * FROM matriculas ORDER BY id DESC')->fetchAll();
$byEstudiante = [];
foreach ($matriculas as $m) {
    $byEstudiante[$m['estudiante_id']][] = $m;
}

foreach ($estudiantes as &$e) {
    $e['matriculas'] = $byEstudiante[$e['id']] ?? [];
}
unset($e);

respond(['ok' => true, 'estudiantes' => $estudiantes]);
