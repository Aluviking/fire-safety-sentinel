<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'informes.consolidado_notas');

if ($user['role'] === 'docente') {
    $notasFinales = [];
    if (!empty($user['identificacion'])) {
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
        $notasFinales = $stmt->fetchAll();
    }
    // Las homologaciones importadas de Q10 no traen el docente identificado
    // (columna `docente` vacía en todos los registros reales), así que no hay
    // forma confiable de acotarlas por docente — se omiten en vez de mostrar
    // registros que podrían no ser suyos.
    respond(['ok' => true, 'notasFinales' => $notasFinales, 'homologaciones' => []]);
}

$notasFinales   = db()->query('SELECT * FROM notas_finales ORDER BY id DESC')->fetchAll();
$homologaciones = db()->query('SELECT * FROM homologaciones ORDER BY id DESC')->fetchAll();

respond(['ok' => true, 'notasFinales' => $notasFinales, 'homologaciones' => $homologaciones]);
