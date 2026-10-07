<?php
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../zoom-lib.php';

// Cualquier rol que pueda ver "Clases virtuales" necesita saber si Zoom ya
// está configurado, para mostrar u ocultar el botón "Crear con Zoom".
require_auth();

respond(['ok' => true, 'configurado' => zoom_configurado()]);
