<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM programas WHERE id = ?');
$stmt->execute([$id]);
$programa = $stmt->fetch();
if (!$programa) fail('Programa no encontrado.', 404);

db()->prepare(
    'UPDATE programas SET pensum_nombre = ?, porcentaje_inasistencia = ?, nota_aprobacion = ?, valor_maximo_calificacion = ?
     WHERE id = ?'
)->execute([
    trim($body['pensumNombre'] ?? '') ?: 'PENSUM',
    $body['porcentajeInasistencia'] ?? null, $body['notaAprobacion'] ?? null, $body['valorMaximoCalificacion'] ?? null,
    $id,
]);

log_trace($user, 'programa_update', "Editó el pensum de {$programa['nombre']}");
respond(['ok' => true]);
