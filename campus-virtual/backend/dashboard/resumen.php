<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente ya usa este mismo panel administrativo (antes tenía uno aparte) —
// solo Estudiante sigue teniendo su propio dashboard separado.
if ($user['role'] === 'estudiante') fail('No autorizado.', 403);

// Anuncios recientes de las 4 familias de contenido (programas, asignaturas,
// cursos, cursos ligeros) — mismo patrón que el resto del sistema, unidos
// para mostrar un solo feed real en el inicio del panel administrativo.
$anuncios = db()->query(
    "(SELECT 'Programa' AS origen, p.nombre AS origen_nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM programa_anuncios a JOIN programas p ON p.id = a.programa_id)
     UNION ALL
     (SELECT 'Asignatura', asg.nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM asignatura_anuncios a JOIN asignaturas asg ON asg.id = a.asignatura_id)
     UNION ALL
     (SELECT 'Curso', c.codigo_nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM curso_anuncios a JOIN cursos c ON c.id = a.curso_id)
     UNION ALL
     (SELECT 'Curso ligero', cl.nombre, a.titulo, a.mensaje, a.importancia, a.created_at
      FROM curso_ligero_anuncios a JOIN cursos_ligeros cl ON cl.id = a.curso_ligero_id)
     ORDER BY created_at DESC LIMIT 8"
)->fetchAll();

// Próximas clases virtuales agendadas, mismas 4 familias. origen_id es el id
// del programa/asignatura/curso/curso-ligero dueño — el front lo usa para
// armar un acceso directo al módulo exacto (evita ir paso a paso para, por
// ejemplo, eliminar la reunión).
$clases = db()->query(
    "(SELECT 'Programa' AS origen, p.nombre AS origen_nombre, p.id AS origen_id, c.titulo, c.fecha_inicio, c.fecha_fin
      FROM programa_clases_virtuales c JOIN programas p ON p.id = c.programa_id WHERE c.fecha_inicio >= NOW())
     UNION ALL
     (SELECT 'Asignatura', asg.nombre, asg.id, c.titulo, c.fecha_inicio, c.fecha_fin
      FROM asignatura_clases_virtuales c JOIN asignaturas asg ON asg.id = c.asignatura_id WHERE c.fecha_inicio >= NOW())
     UNION ALL
     (SELECT 'Curso', cu.codigo_nombre, cu.id, c.titulo, c.fecha_inicio, c.fecha_fin
      FROM curso_clases_virtuales c JOIN cursos cu ON cu.id = c.curso_id WHERE c.fecha_inicio >= NOW())
     UNION ALL
     (SELECT 'Curso ligero', cl.nombre, cl.id, c.titulo, c.fecha_inicio, c.fecha_fin
      FROM curso_ligero_clases_virtuales c JOIN cursos_ligeros cl ON cl.id = c.curso_ligero_id WHERE c.fecha_inicio >= NOW())
     ORDER BY fecha_inicio ASC LIMIT 8"
)->fetchAll();

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
// directo al módulo "Inscritos".
$preinscripciones = db()->query(
    "SELECT id, nombres, apellidos, tipo_interes, item_nombre, created_at
     FROM preinscripciones WHERE estado = 'Pendiente' ORDER BY created_at DESC LIMIT 8"
)->fetchAll();
$preinscripcionesPendientesCount = (int) db()->query(
    "SELECT COUNT(*) FROM preinscripciones WHERE estado = 'Pendiente'"
)->fetchColumn();

// Contadores reales para las tarjetas del encabezado (nada decorativo).
$totalCursos = (int) db()->query('SELECT COUNT(*) FROM cursos')->fetchColumn();
$pagosPendientes = (int) db()->query('SELECT COUNT(*) FROM pagos_pendientes')->fetchColumn();
$anunciosRecientesCount = (int) db()->query(
    "SELECT COUNT(*) FROM (
        SELECT created_at FROM programa_anuncios WHERE created_at >= NOW() - INTERVAL 7 DAY
        UNION ALL SELECT created_at FROM asignatura_anuncios WHERE created_at >= NOW() - INTERVAL 7 DAY
        UNION ALL SELECT created_at FROM curso_anuncios WHERE created_at >= NOW() - INTERVAL 7 DAY
        UNION ALL SELECT created_at FROM curso_ligero_anuncios WHERE created_at >= NOW() - INTERVAL 7 DAY
    ) t"
)->fetchColumn();

respond([
    'ok' => true,
    'anuncios' => $anuncios,
    'clases' => $clases,
    'auditoria' => $auditoria,
    'preinscripciones' => $preinscripciones,
    'stats' => [
        'cursos' => $totalCursos,
        'pagosPendientes' => $pagosPendientes,
        'notificaciones' => $anunciosRecientesCount + $auditoriaRecienteCount + $preinscripcionesPendientesCount,
    ],
]);
