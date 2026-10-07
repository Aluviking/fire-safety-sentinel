<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'institucional.estudiantes');

// Un docente solo ve a SUS estudiantes (matriculados en algo que él enseña),
// nunca la base completa — admin/super_admin/equipo/administrativo siguen
// viendo a todos, como siempre.
if ($user['role'] === 'docente') {
    $ids = estudiante_ids_visibles_para_docente($user['identificacion'] ?? '');
    if (empty($ids)) {
        respond(['ok' => true, 'estudiantes' => []]);
    }
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = db()->prepare("SELECT * FROM estudiantes WHERE id IN ($placeholders) ORDER BY nombre_completo");
    $stmt->execute($ids);
    $estudiantes = $stmt->fetchAll();
} else {
    $estudiantes = db()->query('SELECT * FROM estudiantes ORDER BY nombre_completo')->fetchAll();
}

$matriculas = db()->query('SELECT * FROM matriculas ORDER BY id DESC')->fetchAll();
$byEstudiante = [];
foreach ($matriculas as $m) {
    $byEstudiante[$m['estudiante_id']][] = $m;
}

foreach ($estudiantes as &$e) {
    $e['matriculas'] = $byEstudiante[$e['id']] ?? [];
}
unset($e);

respond(['ok' => true, 'estudiantes' => $estudiantes]);
