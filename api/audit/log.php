<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

// Este endpoint solo registra las acciones de "vista" que dispara el propio
// cliente al navegar (AuthContext.addTrace). El resto de acciones (subir,
// eliminar, cambiar rol/permiso, crear usuario/empresa, etc.) las registra
// cada endpoint server-side directamente vía log_trace() — nunca a través de
// aquí — para que un usuario autenticado no pueda fabricar entradas de
// auditoría falsas de acciones que nunca ocurrieron.
$allowedActions = ['view_empresa', 'view_phva', 'view_folder'];

$body      = json_body();
$action    = $body['action'] ?? '';
$empresaId = $body['empresaId'] ?? null;
$detail    = $body['detail'] ?? null;
if (!in_array($action, $allowedActions, true)) fail('Acción no permitida.', 400);

log_trace($user, $action, $empresaId, $detail);
respond(['ok' => true]);
