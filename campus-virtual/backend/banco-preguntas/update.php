<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.banco_preguntas', 'editar');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$current = db()->prepare('SELECT * FROM banco_preguntas WHERE id = ?');
$current->execute([$id]);
$row = $current->fetch();
if (!$row) fail('Pregunta no encontrada.', 404);

$field  = fn(string $key, string $col) => array_key_exists($key, $body) ? $body[$key] : $row[$col];
$titulo = array_key_exists('titulo', $body) ? trim($body['titulo']) : $row['titulo'];
$desc   = array_key_exists('descripcion', $body) ? trim($body['descripcion']) : $row['descripcion'];
if ($titulo === '') fail('El título es requerido.');
if ($desc === '') fail('La descripción es requerida.');

db()->prepare(
    'UPDATE banco_preguntas SET titulo = ?, descripcion = ?, puntos = ?, respuestas_aleatorias = ?,
        permite_puntos_parciales = ?, aplica_retroalimentacion = ?, retroalimentacion = ?
     WHERE id = ?'
)->execute([
    $titulo, $desc, $field('puntos', 'puntos'),
    array_key_exists('respuestasAleatorias', $body) ? (!empty($body['respuestasAleatorias']) ? 1 : 0) : $row['respuestas_aleatorias'],
    array_key_exists('permitePuntosParciales', $body) ? (!empty($body['permitePuntosParciales']) ? 1 : 0) : $row['permite_puntos_parciales'],
    array_key_exists('aplicaRetroalimentacion', $body) ? (!empty($body['aplicaRetroalimentacion']) ? 1 : 0) : $row['aplica_retroalimentacion'],
    $field('retroalimentacion', 'retroalimentacion'),
    $id,
]);

// Etiquetas — diff-based (mismo patrón que asignaturas/update.php con
// programaIds), en vez de borrar-e-insertar ciego.
if (array_key_exists('etiquetaIds', $body) && is_array($body['etiquetaIds'])) {
    $stmt = db()->prepare('SELECT etiqueta_id FROM banco_pregunta_etiquetas WHERE pregunta_id = ?');
    $stmt->execute([$id]);
    $idsActuales = array_map('intval', array_column($stmt->fetchAll(), 'etiqueta_id'));
    $idsNuevos   = array_map('intval', $body['etiquetaIds']);

    $aQuitar = array_diff($idsActuales, $idsNuevos);
    if (!empty($aQuitar)) {
        $placeholders = implode(',', array_fill(0, count($aQuitar), '?'));
        db()->prepare("DELETE FROM banco_pregunta_etiquetas WHERE pregunta_id = ? AND etiqueta_id IN ($placeholders)")
            ->execute(array_merge([$id], array_values($aQuitar)));
    }
    $aAgregar = array_diff($idsNuevos, $idsActuales);
    if (!empty($aAgregar)) {
        $insert = db()->prepare('INSERT IGNORE INTO banco_pregunta_etiquetas (pregunta_id, etiqueta_id) VALUES (?, ?)');
        foreach ($aAgregar as $eid) $insert->execute([$id, $eid]);
    }
}

// Opciones/pares — a diferencia de las etiquetas, aquí sí se reemplaza todo:
// editar una pregunta significa redefinir sus respuestas por completo, no
// hay metadata propia del vínculo que valga la pena preservar (a diferencia
// del pensum de Programas, que sí guarda nivel/créditos por vínculo).
if (in_array($row['tipo'], [1, 2, 3], true) && array_key_exists('opciones', $body) && is_array($body['opciones'])) {
    db()->prepare('DELETE FROM banco_pregunta_opciones WHERE pregunta_id = ?')->execute([$id]);
    $stmt = db()->prepare('INSERT INTO banco_pregunta_opciones (pregunta_id, texto, correcta, orden) VALUES (?,?,?,?)');
    foreach ($body['opciones'] as $i => $op) {
        $texto = trim($op['texto'] ?? '');
        if ($texto === '') continue;
        $stmt->execute([$id, $texto, !empty($op['correcta']) ? 1 : 0, $i]);
    }
} elseif ((int) $row['tipo'] === 4 && array_key_exists('pares', $body) && is_array($body['pares'])) {
    db()->prepare('DELETE FROM banco_pregunta_pares WHERE pregunta_id = ?')->execute([$id]);
    $stmt = db()->prepare('INSERT INTO banco_pregunta_pares (pregunta_id, termino, respuesta, orden) VALUES (?,?,?,?)');
    foreach ($body['pares'] as $i => $par) {
        $termino   = trim($par['termino'] ?? '');
        $respuesta = trim($par['respuesta'] ?? '');
        if ($termino === '' || $respuesta === '') continue;
        $stmt->execute([$id, $termino, $respuesta, $i]);
    }
}

log_trace($user, 'banco_pregunta_update', "Editó la pregunta \"$titulo\"");
respond(['ok' => true]);
