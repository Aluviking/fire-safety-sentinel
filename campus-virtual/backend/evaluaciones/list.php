<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.evaluaciones');

// Filtro opcional por estudiante puntual (ej. desde el panel de detalle de
// un estudiante dentro de Programa) -- sin esto, admin/super_admin
// recibían la tabla entera solo para filtrar un estudiante en el navegador.
$identificacion = trim($_GET['identificacion'] ?? '');
$esDocente = $user['role'] === 'docente';
$idDocente = (string) ($user['identificacion'] ?? '');

if ($esDocente && $idDocente === '') {
    respond(['ok' => true, 'evaluaciones' => []]);
}

$rows = [];

// ══════════════════════════════════════════════════════════════════════
// 1) Histórico importado de Q10 -- "data antigua" (no se vuelve a importar,
//    queda tal como llegó; el campo `origen` es lo que el frontend usa para
//    marcarla como antigua, nunca se expone la palabra "Q10" en pantalla).
// ══════════════════════════════════════════════════════════════════════
if ($esDocente) {
    $sql = "SELECT e.* FROM evaluaciones e
         WHERE EXISTS (
           SELECT 1 FROM cursos c
           WHERE c.docente_identificacion = ?
             AND c.periodo = e.periodo
             AND c.programa_asignatura_jornada LIKE CONCAT('%', e.asignatura, '%')
         )";
    $params = [$idDocente];
    if ($identificacion !== '') { $sql .= ' AND e.identificacion_estudiante = ?'; $params[] = $identificacion; }
    $stmt = db()->prepare($sql . ' ORDER BY e.id DESC');
    $stmt->execute($params);
    $antiguas = $stmt->fetchAll();
} elseif ($identificacion !== '') {
    $stmt = db()->prepare('SELECT * FROM evaluaciones WHERE identificacion_estudiante = ? ORDER BY id DESC');
    $stmt->execute([$identificacion]);
    $antiguas = $stmt->fetchAll();
} else {
    $antiguas = db()->query('SELECT * FROM evaluaciones ORDER BY id DESC')->fetchAll();
}
foreach ($antiguas as $r) {
    $rows[] = [
        'id' => (int) $r['id'], 'codigo_curso' => $r['codigo_curso'], 'periodo' => $r['periodo'],
        'identificacion_estudiante' => $r['identificacion_estudiante'], 'asignatura' => $r['asignatura'],
        'parametro' => $r['parametro'], 'porcentaje' => $r['porcentaje'], 'nota' => $r['nota'],
        'inasistencias' => $r['inasistencias'], 'observaciones' => $r['observaciones'],
        'origen' => 'q10', 'empresa' => null, 'fueraDeBaseDe' => null,
    ];
}

// ══════════════════════════════════════════════════════════════════════
// 2) Resultados reales de los Cuestionarios de Campus Virtual (ya enviados)
//    -- antes esto NO aparecía aquí, solo en la pestaña de Intentos de cada
//    contenido. Un intento = una fila (si tiene 2 intentos, salen los 2 con
//    su número aparte). Mismo criterio de permisos que la data de Q10:
//    Docente solo ve lo suyo, el resto ve todo.
// ══════════════════════════════════════════════════════════════════════

// -- Asignaturas --
// El curso sale con subconsulta correlacionada (no JOIN + GROUP BY) para no
// depender de que MySQL tenga ONLY_FULL_GROUP_BY apagado -- una asignatura
// puede estar en más de un pensum, así que puede traer varios nombres.
$sql = "SELECT i.id, i.estudiante_identificacion, i.numero_intento, i.porcentaje,
               c.titulo AS parametro, a.nombre AS asignatura,
               (SELECT GROUP_CONCAT(DISTINCT p.nombre ORDER BY p.nombre SEPARATOR ', ')
                FROM programa_asignaturas pa JOIN programas p ON p.id = pa.programa_id
                WHERE pa.asignatura_id = a.id) AS curso,
               (SELECT ce.razon_social FROM curso_empresa_empleados cee
                JOIN curso_empresas ce ON ce.id = cee.empresa_id
                JOIN programa_asignaturas pa2 ON pa2.programa_id = ce.programa_id
                WHERE pa2.asignatura_id = a.id AND cee.identificacion = i.estudiante_identificacion
                LIMIT 1) AS empresa,
               (SELECT m.periodo FROM matriculas m
                JOIN estudiantes e2 ON e2.id = m.estudiante_id
                JOIN programa_asignaturas pa3 ON pa3.asignatura_id = a.id
                JOIN programas p3 ON p3.id = pa3.programa_id
                WHERE e2.identificacion = i.estudiante_identificacion
                  AND (m.programa = p3.nombre OR m.programa LIKE CONCAT(p3.nombre, ' - %'))
                  AND m.periodo IS NOT NULL
                LIMIT 1) AS periodo
        FROM asignatura_cuestionario_intentos i
        JOIN asignatura_contenido c ON c.id = i.contenido_id
        JOIN asignaturas a ON a.id = c.asignatura_id
        WHERE i.enviado_at IS NOT NULL";
$params = [];
if ($esDocente) {
    $sql .= ' AND EXISTS (SELECT 1 FROM asignatura_docentes ad JOIN docentes d ON d.id = ad.docente_id WHERE ad.asignatura_id = a.id AND d.identificacion = ?)';
    $params[] = $idDocente;
}
if ($identificacion !== '') { $sql .= ' AND i.estudiante_identificacion = ?'; $params[] = $identificacion; }
$sql .= ' ORDER BY i.id DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
foreach ($stmt->fetchAll() as $r) {
    $rows[] = [
        'id' => 'cv-asig-' . $r['id'], 'codigo_curso' => $r['curso'], 'periodo' => $r['periodo'],
        'identificacion_estudiante' => $r['estudiante_identificacion'], 'asignatura' => $r['asignatura'],
        'parametro' => $r['parametro'] . ' (Intento ' . $r['numero_intento'] . ')',
        'porcentaje' => $r['porcentaje'], 'nota' => null, 'inasistencias' => null, 'observaciones' => null,
        'origen' => 'cuestionario', 'empresa' => $r['empresa'], 'fueraDeBaseDe' => null,
    ];
}

// -- Cursos (que en Campus Virtual son filas de `programas` con tipo=curso) --
$sql = "SELECT i.id, i.estudiante_identificacion, i.numero_intento, i.porcentaje,
               c.titulo AS parametro, p.nombre AS curso,
               (SELECT ce.razon_social FROM curso_empresa_empleados cee
                JOIN curso_empresas ce ON ce.id = cee.empresa_id
                WHERE ce.programa_id = p.id AND cee.identificacion = i.estudiante_identificacion
                LIMIT 1) AS empresa,
               (SELECT m.periodo FROM matriculas m
                JOIN estudiantes e2 ON e2.id = m.estudiante_id
                WHERE e2.identificacion = i.estudiante_identificacion
                  AND (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %'))
                  AND m.periodo IS NOT NULL
                LIMIT 1) AS periodo
        FROM curso_cuestionario_intentos i
        JOIN curso_contenido c ON c.id = i.contenido_id
        JOIN programas p ON p.id = c.curso_id
        WHERE i.enviado_at IS NOT NULL";
$params = [];
if ($esDocente) {
    $sql .= ' AND EXISTS (SELECT 1 FROM programa_docentes pd JOIN docentes d ON d.id = pd.docente_id WHERE pd.programa_id = p.id AND d.identificacion = ?)';
    $params[] = $idDocente;
}
if ($identificacion !== '') { $sql .= ' AND i.estudiante_identificacion = ?'; $params[] = $identificacion; }
$sql .= ' ORDER BY i.id DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
foreach ($stmt->fetchAll() as $r) {
    $rows[] = [
        'id' => 'cv-curso-' . $r['id'], 'codigo_curso' => $r['curso'], 'periodo' => $r['periodo'],
        'identificacion_estudiante' => $r['estudiante_identificacion'], 'asignatura' => $r['curso'],
        'parametro' => $r['parametro'] . ' (Intento ' . $r['numero_intento'] . ')',
        'porcentaje' => $r['porcentaje'], 'nota' => null, 'inasistencias' => null, 'observaciones' => null,
        'origen' => 'cuestionario', 'empresa' => $r['empresa'], 'fueraDeBaseDe' => null,
    ];
}

// -- Cursos ligeros --
$sql = "SELECT i.id, i.estudiante_identificacion, i.numero_intento, i.porcentaje,
               c.titulo AS parametro, cl.nombre AS curso
        FROM curso_ligero_cuestionario_intentos i
        JOIN curso_ligero_contenido c ON c.id = i.contenido_id
        JOIN cursos_ligeros cl ON cl.id = c.curso_ligero_id
        WHERE i.enviado_at IS NOT NULL";
$params = [];
if ($esDocente) {
    $sql .= ' AND cl.docente_identificacion = ?';
    $params[] = $idDocente;
}
if ($identificacion !== '') { $sql .= ' AND i.estudiante_identificacion = ?'; $params[] = $identificacion; }
$sql .= ' ORDER BY i.id DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
foreach ($stmt->fetchAll() as $r) {
    $rows[] = [
        'id' => 'cv-cligero-' . $r['id'], 'codigo_curso' => $r['curso'], 'periodo' => null,
        'identificacion_estudiante' => $r['estudiante_identificacion'], 'asignatura' => $r['curso'],
        'parametro' => $r['parametro'] . ' (Intento ' . $r['numero_intento'] . ')',
        'porcentaje' => $r['porcentaje'], 'nota' => null, 'inasistencias' => null, 'observaciones' => null,
        'origen' => 'cuestionario', 'empresa' => null, 'fueraDeBaseDe' => null,
    ];
}

// ══════════════════════════════════════════════════════════════════════
// 3) Roster completo de CUALQUIER curso/asignatura con Cuestionario -- aunque
//    un estudiante todavía no lo haya presentado, igual debe aparecer aquí
//    (con "Sin presentar"), para que se vea la lista completa de
//    matriculados desde el día uno, no solo a quien ya respondió. Antes
//    esto solo pasaba en cursos con empresas cargadas (Cursos para
//    empresas) -- pedido explícito del cliente: aplica a TODOS los
//    programas/cursos, tengan empresa o no.
// ══════════════════════════════════════════════════════════════════════

// -- Vía asignatura (ej. Legislación dentro del pensum de un curso) --
$sql = "SELECT DISTINCT e.identificacion, a.nombre AS asignatura, c.id AS contenido_id, c.titulo AS parametro,
               p.id AS programa_id, p.nombre AS curso, m.periodo
        FROM programas p
        JOIN programa_asignaturas pa ON pa.programa_id = p.id
        JOIN asignaturas a ON a.id = pa.asignatura_id
        JOIN asignatura_contenido c ON c.asignatura_id = a.id AND c.tipo = 'Cuestionario'
        JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
        JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE NOT EXISTS (
          SELECT 1 FROM asignatura_cuestionario_intentos i
          WHERE i.contenido_id = c.id AND i.estudiante_identificacion = e.identificacion AND i.enviado_at IS NOT NULL
        )";
$params = [];
if ($esDocente) {
    $sql .= ' AND EXISTS (SELECT 1 FROM asignatura_docentes ad JOIN docentes d ON d.id = ad.docente_id WHERE ad.asignatura_id = a.id AND d.identificacion = ?)';
    $params[] = $idDocente;
}
if ($identificacion !== '') { $sql .= ' AND e.identificacion = ?'; $params[] = $identificacion; }
$stmt = db()->prepare($sql);
$stmt->execute($params);
$pendientesAsignatura = $stmt->fetchAll();

// -- Vía curso directo --
$sql = "SELECT DISTINCT e.identificacion, p.nombre AS curso, c.id AS contenido_id, c.titulo AS parametro, p.id AS programa_id, m.periodo
        FROM programas p
        JOIN curso_contenido c ON c.curso_id = p.id AND c.tipo = 'Cuestionario'
        JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
        JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE NOT EXISTS (
          SELECT 1 FROM curso_cuestionario_intentos i
          WHERE i.contenido_id = c.id AND i.estudiante_identificacion = e.identificacion AND i.enviado_at IS NOT NULL
        )";
$params = [];
if ($esDocente) {
    $sql .= ' AND EXISTS (SELECT 1 FROM programa_docentes pd JOIN docentes d ON d.id = pd.docente_id WHERE pd.programa_id = p.id AND d.identificacion = ?)';
    $params[] = $idDocente;
}
if ($identificacion !== '') { $sql .= ' AND e.identificacion = ?'; $params[] = $identificacion; }
$stmt = db()->prepare($sql);
$stmt->execute($params);
$pendientesCurso = $stmt->fetchAll();

$pendientes = array_merge(
    array_map(static fn($r) => ['asignatura' => $r['asignatura'], 'curso' => $r['curso'], 'parametro' => $r['parametro'], 'identificacion' => $r['identificacion'], 'programa_id' => $r['programa_id'], 'periodo' => $r['periodo']], $pendientesAsignatura),
    array_map(static fn($r) => ['asignatura' => $r['curso'], 'curso' => $r['curso'], 'parametro' => $r['parametro'], 'identificacion' => $r['identificacion'], 'programa_id' => $r['programa_id'], 'periodo' => $r['periodo']], $pendientesCurso)
);

if (!empty($pendientes)) {
    $programaIds = array_values(array_unique(array_column($pendientes, 'programa_id')));
    $placeholders = implode(',', array_fill(0, count($programaIds), '?'));
    $stmt = db()->prepare("SELECT id, programa_id, razon_social FROM curso_empresas WHERE programa_id IN ($placeholders)");
    $stmt->execute($programaIds);
    $empresasPorPrograma2 = [];
    foreach ($stmt->fetchAll() as $e) { $empresasPorPrograma2[$e['programa_id']][] = $e; }

    $empresaIds2 = [];
    foreach ($empresasPorPrograma2 as $lista) { foreach ($lista as $e) { $empresaIds2[] = (int) $e['id']; } }
    $empresaPorIdentificacion2 = [];
    $nombrePorEmpresaId2 = [];
    if (!empty($empresaIds2)) {
        $placeholders2 = implode(',', array_fill(0, count($empresaIds2), '?'));
        $stmt = db()->prepare("SELECT identificacion, empresa_id FROM curso_empresa_empleados WHERE empresa_id IN ($placeholders2)");
        $stmt->execute($empresaIds2);
        foreach ($stmt->fetchAll() as $emp) { $empresaPorIdentificacion2[$emp['identificacion']] = $emp['empresa_id']; }
        foreach ($empresasPorPrograma2 as $lista) { foreach ($lista as $e) { $nombrePorEmpresaId2[$e['id']] = $e['razon_social']; } }
    }

    foreach ($pendientes as $r) {
        $empresasDeEstePrograma = $empresasPorPrograma2[$r['programa_id']] ?? [];
        $empresaId = $empresaPorIdentificacion2[$r['identificacion']] ?? null;
        if ($empresaId !== null && in_array($empresaId, array_column($empresasDeEstePrograma, 'id'), true)) {
            $empresa = $nombrePorEmpresaId2[$empresaId];
            $fueraDeBaseDe = null;
        } else {
            $empresa = null;
            // Null si el programa ni siquiera tiene empresas cargadas (caso
            // normal ahora que esto aplica a todos) -- solo se arma el texto
            // si de verdad hay alguna empresa de la que esté "fuera".
            $fueraDeBaseDe = empty($empresasDeEstePrograma) ? null : implode(', ', array_column($empresasDeEstePrograma, 'razon_social'));
        }
        $rows[] = [
            'id' => 'cv-pend-' . $r['programa_id'] . '-' . $r['identificacion'] . '-' . md5($r['parametro']),
            'codigo_curso' => $r['curso'], 'periodo' => $r['periodo'],
            'identificacion_estudiante' => $r['identificacion'], 'asignatura' => $r['asignatura'],
            'parametro' => $r['parametro'] . ' (Sin presentar)',
            'porcentaje' => null, 'nota' => null, 'inasistencias' => null, 'observaciones' => null,
            'origen' => 'cuestionario', 'empresa' => $empresa, 'fueraDeBaseDe' => $fueraDeBaseDe,
        ];
    }
}

// ══════════════════════════════════════════════════════════════════════
// 4) Roster de matriculados en una asignatura/curso que NO tiene ningún
//    Cuestionario creado todavía -- sin esto, esos estudiantes quedaban
//    invisibles en Evaluaciones aunque sí estén matriculados y con periodo,
//    simplemente porque no hay nada que calificar todavía. "Sin evaluación
//    configurada" dice justo eso, en vez de que no salga nada y parezca que
//    el estudiante se perdió.
// ══════════════════════════════════════════════════════════════════════

// -- Vía asignatura --
$sql = "SELECT DISTINCT e.identificacion, a.nombre AS asignatura, p.nombre AS curso, m.periodo
        FROM programas p
        JOIN programa_asignaturas pa ON pa.programa_id = p.id
        JOIN asignaturas a ON a.id = pa.asignatura_id
        JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
        JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE NOT EXISTS (SELECT 1 FROM asignatura_contenido c2 WHERE c2.asignatura_id = a.id AND c2.tipo = 'Cuestionario')";
$params = [];
if ($esDocente) {
    $sql .= ' AND EXISTS (SELECT 1 FROM asignatura_docentes ad JOIN docentes d ON d.id = ad.docente_id WHERE ad.asignatura_id = a.id AND d.identificacion = ?)';
    $params[] = $idDocente;
}
if ($identificacion !== '') { $sql .= ' AND e.identificacion = ?'; $params[] = $identificacion; }
$stmt = db()->prepare($sql);
$stmt->execute($params);
foreach ($stmt->fetchAll() as $r) {
    $rows[] = [
        'id' => 'cv-sinev-asig-' . md5($r['asignatura'] . '-' . $r['identificacion']),
        'codigo_curso' => $r['curso'], 'periodo' => $r['periodo'],
        'identificacion_estudiante' => $r['identificacion'], 'asignatura' => $r['asignatura'],
        'parametro' => 'Sin evaluación configurada',
        'porcentaje' => null, 'nota' => null, 'inasistencias' => null, 'observaciones' => null,
        'origen' => 'cuestionario', 'empresa' => null, 'fueraDeBaseDe' => null,
    ];
}

// -- Vía curso directo --
$sql = "SELECT DISTINCT e.identificacion, p.nombre AS curso, m.periodo
        FROM programas p
        JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
        JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE NOT EXISTS (SELECT 1 FROM curso_contenido c2 WHERE c2.curso_id = p.id AND c2.tipo = 'Cuestionario')
          AND NOT EXISTS (SELECT 1 FROM programa_asignaturas pa2 WHERE pa2.programa_id = p.id)";
$params = [];
if ($esDocente) {
    $sql .= ' AND EXISTS (SELECT 1 FROM programa_docentes pd JOIN docentes d ON d.id = pd.docente_id WHERE pd.programa_id = p.id AND d.identificacion = ?)';
    $params[] = $idDocente;
}
if ($identificacion !== '') { $sql .= ' AND e.identificacion = ?'; $params[] = $identificacion; }
$stmt = db()->prepare($sql);
$stmt->execute($params);
foreach ($stmt->fetchAll() as $r) {
    $rows[] = [
        'id' => 'cv-sinev-curso-' . md5($r['curso'] . '-' . $r['identificacion']),
        'codigo_curso' => $r['curso'], 'periodo' => $r['periodo'],
        'identificacion_estudiante' => $r['identificacion'], 'asignatura' => $r['curso'],
        'parametro' => 'Sin evaluación configurada',
        'porcentaje' => null, 'nota' => null, 'inasistencias' => null, 'observaciones' => null,
        'origen' => 'cuestionario', 'empresa' => null, 'fueraDeBaseDe' => null,
    ];
}

respond(['ok' => true, 'evaluaciones' => $rows]);
