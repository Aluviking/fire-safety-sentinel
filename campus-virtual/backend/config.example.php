<?php
/**
 * Copia este archivo como config.php (sin ".example") y reemplaza los valores
 * por los reales de la base de datos MySQL de Campus Virtual en hPanel >
 * Bases de datos. config.php NUNCA debe subirse a git (ya está en .gitignore).
 */

return [
    'db_host' => 'localhost',
    'db_name' => 'CAMBIA_nombre_de_tu_base_de_datos',
    'db_user' => 'CAMBIA_usuario_de_la_base_de_datos',
    'db_pass' => 'CAMBIA_contraseña_de_la_base_de_datos',

    // Orígenes permitidos para llamar a esta API (Campus Virtual en producción
    // y el servidor local de desarrollo de Vite).
    'allowed_origins' => [
        'https://siso.com.co',
        'https://www.siso.com.co',
        'http://localhost:8082',
    ],

    // Clave SECRETA de reCAPTCHA v2 (google.com/recaptcha/admin) — nunca la
    // clave de sitio (esa es pública y va en el frontend). Se usa para
    // verificar el token contra la API de Google en cada intento de login.
    'recaptcha_secret' => 'CAMBIA_tu_secret_key_de_recaptcha',
];
