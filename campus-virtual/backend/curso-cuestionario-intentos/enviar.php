<?php
require __DIR__ . '/../bootstrap.php';

// Recibe las respuestas de un intento ya iniciado y lo califica:
// única/múltiple/asociación se califican solas comparando contra
// es_correcta/pareja_texto; descriptiva (texto libre) queda pendiente de
// que el docente/admin la califique a mano.

$user = require_auth();
if ($user['role'] !== 'estudiante' || empty($user['identificacion'])) fail('No autorizado.', 403);

$body = json_body();
$intentoId = (int) ($body['intentoId'] ?? 0);
$respuestasBody = is_array($body['respuestas'] ?? null) ? $body['respuestas'] : [];
if ($intentoId === 0) fail('intentoId requerido.');

$stmt = db()->prepare('SELECT * FROM curso_cuestionario_intentos WHERE id = ?');
$stmt->execute([$intentoId]);
$intento = $stmt->fetch();
if (!$intento) fail('Intento no encontrado.', 404);
if ($intento['estudiante_identificacion'] !== $user['identificacion']) fail('No autorizado.', 403);
if ($intento['enviado_at'] !== null) fail('Este intento ya fue enviado.', 403);

$stmt = db()->prepare('SELECT * FROM curso_contenido WHERE id = ?');
$stmt->execute([$intento['contenido_id']]);
$contenido = $stmt->fetch();
if (!$contenido) fail('Cuestionario no encontrado.', 404);

$segundos = time() - strtotime($intento['iniciado_at']);
if ($contenido['tiempo_minimo_min'] && $segundos < ((int) $contenido['tiempo_minimo_min'] * 60)) {
    fail('Todavía no ha pasado el tiempo mínimo para enviar este cuestionario.', 403);
}
// Si ya se pasó del tiempo máximo NO se bloquea el envío -- antes se
// rechazaba con fail() y el intento quedaba sin enviar_at para siempre, y
// como iniciar.php siempre reanuda el intento sin enviar que ya existe (en
// vez de crear uno nuevo), el estudiante quedaba atascado sin poder volver a
// presentar el cuestionario NUNCA, ni gastando otro de sus intentos
// disponibles. Ahora se envía igual (como un examen real: se acaba el
// tiempo y se califica con lo que alcanzó a responder) y queda marcado
// aparte como tardío para que el docente lo sepa.
$tiempoAgotado = $contenido['tiempo_maximo_min'] && $segundos > ((int) $contenido['tiempo_maximo_min'] * 60 + 90);

$stmt = db()->prepare('SELECT * FROM curso_preguntas WHERE contenido_id = ?');
$stmt->execute([$intento['contenido_id']]);
$preguntas = $stmt->fetchAll();
$optStmt = db()->prepare('SELECT * FROM curso_opciones WHERE pregunta_id = ? ORDER BY orden, id');
$insertResp = db()->prepare(
    'INSERT INTO curso_cuestionario_respuestas (intento_id, pregunta_id, opcion_ids, texto_respuesta, es_correcta, puntos_obtenidos)
     VALUES (?,?,?,?,?,?)'
);

$puntosObtenidos = 0.0; $puntosTotales = 0.0; $pendiente = false;

foreach ($preguntas as $p) {
    $puntosTotales += (float) $p['puntos'];
    $respuesta = null;
    foreach ($respuestasBody as $r) {
        if ((int) ($r['preguntaId'] ?? 0) === (int) $p['id']) { $respuesta = $r; break; }
    }
    $optStmt->execute([$p['id']]);
    $opciones = $optStmt->fetchAll();

    $esCorrecta = null; $puntos = 0.0; $opcionIds = null; $texto = null;

    if ($p['tipo_respuesta'] === 'descriptiva') {
        $texto = trim((string) ($respuesta['texto'] ?? ''));
        $pendiente = true;
    } elseif ($p['tipo_respuesta'] === 'asociacion') {
        $pares = is_array($respuesta['pares'] ?? null) ? $respuesta['pares'] : [];
        $opcionIds = json_encode($pares);
        $totalPares = count($opciones);
        $correctos = 0;
        foreach ($pares as $par) {
            $op = null;
            foreach ($opciones as $o) { if ((int) $o['id'] === (int) ($par['opcionId'] ?? 0)) { $op = $o; break; } }
            if ($op && trim((string) ($par['parejaElegida'] ?? '')) === trim((string) $op['pareja_texto'])) $correctos++;
        }
        $esCorrecta = $totalPares > 0 && $correctos === $totalPares;
        $puntos = $totalPares > 0 ? round((float) $p['puntos'] * $correctos / $totalPares, 2) : 0.0;
    } else {
        $enviados = array_map('intval', is_array($respuesta['opcionIds'] ?? null) ? $respuesta['opcionIds'] : []);
        sort($enviados);
        $opcionIds = implode(',', $enviados);
        $correctas = array_map(static fn($o) => (int) $o['id'], array_values(array_filter($opciones, static fn($o) => (bool) $o['es_correcta'])));
        sort($correctas);
        $esCorrecta = !empty($correctas) && $enviados === $correctas;
        $puntos = $esCorrecta ? (float) $p['puntos'] : 0.0;
    }

    $puntosObtenidos += $puntos;
    $insertResp->execute([$intentoId, $p['id'], $opcionIds, $texto, $esCorrecta === null ? null : ($esCorrecta ? 1 : 0), $puntos]);
}

$porcentaje = $puntosTotales > 0 ? round($puntosObtenidos / $puntosTotales * 100, 2) : 0.0;
$aprobado = $contenido['porcentaje_aprobacion'] !== null ? ($porcentaje >= (float) $contenido['porcentaje_aprobacion']) : null;

db()->prepare(
    'UPDATE curso_cuestionario_intentos
     SET enviado_at = NOW(), puntos_obtenidos = ?, puntos_totales = ?, porcentaje = ?, aprobado = ?, pendiente_calificar = ?
     WHERE id = ?'
)->execute([
    $puntosObtenidos, $puntosTotales, $porcentaje, $aprobado === null ? null : ($aprobado ? 1 : 0), $pendiente ? 1 : 0, $intentoId,
]);

respond([
    'ok' => true,
    'mostrarPuntaje' => (bool) $contenido['mostrar_puntaje'],
    'verDetalle' => (bool) $contenido['ver_detalle_resultados'],
    'puntosObtenidos' => $puntosObtenidos, 'puntosTotales' => $puntosTotales,
    'porcentaje' => $porcentaje, 'aprobado' => $aprobado, 'pendienteCalificar' => $pendiente,
    'tiempoAgotado' => $tiempoAgotado,
]);
