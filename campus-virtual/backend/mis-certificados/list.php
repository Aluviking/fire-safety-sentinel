<?php
require __DIR__ . '/../bootstrap.php';

// Certificados reales disponibles para ESTE estudiante: programas y cursos
// ligeros donde está matriculado/inscrito Y que además tienen una plantilla
// de certificado asignada (certificado_id, ya configurable desde Ajustes en
// Programas/Cursos ligeros) Y donde el docente/super_admin prendió a mano
// "Mostrar certificado" para ESE estudiante puntual (m.mostrar_certificado /
// i.mostrar_certificado, apagado por defecto -- ver Estudiantes dentro de
// Programa, o Usuarios dentro de Curso ligero). No se exige "aprobado" --
// no hay una regla de negocio clara y única para eso en todos los
// programas, así que la disponibilidad depende de que alguien lo habilite
// a mano, no de la nota.

$user = require_auth();
if ($user['role'] !== 'estudiante' || empty($user['identificacion'])) {
    respond(['ok' => true, 'certificados' => []]);
}

$stmt = db()->prepare(
    "SELECT 'Programa' AS origen, p.id AS origen_id, p.nombre AS origen_nombre,
            cp.id AS certificado_id, cp.nombre AS certificado_nombre, cp.imagen_path
     FROM programas p
     JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
     JOIN estudiantes e ON e.id = m.estudiante_id
     JOIN certificados_plantillas cp ON cp.id = p.certificado_id
     WHERE e.identificacion = ? AND m.mostrar_certificado = 1
     UNION ALL
     SELECT 'Curso ligero', c.id, c.nombre, cp.id, cp.nombre, cp.imagen_path
     FROM cursos_ligeros c
     JOIN curso_ligero_inscripciones i ON i.curso_ligero_id = c.id
     JOIN certificados_plantillas cp ON cp.id = c.certificado_id
     WHERE i.estudiante_identificacion = ? AND i.mostrar_certificado = 1
     UNION ALL
     -- Certificado propio de UNA asignatura (independiente del certificado
     -- del programa) -- el estudiante hereda acceso por pensum, mismo
     -- candado (mostrar_certificado) de la matrícula de su programa.
     SELECT 'Asignatura', a.id, a.nombre, cp.id, cp.nombre, cp.imagen_path
     FROM asignaturas a
     JOIN certificados_plantillas cp ON cp.id = a.certificado_id
     JOIN programa_asignaturas pa ON pa.asignatura_id = a.id
     JOIN programas p ON p.id = pa.programa_id
     JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
     JOIN estudiantes e ON e.id = m.estudiante_id
     WHERE e.identificacion = ? AND m.mostrar_certificado = 1
     ORDER BY origen_nombre"
);
$stmt->execute([$user['identificacion'], $user['identificacion'], $user['identificacion']]);
$rows = $stmt->fetchAll();

// Solo imagen (jpg/png/webp) permite el overlay con el nombre del
// estudiante -- PDF/Word quedan como plantilla para descargar, sin
// personalizar (ver certificados/image.php, que ya los sirve tal cual).
foreach ($rows as &$r) {
    $ext = strtolower(pathinfo((string) $r['imagen_path'], PATHINFO_EXTENSION));
    $r['personalizable'] = in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true);
}
unset($r);

respond(['ok' => true, 'certificados' => $rows]);
