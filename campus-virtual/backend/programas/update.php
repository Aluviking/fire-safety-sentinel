<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del programa es requerido.');

$dup = db()->prepare('SELECT id FROM programas WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otro programa con ese nombre.');

db()->prepare(
    'UPDATE programas SET codigo = ?, nombre = ?, pensum = ?, abreviacion = ?, num_resolucion = ?,
        fecha_resolucion = ?, disponible_oferta_laboral = ?, estado = ?, aplica_preinscripcion = ?
     WHERE id = ?'
)->execute([
    $body['codigo'] ?? null, $nombre, $body['pensum'] ?? null, $body['abreviacion'] ?? null,
    $body['numResolucion'] ?? null, $body['fechaResolucion'] ?? null,
    $body['disponibleOfertaLaboral'] ?? 'Sí', $body['estado'] ?? 'Activo', $body['aplicaPreinscripcion'] ?? 'No',
    $id,
]);

log_trace($user, 'programa_update', "Editó a $nombre");
respond(['ok' => true]);
