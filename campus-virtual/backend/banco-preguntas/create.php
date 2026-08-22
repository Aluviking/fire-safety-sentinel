<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.banco_preguntas', 'editar');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body    = json_body();
$titulo  = trim($body['titulo'] ?? '');
$tipo    = (int) ($body['tipo'] ?? 0);
$desc    = trim($body['descripcion'] ?? '');
if ($titulo === '') fail('El título es requerido.');
if (!in_array($tipo, [1, 2, 3, 4, 6], true)) fail('Tipo de pregunta inválido.');
if ($desc === '') fail('La descripción es requerida.');

$etiquetaIds = is_array($body['etiquetaIds'] ?? null) ? $body['etiquetaIds'] : [];
if (empty($etiquetaIds)) fail('Debe seleccionar al menos una etiqueta.');

db()->prepare(
    'INSERT INTO banco_preguntas
        (titulo, descripcion, tipo, puntos, respuestas_aleatorias, permite_puntos_parciales,
         aplica_retroalimentacion, retroalimentacion)
     VALUES (?,?,?,?,?,?,?,?)'
)->execute([
    $titulo, $desc, $tipo,
    $body['puntos'] ?? 10,
    !empty($body['respuestasAleatorias']) ? 1 : 0,
    !empty($body['permitePuntosParciales']) ? 1 : 0,
    !empty($body['aplicaRetroalimentacion']) ? 1 : 0,
    $body['retroalimentacion'] ?? null,
]);
$id = (int) db()->lastInsertId();

$etiquetaStmt = db()->prepare('INSERT IGNORE INTO banco_pregunta_etiquetas (pregunta_id, etiqueta_id) VALUES (?, ?)');
foreach ($etiquetaIds as $eid) {
    $etiquetaStmt->execute([$id, (int) $eid]);
}

if (in_array($tipo, [1, 2, 3], true)) {
    $opciones = is_array($body['opciones'] ?? null) ? $body['opciones'] : [];
    $stmt = db()->prepare('INSERT INTO banco_pregunta_opciones (pregunta_id, texto, correcta, orden) VALUES (?,?,?,?)');
    foreach ($opciones as $i => $op) {
        $texto = trim($op['texto'] ?? '');
        if ($texto === '') continue;
        $stmt->execute([$id, $texto, !empty($op['correcta']) ? 1 : 0, $i]);
    }
} elseif ($tipo === 4) {
    $pares = is_array($body['pares'] ?? null) ? $body['pares'] : [];
    $stmt = db()->prepare('INSERT INTO banco_pregunta_pares (pregunta_id, termino, respuesta, orden) VALUES (?,?,?,?)');
    foreach ($pares as $i => $par) {
        $termino   = trim($par['termino'] ?? '');
        $respuesta = trim($par['respuesta'] ?? '');
        if ($termino === '' || $respuesta === '') continue;
        $stmt->execute([$id, $termino, $respuesta, $i]);
    }
}

log_trace($user, 'banco_pregunta_create', "Creó la pregunta \"$titulo\"");
respond(['ok' => true, 'pregunta' => ['id' => $id]]);
