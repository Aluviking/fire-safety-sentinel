<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.evaluaciones');

if ($user['role'] === 'docente') {
    if (empty($user['identificacion'])) {
        respond(['ok' => true, 'notasFinales' => []]);
    }
    $stmt = db()->prepare(
        "SELECT n.* FROM notas_finales n
         WHERE EXISTS (
           SELECT 1 FROM cursos c
           WHERE c.docente_identificacion = ?
             AND c.periodo = n.periodo
             AND c.programa_asignatura_jornada LIKE CONCAT('%', n.asignatura, '%')
         )
         ORDER BY n.id DESC"
    );
    $stmt->execute([$user['identificacion']]);
    $rows = $stmt->fetchAll();
} else {
    $rows = db()->query('SELECT * FROM notas_finales ORDER BY id DESC')->fetchAll();
}

respond(['ok' => true, 'notasFinales' => $rows]);
