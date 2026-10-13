<?php
require __DIR__ . '/../bootstrap.php';

// Cada usuario elige su propio ícono de avatar (nunca sube una foto real —
// a propósito, así no hace falta manejar subida/almacenamiento de imágenes
// para algo puramente decorativo). Se guarda en users.avatar_path, que hoy
// no lo usa ninguna otra pantalla como URL de imagen real — reutilizarlo es
// seguro.
$ICONOS_VALIDOS = [
    'User', 'GraduationCap', 'BookOpen', 'Star', 'Heart', 'Smile',
    'Rocket', 'Sparkles', 'Trophy', 'Target', 'Compass', 'Lightbulb',
];

$user = require_auth();
$body = json_body();
$icono = trim($body['icono'] ?? '');

if (!in_array($icono, $ICONOS_VALIDOS, true)) fail('Ícono no válido.');

db()->prepare('UPDATE users SET avatar_path = ? WHERE id = ?')->execute([$icono, $user['id']]);
respond(['ok' => true, 'avatar' => $icono]);
