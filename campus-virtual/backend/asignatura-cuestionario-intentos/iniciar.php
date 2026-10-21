<?php
require __DIR__ . '/../bootstrap.php';

// Arranca (o reanuda, si ya había uno sin enviar) el intento de un
// estudiante sobre un Cuestionario real de una asignatura. Devuelve las
// preguntas ya sin es_correcta/pareja_texto -- el estudiante nunca recibe
// la respuesta correcta antes de enviar.

$user = require_auth();
if ($user['role'] !== 'estudiante' || empty($user['identificacion'])) fail('Solo un estudiante puede presentar un cuestionario.', 403);

$body = json_body();
$contenidoId = (int) ($body['contenidoId'] ?? 0);
if ($contenidoId === 0) fail('contenidoId requerido.');

$stmt = db()->prepare("SELECT * FROM asignatura_contenido WHERE id = ? AND tipo = 'Cuestionario'");
$stmt->execute([$contenidoId]);
$contenido = $stmt->fetch();
if (!$contenido) fail('Cuestionario no encontrado.', 404);

require_acceso_asignatura($user, (int) $contenido['asignatura_id']);

$stmt = db()->prepare('SELECT COUNT(*) FROM asignatura_cuestionario_intentos WHERE contenido_id = ? AND estudiante_identificacion = ? AND enviado_at IS NOT NULL');
$stmt->execute([$contenidoId, $user['identificacion']]);
$yaEnviados = (int) $stmt->fetchColumn();

$limite = $contenido['intentos_disponibles'];
if ($limite !== null && $yaEnviados >= (int) $limite) {
    fail('Ya usaste todos tus intentos disponibles para este cuestionario.', 403);
}

// Si hay un intento sin enviar todavía, se reanuda en vez de crear uno nuevo.
$stmt = db()->prepare(
    'SELECT * FROM asignatura_cuestionario_intentos
     WHERE contenido_id = ? AND estudiante_identificacion = ? AND enviado_at IS NULL
     ORDER BY id DESC LIMIT 1'
);
$stmt->execute([$contenidoId, $user['identificacion']]);
$intento = $stmt->fetch();

if (!$intento) {
    db()->prepare(
        'INSERT INTO asignatura_cuestionario_intentos (contenido_id, estudiante_identificacion, estudiante_nombre, numero_intento)
         VALUES (?, ?, ?, ?)'
    )->execute([$contenidoId, $user['identificacion'], $user['nombre'] ?? null, $yaEnviados + 1]);
    $intentoId = (int) db()->lastInsertId();
    $iniciadoAt = date('Y-m-d H:i:s');
} else {
    $intentoId = (int) $intento['id'];
    $iniciadoAt = $intento['iniciado_at'];
}

$stmt = db()->prepare('SELECT id, texto, tipo_respuesta, puntos FROM asignatura_preguntas WHERE contenido_id = ? ORDER BY orden, id');
$stmt->execute([$contenidoId]);
$preguntas = $stmt->fetchAll();

$optStmt = db()->prepare('SELECT id, texto, pareja_texto FROM asignatura_opciones WHERE pregunta_id = ? ORDER BY orden, id');
foreach ($preguntas as &$p) {
    $optStmt->execute([$p['id']]);
    $opciones = $optStmt->fetchAll();
    if ($p['tipo_respuesta'] === 'asociacion') {
        // Los ítems (texto) se muestran en orden, pero las definiciones
        // (pareja_texto) revueltas -- si quedaran alineadas, el orden mismo
        // delataría la respuesta correcta.
        $definiciones = array_values(array_map(static fn($o) => $o['pareja_texto'], $opciones));
        shuffle($definiciones);
        $p['definiciones'] = $definiciones;
        $p['opciones'] = array_map(static function (array $o): array {
            return ['id' => $o['id'], 'texto' => $o['texto']];
        }, $opciones);
    } else {
        $p['opciones'] = array_map(static function (array $o): array {
            return ['id' => $o['id'], 'texto' => $o['texto']];
        }, $opciones);
    }
}
unset($p);

if ($contenido['preguntas_aleatorias']) shuffle($preguntas);

respond([
    'ok' => true, 'intentoId' => $intentoId, 'iniciadoAt' => $iniciadoAt,
    'tiempoMaximoMin' => $contenido['tiempo_maximo_min'], 'tiempoMinimoMin' => $contenido['tiempo_minimo_min'],
    'permitirVerificarAntesEnviar' => (bool) $contenido['permitir_verificar_antes_enviar'],
    'mostrarPuntaje' => (bool) $contenido['mostrar_puntaje'],
    'preguntas' => $preguntas,
]);
