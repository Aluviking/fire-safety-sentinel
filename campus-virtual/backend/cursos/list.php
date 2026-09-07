<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso_alguno($user, ['academico.cursos', 'academico.cursos_virtuales']);

// La tabla `cursos` es el histórico importado de Q10 — en la práctica cada
// fila es una asignatura-instancia ("{programa} - {asignatura} - {jornada}"
// en programa_asignatura_jornada), no un curso independiente. El cliente
// pidió que "Crear curso" solo muestre lo que de verdad son cursos: las
// filas cuyo programa (el texto de antes del " - ") corresponde a un
// programa real ACTIVO cuyo nombre empieza por "CURSO" — el resto (TSST,
// TAE, Diplomado, o cualquier programa ya eliminado) queda oculto, sin
// borrar ninguna fila. Se compara contra el nombre actual del programa y
// también contra el nombre sin el prefijo "CURSO " (los datos se
// importaron antes de que esos programas se renombraran con ese prefijo).
$cursosPrograma = db()->query(
    "SELECT nombre FROM programas WHERE estado = 'Activo' AND nombre LIKE 'CURSO%'"
)->fetchAll();

$prefijos = [];
foreach ($cursosPrograma as $p) {
    $prefijos[] = $p['nombre'];
    $prefijos[] = trim(substr($p['nombre'], 6)); // quita "CURSO " del principio
}
$prefijos = array_values(array_unique($prefijos));

if (empty($prefijos)) {
    respond(['ok' => true, 'cursos' => []]);
}

// Un docente solo ve SUS propios cursos, no los de todos — el resto de
// roles (admin/super_admin/equipo) sigue viendo el catálogo completo.
$soloPropios = $user['role'] === 'docente';

$condiciones = [];
$params = [];
foreach ($prefijos as $prefijo) {
    $condiciones[] = 'c.programa_asignatura_jornada LIKE ?';
    $params[] = $prefijo . ' - %';
}
$whereProgramas = '(' . implode(' OR ', $condiciones) . ')';

$sql = "SELECT c.*, (SELECT COUNT(*) FROM curso_estudiantes ce WHERE ce.curso_id = c.id) AS matriculados
        FROM cursos c
        WHERE $whereProgramas"
     . ($soloPropios ? ' AND c.docente_identificacion = ?' : '')
     . ' ORDER BY c.fecha_inicio DESC, c.id DESC';

if ($soloPropios) $params[] = $user['identificacion'];

$stmt = db()->prepare($sql);
$stmt->execute($params);
respond(['ok' => true, 'cursos' => $stmt->fetchAll()]);
