<?php
require __DIR__ . '/../bootstrap.php';

// Cualquier usuario autenticado puede ver SUS PROPIAS cuentas vinculadas —
// esto es lo que alimenta el selector de "Cambiar de cuenta" que aparece en
// todos los paneles (docente, estudiante, admin...), no solo en Usuarios.

$user = require_auth();

$stmt = db()->prepare(
    'SELECT u.id, u.nombre, u.role, u.username
     FROM usuarios_vinculados uv
     JOIN users u ON u.id = uv.vinculado_a_user_id
     WHERE uv.user_id = ?
     ORDER BY u.nombre'
);
$stmt->execute([$user['id']]);
respond(['ok' => true, 'cuentas' => $stmt->fetchAll()]);
