<?php
require __DIR__ . '/../bootstrap.php';

// Doble uso, según quién pregunte:
// - ?id=  -> detalle completo de UN intento (con sus respuestas) -- el
//   estudiante solo puede ver el suyo; docente/admin necesita ser dueño
//   del curso (require_gestion_curso).
// - ?contenidoId= -> lista de intentos de ese cuestionario -- un
//   estudiante recibe solo los suyos (para reanudar/ver su historial);
//   docente/admin recibe los de TODOS los estudiantes (para revisar).

$user = require_auth();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$contenidoId = isset($_GET['contenidoId']) ? (int) $_GET['contenidoId'] : 0;

if ($id > 0) {
    $stmt = db()->prepare(
        'SELECT i.*, c.curso_id, c.ver_detalle_resultados FROM curso_cuestionario_intentos i
         JOIN curso_contenido c ON c.id = i.contenido_id WHERE i.id = ?'
    );
    $stmt->execute([$id]);
    $intento = $stmt->fetch();
    if (!$intento) fail('Intento no encontrado.', 404);

    if ($user['role'] === 'estudiante') {
        if ($intento['estudiante_identificacion'] !== ($user['identificacion'] ?? null)) fail('No autorizado.', 403);
        // "Ver detalle de resultados" apagado = el estudiante no debe poder
        // ver cuáles respondió bien o mal -- antes esto solo se ocultaba en
        // el botón del frontend, pero llamando este endpoint directo igual
        // se veía todo (el toggle no protegía nada de verdad).
        if (!$intento['ver_detalle_resultados']) fail('El detalle de resultados no está habilitado para este cuestionario.', 403);
    } else {
        require_ver_o_gestion_curso($user, (int) $intento['curso_id']);
    }

    $stmt = db()->prepare(
        'SELECT r.*, p.texto AS pregunta_texto, p.tipo_respuesta, p.puntos AS puntos_max, p.retroalimentacion
         FROM curso_cuestionario_respuestas r JOIN curso_preguntas p ON p.id = r.pregunta_id
         WHERE r.intento_id = ? ORDER BY p.orden, p.id'
    );
    $stmt->execute([$id]);
    $respuestas = $stmt->fetchAll();

    // Ya se envió el intento, así que mostrar la respuesta correcta aquí no
    // es filtración -- es justo lo que se necesita para revisar/calificar.
    $optStmt = db()->prepare('SELECT * FROM curso_opciones WHERE pregunta_id = ? ORDER BY orden, id');
    foreach ($respuestas as &$r) {
        $optStmt->execute([$r['pregunta_id']]);
        $r['opciones'] = $optStmt->fetchAll();
    }
    unset($r);

    $intento['respuestas'] = $respuestas;
    respond(['ok' => true, 'intento' => $intento]);
}

if ($contenidoId === 0) fail('contenidoId o id requerido.');

$stmt = db()->prepare('SELECT curso_id FROM curso_contenido WHERE id = ?');
$stmt->execute([$contenidoId]);
$contenido = $stmt->fetch();
if (!$contenido) fail('Cuestionario no encontrado.', 404);

if ($user['role'] === 'estudiante') {
    if (empty($user['identificacion'])) fail('No autorizado.', 403);
    require_acceso_curso($user, (int) $contenido['curso_id']);
    $stmt = db()->prepare('SELECT * FROM curso_cuestionario_intentos WHERE contenido_id = ? AND estudiante_identificacion = ? ORDER BY numero_intento');
    $stmt->execute([$contenidoId, $user['identificacion']]);
} else {
    require_ver_o_gestion_curso($user, (int) $contenido['curso_id']);
    $stmt = db()->prepare('SELECT * FROM curso_cuestionario_intentos WHERE contenido_id = ? ORDER BY estudiante_nombre, numero_intento');
    $stmt->execute([$contenidoId]);
}

respond(['ok' => true, 'intentos' => $stmt->fetchAll()]);
