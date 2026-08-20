<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.evaluaciones');

if ($user['role'] === 'docente') {
    if (empty($user['identificacion'])) {
        respond(['ok' => true, 'evaluaciones' => []]);
    }
    $stmt = db()->prepare(
        "SELECT e.* FROM evaluaciones e
         WHERE EXISTS (
           SELECT 1 FROM cursos c
           WHERE c.docente_identificacion = ?
             AND c.periodo = e.periodo
             AND c.programa_asignatura_jornada LIKE CONCAT('%', e.asignatura, '%')
         )
         ORDER BY e.id DESC"
    );
    $stmt->execute([$user['identificacion']]);
    $rows = $stmt->fetchAll();
} else {
    $rows = db()->query('SELECT * FROM evaluaciones ORDER BY id DESC')->fetchAll();
}

respond(['ok' => true, 'evaluaciones' => $rows]);
