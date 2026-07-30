<?php
/**
 * Variante de bootstrap.php para scripts de línea de comandos (cron jobs).
 * No define headers HTTP ni CORS (no aplican fuera de una petición web) y no
 * exige sesión/token — estos scripts corren en el servidor, no vía navegador.
 */
declare(strict_types=1);

$__configPath = __DIR__ . '/config.php';
if (!file_exists($__configPath)) {
    fwrite(STDERR, "config.php no existe. Copia config.example.php como config.php y completa tus datos reales.\n");
    exit(1);
}
$__CONFIG = require $__configPath;

function db(): PDO
{
    global $__CONFIG;
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host={$__CONFIG['db_host']};dbname={$__CONFIG['db_name']};charset=utf8mb4";
        $pdo = new PDO($dsn, $__CONFIG['db_user'], $__CONFIG['db_pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function config(string $key)
{
    global $__CONFIG;
    return $__CONFIG[$key] ?? null;
}
