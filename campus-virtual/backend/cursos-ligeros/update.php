<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Un docente solo puede editar sus propios cursos ligeros -- nunca los de
// otro docente. Admin/Super Admin siempre pasan.
require_role($user, ['super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del curso es requerido.');

require_gestion_curso_ligero($user, $id);

$current = db()->prepare('SELECT * FROM cursos_ligeros WHERE id = ?');
$current->execute([$id]);
$row = $current->fetch();
if (!$row) fail('Curso ligero no encontrado.', 404);

// El modal rápido de la lista y la pestaña Ajustes (dentro de un curso
// ligero) mandan sub-conjuntos distintos de campos — solo el campo que
// realmente vino en el body se actualiza, el resto conserva su valor
// actual, mismo patrón ya aplicado en programas/asignaturas/cursos.
$field = fn(string $key, string $col) => array_key_exists($key, $body) ? $body[$key] : $row[$col];

// Un docente no puede reasignar su curso ligero a otro docente -- se fuerza
// a que siga siendo el mismo, sin importar lo que venga del body.
$docenteIdentificacion = $user['role'] === 'docente' ? ($user['identificacion'] ?? null) : $field('docenteIdentificacion', 'docente_identificacion');
$docenteNombre         = $user['role'] === 'docente' ? ($user['nombre'] ?? null) : $field('docenteNombre', 'docente_nombre');

db()->prepare(
    'UPDATE cursos_ligeros SET nombre = ?, categoria = ?, docente_identificacion = ?, docente_nombre = ?,
        estado = ?, usuarios_inscritos = ?, descripcion = ?, dias_disponibles = ?, certificado_id = ?
     WHERE id = ?'
)->execute([
    $nombre, $field('categoria', 'categoria'), $docenteIdentificacion,
    $docenteNombre, $field('estado', 'estado'),
    $field('usuariosInscritos', 'usuarios_inscritos'),
    $field('descripcion', 'descripcion'), $field('diasDisponibles', 'dias_disponibles'),
    $field('certificadoId', 'certificado_id'),
    $id,
]);

log_trace($user, 'curso_ligero_update', "Editó el curso ligero $nombre");
respond(['ok' => true]);
