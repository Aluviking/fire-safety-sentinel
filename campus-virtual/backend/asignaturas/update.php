<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre de la asignatura es requerido.');

$current = db()->prepare('SELECT * FROM asignaturas WHERE id = ?');
$current->execute([$id]);
$row = $current->fetch();
if (!$row) fail('Asignatura no encontrada.', 404);

$dup = db()->prepare('SELECT id FROM asignaturas WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otra asignatura con ese nombre.');

// El formulario básico y la pestaña Ajustes mandan sub-conjuntos distintos de
// campos — solo el que realmente vino en el body se actualiza (mismo patrón
// que programas/update.php), para no borrar la imagen/publicado/certificado
// al editar solo lo básico.
$field = fn(string $key, string $col) => array_key_exists($key, $body) ? $body[$key] : $row[$col];

db()->prepare(
    'UPDATE asignaturas SET codigo = ?, nombre = ?, abreviacion = ?, intensidad_semanal = ?,
        intensidad_total = ?, nivel = ?, num_creditos = ?, aplica_practica_laboral = ?,
        descripcion = ?, publicado = ?, dias_disponibles = ?, certificado_id = ?
     WHERE id = ?'
)->execute([
    $field('codigo', 'codigo'), $nombre, $field('abreviacion', 'abreviacion'),
    $field('intensidadSemanal', 'intensidad_semanal'), $field('intensidadTotal', 'intensidad_total'),
    $field('nivel', 'nivel'), $field('numCreditos', 'num_creditos'),
    $field('aplicaPracticaLaboral', 'aplica_practica_laboral'),
    $field('descripcion', 'descripcion'),
    array_key_exists('publicado', $body) ? (!empty($body['publicado']) ? 1 : 0) : $row['publicado'],
    $field('diasDisponibles', 'dias_disponibles'), $field('certificadoId', 'certificado_id'),
    $id,
]);

// Resincroniza los programas vinculados: borra los actuales y vuelve a
// insertar los que llegaron en la petición (mismo patrón que create.php).
db()->prepare('DELETE FROM programa_asignaturas WHERE asignatura_id = ?')->execute([$id]);
$programaIds = $body['programaIds'] ?? [];
if (is_array($programaIds)) {
    $stmt = db()->prepare('INSERT IGNORE INTO programa_asignaturas (programa_id, asignatura_id) VALUES (?, ?)');
    foreach ($programaIds as $pid) {
        $stmt->execute([(int) $pid, $id]);
    }
}

log_trace($user, 'asignatura_update', "Editó a $nombre");
respond(['ok' => true]);
