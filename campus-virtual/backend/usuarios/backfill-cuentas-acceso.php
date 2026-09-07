<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

// Respaldo de una sola vez: crea la cuenta de acceso (usuario y clave =
// identificación) para todos los estudiantes/docentes ya registrados que
// todavía no la tengan. Es seguro volver a correrlo — a quien ya tiene
// cuenta simplemente se lo salta (crear_cuenta_acceso_automatica ya revisa
// eso internamente).

$estudiantes = db()->query('SELECT identificacion, nombre_completo, correo FROM estudiantes WHERE identificacion IS NOT NULL AND identificacion != \'\'')->fetchAll();
$docentes    = db()->query('SELECT identificacion, nombre_completo, correo FROM docentes WHERE identificacion IS NOT NULL AND identificacion != \'\'')->fetchAll();

$resultado = ['estudiantes' => ['creadas' => 0, 'omitidas' => 0], 'docentes' => ['creadas' => 0, 'omitidas' => 0]];

foreach ($estudiantes as $e) {
    $ok = crear_cuenta_acceso_automatica($e['identificacion'], $e['nombre_completo'], 'estudiante', $e['correo'], 'estudiantes.gfoacademy.local');
    $resultado['estudiantes'][$ok ? 'creadas' : 'omitidas']++;
}
foreach ($docentes as $d) {
    $ok = crear_cuenta_acceso_automatica($d['identificacion'], $d['nombre_completo'], 'docente', $d['correo'], 'docentes.gfoacademy.local');
    $resultado['docentes'][$ok ? 'creadas' : 'omitidas']++;
}

log_trace(
    $user, 'backfill_cuentas_acceso',
    "Creó {$resultado['estudiantes']['creadas']} cuentas de estudiante y {$resultado['docentes']['creadas']} de docente"
);

respond(['ok' => true] + $resultado);
