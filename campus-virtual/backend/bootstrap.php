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
        // Zona horaria de Bogotá desde el día uno (en Portal Empresarial esto
        // faltó al principio y las fechas quedaron 5 horas adelantadas).
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
        'SELECT u.id, u.nombre, u.email, u.username, u.role, u.avatar_path, u.perfil_id, u.identificacion
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

/* ─── Perfiles de permisos ─────────────────────────────────────────────────
   Catálogo fijo de módulos reales de la app (no una tabla aparte — los
   módulos los define el código, no el usuario). Cada uno tiene ver/editar.
   Super Admin nunca pasa por esto — siempre ve todo. Un usuario sin
   perfil_id asignado también ve todo (compatibilidad con cuentas ya
   existentes) — asignar un perfil es lo que activa la restricción. */
function modulos_catalogo(): array
{
    return [
        'Institucional' => [
            'institucional.estudiantes'     => 'Estudiantes',
            'institucional.docentes'        => 'Docentes',
            'institucional.administrativos' => 'Administrativos',
            'institucional.codeudores'      => 'Codeudores',
        ],
        'Académico' => [
            'academico.evaluaciones'       => 'Evaluaciones',
            'academico.educacion_virtual'  => 'Educación virtual',
            'academico.cursos_ligeros'     => 'Cursos ligeros',
            'academico.cursos_virtuales'   => 'Cursos virtuales',
            'academico.plantillas'         => 'Plantillas',
            'academico.certificados'       => 'Certificados',
            'academico.aulas_virtuales'    => 'Aulas virtuales',
            'academico.programas'          => 'Programas',
            'academico.asignaturas'        => 'Asignaturas',
            'academico.cursos'             => 'Cursos',
        ],
        'Tesorería' => [
            'tesoreria.creditos'      => 'Créditos',
            'tesoreria.pagos'         => 'Pagos',
            'tesoreria.notas_credito' => 'Administrar notas crédito',
        ],
        'Informes' => [
            'informes.consolidado_notas'  => 'Consolidado de notas',
            'informes.cartera_general'    => 'Cartera general',
            'informes.gestion_financiera' => 'Gestión financiera',
        ],
        'Usuarios' => [
            'usuarios' => 'Usuarios',
        ],
    ];
}

function modulos_flat(): array
{
    $flat = [];
    foreach (modulos_catalogo() as $categoria => $items) {
        foreach ($items as $key => $label) $flat[$key] = ['categoria' => $categoria, 'label' => $label];
    }
    return $flat;
}

/**
 * Permisos por defecto según el ROL (sin necesidad de asignar un perfil
 * aparte) — replica los perfiles reales que ya existían en Q10:
 * "Coordinador Academico" (Institucional + Académico + Informes, sin
 * Tesorería) y "Gerente Administrativa" (Institucional + Tesorería +
 * Informes, sin Académico). Solo lectura por defecto (editar sigue siendo
 * exclusivo de admin/super_admin); un perfil explícito (perfil_id) puede
 * ajustar esto módulo por módulo si algún día hace falta más detalle.
 */
function rol_modulos_por_defecto(string $role): ?array
{
    $ver = fn(array $keys) => array_fill_keys($keys, ['ver' => true, 'editar' => false]);

    if ($role === 'equipo') {
        return $ver([
            'institucional.estudiantes', 'institucional.docentes', 'institucional.administrativos',
            'academico.evaluaciones', 'academico.educacion_virtual', 'academico.cursos_ligeros',
            'academico.cursos_virtuales', 'academico.plantillas', 'academico.certificados',
            'academico.aulas_virtuales', 'academico.programas', 'academico.asignaturas', 'academico.cursos',
            'informes.consolidado_notas', 'informes.cartera_general', 'informes.gestion_financiera',
        ]);
    }
    if ($role === 'administrativo') {
        return $ver([
            'institucional.estudiantes', 'institucional.docentes', 'institucional.administrativos',
            'tesoreria.creditos', 'tesoreria.pagos', 'tesoreria.notas_credito',
            'informes.consolidado_notas', 'informes.cartera_general', 'informes.gestion_financiera',
        ]);
    }
    // Docente — mismo panel administrativo (antes tenía uno aparte, muy
    // limitado, solo lectura de nombres). Alcance calcado del menú real que
    // Q10 le muestra a un docente: Estudiantes (sin Docentes/Administrativos),
    // Evaluaciones, Cursos ligeros/virtuales, Aulas virtuales, Informes. Ver
    // solamente — crear/editar/eliminar sigue siendo exclusivo de Super
    // Admin en todos lados, igual que para equipo/administrativo. Además,
    // list.php de cursos/cursos-ligeros filtra por docente_identificacion
    // cuando el rol es docente, para que solo vea SUS propios cursos.
    if ($role === 'docente') {
        $modulos = $ver([
            'institucional.estudiantes',
            'academico.evaluaciones', 'academico.cursos_ligeros', 'academico.cursos_virtuales',
            'academico.aulas_virtuales',
            'informes.consolidado_notas',
        ]);
        // Única excepción a "editar es solo Super Admin": el docente sí puede
        // calificar sus propias evaluaciones — el scoping real (solo sus
        // asignaturas/período, vía docente_tiene_asignatura_periodo()) se
        // aplica en evaluaciones/list.php y evaluaciones/update.php.
        $modulos['academico.evaluaciones']['editar'] = true;
        return $modulos;
    }
    return null;
}

function user_permisos(array $user): array
{
    if ($user['role'] === 'super_admin') return ['all' => true, 'modulos' => []];
    if ($user['role'] === 'admin' && empty($user['perfil_id'])) return ['all' => true, 'modulos' => []];

    if (!empty($user['perfil_id'])) {
        $stmt = db()->prepare('SELECT modulo, puede_ver, puede_editar FROM perfil_permisos WHERE perfil_id = ?');
        $stmt->execute([$user['perfil_id']]);
        $modulos = [];
        foreach ($stmt->fetchAll() as $row) {
            $modulos[$row['modulo']] = ['ver' => (bool) $row['puede_ver'], 'editar' => (bool) $row['puede_editar']];
        }
        return ['all' => false, 'modulos' => $modulos];
    }

    $porDefecto = rol_modulos_por_defecto($user['role']);
    if ($porDefecto !== null) return ['all' => false, 'modulos' => $porDefecto];

    // docente/estudiante: sin perfil y sin permisos por defecto — el
    // frontend ya les bloquea la entrada al panel administrativo.
    return ['all' => false, 'modulos' => []];
}

/**
 * Puerta de un endpoint por módulo real (ej. 'academico.evaluaciones') en
 * vez de por rol fijo. admin/super_admin sin perfil asignado siguen viendo
 * todo (compatibilidad con lo que ya existía). Un usuario 'equipo' o
 * 'administrativo' obtiene sus módulos automáticamente por rol (ver
 * rol_modulos_por_defecto) sin ningún paso manual de asignación; un
 * perfil_id explícito puede afinar eso módulo por módulo si hace falta.
 */
function require_permiso(array $user, string $modulo, string $accion = 'ver'): void
{
    if ($user['role'] === 'super_admin') return;
    if ($user['role'] === 'admin' && empty($user['perfil_id'])) return;

    $permisos = user_permisos($user);
    $ok = $permisos['all'] || (($permisos['modulos'][$modulo][$accion] ?? false) === true);
    if (!$ok) fail('No autorizado.', 403);
}

/**
 * Igual que require_permiso(), pero pasa con CUALQUIERA de varios módulos —
 * necesario porque "Estructuración › Crear curso" (academico.cursos) y
 * "Educación virtual › Cursos virtuales" (academico.cursos_virtuales) son
 * dos rutas de menú distintas que en realidad leen la MISMA tabla `cursos`;
 * un rol como Docente puede tener acceso solo por la segunda ruta.
 */
function require_permiso_alguno(array $user, array $modulos, string $accion = 'ver'): void
{
    if ($user['role'] === 'super_admin') return;
    if ($user['role'] === 'admin' && empty($user['perfil_id'])) return;

    $permisos = user_permisos($user);
    if ($permisos['all']) return;
    foreach ($modulos as $modulo) {
        if (($permisos['modulos'][$modulo][$accion] ?? false) === true) return;
    }
    fail('No autorizado.', 403);
}

/**
 * Si no existe ya una ficha en `estudiantes` con esa identificación, la crea
 * con los datos mínimos — así una cuenta de acceso (rol estudiante) queda
 * vinculada automáticamente al registro real usado en matrículas, cursos,
 * notas y evaluaciones, sin duplicar captura de datos.
 */
function vincular_estudiante(string $identificacion, string $nombre): void
{
    $stmt = db()->prepare('SELECT id FROM estudiantes WHERE identificacion = ?');
    $stmt->execute([$identificacion]);
    if ($stmt->fetch()) return;

    db()->prepare('INSERT INTO estudiantes (identificacion, nombre_completo) VALUES (?, ?)')
        ->execute([$identificacion, $nombre]);
}

/** Mismo mecanismo que vincular_estudiante(), pero para cuentas con rol docente. */
function vincular_docente(string $identificacion, string $nombre): void
{
    $stmt = db()->prepare('SELECT id FROM docentes WHERE identificacion = ?');
    $stmt->execute([$identificacion]);
    if ($stmt->fetch()) return;

    db()->prepare('INSERT INTO docentes (identificacion, nombre_completo) VALUES (?, ?)')
        ->execute([$identificacion, $nombre]);
}

/**
 * Puerta de un endpoint de contenido de un curso ligero: admin/super_admin y
 * los roles con permiso sobre el módulo entran como siempre; un estudiante
 * solo entra si está realmente matriculado en ESE curso ligero puntual — así
 * puede ver el contenido de sus propios cursos sin poder leer los de nadie
 * más ni los de cursos donde no está inscrito.
 */
function require_acceso_curso_ligero(array $user, int $cursoLigeroId): void
{
    if ($user['role'] === 'estudiante') {
        if (empty($user['identificacion'])) fail('No autorizado.', 403);
        $stmt = db()->prepare('SELECT id FROM curso_ligero_inscripciones WHERE curso_ligero_id = ? AND estudiante_identificacion = ?');
        $stmt->execute([$cursoLigeroId, $user['identificacion']]);
        if (!$stmt->fetch()) fail('No autorizado.', 403);
        return;
    }
    require_permiso($user, 'academico.cursos_ligeros');
}

/** Mismo mecanismo que require_acceso_curso_ligero(), para el contenido de un Programa. */
function require_acceso_programa(array $user, int $programaId): void
{
    if ($user['role'] === 'estudiante') {
        if (empty($user['identificacion'])) fail('No autorizado.', 403);
        $stmt = db()->prepare(
            'SELECT pe.id FROM programa_estudiantes pe
             JOIN estudiantes e ON e.id = pe.estudiante_id
             WHERE pe.programa_id = ? AND e.identificacion = ?'
        );
        $stmt->execute([$programaId, $user['identificacion']]);
        if (!$stmt->fetch()) fail('No autorizado.', 403);
        return;
    }
    require_permiso($user, 'academico.programas');
}

/** Mismo mecanismo que require_acceso_curso_ligero(), para el contenido de una Asignatura. */
function require_acceso_asignatura(array $user, int $asignaturaId): void
{
    if ($user['role'] === 'estudiante') {
        if (empty($user['identificacion'])) fail('No autorizado.', 403);
        $stmt = db()->prepare(
            'SELECT ae.id FROM asignatura_estudiantes ae
             JOIN estudiantes e ON e.id = ae.estudiante_id
             WHERE ae.asignatura_id = ? AND e.identificacion = ?'
        );
        $stmt->execute([$asignaturaId, $user['identificacion']]);
        if (!$stmt->fetch()) fail('No autorizado.', 403);
        return;
    }
    require_permiso($user, 'academico.asignaturas');
}

/** Mismo mecanismo que require_acceso_curso_ligero(), para el contenido de un Curso. */
function require_acceso_curso(array $user, int $cursoId): void
{
    if ($user['role'] === 'estudiante') {
        if (empty($user['identificacion'])) fail('No autorizado.', 403);
        $stmt = db()->prepare(
            'SELECT ce.id FROM curso_estudiantes ce
             JOIN estudiantes e ON e.id = ce.estudiante_id
             WHERE ce.curso_id = ? AND e.identificacion = ?'
        );
        $stmt->execute([$cursoId, $user['identificacion']]);
        if (!$stmt->fetch()) fail('No autorizado.', 403);
        return;
    }
    require_permiso_alguno($user, ['academico.cursos', 'academico.cursos_virtuales']);
}

/**
 * Puente real entre el histórico de evaluaciones importado de Q10
 * (identificado solo por texto: asignatura + período, sin FK a docente) y el
 * docente asignado — usa `cursos.programa_asignatura_jornada` (que contiene
 * el nombre de la asignatura) + `cursos.periodo` + `cursos.docente_identificacion`,
 * ya verificado contra la vista real de Q10 para varios casos conocidos.
 */
function docente_tiene_asignatura_periodo(string $identificacion, string $asignatura, ?string $periodo): bool
{
    if ($periodo === null || $periodo === '' || $asignatura === '') return false;
    $stmt = db()->prepare(
        "SELECT 1 FROM cursos
         WHERE docente_identificacion = ?
           AND periodo = ?
           AND programa_asignatura_jornada LIKE CONCAT('%', ?, '%')
         LIMIT 1"
    );
    $stmt->execute([$identificacion, $periodo, $asignatura]);
    return (bool) $stmt->fetchColumn();
}

/* ─── Auditoría ────────────────────────────────────────────────────────── */
function log_trace(array $user, string $action, ?string $detail = null): void
{
    $stmt = db()->prepare(
        'INSERT INTO audit_trace (user_id, user_name, user_role, action, detail) VALUES (?,?,?,?,?)'
    );
    $stmt->execute([$user['id'], $user['nombre'], $user['role'], $action, $detail]);
}

/* ─── reCAPTCHA v2 (Google) ───────────────────────────────────────────────
   Verifica el token contra la API de Google desde el servidor — la única
   parte que realmente cuenta como seguridad (el widget en el navegador por
   sí solo no evita nada, cualquiera puede llamar a la API directo). */
function verify_recaptcha(?string $token): bool
{
    if (!$token) return false;
    $secret = config('recaptcha_secret');
    if (!$secret) return false;

    $payload = http_build_query([
        'secret'   => $secret,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]);

    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $payload,
            'timeout' => 6,
        ],
    ]);

    $result = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
    if ($result === false) return false;

    $data = json_decode($result, true);
    return is_array($data) && !empty($data['success']);
}
