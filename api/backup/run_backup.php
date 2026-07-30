<?php
/**
 * Respaldo diario del Portal Empresarial.
 *
 * Exporta SOLO lo que pidió el cliente — nada de "basura" (sesiones,
 * contraseñas, config): los metadatos de documentos subidos (`documents`),
 * la bitácora de movimientos (`audit_trace`) y una copia de los archivos
 * reales ya cargados — todo comprimido en un ZIP y subido a la carpeta de
 * Google Drive configurada en config.php.
 *
 * Pensado para ejecutarse una vez al día vía Cron Job de Hostinger:
 *   php /ruta/a/public_html/api/backup/run_backup.php
 *
 * No se expone por HTTP (no vive bajo una URL pública) — solo corre por
 * línea de comandos, así que no necesita autenticación de usuario.
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Este script solo puede ejecutarse por línea de comandos (cron), no desde el navegador.');
}

require __DIR__ . '/../bootstrap_cli.php';
require __DIR__ . '/drive_client.php';

function backup_log(string $msg): void
{
    echo '[' . date('Y-m-d H:i:s') . "] $msg\n";
}

function rrmdir(string $dir): void
{
    if (!is_dir($dir)) return;
    foreach (scandir($dir) as $item) {
        if ($item === '.' || $item === '..') continue;
        $path = "$dir/$item";
        is_dir($path) ? rrmdir($path) : unlink($path);
    }
    rmdir($dir);
}

$driveConfig = config('google_drive');
if (!$driveConfig || empty($driveConfig['folder_id']) || empty($driveConfig['client_email']) || empty($driveConfig['private_key'])) {
    backup_log('ERROR: falta configurar la sección "google_drive" en config.php.');
    exit(1);
}

$stamp  = date('Y-m-d_His');
$tmpDir = sys_get_temp_dir() . "/siso-backup-$stamp";
mkdir($tmpDir, 0700, true);

backup_log('Exportando metadatos de documentos y auditoría...');
$documents = db()->query('SELECT * FROM documents ORDER BY uploaded_at')->fetchAll();
$trace     = db()->query('SELECT * FROM audit_trace ORDER BY created_at')->fetchAll();
file_put_contents("$tmpDir/documents.json", json_encode($documents, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$tmpDir/audit_trace.json", json_encode($trace, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

backup_log('Copiando archivos subidos (' . count($documents) . ' registros)...');
$uploadsDir = rtrim((string)config('uploads_dir'), '/');
$filesDir   = "$tmpDir/files";
mkdir($filesDir, 0700, true);
$missing = [];
foreach ($documents as $doc) {
    $src = "$uploadsDir/{$doc['stored_filename']}";
    if (!file_exists($src)) { $missing[] = $doc['id']; continue; }
    $carpeta = preg_replace('/[\/\\\\]/', '_', $doc['folder_name']);
    $destDir = "$filesDir/{$doc['empresa_id']}/{$doc['phva_phase']}/$carpeta";
    if (!is_dir($destDir)) mkdir($destDir, 0700, true);
    copy($src, "$destDir/{$doc['id']}_{$doc['original_filename']}");
}
if ($missing) {
    file_put_contents("$tmpDir/missing_files.json", json_encode($missing));
    backup_log('Aviso: ' . count($missing) . ' documento(s) en la base de datos sin archivo físico correspondiente.');
}

backup_log('Comprimiendo respaldo...');
$zipPath = sys_get_temp_dir() . "/siso-backup-$stamp.zip";
$zip = new ZipArchive();
if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
    backup_log('ERROR: no se pudo crear el archivo ZIP.');
    exit(1);
}
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($tmpDir), RecursiveIteratorIterator::LEAVES_ONLY);
foreach ($iterator as $file) {
    if ($file->isDir()) continue;
    $localName = substr($file->getPathname(), strlen($tmpDir) + 1);
    $zip->addFile($file->getPathname(), $localName);
}
$zip->close();

backup_log('Subiendo a Google Drive...');
try {
    $token  = drive_get_access_token($driveConfig);
    $result = drive_upload_file($token, $zipPath, "siso-backup-$stamp.zip", $driveConfig['folder_id']);
    backup_log("Listo: {$result['name']} subido a Drive (id {$result['id']}).");
} catch (Throwable $e) {
    backup_log('ERROR al subir a Drive: ' . $e->getMessage());
    backup_log("El ZIP quedó guardado localmente en $zipPath para revisión manual.");
    rrmdir($tmpDir);
    exit(1);
}

rrmdir($tmpDir);
unlink($zipPath);
backup_log('Respaldo diario completado correctamente.');
