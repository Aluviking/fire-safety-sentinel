<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.banco_preguntas');

// Modo "slim" — igual que Q10: la lista trae solo lo necesario para las
// tarjetas (título, tipo, etiquetas). Opciones/pares se piden aparte por
// pregunta al editar/previsualizar (banco-preguntas/detail.php).
$preguntas = db()->query('SELECT id, titulo, tipo, puntos, created_at FROM banco_preguntas ORDER BY id DESC')->fetchAll();

$etiquetasPorPregunta = [];
$rows = db()->query(
    'SELECT pe.pregunta_id, e.id, e.nombre, e.color
     FROM banco_pregunta_etiquetas pe
     JOIN banco_etiquetas e ON e.id = pe.etiqueta_id'
)->fetchAll();
foreach ($rows as $r) {
    $etiquetasPorPregunta[$r['pregunta_id']][] = ['id' => (int) $r['id'], 'nombre' => $r['nombre'], 'color' => $r['color']];
}

foreach ($preguntas as &$p) {
    $p['etiquetas'] = $etiquetasPorPregunta[$p['id']] ?? [];
}

respond(['ok' => true, 'preguntas' => $preguntas]);
