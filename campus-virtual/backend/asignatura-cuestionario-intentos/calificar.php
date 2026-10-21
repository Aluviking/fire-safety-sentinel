<?php
require __DIR__ . '/../bootstrap.php';

// Califica a mano las respuestas 'descriptiva' de un intento (lo único que
// no se puede calificar solo al enviar) y recalcula el total del intento.

$user = require_auth();

$body = json_body();
$intentoId = (int) ($body['intentoId'] ?? 0);
$calificaciones = is_array($body['calificaciones'] ?? null) ? $body['calificaciones'] : [];
if ($intentoId === 0) fail('intentoId requerido.');

$stmt = db()->prepare(
    'SELECT i.*, c.asignatura_id FROM asignatura_cuestionario_intentos i
     JOIN asignatura_contenido c ON c.id = i.contenido_id WHERE i.id = ?'
);
$stmt->execute([$intentoId]);
$intento = $stmt->fetch();
if (!$intento) fail('Intento no encontrado.', 404);
if ($intento['enviado_at'] === null) fail('Este intento todavía no fue enviado.', 403);

require_gestion_asignatura($user, (int) $intento['asignatura_id']);

$stmt = db()->prepare(
    'SELECT r.*, p.puntos AS puntos_max FROM asignatura_cuestionario_respuestas r
     JOIN asignatura_preguntas p ON p.id = r.pregunta_id WHERE r.intento_id = ?'
);
$stmt->execute([$intentoId]);
$respuestas = $stmt->fetchAll();

$update = db()->prepare('UPDATE asignatura_cuestionario_respuestas SET es_correcta = ?, puntos_obtenidos = ? WHERE id = ?');
foreach ($calificaciones as $cal) {
    $rid = (int) ($cal['respuestaId'] ?? 0);
    $match = null;
    foreach ($respuestas as $r) { if ((int) $r['id'] === $rid) { $match = $r; break; } }
    if (!$match) continue;
    $puntos = max(0.0, min((float) $match['puntos_max'], (float) ($cal['puntos'] ?? 0)));
    $update->execute([!empty($cal['esCorrecta']) ? 1 : 0, $puntos, $rid]);
}

$stmt = db()->prepare(
    'SELECT COALESCE(SUM(puntos_obtenidos), 0) AS obtenidos FROM asignatura_cuestionario_respuestas WHERE intento_id = ?'
);
$stmt->execute([$intentoId]);
$obtenidos = (float) $stmt->fetchColumn();

$stmt = db()->prepare('SELECT COALESCE(SUM(puntos), 0) FROM asignatura_preguntas WHERE contenido_id = ?');
$stmt->execute([$intento['contenido_id']]);
$totales = (float) $stmt->fetchColumn();

$stmt = db()->prepare('SELECT porcentaje_aprobacion FROM asignatura_contenido WHERE id = ?');
$stmt->execute([$intento['contenido_id']]);
$pctAprob = $stmt->fetchColumn();

$porcentaje = $totales > 0 ? round($obtenidos / $totales * 100, 2) : 0.0;
$aprobado = ($pctAprob !== null && $pctAprob !== false) ? ($porcentaje >= (float) $pctAprob) : null;

// Ya no quedan 'descriptiva' sin calificar en este intento -- se verifica
// antes de limpiar la bandera, por si el docente solo califica parte.
$stmt = db()->prepare(
    "SELECT COUNT(*) FROM asignatura_cuestionario_respuestas r
     JOIN asignatura_preguntas p ON p.id = r.pregunta_id
     WHERE r.intento_id = ? AND p.tipo_respuesta = 'descriptiva' AND r.es_correcta IS NULL"
);
$stmt->execute([$intentoId]);
$faltan = (int) $stmt->fetchColumn();

db()->prepare(
    'UPDATE asignatura_cuestionario_intentos SET puntos_obtenidos = ?, puntos_totales = ?, porcentaje = ?, aprobado = ?, pendiente_calificar = ? WHERE id = ?'
)->execute([$obtenidos, $totales, $porcentaje, $aprobado === null ? null : ($aprobado ? 1 : 0), $faltan > 0 ? 1 : 0, $intentoId]);

log_trace($user, 'cuestionario_calificar', "Calificó el intento #$intentoId");
respond(['ok' => true, 'pendienteCalificar' => $faltan > 0]);
