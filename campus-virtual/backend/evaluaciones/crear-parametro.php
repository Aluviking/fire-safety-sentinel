<?php
require __DIR__ . '/../bootstrap.php';

// Permite crear a mano un parámetro de evaluación nuevo (ej. "PARCIAL 2")
// para una asignatura + periodo puntual -- se inserta una fila editable en
// `evaluaciones` por cada matriculado de ese periodo, con nota en blanco
// lista para calificar. Al quedar en esa misma tabla, sale con origen 'q10'
// (= editable) en /evaluaciones/list.php sin tocar nada más ahí.
$user = require_auth();
require_permiso($user, 'academico.evaluaciones', 'editar');

$body      = json_body();
$asignatura = trim($body['asignatura'] ?? '');
$periodo    = trim($body['periodo'] ?? '');
$parametro  = trim($body['parametro'] ?? '');
$porcentajeRaw = $body['porcentaje'] ?? null;
$porcentaje = ($porcentajeRaw === null || $porcentajeRaw === '') ? null : (float) $porcentajeRaw;

if ($asignatura === '' || $periodo === '' || $parametro === '') {
    fail('Asignatura, periodo y nombre del parámetro son requeridos.');
}

$stmt = db()->prepare('SELECT id FROM asignaturas WHERE nombre = ?');
$stmt->execute([$asignatura]);
$asignaturaId = $stmt->fetchColumn();
if (!$asignaturaId) fail('Asignatura no encontrada.', 404);

if ($user['role'] === 'docente') require_gestion_asignatura($user, (int) $asignaturaId);

$stmt = db()->prepare(
    "SELECT DISTINCT e.identificacion,
            (SELECT GROUP_CONCAT(DISTINCT p2.nombre ORDER BY p2.nombre SEPARATOR ', ')
             FROM programa_asignaturas pa2 JOIN programas p2 ON p2.id = pa2.programa_id
             WHERE pa2.asignatura_id = ?) AS curso
     FROM programa_asignaturas pa
     JOIN programas p ON p.id = pa.programa_id
     JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO' AND m.periodo = ?
     JOIN estudiantes e ON e.id = m.estudiante_id
     WHERE pa.asignatura_id = ?"
);
$stmt->execute([$asignaturaId, $periodo, $asignaturaId]);
$matriculados = $stmt->fetchAll();
if (empty($matriculados)) fail('No hay matriculados en esa asignatura para ese periodo.');

$stmtCheck = db()->prepare(
    'SELECT 1 FROM evaluaciones WHERE asignatura = ? AND periodo = ? AND parametro = ? AND identificacion_estudiante = ? LIMIT 1'
);
$stmtInsert = db()->prepare(
    'INSERT INTO evaluaciones (codigo_curso, periodo, identificacion_estudiante, asignatura, parametro, porcentaje, nota, inasistencias, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, NULL)'
);
$creadas = 0;
foreach ($matriculados as $m) {
    $stmtCheck->execute([$asignatura, $periodo, $parametro, $m['identificacion']]);
    if ($stmtCheck->fetch()) continue;
    $stmtInsert->execute([$m['curso'], $periodo, $m['identificacion'], $asignatura, $parametro, $porcentaje]);
    $creadas++;
}

if ($creadas === 0) fail('Ese parámetro ya existe para todos los matriculados de este periodo.');

log_trace($user, 'evaluacion_crear_parametro', "Creó el parámetro \"$parametro\" en $asignatura ($periodo) para $creadas estudiantes");

respond(['ok' => true, 'creadas' => $creadas]);
