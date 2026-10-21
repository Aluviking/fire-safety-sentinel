<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.evaluaciones');

// Filtro opcional por estudiante puntual (ej. desde el panel de detalle de
// un estudiante dentro de Programa) -- sin esto, admin/super_admin
// recibían la tabla entera solo para filtrar un estudiante en el navegador.
$identificacion = trim($_GET['identificacion'] ?? '');

if ($user['role'] === 'docente') {
    if (empty($user['identificacion'])) {
        respond(['ok' => true, 'evaluaciones' => []]);
    }
    $sql = "SELECT e.* FROM evaluaciones e
         WHERE EXISTS (
           SELECT 1 FROM cursos c
           WHERE c.docente_identificacion = ?
             AND c.periodo = e.periodo
             AND c.programa_asignatura_jornada LIKE CONCAT('%', e.asignatura, '%')
         )";
    $params = [$user['identificacion']];
    if ($identificacion !== '') { $sql .= ' AND e.identificacion_estudiante = ?'; $params[] = $identificacion; }
    $stmt = db()->prepare($sql . ' ORDER BY e.id DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
} elseif ($identificacion !== '') {
    $stmt = db()->prepare('SELECT * FROM evaluaciones WHERE identificacion_estudiante = ? ORDER BY id DESC');
    $stmt->execute([$identificacion]);
    $rows = $stmt->fetchAll();
} else {
    $rows = db()->query('SELECT * FROM evaluaciones ORDER BY id DESC')->fetchAll();
}

respond(['ok' => true, 'evaluaciones' => $rows]);
