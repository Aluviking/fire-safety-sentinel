<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$id           = (int) ($body['id'] ?? 0);
$codigoNombre = trim($body['codigoNombre'] ?? '');
$programaId   = $body['programaId'] ?? null;
$asignaturaId = $body['asignaturaId'] ?? null;
$jornada      = trim($body['jornada'] ?? '');

if ($id === 0 || $codigoNombre === '' || !$programaId || !$asignaturaId) {
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
    'UPDATE cursos SET codigo_nombre = ?, programa_id = ?, asignatura_id = ?, programa_asignatura_jornada = ?,
        tipo_evaluacion = ?, cupo_maximo = ?, fecha_inicio = ?, fecha_fin = ?, aula = ?, cerrado = ?,
        docente_identificacion = ?, docente_nombre = ?, horario = ?, periodo = ?
     WHERE id = ?'
)->execute([
    $codigoNombre, $programaId, $asignaturaId, $descripcion, $body['tipoEvaluacion'] ?? 'CUANTITATIVO',
    $body['cupoMaximo'] ?? null, $body['fechaInicio'] ?? null, $body['fechaFin'] ?? null, $body['aula'] ?? null,
    $body['cerrado'] ?? 'NO', $body['docenteIdentificacion'] ?? null, $body['docenteNombre'] ?? null,
    $body['horario'] ?? null, $body['periodo'] ?? null,
    $id,
]);

log_trace($user, 'curso_update', "Editó a $codigoNombre");
respond(['ok' => true]);
