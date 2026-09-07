<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

if (empty($user['identificacion'])) {
    respond(['ok' => true, 'programas' => [], 'vinculado' => false]);
}

// La matrícula real es el histórico importado de Q10 (tabla `matriculas`,
// programa guardado como texto libre "{nombre} - {jornada}", sin FK) — ya no
// depende de que alguien lo matricule a mano en Campus Virtual. Se excluyen
// solo los CANCELADO (el estudiante se retiró); ACTIVO/INACTIVO/GRADUADO sí
// dan acceso al contenido, igual que cursos ligeros no exige "publicar". Las
// matrículas nuevas (creadas desde Registrar estudiante) no llevan sufijo de
// jornada, así que también se acepta el nombre exacto del programa.
$stmt = db()->prepare(
    "SELECT DISTINCT p.id, p.nombre, p.descripcion, p.imagen_path, p.dias_disponibles
     FROM programas p
     JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
     JOIN estudiantes e ON e.id = m.estudiante_id
     WHERE e.identificacion = ?
     ORDER BY p.nombre"
);
$stmt->execute([$user['identificacion']]);
respond(['ok' => true, 'programas' => $stmt->fetchAll(), 'vinculado' => true]);
