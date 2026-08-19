<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body          = json_body();
$contenidoId   = (int) ($body['contenidoId'] ?? 0);
$texto         = trim($body['texto'] ?? '');
$tipoRespuesta = $body['tipoRespuesta'] ?? 'unica';
$opciones      = $body['opciones'] ?? [];
if ($contenidoId === 0 || $texto === '') fail('El texto de la pregunta es requerido.');

if ($tipoRespuesta === 'asociacion') {
    if (!is_array($opciones) || count($opciones) < 2) fail('Agrega al menos 2 pares para relacionar.');
    foreach ($opciones as $o) {
        if (trim($o['texto'] ?? '') === '' || trim($o['parejaTexto'] ?? '') === '') fail('Completa ambos lados de cada par.');
    }
} elseif ($tipoRespuesta !== 'descriptiva') {
    if (!is_array($opciones) || count($opciones) < 2) fail('Agrega al menos 2 opciones de respuesta.');
    if (!array_filter($opciones, fn($o) => !empty($o['esCorrecta']))) fail('Marca al menos una opción como correcta.');
}

$stmt = db()->prepare('SELECT COALESCE(MAX(orden), -1) + 1 FROM plantilla_preguntas WHERE contenido_id = ?');
$stmt->execute([$contenidoId]);
$orden = (int) $stmt->fetchColumn();

db()->prepare(
    'INSERT INTO plantilla_preguntas (contenido_id, texto, tipo_respuesta, puntos, retroalimentacion, orden) VALUES (?,?,?,?,?,?)'
)->execute([
    $contenidoId, $texto, $tipoRespuesta, $body['puntos'] ?? 10, $body['retroalimentacion'] ?? null, $orden,
]);
$preguntaId = (int) db()->lastInsertId();

if ($tipoRespuesta !== 'descriptiva') {
    $optStmt = db()->prepare('INSERT INTO plantilla_opciones (pregunta_id, texto, pareja_texto, es_correcta, orden) VALUES (?,?,?,?,?)');
    foreach ($opciones as $i => $o) {
        $optTexto = trim($o['texto'] ?? '');
        if ($optTexto === '') continue;
        $parejaTexto = $tipoRespuesta === 'asociacion' ? trim($o['parejaTexto'] ?? '') : null;
        $optStmt->execute([$preguntaId, $optTexto, $parejaTexto, !empty($o['esCorrecta']) ? 1 : 0, $i]);
    }
}

respond(['ok' => true, 'pregunta' => ['id' => $preguntaId]]);
