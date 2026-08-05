<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del programa es requerido.');

$stmt = db()->prepare('SELECT id FROM programas WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe un programa con ese nombre.');

db()->prepare(
    'INSERT INTO programas (codigo, nombre, pensum, abreviacion, num_resolucion, fecha_resolucion,
        disponible_oferta_laboral, estado, aplica_preinscripcion)
     VALUES (?,?,?,?,?,?,?,?,?)'
)->execute([
    $body['codigo'] ?? null, $nombre, $body['pensum'] ?? null, $body['abreviacion'] ?? null,
    $body['numResolucion'] ?? null, $body['fechaResolucion'] ?? null,
    $body['disponibleOfertaLaboral'] ?? 'Sí', $body['estado'] ?? 'Activo', $body['aplicaPreinscripcion'] ?? 'No',
]);

respond(['ok' => true, 'programa' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
