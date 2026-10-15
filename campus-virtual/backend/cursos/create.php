<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente puede crear cursos, pero queda como dueño SOLO del que crea
// (docente_identificacion/docente_nombre se fuerzan a sí mismo más abajo,
// ignorando lo que venga del body) -- nunca ve ni edita los de otro
// docente (candado real en update.php/delete.php vía require_gestion_curso()).
require_role($user, ['admin', 'super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body        = json_body();
$codigoNombre = trim($body['codigoNombre'] ?? '');
$programaId   = $body['programaId'] ?? null;
$asignaturaId = $body['asignaturaId'] ?? null;
$jornada      = trim($body['jornada'] ?? '');

if ($codigoNombre === '' || !$programaId || !$asignaturaId) {
    fail('Nombre del curso, programa y asignatura son requeridos.');
}

$stmt = db()->prepare('SELECT nombre FROM programas WHERE id = ?');
$stmt->execute([$programaId]);
$programa = $stmt->fetch();
if (!$programa) fail('Programa no encontrado.', 404);

$stmt = db()->prepare('SELECT nombre FROM asignaturas WHERE id = ?');
$stmt->execute([$asignaturaId]);
$asignatura = $stmt->fetch();
if (!$asignatura) fail('Asignatura no encontrada.', 404);

$descripcion = $programa['nombre'] . ' - ' . $asignatura['nombre'] . ($jornada !== '' ? " - $jornada" : '');

// Si quien crea es docente, el curso queda a su propio nombre sin importar
// lo que venga del body -- no puede crear un curso a nombre de otro docente.
$docenteIdentificacion = $user['role'] === 'docente' ? ($user['identificacion'] ?? null) : ($body['docenteIdentificacion'] ?? null);
$docenteNombre         = $user['role'] === 'docente' ? ($user['nombre'] ?? null) : ($body['docenteNombre'] ?? null);

db()->prepare(
    'INSERT INTO cursos (codigo_nombre, programa_id, asignatura_id, programa_asignatura_jornada, tipo_evaluacion,
        cupo_maximo, fecha_inicio, fecha_fin, aula, cerrado, archivado, docente_identificacion, docente_nombre,
        horario, periodo)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
)->execute([
    $codigoNombre, $programaId, $asignaturaId, $descripcion, $body['tipoEvaluacion'] ?? 'CUANTITATIVO',
    $body['cupoMaximo'] ?? null, $body['fechaInicio'] ?? null, $body['fechaFin'] ?? null, $body['aula'] ?? null,
    'NO', 'NO', $docenteIdentificacion, $docenteNombre,
    $body['horario'] ?? null, $body['periodo'] ?? null,
]);

respond(['ok' => true, 'curso' => ['id' => (int) db()->lastInsertId(), 'codigoNombre' => $codigoNombre]]);
