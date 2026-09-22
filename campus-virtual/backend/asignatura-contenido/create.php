<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$asignaturaId = (int) ($body['asignaturaId'] ?? 0);
$titulo       = trim($body['titulo'] ?? '');
if ($asignaturaId === 0 || $titulo === '') fail('El título es requerido.');
require_gestion_asignatura($user, $asignaturaId);

$stmt = db()->prepare('SELECT COALESCE(MAX(orden), -1) + 1 FROM asignatura_contenido WHERE asignatura_id = ?');
$stmt->execute([$asignaturaId]);
$orden = (int) $stmt->fetchColumn();

db()->prepare(
    'INSERT INTO asignatura_contenido
        (asignatura_id, titulo, modulo, tipo, orden, descripcion, contenido_texto, url_externa,
         como_completarlo, restringir_fecha, fecha_desde, fecha_hasta,
         preguntas_por_pagina, preguntas_aleatorias, mostrar_puntaje, tiempo_maximo_min, tiempo_minimo_min,
         porcentaje_aprobacion, intentos_disponibles, permitir_editar_respuestas,
         permitir_verificar_antes_enviar, ver_detalle_resultados, tomar_foto)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
)->execute([
    $asignaturaId, $titulo, trim($body['modulo'] ?? '') ?: null, $body['tipo'] ?? 'Texto', $orden,
    $body['descripcion'] ?? null, $body['contenidoTexto'] ?? null, $body['urlExterna'] ?? null,
    $body['comoCompletarlo'] ?? null, !empty($body['restringirFecha']) ? 1 : 0,
    $body['fechaDesde'] ?? null, $body['fechaHasta'] ?? null,
    $body['preguntasPorPagina'] ?? null, !empty($body['preguntasAleatorias']) ? 1 : 0,
    array_key_exists('mostrarPuntaje', $body) ? (!empty($body['mostrarPuntaje']) ? 1 : 0) : 1,
    $body['tiempoMaximoMin'] ?? null, $body['tiempoMinimoMin'] ?? null, $body['porcentajeAprobacion'] ?? null,
    $body['intentosDisponibles'] ?? 1,
    array_key_exists('permitirEditarRespuestas', $body) ? (!empty($body['permitirEditarRespuestas']) ? 1 : 0) : 1,
    array_key_exists('permitirVerificarAntesEnviar', $body) ? (!empty($body['permitirVerificarAntesEnviar']) ? 1 : 0) : 1,
    !empty($body['verDetalleResultados']) ? 1 : 0, !empty($body['tomarFoto']) ? 1 : 0,
]);

respond(['ok' => true, 'contenido' => ['id' => (int) db()->lastInsertId(), 'titulo' => $titulo]]);
