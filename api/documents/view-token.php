<?php
require __DIR__ . '/../bootstrap.php';

/**
 * Genera un link público TEMPORAL (5 minutos, firmado, no adivinable) para
 * que el visor de Microsoft Office Online pueda leer un documento Word/Excel/
 * PowerPoint y mostrarlo en el navegador sin descargarlo. Solo se usa para
 * esos formatos — PDF/imágenes se ven directo con el token normal de sesión,
 * sin necesidad de exponer ningún link público.
 */
$user = require_auth();

$id = $_GET['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM documents WHERE id = ?');
$stmt->execute([$id]);
$doc = $stmt->fetch();
if (!$doc) fail('No encontrado.', 404);

if (!has_permission($user, $doc['empresa_id'], 'can_view')) fail('No tienes permiso para esto.', 403);

$secret = config('view_link_secret');
if (!$secret) fail('Vista previa no configurada en el servidor.', 500);

$expires    = time() + 300; // 5 minutos
$signature  = hash_hmac('sha256', "$id.$expires", $secret);
$token      = "$id.$expires.$signature";

$scheme    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host      = $_SERVER['HTTP_HOST'] ?? 'siso.com.co';
$publicUrl = "$scheme://$host/api/documents/view-public.php?token=" . urlencode($token);

log_trace($user, 'view_folder', $doc['empresa_id'], "Visualizó {$doc['original_filename']} (Office Online)");

respond(['ok' => true, 'url' => $publicUrl]);
