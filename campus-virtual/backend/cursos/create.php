<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente tiene edicion completa en Cursos/Cursos ligeros, igual que
// Super Admin -- mismo pedido explicito del cliente ya aplicado en
// Programas/Asignaturas.
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

db()->prepare(
    'INSERT INTO cursos (codigo_nombre, programa_id, asignatura_id, programa_asignatura_jornada, tipo_evaluacion,
        cupo_maximo, fecha_inicio, fecha_fin, aula, cerrado, archivado, docente_identificacion, docente_nombre,
        horario, periodo)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
)->execute([
    $codigoNombre, $programaId, $asignaturaId, $descripcion, $body['tipoEvaluacion'] ?? 'CUANTITATIVO',
    $body['cupoMaximo'] ?? null, $body['fechaInicio'] ?? null, $body['fechaFin'] ?? null, $body['aula'] ?? null,
    'NO', 'NO', $body['docenteIdentificacion'] ?? null, $body['docenteNombre'] ?? null,
    $body['horario'] ?? null, $body['periodo'] ?? null,
]);

respond(['ok' => true, 'curso' => ['id' => (int) db()->lastInsertId(), 'codigoNombre' => $codigoNombre]]);
