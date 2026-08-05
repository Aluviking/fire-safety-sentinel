<?php
/**
 * Cargado por cada endpoint. Da: conexión a MySQL, CORS, helpers de
 * respuesta JSON y autenticación por token de sesión.
 */
declare(strict_types=1);

$__configPath = __DIR__ . '/config.php';
if (!file_exists($__configPath)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'config.php no existe. Copia config.example.php como config.php y completa tus datos reales.']);
    exit;
}
$__CONFIG = require $__configPath;

/* ─── CORS ─────────────────────────────────────────────────────────────── */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $__CONFIG['allowed_origins'], true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* ─── DB ───────────────────────────────────────────────────────────────── */
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
        // Hostinger deja la zona horaria de MySQL en UTC por defecto. Sin esto,
        // CURRENT_TIMESTAMP (usado en created_at/uploaded_at de varias tablas)
        // queda 5 horas adelantado respecto a la hora real de Colombia, y como
        // el frontend interpreta esos valores como si ya fueran hora local, se
        // ve mal en el Historial y en las fechas de documentos.
        $pdo->exec("SET time_zone = '-05:00'");
    }
    return $pdo;
}

function config(string $key)
{
    global $__CONFIG;
    return $__CONFIG[$key] ?? null;
}

/* ─── Request / response helpers ──────────────────────────────────────── */
function json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond($data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function fail(string $message, int $status = 400): never
{
    respond(['ok' => false, 'error' => $message], $status);
}

function new_id(string $prefix): string
{
    return $prefix . '-' . bin2hex(random_bytes(8));
}

/* ─── Auth ─────────────────────────────────────────────────────────────── */
function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (preg_match('/Bearer\s+(\S+)/', $header, $m)) return $m[1];
    return null;
}

function current_user(): ?array
{
    $token = bearer_token();
    if (!$token) return null;
    $stmt = db()->prepare(
        'SELECT u.id, u.nombre, u.email, u.username, u.role, u.empresa_id
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token = ? AND s.expires_at > NOW()'
    );
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    return $user ?: null;
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) fail('No autenticado.', 401);
    return $user;
}

function require_role(array $user, array $roles): void
{
    if (!in_array($user['role'], $roles, true)) fail('No autorizado.', 403);
}

/* ─── Permisos granulares (Ver/Subir/Editar/Descargar) por usuario+empresa ──
   Admin/Super Admin siempre tienen todo. Equipo y Cliente se resuelven igual,
   por fila específica en `permissions` (user_id, empresa_id) — ya no hay
   distinción de lógica entre esos dos roles a este nivel. */
function has_permission(array $user, string $empresaId, string $field): bool
{
    if ($user['role'] === 'admin' || $user['role'] === 'super_admin') return true;
    if (!in_array($field, ['can_view', 'can_upload', 'can_edit', 'can_download'], true)) return false;
    $stmt = db()->prepare("SELECT $field FROM permissions WHERE user_id = ? AND empresa_id = ?");
    $stmt->execute([$user['id'], $empresaId]);
    $perm = $stmt->fetch();
    return (bool) ($perm[$field] ?? false);
}

function log_trace(array $user, string $action, ?string $empresaId = null, ?string $detail = null): void
{
    $stmt = db()->prepare(
        'INSERT INTO audit_trace (user_id, user_name, user_role, action, empresa_id, detail) VALUES (?,?,?,?,?,?)'
    );
    $stmt->execute([$user['id'], $user['nombre'], $user['role'], $action, $empresaId, $detail]);
}
