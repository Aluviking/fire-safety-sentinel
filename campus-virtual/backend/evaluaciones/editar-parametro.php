<?php
require __DIR__ . '/../bootstrap.php';

// Renombra un parámetro ya creado (a mano o legado de Q10) y/o le cambia el
// peso -- aplica a TODAS las filas de esa asignatura+periodo que tengan ese
// parámetro (la columna completa), no fila por fila.
$user = require_auth();
require_permiso($user, 'academico.evaluaciones', 'editar');

$body           = json_body();
$asignatura     = trim($body['asignatura'] ?? '');
$periodo        = trim($body['periodo'] ?? '');
$parametroActual = trim($body['parametroActual'] ?? '');
$parametroNuevo  = trim($body['parametroNuevo'] ?? '');
$porcentajeRaw   = $body['porcentaje'] ?? null;
$porcentaje      = ($porcentajeRaw === null || $porcentajeRaw === '') ? null : (float) $porcentajeRaw;

if ($asignatura === '' || $periodo === '' || $parametroActual === '' || $parametroNuevo === '') {
    fail('Asignatura, periodo y nombre del parámetro son requeridos.');
}

$stmt = db()->prepare('SELECT id FROM asignaturas WHERE nombre = ?');
$stmt->execute([$asignatura]);
$asignaturaId = $stmt->fetchColumn();
if ($asignaturaId && $user['role'] === 'docente') require_gestion_asignatura($user, (int) $asignaturaId);

// No permitir que el nuevo nombre choque con OTRO parámetro ya existente en
// esa misma asignatura+periodo -- eso fusionaría dos columnas sin querer y
// se perdería la mitad de las notas.
if ($parametroNuevo !== $parametroActual) {
    $stmt = db()->prepare(
        'SELECT 1 FROM evaluaciones WHERE asignatura = ? AND periodo = ? AND parametro = ? LIMIT 1'
    );
    $stmt->execute([$asignatura, $periodo, $parametroNuevo]);
    if ($stmt->fetch()) fail('Ya existe un parámetro con ese nombre en esta asignatura y periodo.');
}

$stmt = db()->prepare(
    'UPDATE evaluaciones SET parametro = ?, porcentaje = ? WHERE asignatura = ? AND periodo = ? AND parametro = ?'
);
$stmt->execute([$parametroNuevo, $porcentaje, $asignatura, $periodo, $parametroActual]);

log_trace($user, 'evaluacion_editar_parametro', "Editó el parámetro \"$parametroActual\" -> \"$parametroNuevo\" en $asignatura ($periodo)");

respond(['ok' => true, 'actualizadas' => $stmt->rowCount()]);
