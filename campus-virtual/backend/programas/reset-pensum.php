<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente tiene edicion completa en Cursos/Programas/Diplomados, igual
// que Super Admin (no solo lo que tiene asignado) -- pedido explicito del
// cliente, aplica a TODOS los docentes por rol, no por cuenta puntual.
require_role($user, ['super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM programas WHERE id = ?');
$stmt->execute([$id]);
$programa = $stmt->fetch();
if (!$programa) fail('Programa no encontrado.', 404);

db()->prepare('DELETE FROM programa_asignatura_prerequisitos WHERE programa_id = ?')->execute([$id]);
db()->prepare('DELETE FROM programa_asignaturas WHERE programa_id = ?')->execute([$id]);
db()->prepare(
    'UPDATE programas SET pensum_nombre = ?, porcentaje_inasistencia = NULL, nota_aprobacion = NULL, valor_maximo_calificacion = NULL WHERE id = ?'
)->execute(['PENSUM', $id]);

log_trace($user, 'programa_update', "Eliminó el pensum de {$programa['nombre']}");
respond(['ok' => true]);
