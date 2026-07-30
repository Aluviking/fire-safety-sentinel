<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body      = json_body();
$empresaId = $body['id'] ?? '';
if ($empresaId === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM companies WHERE id = ?');
$stmt->execute([$empresaId]);
$company = $stmt->fetch();
if (!$company) fail('Empresa no encontrada.', 404);

// Borra primero los archivos físicos de esta empresa, para no dejar
// huérfanos en disco cuando sus documentos se eliminen en cascada.
$docs = db()->prepare('SELECT stored_filename FROM documents WHERE empresa_id = ?');
$docs->execute([$empresaId]);
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
foreach ($docs->fetchAll() as $doc) {
    $path = $uploadsDir . '/' . $doc['stored_filename'];
    if (file_exists($path)) unlink($path);
}

db()->prepare('DELETE FROM companies WHERE id = ?')->execute([$empresaId]);

log_trace($user, 'company_delete', $empresaId, "Eliminó la empresa {$company['nombre']}");
respond(['ok' => true]);
