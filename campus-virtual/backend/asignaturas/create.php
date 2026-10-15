<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente puede crear asignaturas, pero queda como dueño SOLO de la que
// crea (ver bloque de docenteIds más abajo, forzado a sí mismo) -- nunca
// puede asignar la asignatura a otro docente ni ver las de sus colegas
// (candado real en update.php/delete.php vía require_gestion_asignatura()).
require_role($user, ['admin', 'super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre de la asignatura es requerido.');

$stmt = db()->prepare('SELECT id FROM asignaturas WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe una asignatura con ese nombre.');

db()->prepare(
    'INSERT INTO asignaturas (codigo, nombre, abreviacion, intensidad_semanal, intensidad_total, nivel,
        num_creditos, aplica_practica_laboral, descripcion)
     VALUES (?,?,?,?,?,?,?,?,?)'
)->execute([
    $body['codigo'] ?? null, $nombre, $body['abreviacion'] ?? null,
    $body['intensidadSemanal'] ?? null, $body['intensidadTotal'] ?? null, $body['nivel'] ?? null,
    $body['numCreditos'] ?? null, $body['aplicaPracticaLaboral'] ?? 'No', $body['descripcion'] ?? null,
]);
$asignaturaId = (int) db()->lastInsertId();

// Se puede reutilizar en varios programas desde el momento en que se crea.
$programaIds = $body['programaIds'] ?? [];
if (is_array($programaIds)) {
    $stmt = db()->prepare('INSERT IGNORE INTO programa_asignaturas (programa_id, asignatura_id) VALUES (?, ?)');
    foreach ($programaIds as $pid) {
        $stmt->execute([(int) $pid, $asignaturaId]);
    }
}

// Puede tener varios docentes desde el momento en que se crea -- pero si
// quien crea es un docente, se ignora lo que venga del body y se fuerza a
// que quede ligada SOLO a sí mismo (no puede asignarse a otro docente que
// no sea él, ni dejar la asignatura sin dueño donde ni él mismo la vería).
$docenteIds = $body['docenteIds'] ?? [];
if ($user['role'] === 'docente') {
    $docente = db()->prepare('SELECT id FROM docentes WHERE identificacion = ?');
    $docente->execute([$user['identificacion'] ?? '']);
    $propioId = $docente->fetchColumn();
    $docenteIds = $propioId ? [$propioId] : [];
}
if (is_array($docenteIds)) {
    $stmt = db()->prepare('INSERT IGNORE INTO asignatura_docentes (asignatura_id, docente_id) VALUES (?, ?)');
    foreach ($docenteIds as $did) {
        $stmt->execute([$asignaturaId, (int) $did]);
    }
}

respond(['ok' => true, 'asignatura' => ['id' => $asignaturaId, 'nombre' => $nombre]]);
