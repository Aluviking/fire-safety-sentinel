<?php
/**
 * Endpoint PÚBLICO (sin login) a propósito: el visor de Microsoft Office
 * Online lo carga desde el navegador de quien ve el documento (no desde un
 * servidor de Microsoft), así que la petición llega desde el origen
 * view.officeapps.live.com — por eso se permite cualquier origen aquí; la
 * seguridad real es el token firmado más abajo, no el origen de la petición.
 * Este header va ANTES de bootstrap.php porque ahí mismo se corta la
 * respuesta en peticiones OPTIONS (preflight de CORS) y debe estar puesto ya.
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require __DIR__ . '/../bootstrap.php';

/**
 * El token es válido para UN documento puntual y expira a los 5 minutos de
 * haberse generado en view-token.php. Sin ese token exacto, no se puede leer
 * nada.
 */

$token = $_GET['token'] ?? '';
if ($token === '') fail('Token requerido.', 400);

$parts = explode('.', $token);
if (count($parts) !== 3) fail('Token inválido.', 400);
[$id, $expires, $signature] = $parts;

$secret = config('view_link_secret');
if (!$secret) fail('Vista previa no configurada en el servidor.', 500);

$expected = hash_hmac('sha256', "$id.$expires", $secret);
if (!hash_equals($expected, $signature)) fail('Token inválido.', 403);
if ((int) $expires < time()) fail('El enlace de vista previa expiró.', 410);

$stmt = db()->prepare('SELECT * FROM documents WHERE id = ?');
$stmt->execute([$id]);
$doc = $stmt->fetch();
if (!$doc) fail('No encontrado.', 404);

$path = rtrim((string) config('uploads_dir'), '/') . '/' . $doc['stored_filename'];
if (!file_exists($path)) fail('Archivo no encontrado en el servidor.', 404);

header('Content-Type: ' . $doc['mime_type']);
header('Content-Disposition: inline; filename="' . addslashes($doc['original_filename']) . '"');
header('Content-Length: ' . filesize($path));
readfile($path);
exit;
