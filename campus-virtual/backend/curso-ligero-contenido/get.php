<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$id = $_GET['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM curso_ligero_contenido WHERE id = ?');
$stmt->execute([$id]);
$item = $stmt->fetch();
if (!$item) fail('Recurso no encontrado.', 404);

if ($item['tipo'] === 'Cuestionario') {
    $stmt = db()->prepare('SELECT * FROM curso_ligero_preguntas WHERE contenido_id = ? ORDER BY orden, id');
    $stmt->execute([$id]);
    $preguntas = $stmt->fetchAll();

    $optStmt = db()->prepare('SELECT * FROM curso_ligero_opciones WHERE pregunta_id = ? ORDER BY orden, id');
    foreach ($preguntas as &$p) {
        $optStmt->execute([$p['id']]);
        $p['opciones'] = $optStmt->fetchAll();
    }
    unset($p);
    $item['preguntas'] = $preguntas;
}

respond(['ok' => true, 'contenido' => $item]);
