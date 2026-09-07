<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM preinscripciones WHERE id = ?');
$stmt->execute([$id]);
$pre = $stmt->fetch();
if (!$pre) fail('Preinscripción no encontrada.', 404);
if ($pre['estado'] === 'Matriculado') fail('Esta preinscripción ya fue matriculada.');

$nombreCompleto = trim($pre['nombres'] . ' ' . $pre['apellidos']);
$identificacion = $pre['identificacion'];

// Si ya existe una ficha de estudiante con esa identificación (pudo crearse
// por otro lado mientras tanto), se reutiliza en vez de duplicar.
$dupStmt = db()->prepare('SELECT id FROM estudiantes WHERE identificacion = ?');
$dupStmt->execute([$identificacion]);
$existente = $dupStmt->fetch();

if ($existente) {
    $estudianteId = (int) $existente['id'];
} else {
    db()->prepare(
        'INSERT INTO estudiantes (identificacion, nombre_completo, celular, correo) VALUES (?,?,?,?)'
    )->execute([$identificacion, $nombreCompleto, $pre['celular'], $pre['correo']]);
    $estudianteId = (int) db()->lastInsertId();
}

// Matrícula real — las 3 categorías (curso/programa/diplomado) son la misma
// tabla `programas`, separadas solo por el prefijo del nombre real.
if (in_array($pre['tipo_interes'], ['curso', 'programa', 'diplomado'], true)) {
    db()->prepare(
        "INSERT INTO matriculas (estudiante_id, estado, formalizada, programa) VALUES (?, 'Activo', 1, ?)"
    )->execute([$estudianteId, $pre['item_nombre']]);
}

// Cuenta de acceso automática (rol estudiante) — usuario y clave son la identificación.
$cuentaCreada = crear_cuenta_acceso_automatica($identificacion, $nombreCompleto, 'estudiante', $pre['correo'], 'estudiantes.gfoacademy.local');

db()->prepare("UPDATE preinscripciones SET estado = 'Matriculado', estudiante_id = ? WHERE id = ?")->execute([$estudianteId, $id]);

log_trace($user, 'preinscripcion_matricular', "Matriculó a $nombreCompleto ({$pre['item_nombre']}) desde una preinscripción");

respond(['ok' => true, 'estudianteId' => $estudianteId, 'cuentaCreada' => $cuentaCreada]);
