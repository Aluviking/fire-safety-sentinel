<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

// soloMias=1: para la pestaña "Ver contenido de la asignatura" (acceso
// rápido de un Docente a SUS asignaturas) — el Pensum completo (gestión de
// estructura) sigue sin filtrar, porque ahí el Docente sí tiene edición
// total sobre TODO el programa, no solo lo suyo (decisión explícita ya
// aplicada en programa-asignaturas/create.php y delete.php).
$soloMias = !empty($_GET['soloMias']) && $user['role'] === 'docente';

if ($soloMias) {
    $stmt = db()->prepare(
        'SELECT pa.*, a.codigo AS asignatura_codigo, a.nombre AS asignatura_nombre
         FROM programa_asignaturas pa
         JOIN asignaturas a ON a.id = pa.asignatura_id
         WHERE pa.programa_id = ? AND EXISTS (
           SELECT 1 FROM asignatura_docentes ad JOIN docentes d ON d.id = ad.docente_id
           WHERE ad.asignatura_id = pa.asignatura_id AND d.identificacion = ?
         )
         ORDER BY pa.orden, pa.id'
    );
    $stmt->execute([$programaId, $user['identificacion'] ?? '']);
} else {
    $stmt = db()->prepare(
        'SELECT pa.*, a.codigo AS asignatura_codigo, a.nombre AS asignatura_nombre
         FROM programa_asignaturas pa
         JOIN asignaturas a ON a.id = pa.asignatura_id
         WHERE pa.programa_id = ?
         ORDER BY pa.orden, pa.id'
    );
    $stmt->execute([$programaId]);
}
respond(['ok' => true, 'asignaturas' => $stmt->fetchAll()]);
