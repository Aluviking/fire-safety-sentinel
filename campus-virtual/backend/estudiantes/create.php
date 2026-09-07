<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body           = json_body();
$identificacion = trim($body['identificacion'] ?? '');
$nombreCompleto = trim($body['nombreCompleto'] ?? '');
$genero         = $body['genero'] ?? null;
$tipoDocumento  = $body['tipoDocumento'] ?? null;
$celular        = $body['celular'] ?? null;
$correo         = $body['correo'] ?? null;
$sisben         = $body['subgrupoSisben'] ?? null;

// Datos de matrícula (opcionales — se crea la matrícula inicial junto al estudiante).
$periodo  = $body['periodo'] ?? null;
$sede     = $body['sede'] ?? null;
$programa = $body['programa'] ?? null;

if ($identificacion === '' || $nombreCompleto === '') fail('Identificación y nombre completo son requeridos.');

$stmt = db()->prepare('SELECT id FROM estudiantes WHERE identificacion = ?');
$stmt->execute([$identificacion]);
if ($stmt->fetch()) fail('Ya existe un estudiante con esa identificación.');

db()->prepare(
    'INSERT INTO estudiantes (identificacion, nombre_completo, genero, tipo_documento, celular, correo, subgrupo_sisben)
     VALUES (?,?,?,?,?,?,?)'
)->execute([$identificacion, $nombreCompleto, $genero, $tipoDocumento, $celular, $correo, $sisben]);

$estudianteId = (int) db()->lastInsertId();

if ($periodo || $sede || $programa) {
    db()->prepare(
        "INSERT INTO matriculas (estudiante_id, estado, formalizada, sede, programa, periodo) VALUES (?, 'Activo', 1, ?, ?, ?)"
    )->execute([$estudianteId, $sede, $programa, $periodo]);
}

// Cuenta de acceso automática (rol estudiante) — usuario y clave son
// siempre la identificación.
$cuentaCreada = crear_cuenta_acceso_automatica($identificacion, $nombreCompleto, 'estudiante', $correo, 'estudiantes.gfoacademy.local');

respond(['ok' => true, 'estudiante' => ['id' => $estudianteId, 'identificacion' => $identificacion, 'nombreCompleto' => $nombreCompleto], 'cuentaCreada' => $cuentaCreada]);
