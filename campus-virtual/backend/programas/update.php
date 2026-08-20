<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del programa es requerido.');

$current = db()->prepare('SELECT * FROM programas WHERE id = ?');
$current->execute([$id]);
$row = $current->fetch();
if (!$row) fail('Programa no encontrado.', 404);

$dup = db()->prepare('SELECT id FROM programas WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otro programa con ese nombre.');

// El formulario básico (Programas) y la pestaña Ajustes (dentro de un
// programa) mandan sub-conjuntos distintos de campos — solo el campo que
// realmente vino en el body se actualiza, el resto conserva su valor actual,
// para que editar lo básico no borre la imagen/publicado/certificado ya
// configurados desde Ajustes (y viceversa).
$field = fn(string $key, string $col) => array_key_exists($key, $body) ? $body[$key] : $row[$col];

db()->prepare(
    'UPDATE programas SET codigo = ?, nombre = ?, pensum = ?, abreviacion = ?, num_resolucion = ?,
        fecha_resolucion = ?, disponible_oferta_laboral = ?, estado = ?, aplica_preinscripcion = ?,
        aplica_grupos = ?, categoria = ?, descripcion = ?, publicado = ?, dias_disponibles = ?, certificado_id = ?
     WHERE id = ?'
)->execute([
    $field('codigo', 'codigo'), $nombre, $field('pensum', 'pensum'), $field('abreviacion', 'abreviacion'),
    $field('numResolucion', 'num_resolucion'), $field('fechaResolucion', 'fecha_resolucion'),
    $field('disponibleOfertaLaboral', 'disponible_oferta_laboral'), $field('estado', 'estado'),
    $field('aplicaPreinscripcion', 'aplica_preinscripcion'), $field('aplicaGrupos', 'aplica_grupos'),
    $field('categoria', 'categoria'),
    $field('descripcion', 'descripcion'),
    array_key_exists('publicado', $body) ? (!empty($body['publicado']) ? 1 : 0) : $row['publicado'],
    $field('diasDisponibles', 'dias_disponibles'), $field('certificadoId', 'certificado_id'),
    $id,
]);

log_trace($user, 'programa_update', "Editó a $nombre");
respond(['ok' => true]);
