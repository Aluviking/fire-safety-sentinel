<?php
/**
 * Copia este archivo como config.php (sin ".example") y reemplaza los valores
 * por los reales de la base de datos MySQL de Campus Virtual en hPanel >
 * Bases de datos. config.php NUNCA debe subirse a git (ya está en .gitignore).
 */

// campus-api/ vive dentro de public_html/ una vez desplegado (mismo nivel que
// api/), así que subir dos niveles desde aquí da la ruta justo al lado de
// public_html — crea ahí una carpeta "private_uploads_campus" (fuera del
// webroot, no descargable por URL directa). Nombre distinto al de Portal
// Empresarial para no mezclar los dos sistemas de archivos.
$uploadsDir = dirname(__DIR__, 2) . '/private_uploads_campus';

return [
    'db_host' => 'localhost',
    'db_name' => 'CAMBIA_nombre_de_tu_base_de_datos',
    'db_user' => 'CAMBIA_usuario_de_la_base_de_datos',
    'db_pass' => 'CAMBIA_contraseña_de_la_base_de_datos',

    // Carpeta FUERA de public_html donde se guardan los archivos subidos
    // (ej. imágenes de certificados).
    'uploads_dir' => $uploadsDir,

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

    // App "Server-to-Server OAuth" de Zoom (marketplace.zoom.us > Develop >
    // Build App) — para que "Clases virtuales" pueda crear la reunión de
    // verdad con grabación automática en la nube. zoom_webhook_secret es el
    // "Secret Token" de la sección "Event Subscriptions" de esa misma app
    // (webhook configurado hacia campus-api/zoom/webhook.php), NO el Client
    // Secret — son dos valores distintos.
    'zoom_account_id'     => 'CAMBIA_tu_account_id',
    'zoom_client_id'      => 'CAMBIA_tu_client_id',
    'zoom_client_secret'  => 'CAMBIA_tu_client_secret',
    'zoom_webhook_secret' => 'CAMBIA_tu_secret_token_del_webhook',
];
