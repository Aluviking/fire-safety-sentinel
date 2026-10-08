<?php
require __DIR__ . '/../bootstrap.php';

// Perfil completo de una persona (estudiante o docente) — todo lo que hay de
// ella en el sistema, para el buscador del navbar: "clic y te lleva a toda
// la info". Cada bloque se busca solo si el usuario tiene permiso de ver ese
// módulo real (mismo candado que ya usa cada pantalla por separado).

$user = require_auth();

$tipo = $_GET['tipo'] ?? '';
$id   = (int) ($_GET['id'] ?? 0);
if (!in_array($tipo, ['estudiante', 'docente'], true) || $id === 0) fail('tipo e id son requeridos.');

$permisos = user_permisos($user);
$puedeVer = function (string $modulo) use ($permisos): bool {
    return $permisos['all'] || (($permisos['modulos'][$modulo]['ver'] ?? false) === true);
};
if (!$puedeVer('institucional.estudiantes') && !$puedeVer('institucional.docentes')) {
    fail('No autorizado.', 403);
}

if ($tipo === 'estudiante') {
    $stmt = db()->prepare('SELECT * FROM estudiantes WHERE id = ?');
    $stmt->execute([$id]);
    $persona = $stmt->fetch();
    if (!$persona) fail('Estudiante no encontrado.', 404);
    $identificacion = $persona['identificacion'];

    $matriculas = db()->prepare('SELECT * FROM matriculas WHERE estudiante_id = ? ORDER BY created_at DESC');
    $matriculas->execute([$id]);

    $cursosLigeros = db()->prepare(
        "SELECT cl.id, cl.nombre, cl.categoria, cli.progreso, cli.estado_acceso, cli.ultimo_acceso
         FROM curso_ligero_inscripciones cli JOIN cursos_ligeros cl ON cl.id = cli.curso_ligero_id
         WHERE cli.estudiante_identificacion = ? ORDER BY cl.nombre"
    );
    $cursosLigeros->execute([$identificacion]);

    // Asignaturas heredadas del pensum de cada programa en el que está
    // matriculado (mismo puente que mis-asignaturas/list.php).
    $asignaturas = db()->prepare(
        "SELECT DISTINCT a.id, a.nombre, p.nombre AS programa_nombre
         FROM asignaturas a
         JOIN programa_asignaturas pa ON pa.asignatura_id = a.id
         JOIN programas p ON p.id = pa.programa_id
         JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
         WHERE m.estudiante_id = ?
         ORDER BY p.nombre, a.nombre"
    );
    $asignaturas->execute([$id]);

    // Lo histórico/financiero (cursos pasados, créditos, pagos, notas) es
    // exclusivo de Super Admin — Docente/Coordinador/Administrativo solo ven
    // la situación actual del estudiante (matrículas, asignaturas, cursos
    // ligeros), nunca su historial académico o financiero completo.
    $cursos = $creditos = $pagosRealizados = $pagosPendientes = $notasCredito = $evaluaciones = $notasFinales = [];
    if ($user['role'] === 'super_admin') {
        $cursosStmt = db()->prepare(
            "SELECT c.id, c.programa_asignatura_jornada, ce.estado
             FROM curso_estudiantes ce JOIN cursos c ON c.id = ce.curso_id
             WHERE ce.estudiante_id = ? ORDER BY c.id DESC"
        );
        $cursosStmt->execute([$id]);
        $cursos = $cursosStmt->fetchAll();

        $creditosStmt = db()->prepare('SELECT * FROM creditos WHERE identificacion_estudiante = ? ORDER BY fecha_credito DESC');
        $creditosStmt->execute([$identificacion]);
        $creditos = $creditosStmt->fetchAll();

        $pagosRealizadosStmt = db()->prepare('SELECT * FROM pagos_realizados WHERE identificacion = ? ORDER BY fecha_pago DESC');
        $pagosRealizadosStmt->execute([$identificacion]);
        $pagosRealizados = $pagosRealizadosStmt->fetchAll();

        $pagosPendientesStmt = db()->prepare('SELECT * FROM pagos_pendientes WHERE identificacion = ?');
        $pagosPendientesStmt->execute([$identificacion]);
        $pagosPendientes = $pagosPendientesStmt->fetchAll();

        $notasCreditoStmt = db()->prepare('SELECT * FROM notas_credito WHERE identificacion = ? ORDER BY fecha DESC');
        $notasCreditoStmt->execute([$identificacion]);
        $notasCredito = $notasCreditoStmt->fetchAll();

        $evaluacionesStmt = db()->prepare('SELECT * FROM evaluaciones WHERE identificacion_estudiante = ? ORDER BY periodo DESC');
        $evaluacionesStmt->execute([$identificacion]);
        $evaluaciones = $evaluacionesStmt->fetchAll();

        $notasFinalesStmt = db()->prepare('SELECT * FROM notas_finales WHERE identificacion_estudiante = ? ORDER BY periodo DESC');
        $notasFinalesStmt->execute([$identificacion]);
        $notasFinales = $notasFinalesStmt->fetchAll();
    }

    $cuenta = db()->prepare("SELECT username, email, role, created_at FROM users WHERE identificacion = ? AND role = 'estudiante'");
    $cuenta->execute([$identificacion]);

    respond([
        'ok' => true,
        'tipo' => 'estudiante',
        'persona' => $persona,
        'cuentaAcceso' => $cuenta->fetch() ?: null,
        'matriculas' => $matriculas->fetchAll(),
        'cursosLigeros' => $cursosLigeros->fetchAll(),
        'cursos' => $cursos,
        'asignaturas' => $asignaturas->fetchAll(),
        'creditos' => $creditos,
        'pagosRealizados' => $pagosRealizados,
        'pagosPendientes' => $pagosPendientes,
        'notasCredito' => $notasCredito,
        'evaluaciones' => $evaluaciones,
        'notasFinales' => $notasFinales,
    ]);
}

// tipo === 'docente'
$stmt = db()->prepare('SELECT * FROM docentes WHERE id = ?');
$stmt->execute([$id]);
$persona = $stmt->fetch();
if (!$persona) fail('Docente no encontrado.', 404);
$identificacion = $persona['identificacion'];

$asignaturas = db()->prepare(
    'SELECT a.id, a.nombre FROM asignatura_docentes ad JOIN asignaturas a ON a.id = ad.asignatura_id
     WHERE ad.docente_id = ? ORDER BY a.nombre'
);
$asignaturas->execute([$id]);

$programas = db()->prepare(
    'SELECT p.id, p.nombre FROM programa_docentes pd JOIN programas p ON p.id = pd.programa_id
     WHERE pd.docente_id = ? ORDER BY p.nombre'
);
$programas->execute([$id]);

$cursosLigeros = db()->prepare('SELECT id, nombre, categoria, estado FROM cursos_ligeros WHERE docente_identificacion = ? ORDER BY nombre');
$cursosLigeros->execute([$identificacion]);

$cursos = db()->prepare('SELECT id, programa_asignatura_jornada FROM cursos WHERE docente_identificacion = ? ORDER BY id DESC');
$cursos->execute([$identificacion]);

$cuenta = db()->prepare("SELECT username, email, role, created_at FROM users WHERE identificacion = ? AND role = 'docente'");
$cuenta->execute([$identificacion]);

respond([
    'ok' => true,
    'tipo' => 'docente',
    'persona' => $persona,
    'cuentaAcceso' => $cuenta->fetch() ?: null,
    'asignaturas' => $asignaturas->fetchAll(),
    'programas' => $programas->fetchAll(),
    'cursosLigeros' => $cursosLigeros->fetchAll(),
    'cursos' => $cursos->fetchAll(),
]);
