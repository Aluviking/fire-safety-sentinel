<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente puede crear programas, pero queda como dueño SOLO de lo que él
// crea (ver bloque de programa_docentes más abajo) -- nunca ve ni edita lo
// de otros docentes (candado real en update.php/delete.php vía
// require_gestion_programa()).
require_role($user, ['admin', 'super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del programa es requerido.');

$stmt = db()->prepare('SELECT id FROM programas WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe un programa con ese nombre.');

db()->prepare(
    'INSERT INTO programas (codigo, nombre, pensum, abreviacion, num_resolucion, fecha_resolucion,
        disponible_oferta_laboral, estado, aplica_preinscripcion, aplica_grupos, categoria)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)'
)->execute([
    $body['codigo'] ?? null, $nombre, $body['pensum'] ?? null, $body['abreviacion'] ?? null,
    $body['numResolucion'] ?? null, $body['fechaResolucion'] ?? null,
    $body['disponibleOfertaLaboral'] ?? 'Sí', $body['estado'] ?? 'Activo', $body['aplicaPreinscripcion'] ?? 'No',
    $body['aplicaGrupos'] ?? 'Sí', $body['categoria'] ?? null,
]);
$programaId = (int) db()->lastInsertId();

// Un docente que crea un programa queda como su dueño (programa_docentes),
// o nunca lo vería en su propia lista — mismo candado que ya usa
// require_gestion_programa() para editar/borrar.
if ($user['role'] === 'docente' && !empty($user['identificacion'])) {
    $docente = db()->prepare('SELECT id FROM docentes WHERE identificacion = ?');
    $docente->execute([$user['identificacion']]);
    $docenteId = $docente->fetchColumn();
    if ($docenteId) {
        db()->prepare('INSERT IGNORE INTO programa_docentes (programa_id, docente_id) VALUES (?, ?)')
            ->execute([$programaId, $docenteId]);
    }
}

respond(['ok' => true, 'programa' => ['id' => $programaId, 'nombre' => $nombre]]);
