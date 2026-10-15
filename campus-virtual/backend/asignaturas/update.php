<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Un docente solo puede editar sus propias asignaturas (asignatura_docentes)
// -- nunca las de otro docente. Admin/Super Admin siempre pasan.
require_role($user, ['super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre de la asignatura es requerido.');

require_gestion_asignatura($user, $id);

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

// Resincroniza los programas vinculados — a diferencia de antes, ya NO se
// borran todos los vínculos y se reinsertan de cero: cada vínculo ahora
// guarda su propio nivel/créditos/IH/orden de pensum (Fase 20), y un borra-e-
// inserta ciego destruiría esa metadata cada vez que alguien solo edita el
// nombre de la asignatura desde su propio módulo. Se calcula la diferencia:
// solo se quitan los programas que de verdad se deseleccionaron, y solo se
// agregan los que de verdad son nuevos.
$stmt = db()->prepare('SELECT programa_id FROM programa_asignaturas WHERE asignatura_id = ?');
$stmt->execute([$id]);
$idsActuales = array_map('intval', array_column($stmt->fetchAll(), 'programa_id'));
$idsNuevos   = array_map('intval', is_array($body['programaIds'] ?? null) ? $body['programaIds'] : []);

foreach (array_diff($idsActuales, $idsNuevos) as $pid) {
    db()->prepare('DELETE FROM programa_asignatura_prerequisitos WHERE programa_id = ? AND (asignatura_id = ? OR prerequisito_asignatura_id = ?)')
        ->execute([$pid, $id, $id]);
    db()->prepare('DELETE FROM programa_asignaturas WHERE programa_id = ? AND asignatura_id = ?')->execute([$pid, $id]);
}
if (!empty(array_diff($idsNuevos, $idsActuales))) {
    $insert = db()->prepare('INSERT IGNORE INTO programa_asignaturas (programa_id, asignatura_id) VALUES (?, ?)');
    foreach (array_diff($idsNuevos, $idsActuales) as $pid) {
        $insert->execute([$pid, $id]);
    }
}

// Mismo tipo de sincronización por diferencia, para los docentes -- pero
// solo Admin/Super Admin pueden reasignar qué docentes dan esta asignatura;
// un docente no puede agregarse colegas ni quitarlos (eso sería verlos/
// tocarlos, justo lo que no debe pasar).
if (array_key_exists('docenteIds', $body) && in_array($user['role'], ['admin', 'super_admin'], true)) {
    $stmt = db()->prepare('SELECT docente_id FROM asignatura_docentes WHERE asignatura_id = ?');
    $stmt->execute([$id]);
    $docentesActuales = array_map('intval', array_column($stmt->fetchAll(), 'docente_id'));
    $docentesNuevos   = array_map('intval', is_array($body['docenteIds']) ? $body['docenteIds'] : []);

    foreach (array_diff($docentesActuales, $docentesNuevos) as $did) {
        db()->prepare('DELETE FROM asignatura_docentes WHERE asignatura_id = ? AND docente_id = ?')->execute([$id, $did]);
    }
    if (!empty(array_diff($docentesNuevos, $docentesActuales))) {
        $insert = db()->prepare('INSERT IGNORE INTO asignatura_docentes (asignatura_id, docente_id) VALUES (?, ?)');
        foreach (array_diff($docentesNuevos, $docentesActuales) as $did) {
            $insert->execute([$id, $did]);
        }
    }
}

log_trace($user, 'asignatura_update', "Editó a $nombre");
respond(['ok' => true]);
