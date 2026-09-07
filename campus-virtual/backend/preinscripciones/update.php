<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body           = json_body();
$id             = (int) ($body['id'] ?? 0);
$nombres        = trim($body['nombres'] ?? '');
$apellidos      = trim($body['apellidos'] ?? '');
$tipoDocumento  = trim($body['tipoDocumento'] ?? '') ?: null;
$identificacion = trim($body['identificacion'] ?? '');
$celular        = trim($body['celular'] ?? '') ?: null;
$correo         = trim($body['correo'] ?? '') ?: null;
$tipoInteres    = $body['tipoInteres'] ?? '';
$itemNombre     = trim($body['itemNombre'] ?? '');

if ($id === 0 || $nombres === '' || $apellidos === '' || $identificacion === '') {
    fail('Nombres, apellidos e identificación son requeridos.');
}
if (!in_array($tipoInteres, ['curso', 'programa', 'diplomado'], true) || $itemNombre === '') {
    fail('Selecciona a qué se inscribió.');
}

$stmt = db()->prepare('SELECT * FROM preinscripciones WHERE id = ?');
$stmt->execute([$id]);
$pre = $stmt->fetch();
if (!$pre) fail('Preinscripción no encontrada.', 404);

db()->prepare(
    'UPDATE preinscripciones SET nombres = ?, apellidos = ?, tipo_documento = ?, identificacion = ?,
        celular = ?, correo = ?, tipo_interes = ?, item_nombre = ? WHERE id = ?'
)->execute([$nombres, $apellidos, $tipoDocumento, $identificacion, $celular, $correo, $tipoInteres, $itemNombre, $id]);

// Si ya se matriculó, el estudiante real que se creó desde acá debe quedar
// sincronizado — sin esto, corregir un dato aquí después de matricular no
// serviría de nada porque el estudiante real seguiría con el dato viejo.
if ($pre['estado'] === 'Matriculado' && $pre['estudiante_id']) {
    $dup = db()->prepare('SELECT id FROM estudiantes WHERE identificacion = ? AND id != ?');
    $dup->execute([$identificacion, $pre['estudiante_id']]);
    if (!$dup->fetch()) {
        db()->prepare(
            'UPDATE estudiantes SET nombre_completo = ?, tipo_documento = ?, identificacion = ?, celular = ?, correo = ? WHERE id = ?'
        )->execute([trim("$nombres $apellidos"), $tipoDocumento, $identificacion, $celular, $correo, $pre['estudiante_id']]);
    }
}

log_trace($user, 'preinscripcion_update', "Editó la inscripción de $nombres $apellidos");

respond(['ok' => true]);
