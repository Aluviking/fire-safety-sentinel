<?php
require __DIR__ . '/../bootstrap.php';

// PÚBLICO a propósito — el formulario de inscripción lo llena un prospecto
// que todavía no tiene cuenta ni ficha de estudiante.

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body           = json_body();
$nombres        = trim($body['nombres'] ?? '');
$apellidos      = trim($body['apellidos'] ?? '');
$tipoDocumento  = trim($body['tipoDocumento'] ?? '') ?: null;
$identificacion = trim($body['identificacion'] ?? '');
$celular        = trim($body['celular'] ?? '') ?: null;
$correo         = trim($body['correo'] ?? '') ?: null;
$tipoInteres    = $body['tipoInteres'] ?? '';
$itemNombre     = trim($body['itemNombre'] ?? '');

if ($nombres === '' || $apellidos === '' || $identificacion === '') {
    fail('Nombres, apellidos e identificación son requeridos.');
}
if (!in_array($tipoInteres, ['curso', 'programa', 'diplomado'], true) || $itemNombre === '') {
    fail('Selecciona a qué te quieres inscribir.');
}

db()->prepare(
    'INSERT INTO preinscripciones (nombres, apellidos, tipo_documento, identificacion, celular, correo, tipo_interes, item_nombre)
     VALUES (?,?,?,?,?,?,?,?)'
)->execute([$nombres, $apellidos, $tipoDocumento, $identificacion, $celular, $correo, $tipoInteres, $itemNombre]);

respond(['ok' => true]);
