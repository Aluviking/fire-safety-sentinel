<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente tiene edicion completa en Cursos/Cursos ligeros, igual que
// Super Admin -- mismo pedido explicito del cliente ya aplicado en
// Programas/Asignaturas.
require_role($user, ['super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$id           = (int) ($body['id'] ?? 0);
$codigoNombre = trim($body['codigoNombre'] ?? '');
$programaId   = $body['programaId'] ?? null;
$asignaturaId = $body['asignaturaId'] ?? null;

if ($id === 0 || $codigoNombre === '' || !$programaId || !$asignaturaId) {
    fail('Nombre del curso, programa y asignatura son requeridos.');
}

$current = db()->prepare('SELECT * FROM cursos WHERE id = ?');
$current->execute([$id]);
$row = $current->fetch();
if (!$row) fail('Curso no encontrado.', 404);

$stmt = db()->prepare('SELECT nombre FROM programas WHERE id = ?');
$stmt->execute([$programaId]);
$programa = $stmt->fetch();
if (!$programa) fail('Programa no encontrado.', 404);

$stmt = db()->prepare('SELECT nombre FROM asignaturas WHERE id = ?');
$stmt->execute([$asignaturaId]);
$asignatura = $stmt->fetch();
if (!$asignatura) fail('Asignatura no encontrada.', 404);

// El formulario básico (Cursos) manda jornada + los campos operativos
// (tipoEvaluacion/cupoMaximo/fechas/aula/docente/horario/periodo), mientras
// que la pestaña Ajustes (dentro de un curso) manda un sub-conjunto distinto
// (descripcion/publicado/diasDisponibles/certificadoId) — solo el campo que
// realmente vino en el body se actualiza, el resto conserva su valor actual,
// igual patrón ya aplicado en programas/update.php y asignaturas/update.php.
$field = fn(string $key, string $col) => array_key_exists($key, $body) ? $body[$key] : $row[$col];

$jornadaTexto = array_key_exists('jornada', $body)
    ? ($programa['nombre'] . ' - ' . $asignatura['nombre'] . (trim((string) $body['jornada']) !== '' ? ' - ' . trim((string) $body['jornada']) : ''))
    : $row['programa_asignatura_jornada'];

db()->prepare(
    'UPDATE cursos SET codigo_nombre = ?, programa_id = ?, asignatura_id = ?, programa_asignatura_jornada = ?,
        tipo_evaluacion = ?, cupo_maximo = ?, fecha_inicio = ?, fecha_fin = ?, aula = ?, cerrado = ?,
        docente_identificacion = ?, docente_nombre = ?, horario = ?, periodo = ?,
        descripcion = ?, publicado = ?, dias_disponibles = ?, certificado_id = ?
     WHERE id = ?'
)->execute([
    $codigoNombre, $programaId, $asignaturaId, $jornadaTexto,
    $field('tipoEvaluacion', 'tipo_evaluacion'), $field('cupoMaximo', 'cupo_maximo'),
    $field('fechaInicio', 'fecha_inicio'), $field('fechaFin', 'fecha_fin'), $field('aula', 'aula'),
    $field('cerrado', 'cerrado'), $field('docenteIdentificacion', 'docente_identificacion'),
    $field('docenteNombre', 'docente_nombre'), $field('horario', 'horario'), $field('periodo', 'periodo'),
    $field('descripcion', 'descripcion'),
    array_key_exists('publicado', $body) ? (!empty($body['publicado']) ? 1 : 0) : $row['publicado'],
    $field('diasDisponibles', 'dias_disponibles'), $field('certificadoId', 'certificado_id'),
    $id,
]);

log_trace($user, 'curso_update', "Editó a $codigoNombre");
respond(['ok' => true]);
