<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

$stmt = db()->prepare('SELECT nombre FROM programas WHERE id = ?');
$stmt->execute([$programaId]);
$programa = $stmt->fetch();
if (!$programa) fail('Programa no encontrado.', 404);

// Un docente solo ve la matrícula de SUS programas — admin/super_admin/
// equipo/administrativo siguen viendo cualquier programa, como siempre.
if ($user['role'] === 'docente') require_gestion_programa($user, (int) $programaId);

// La matrícula real de un programa NO vive en una tabla propia de Campus
// Virtual — es el histórico importado de Q10 (tabla `matriculas`), donde el
// programa quedó guardado como texto libre "{nombre} - {jornada}". No hay
// FK: se cruza por prefijo exacto del nombre real del programa. Las
// matrículas creadas desde Registrar estudiante (Campus Virtual nativo) ya
// no capturan jornada, así que también se acepta el nombre exacto sin sufijo.
$stmt = db()->prepare(
    "SELECT m.id, e.id AS estudiante_id, e.identificacion, e.nombre_completo,
            m.programa, m.periodo, m.nivel, m.estado, m.sede
     FROM matriculas m
     JOIN estudiantes e ON e.id = m.estudiante_id
     WHERE m.programa = ? OR m.programa LIKE CONCAT(?, ' - %')
     ORDER BY m.periodo DESC, e.nombre_completo"
);
$stmt->execute([$programa['nombre'], $programa['nombre']]);
$rows = $stmt->fetchAll();

$prefijo = strlen($programa['nombre']) + 3; // + " - "
foreach ($rows as &$r) {
    $r['jornada'] = strlen($r['programa']) > $prefijo ? substr($r['programa'], $prefijo) : null;
    unset($r['programa']);
}
unset($r);

respond(['ok' => true, 'matriculados' => $rows]);
