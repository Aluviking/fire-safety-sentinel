<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$id = $_GET['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM asignatura_contenido WHERE id = ?');
$stmt->execute([$id]);
$item = $stmt->fetch();
if (!$item) fail('Recurso no encontrado.', 404);

require_acceso_asignatura($user, (int) $item['asignatura_id']);

if ($item['tipo'] === 'Cuestionario') {
    $stmt = db()->prepare('SELECT * FROM asignatura_preguntas WHERE contenido_id = ? ORDER BY orden, id');
    $stmt->execute([$id]);
    $preguntas = $stmt->fetchAll();

    $optStmt = db()->prepare('SELECT * FROM asignatura_opciones WHERE pregunta_id = ? ORDER BY orden, id');
    foreach ($preguntas as &$p) {
        $optStmt->execute([$p['id']]);
        $opciones = $optStmt->fetchAll();
        if ($user['role'] === 'estudiante') {
            $opciones = array_map(static function (array $o): array {
                unset($o['es_correcta']);
                return $o;
            }, $opciones);
        }
        $p['opciones'] = $opciones;
    }
    unset($p);
    $item['preguntas'] = $preguntas;
}

respond(['ok' => true, 'contenido' => $item]);
