<?php
require __DIR__ . '/../bootstrap.php';

// Las notas reales del propio estudiante -- evaluaciones (por asignatura/
// parámetro, lo que va calificando el docente en el período) y notas_finales
// (el resultado consolidado por asignatura al cerrar el período). Ambas
// tablas se filtran solo por `identificacion_estudiante` (texto plano, sin
// FK) -- funciona igual para un estudiante importado de Q10 que para uno
// creado directo en Campus Virtual, porque ninguna de las dos depende de
// cómo se creó la cuenta, solo de que la identificación coincida.

$user = require_auth();
if ($user['role'] !== 'estudiante' || empty($user['identificacion'])) fail('No autorizado.', 403);

// El estudiante NUNCA ve sus notas por defecto -- el docente/super_admin
// tiene que haber prendido "Mostrar notas" en AL MENOS una de sus
// matrículas (desde Estudiantes dentro de Programa). evaluaciones/
// notas_finales no guardan a qué matrícula puntual pertenece cada fila
// (solo asignatura + período, sin FK), así que el candado es binario por
// estudiante, no por programa puntual -- si el día de mañana hace falta
// más detalle, agregar esa relación es el siguiente paso.
$stmt = db()->prepare(
    "SELECT 1 FROM matriculas m JOIN estudiantes e ON e.id = m.estudiante_id
     WHERE e.identificacion = ? AND m.estado != 'CANCELADO' AND m.mostrar_notas = 1 LIMIT 1"
);
$stmt->execute([$user['identificacion']]);
if (!$stmt->fetch()) {
    respond(['ok' => true, 'evaluaciones' => [], 'notasFinales' => []]);
}

$stmt = db()->prepare(
    'SELECT * FROM evaluaciones WHERE identificacion_estudiante = ? ORDER BY periodo DESC, asignatura, parametro'
);
$stmt->execute([$user['identificacion']]);
$evaluaciones = $stmt->fetchAll();

$stmt = db()->prepare(
    'SELECT * FROM notas_finales WHERE identificacion_estudiante = ? ORDER BY periodo DESC, asignatura'
);
$stmt->execute([$user['identificacion']]);
$notasFinales = $stmt->fetchAll();

respond(['ok' => true, 'evaluaciones' => $evaluaciones, 'notasFinales' => $notasFinales]);
