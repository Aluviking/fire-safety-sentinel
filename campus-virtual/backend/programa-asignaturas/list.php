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
         )'
    );
    $stmt->execute([$programaId, $user['identificacion'] ?? '']);
} else {
    $stmt = db()->prepare(
        'SELECT pa.*, a.codigo AS asignatura_codigo, a.nombre AS asignatura_nombre
         FROM programa_asignaturas pa
         JOIN asignaturas a ON a.id = pa.asignatura_id
         WHERE pa.programa_id = ?'
    );
    $stmt->execute([$programaId]);
}
$asignaturas = $stmt->fetchAll();

// El pensum se muestra en orden numérico de código (01, 02, 03…), no por
// fecha de inserción -- pedido explícito del cliente: al traer/crear una
// asignatura, debe acomodarse sola en su puesto según su código, no quedar
// pegada al final. strnatcasecmp entiende números dentro del texto (p.ej.
// "02 - BCI" antes de "10 - BCI"), a diferencia de un ORDER BY de texto plano.
usort($asignaturas, fn($a, $b) => strnatcasecmp($a['asignatura_codigo'] ?? '', $b['asignatura_codigo'] ?? ''));

respond(['ok' => true, 'asignaturas' => $asignaturas]);
