<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente ya usa este mismo panel administrativo (antes tenía uno aparte) —
// solo Estudiante sigue teniendo su propio dashboard separado.
if ($user['role'] === 'estudiante') fail('No autorizado.', 403);

// Un Docente en este panel (campanita + tarjetas "Anuncios recientes" /
// "Próximas clases" / "Histórico") solo debe ver lo de SUS programas,
// asignaturas y cursos asignados — nunca el feed de toda la institución.
// Mismo candado de "asignado a este docente" que ya usan programas/list.php
// (programa_docentes / asignatura_docentes vía el pensum), asignaturas/
// list.php (asignatura_docentes) y cursos/cursos-ligeros/list.php
// (docente_identificacion). admin/super_admin siguen viendo todo, igual
// que antes.
$esDocente = $user['role'] === 'docente';
$idDoc = $user['identificacion'] ?? '';
$scopeProg = $esDocente ? ' AND (
    EXISTS (SELECT 1 FROM programa_docentes pd JOIN docentes d ON d.id = pd.docente_id
            WHERE pd.programa_id = p.id AND d.identificacion = ?)
    OR EXISTS (SELECT 1 FROM programa_asignaturas pa
               JOIN asignatura_docentes ad ON ad.asignatura_id = pa.asignatura_id
               JOIN docentes d2 ON d2.id = ad.docente_id
               WHERE pa.programa_id = p.id AND d2.identificacion = ?)
  )' : '';
$scopeAsg = $esDocente ? ' AND EXISTS (
    SELECT 1 FROM asignatura_docentes ad JOIN docentes d ON d.id = ad.docente_id
    WHERE ad.asignatura_id = asg.id AND d.identificacion = ?
  )' : '';
$scopeCL = $esDocente ? ' AND cl.docente_identificacion = ?' : '';
$scopeCursoAnuncios = $esDocente ? ' AND c.docente_identificacion = ?' : '';
$scopeCursoClases = $esDocente ? ' AND cu.docente_identificacion = ?' : '';
$paramsScope = $esDocente ? [$idDoc, $idDoc, $idDoc, $idDoc, $idDoc] : [];

// Anuncios recientes de las 4 familias de contenido (programas, asignaturas,
// cursos, cursos ligeros) — mismo patrón que el resto del sistema, unidos
// para mostrar un solo feed real en el inicio del panel administrativo.
$stmt = db()->prepare(
    "(SELECT 'Programa' AS origen, p.nombre AS origen_nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM programa_anuncios a JOIN programas p ON p.id = a.programa_id WHERE 1=1$scopeProg)
     UNION ALL
     (SELECT 'Asignatura', asg.nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM asignatura_anuncios a JOIN asignaturas asg ON asg.id = a.asignatura_id WHERE 1=1$scopeAsg)
     UNION ALL
     (SELECT 'Curso', c.codigo_nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM curso_anuncios a JOIN cursos c ON c.id = a.curso_id WHERE 1=1$scopeCursoAnuncios)
     UNION ALL
     (SELECT 'Curso ligero', cl.nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM curso_ligero_anuncios a JOIN cursos_ligeros cl ON cl.id = a.curso_ligero_id WHERE 1=1$scopeCL)
     ORDER BY created_at DESC LIMIT 8"
);
$stmt->execute($paramsScope);
$anuncios = $stmt->fetchAll();

// Próximas clases virtuales agendadas, mismas 4 familias. origen_id es el id
// del programa/asignatura/curso/curso-ligero dueño — el front lo usa para
// armar un acceso directo al módulo exacto (evita ir paso a paso para, por
// ejemplo, eliminar la reunión).
$stmt = db()->prepare(
    "(SELECT 'Programa' AS origen, p.nombre AS origen_nombre, p.id AS origen_id, c.titulo, c.fecha_inicio, c.fecha_fin
      FROM programa_clases_virtuales c JOIN programas p ON p.id = c.programa_id WHERE c.fecha_inicio >= NOW() AND c.es_prueba = 0$scopeProg)
     UNION ALL
     (SELECT 'Asignatura', asg.nombre, asg.id, c.titulo, c.fecha_inicio, c.fecha_fin
      FROM asignatura_clases_virtuales c JOIN asignaturas asg ON asg.id = c.asignatura_id WHERE c.fecha_inicio >= NOW() AND c.es_prueba = 0$scopeAsg)
     UNION ALL
     (SELECT 'Curso', cu.codigo_nombre, cu.id, c.titulo, c.fecha_inicio, c.fecha_fin
      FROM curso_clases_virtuales c JOIN cursos cu ON cu.id = c.curso_id WHERE c.fecha_inicio >= NOW() AND c.es_prueba = 0$scopeCursoClases)
     UNION ALL
     (SELECT 'Curso ligero', cl.nombre, cl.id, c.titulo, c.fecha_inicio, c.fecha_fin
      FROM curso_ligero_clases_virtuales c JOIN cursos_ligeros cl ON cl.id = c.curso_ligero_id WHERE c.fecha_inicio >= NOW() AND c.es_prueba = 0$scopeCL)
     ORDER BY fecha_inicio ASC LIMIT 8"
);
$stmt->execute($paramsScope);
$clases = $stmt->fetchAll();

// Histórico: mismas 4 familias, pero ya pasadas y con el link de la
// grabación — para que el panel de Docente/Admin tenga la misma tarjeta de
// "Histórico de clases virtuales" que ya tiene el panel del Estudiante.
$stmt = db()->prepare(
    "(SELECT 'Programa' AS origen, p.nombre AS origen_nombre, p.id AS origen_id, c.titulo, c.fecha_inicio, c.fecha_fin, c.grabacion_url
      FROM programa_clases_virtuales c JOIN programas p ON p.id = c.programa_id
      WHERE COALESCE(c.fecha_fin, c.fecha_inicio) < NOW() AND c.archivado = 0 AND c.es_prueba = 0$scopeProg)
     UNION ALL
     (SELECT 'Asignatura', asg.nombre, asg.id, c.titulo, c.fecha_inicio, c.fecha_fin, c.grabacion_url
      FROM asignatura_clases_virtuales c JOIN asignaturas asg ON asg.id = c.asignatura_id
      WHERE COALESCE(c.fecha_fin, c.fecha_inicio) < NOW() AND c.archivado = 0 AND c.es_prueba = 0$scopeAsg)
     UNION ALL
     (SELECT 'Curso', cu.codigo_nombre, cu.id, c.titulo, c.fecha_inicio, c.fecha_fin, c.grabacion_url
      FROM curso_clases_virtuales c JOIN cursos cu ON cu.id = c.curso_id
      WHERE COALESCE(c.fecha_fin, c.fecha_inicio) < NOW() AND c.archivado = 0 AND c.es_prueba = 0$scopeCursoClases)
     UNION ALL
     (SELECT 'Curso ligero', cl.nombre, cl.id, c.titulo, c.fecha_inicio, c.fecha_fin, c.grabacion_url
      FROM curso_ligero_clases_virtuales c JOIN cursos_ligeros cl ON cl.id = c.curso_ligero_id
      WHERE COALESCE(c.fecha_fin, c.fecha_inicio) < NOW() AND c.archivado = 0 AND c.es_prueba = 0$scopeCL)
     ORDER BY fecha_inicio DESC LIMIT 8"
);
$stmt->execute($paramsScope);
$clasesHistorial = $stmt->fetchAll();

// La auditoría completa (Historial) es exclusiva de Super Admin — aquí solo
// se asoma un resumen de las últimas acciones para la campana.
$auditoria = [];
$auditoriaRecienteCount = 0;
if ($user['role'] === 'super_admin') {
    $auditoria = db()->query(
        'SELECT id, user_name, action, detail, created_at FROM audit_trace ORDER BY created_at DESC LIMIT 8'
    )->fetchAll();
    $auditoriaRecienteCount = (int) db()->query(
        "SELECT COUNT(*) FROM audit_trace WHERE created_at >= NOW() - INTERVAL 7 DAY"
    )->fetchColumn();
}

// Preinscripciones pendientes (formulario público de inscripción) — se
// muestran en la campana igual que anuncios/auditoría, con su propio link
// directo al módulo "Inscritos". Es información de matrícula/admisiones, no
// algo que le incumba a un Docente — mismo candado que ya protege el módulo
// "Inscritos" en sí (institucional.inscritos), para que la campana no
// muestre algo a lo que ese usuario no tiene acceso real.
$preinscripciones = [];
$preinscripcionesPendientesCount = 0;
$permisos = user_permisos($user);
if ($permisos['all'] || (($permisos['modulos']['institucional.inscritos']['ver'] ?? false) === true)) {
    $preinscripciones = db()->query(
        "SELECT id, nombres, apellidos, tipo_interes, item_nombre, created_at
         FROM preinscripciones WHERE estado = 'Pendiente' ORDER BY created_at DESC LIMIT 8"
    )->fetchAll();
    $preinscripcionesPendientesCount = (int) db()->query(
        "SELECT COUNT(*) FROM preinscripciones WHERE estado = 'Pendiente'"
    )->fetchColumn();
}

// Contadores reales para las tarjetas del encabezado (nada decorativo).
// Un docente solo ve el total de SUS propios cursos, no el de toda la
// institución — mismo candado de dueño que ya usa cursos/list.php.
if ($user['role'] === 'docente') {
    $stmtTotalCursos = db()->prepare('SELECT COUNT(*) FROM cursos WHERE docente_identificacion = ?');
    $stmtTotalCursos->execute([$user['identificacion'] ?? '']);
    $totalCursos = (int) $stmtTotalCursos->fetchColumn();
} else {
    $totalCursos = (int) db()->query('SELECT COUNT(*) FROM cursos')->fetchColumn();
}

// Pagos pendientes es información de cartera/tesorería — un Docente no
// tiene ese módulo (rol_modulos_por_defecto() ni siquiera se lo asigna),
// así que no se le calcula ni se le muestra, mismo candado por permiso
// real que ya protege Preinscripciones arriba.
$pagosPendientes = 0;
if ($permisos['all'] || (($permisos['modulos']['tesoreria.pagos']['ver'] ?? false) === true)) {
    $pagosPendientes = (int) db()->query('SELECT COUNT(*) FROM pagos_pendientes')->fetchColumn();
}
// Mismo candado de dueño que el feed de arriba — si no, un Docente ve en el
// badge de la campanita una cantidad que no corresponde a lo suyo.
$stmtCount = db()->prepare(
    "SELECT COUNT(*) FROM (
        (SELECT a.created_at FROM programa_anuncios a JOIN programas p ON p.id = a.programa_id
         WHERE a.created_at >= NOW() - INTERVAL 7 DAY$scopeProg)
        UNION ALL
        (SELECT a.created_at FROM asignatura_anuncios a JOIN asignaturas asg ON asg.id = a.asignatura_id
         WHERE a.created_at >= NOW() - INTERVAL 7 DAY$scopeAsg)
        UNION ALL
        (SELECT a.created_at FROM curso_anuncios a JOIN cursos c ON c.id = a.curso_id
         WHERE a.created_at >= NOW() - INTERVAL 7 DAY$scopeCursoAnuncios)
        UNION ALL
        (SELECT a.created_at FROM curso_ligero_anuncios a JOIN cursos_ligeros cl ON cl.id = a.curso_ligero_id
         WHERE a.created_at >= NOW() - INTERVAL 7 DAY$scopeCL)
    ) t"
);
$stmtCount->execute($paramsScope);
$anunciosRecientesCount = (int) $stmtCount->fetchColumn();

respond([
    'ok' => true,
    'anuncios' => $anuncios,
    'clases' => $clases,
    'clasesHistorial' => $clasesHistorial,
    'auditoria' => $auditoria,
    'preinscripciones' => $preinscripciones,
    'stats' => [
        'cursos' => $totalCursos,
        'pagosPendientes' => $pagosPendientes,
        'notificaciones' => $anunciosRecientesCount + $auditoriaRecienteCount + $preinscripcionesPendientesCount,
    ],
]);
