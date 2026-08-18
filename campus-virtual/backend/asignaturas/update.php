<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre de la asignatura es requerido.');

$dup = db()->prepare('SELECT id FROM asignaturas WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otra asignatura con ese nombre.');

db()->prepare(
    'UPDATE asignaturas SET codigo = ?, nombre = ?, abreviacion = ?, intensidad_semanal = ?,
        intensidad_total = ?, nivel = ?, num_creditos = ?, aplica_practica_laboral = ?
     WHERE id = ?'
)->execute([
    $body['codigo'] ?? null, $nombre, $body['abreviacion'] ?? null,
    $body['intensidadSemanal'] ?? null, $body['intensidadTotal'] ?? null, $body['nivel'] ?? null,
    $body['numCreditos'] ?? null, $body['aplicaPracticaLaboral'] ?? 'No',
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
