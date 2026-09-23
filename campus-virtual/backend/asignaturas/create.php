<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente tiene edicion completa en Cursos/Programas/Diplomados, igual
// que Super Admin (no solo lo que tiene asignado) -- pedido explicito del
// cliente, aplica a TODOS los docentes por rol, no por cuenta puntual.
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
        num_creditos, aplica_practica_laboral)
     VALUES (?,?,?,?,?,?,?,?)'
)->execute([
    $body['codigo'] ?? null, $nombre, $body['abreviacion'] ?? null,
    $body['intensidadSemanal'] ?? null, $body['intensidadTotal'] ?? null, $body['nivel'] ?? null,
    $body['numCreditos'] ?? null, $body['aplicaPracticaLaboral'] ?? 'No',
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

// Puede tener varios docentes desde el momento en que se crea.
$docenteIds = $body['docenteIds'] ?? [];
if (is_array($docenteIds)) {
    $stmt = db()->prepare('INSERT IGNORE INTO asignatura_docentes (asignatura_id, docente_id) VALUES (?, ?)');
    foreach ($docenteIds as $did) {
        $stmt->execute([$asignaturaId, (int) $did]);
    }
}

respond(['ok' => true, 'asignatura' => ['id' => $asignaturaId, 'nombre' => $nombre]]);
