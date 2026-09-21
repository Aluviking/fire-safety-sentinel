<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

// Acción explícita y deliberada del cliente: para TODOS los estudiantes que
// ya tienen cuenta de acceso, forzar usuario = clave = identificación (el
// dato real de su ficha), sin importar qué tuvieran antes — cuentas creadas
// a mano hace tiempo con usuario/clave distintos quedan alineadas. Cierra
// las sesiones activas de cada cuenta que se cambia, para que tengan que
// volver a entrar con la clave nueva. Seguro de volver a correr cuando haga
// falta (idempotente).

$rows = db()->query(
    "SELECT id, identificacion FROM users WHERE role = 'estudiante' AND identificacion IS NOT NULL AND identificacion != ''"
)->fetchAll();

$actualizados = 0;
$omitidos = 0;

$updateStmt         = db()->prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?');
$dupStmt            = db()->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
$deleteSessionsStmt = db()->prepare('DELETE FROM sessions WHERE user_id = ?');

foreach ($rows as $row) {
    $dupStmt->execute([$row['identificacion'], $row['id']]);
    if ($dupStmt->fetch()) { $omitidos++; continue; }

    $hash = password_hash($row['identificacion'], PASSWORD_DEFAULT);
    $updateStmt->execute([$row['identificacion'], $hash, $row['id']]);
    $deleteSessionsStmt->execute([$row['id']]);
    $actualizados++;
}

// Estudiantes que todavía NO tienen cuenta (por ejemplo, porque su correo ya
// lo usaba otra cuenta y antes se saltaba la creación) — se les crea ahora.
$sinCuenta = db()->query(
    "SELECT e.identificacion, e.nombre_completo, e.correo FROM estudiantes e
     WHERE e.identificacion IS NOT NULL AND e.identificacion != ''
       AND NOT EXISTS (SELECT 1 FROM users u WHERE u.identificacion = e.identificacion)"
)->fetchAll();

$creadas = 0;
foreach ($sinCuenta as $e) {
    if (crear_cuenta_acceso_automatica($e['identificacion'], $e['nombre_completo'], 'estudiante', $e['correo'], 'estudiantes.gfoacademy.local')) {
        $creadas++;
    }
}

log_trace(
    $user, 'reset_claves_estudiantes',
    "Restableció usuario=clave=identificación para $actualizados estudiantes, creó $creadas cuentas faltantes ($omitidos omitidos por choque de usuario)"
);

respond(['ok' => true, 'actualizados' => $actualizados, 'creadas' => $creadas, 'omitidos' => $omitidos]);
