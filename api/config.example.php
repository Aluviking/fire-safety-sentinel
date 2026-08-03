<?php
/**
 * Copia este archivo como config.php (sin ".example") y reemplaza los valores
 * por los reales de tu base de datos MySQL en hPanel > Bases de datos.
 * config.php NUNCA debe subirse a git (ya está en .gitignore).
 */

// api/ vive dentro de public_html/ una vez desplegado, así que subir dos
// niveles desde aquí da la ruta justo al lado de public_html — crea ahí
// una carpeta "private_uploads" (fuera del webroot, no descargable por URL).
$uploadsDir = dirname(__DIR__, 2) . '/private_uploads';

return [
    'db_host' => 'localhost',
    'db_name' => 'CAMBIA_nombre_de_tu_base_de_datos',
    'db_user' => 'CAMBIA_usuario_de_la_base_de_datos',
    'db_pass' => 'CAMBIA_contraseña_de_la_base_de_datos',

    // Carpeta FUERA de public_html donde se guardan los archivos subidos.
    'uploads_dir' => $uploadsDir,

    // Orígenes permitidos para llamar a esta API (tu sitio en producción y
    // el servidor local de desarrollo de Vite).
    'allowed_origins' => [
        'https://siso.com.co',
        'https://www.siso.com.co',
        'http://localhost:8080',
        'http://localhost:5173',
    ],

    // Clave secreta para firmar los links temporales de vista previa de
    // documentos Word/Excel/PowerPoint (Microsoft Office Online). Genera la
    // tuya con: php -r "echo bin2hex(random_bytes(48));" — nunca la compartas
    // ni la subas a git.
    'view_link_secret' => 'CAMBIA_esto_por_una_cadena_aleatoria_larga',

    // Respaldo diario a Google Drive (ver api/backup/run_backup.php).
    // client_email y private_key salen del archivo JSON de la cuenta de
    // servicio que descargaste de Google Cloud Console — cópialos tal cual
    // aparecen ahí (private_key incluye los saltos de línea "\n" literales).
    'google_drive' => [
        'client_email' => 'CAMBIA_client_email_del_json_de_la_cuenta_de_servicio',
        'private_key'  => "CAMBIA_private_key_del_json_de_la_cuenta_de_servicio",
        'folder_id'    => 'CAMBIA_id_de_la_carpeta_de_drive_compartida',
    ],
];
