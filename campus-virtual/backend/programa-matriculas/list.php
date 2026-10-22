<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

$stmt = db()->prepare('SELECT nombre FROM programas WHERE id = ?');
$stmt->execute([$programaId]);
$programa = $stmt->fetch();
if (!$programa) fail('Programa no encontrado.', 404);

// Un docente solo ve la matrícula de SUS programas — admin/super_admin/
// equipo/administrativo siguen viendo cualquier programa, como siempre.
if ($user['role'] === 'docente') require_gestion_programa($user, (int) $programaId);

// La matrícula real de un programa NO vive en una tabla propia de Campus
// Virtual — es el histórico importado de Q10 (tabla `matriculas`), donde el
// programa quedó guardado como texto libre "{nombre} - {jornada}". No hay
// FK: se cruza por prefijo exacto del nombre real del programa. Las
// matrículas creadas desde Registrar estudiante (Campus Virtual nativo) ya
// no capturan jornada, así que también se acepta el nombre exacto sin sufijo.
$stmt = db()->prepare(
    "SELECT m.id, e.id AS estudiante_id, e.identificacion, e.nombre_completo,
            m.programa, m.periodo, m.nivel, m.estado, m.sede,
            m.mostrar_notas, m.mostrar_certificado
     FROM matriculas m
     JOIN estudiantes e ON e.id = m.estudiante_id
     WHERE m.programa = ? OR m.programa LIKE CONCAT(?, ' - %')
     ORDER BY m.periodo DESC, e.nombre_completo"
);
$stmt->execute([$programa['nombre'], $programa['nombre']]);
$rows = $stmt->fetchAll();

$prefijo = strlen($programa['nombre']) + 3; // + " - "
foreach ($rows as &$r) {
    $r['jornada'] = strlen($r['programa']) > $prefijo ? substr($r['programa'], $prefijo) : null;
    unset($r['programa']);
}
unset($r);

// Si este curso/programa tiene empresas con empleados cargados en "Cursos
// para empresas", cada estudiante se marca con la empresa de la que vino, o
// con "fuera de esa base" si quedó matriculado aquí por otro lado (agregado
// a mano, de otra empresa que no es de este curso, etc.) -- pedido explícito
// del cliente, para no mezclarlos aunque estén en el mismo curso.
$stmt = db()->prepare('SELECT id, razon_social FROM curso_empresas WHERE programa_id = ?');
$stmt->execute([(int) $programaId]);
$empresas = $stmt->fetchAll();

if (!empty($empresas)) {
    $empresaIds = array_map(static fn($e) => (int) $e['id'], $empresas);
    $placeholders = implode(',', array_fill(0, count($empresaIds), '?'));
    $stmt = db()->prepare("SELECT identificacion, empresa_id FROM curso_empresa_empleados WHERE empresa_id IN ($placeholders)");
    $stmt->execute($empresaIds);
    $empresaPorIdentificacion = [];
    foreach ($stmt->fetchAll() as $emp) {
        $empresaPorIdentificacion[$emp['identificacion']] = $emp['empresa_id'];
    }
    $nombrePorEmpresaId = [];
    foreach ($empresas as $e) { $nombrePorEmpresaId[$e['id']] = $e['razon_social']; }
    $todasLasEmpresas = implode(', ', array_column($empresas, 'razon_social'));

    foreach ($rows as &$r) {
        $empresaId = $empresaPorIdentificacion[$r['identificacion']] ?? null;
        if ($empresaId !== null) {
            $r['empresa'] = $nombrePorEmpresaId[$empresaId];
            $r['fueraDeBaseDe'] = null;
        } else {
            $r['empresa'] = null;
            $r['fueraDeBaseDe'] = $todasLasEmpresas;
        }
    }
    unset($r);
} else {
    foreach ($rows as &$r) { $r['empresa'] = null; $r['fueraDeBaseDe'] = null; }
    unset($r);
}

respond(['ok' => true, 'matriculados' => $rows]);
