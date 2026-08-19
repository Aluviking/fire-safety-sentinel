<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

// Catálogo completo de módulos disponibles, para que el formulario de
// crear/editar perfil sepa qué casillas dibujar (sin repetir esta lista en
// el frontend).
respond(['ok' => true, 'categorias' => modulos_catalogo()]);
