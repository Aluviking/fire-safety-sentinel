<?php
require __DIR__ . '/../bootstrap.php';

// El Excel se lee en el navegador (no hay librería de Excel ni en este
// backend PHP ni en el frontend hasta ahora, así que evitamos meter una
// dependencia nueva en PHP) — aquí solo llega un arreglo ya parseado de
// filas {nombres, apellidos, tipoDocumento, identificacion, celular, correo}.

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body      = json_body();
$empresaId = (int) ($body['empresaId'] ?? 0);
$filas     = $body['empleados'] ?? [];

if ($empresaId === 0) fail('empresaId requerido.');
if (!is_array($filas) || count($filas) === 0) fail('No hay filas para importar.');

// El curso al que pertenece esta empresa -- los empleados cargados aquí SON
// estudiantes de ese curso (pedido explícito del cliente): deben quedar
// visibles en la pestaña "Estudiantes" del mismo curso, matriculados de
// verdad (misma convención sin FK que usa programa-matriculas/create.php:
// matriculas.programa = nombre exacto del curso) y con su propia cuenta de
// acceso (usuario y clave = identificación, igual que estudiantes/create.php).
$stmt = db()->prepare(
    'SELECT p.nombre FROM curso_empresas ce JOIN programas p ON p.id = ce.programa_id WHERE ce.id = ?'
);
$stmt->execute([$empresaId]);
$curso = $stmt->fetch();
if (!$curso) fail('Empresa/curso no encontrado.', 404);
$cursoNombre = $curso['nombre'];

$insertEmpleado = db()->prepare(
    'INSERT INTO curso_empresa_empleados (empresa_id, nombres, apellidos, tipo_documento, identificacion, celular, correo)
     VALUES (?,?,?,?,?,?,?)'
);
$buscarEstudiante  = db()->prepare('SELECT id FROM estudiantes WHERE identificacion = ?');
$crearEstudiante   = db()->prepare(
    'INSERT INTO estudiantes (identificacion, nombre_completo, tipo_documento, celular, correo) VALUES (?,?,?,?,?)'
);
$buscarMatricula = db()->prepare(
    "SELECT id FROM matriculas WHERE estudiante_id = ? AND (programa = ? OR programa LIKE CONCAT(?, ' - %'))"
);
$crearMatricula = db()->prepare(
    "INSERT INTO matriculas (estudiante_id, estado, sede, programa) VALUES (?, 'ACTIVO', 'Principal', ?)"
);

$insertados   = 0;
$omitidos     = 0;
$matriculados = 0;
$cuentasCreadas = 0;

foreach ($filas as $fila) {
    $nombres        = trim($fila['nombres'] ?? '');
    $apellidos      = trim($fila['apellidos'] ?? '');
    $tipoDocumento  = trim($fila['tipoDocumento'] ?? '') ?: null;
    $identificacion = trim($fila['identificacion'] ?? '');
    $celular        = trim($fila['celular'] ?? '') ?: null;
    $correo         = trim($fila['correo'] ?? '') ?: null;

    if ($nombres === '' || $apellidos === '' || $identificacion === '') {
        $omitidos++;
        continue;
    }

    $insertEmpleado->execute([$empresaId, $nombres, $apellidos, $tipoDocumento, $identificacion, $celular, $correo]);
    $insertados++;

    $nombreCompleto = trim("$nombres $apellidos");

    $buscarEstudiante->execute([$identificacion]);
    $estudiante = $buscarEstudiante->fetch();
    if ($estudiante) {
        $estudianteId = (int) $estudiante['id'];
    } else {
        $crearEstudiante->execute([$identificacion, $nombreCompleto, $tipoDocumento, $celular, $correo]);
        $estudianteId = (int) db()->lastInsertId();
    }

    $buscarMatricula->execute([$estudianteId, $cursoNombre, $cursoNombre]);
    if (!$buscarMatricula->fetch()) {
        $crearMatricula->execute([$estudianteId, $cursoNombre]);
        $matriculados++;
    }

    if (crear_cuenta_acceso_automatica($identificacion, $nombreCompleto, 'estudiante', $correo, 'estudiantes.gfoacademy.local')) {
        $cuentasCreadas++;
    }
}

log_trace($user, 'curso_empresa_empleados_import',
    "Importó $insertados empleados a la empresa #$empresaId y los matriculó en \"$cursoNombre\"" . ($omitidos > 0 ? " ($omitidos filas omitidas)" : ''));

respond(['ok' => true, 'insertados' => $insertados, 'omitidos' => $omitidos, 'matriculados' => $matriculados, 'cuentasCreadas' => $cuentasCreadas]);
