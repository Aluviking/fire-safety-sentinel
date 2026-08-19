<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del certificado es requerido.');

$predeterminado = !empty($body['predeterminado']) ? 1 : 0;

// Solo puede haber un certificado predeterminado a la vez.
if ($predeterminado) {
    db()->prepare('UPDATE certificados_plantillas SET predeterminado = 0 WHERE id != ?')->execute([$id]);
}

db()->prepare('UPDATE certificados_plantillas SET nombre = ?, predeterminado = ? WHERE id = ?')
    ->execute([$nombre, $predeterminado, $id]);

log_trace($user, 'certificado_update', "Editó el certificado $nombre");
respond(['ok' => true]);
