<?php
require __DIR__ . '/../bootstrap.php';

// Ya NO se usa la tabla asignatura_estudiantes (matrícula manual aparte, sin
// UI desde que el contenido de asignaturas pasó a administrarse solo desde
// el pensum del programa) — el estudiante hereda el acceso a una asignatura
// por estar matriculado en un programa que la trae en su pensum, mismo
// puente que ya usa require_acceso_asignatura() en bootstrap.php.

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

$asignaturaId = (int) ($_GET['asignaturaId'] ?? 0);
if ($asignaturaId === 0) fail('asignaturaId requerido.');

// Un docente solo ve los estudiantes de las asignaturas que de verdad dicta.
if ($user['role'] === 'docente') require_gestion_asignatura($user, $asignaturaId);

$stmt = db()->prepare(
    "SELECT m.id, e.id AS estudiante_id, m.estado, m.created_at, e.identificacion, e.nombre_completo, p.id AS programa_id, p.nombre AS programa_nombre,
            m.mostrar_notas, m.mostrar_certificado
     FROM programa_asignaturas pa
     JOIN programas p ON p.id = pa.programa_id
     JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
     JOIN estudiantes e ON e.id = m.estudiante_id
     WHERE pa.asignatura_id = ?
     ORDER BY e.nombre_completo"
);
$stmt->execute([$asignaturaId]);
$rows = $stmt->fetchAll();

// Mismo marcado de origen por empresa que programa-matriculas/list.php --
// aquí cada fila ya sabe por cuál programa entró (puede ser más de uno si la
// asignatura está en varios pensums), así que se cruza por ESE programa
// puntual, sin ambigüedad.
$programaIds = array_values(array_unique(array_column($rows, 'programa_id')));
if (!empty($programaIds)) {
    $placeholders = implode(',', array_fill(0, count($programaIds), '?'));
    $stmt = db()->prepare("SELECT id, programa_id, razon_social FROM curso_empresas WHERE programa_id IN ($placeholders)");
    $stmt->execute($programaIds);
    $empresasPorPrograma = [];
    foreach ($stmt->fetchAll() as $e) { $empresasPorPrograma[$e['programa_id']][] = $e; }

    if (!empty($empresasPorPrograma)) {
        $empresaIds = [];
        foreach ($empresasPorPrograma as $lista) { foreach ($lista as $e) { $empresaIds[] = (int) $e['id']; } }
        $placeholders2 = implode(',', array_fill(0, count($empresaIds), '?'));
        $stmt = db()->prepare("SELECT identificacion, empresa_id FROM curso_empresa_empleados WHERE empresa_id IN ($placeholders2)");
        $stmt->execute($empresaIds);
        $empresaPorIdentificacion = [];
        foreach ($stmt->fetchAll() as $emp) { $empresaPorIdentificacion[$emp['identificacion']] = $emp['empresa_id']; }
        $nombrePorEmpresaId = [];
        foreach ($empresasPorPrograma as $lista) { foreach ($lista as $e) { $nombrePorEmpresaId[$e['id']] = $e['razon_social']; } }
    }
}

foreach ($rows as &$r) {
    $empresasDeEsteProgramaa = $empresasPorPrograma[$r['programa_id']] ?? [];
    if (empty($empresasDeEsteProgramaa)) { $r['empresa'] = null; $r['fueraDeBaseDe'] = null; continue; }
    $empresaId = $empresaPorIdentificacion[$r['identificacion']] ?? null;
    if ($empresaId !== null && in_array($empresaId, array_column($empresasDeEsteProgramaa, 'id'), true)) {
        $r['empresa'] = $nombrePorEmpresaId[$empresaId];
        $r['fueraDeBaseDe'] = null;
    } else {
        $r['empresa'] = null;
        $r['fueraDeBaseDe'] = implode(', ', array_column($empresasDeEsteProgramaa, 'razon_social'));
    }
}
unset($r);

respond(['ok' => true, 'matriculados' => $rows]);
