<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$asignaturaId = (int) ($body['asignaturaId'] ?? 0);
$titulo       = trim($body['titulo'] ?? '');
if ($asignaturaId === 0 || $titulo === '') fail('El título es requerido.');
require_gestion_asignatura($user, $asignaturaId);

// Si lo crea un Docente, queda marcado como suyo — un colega docente
// asignado a la misma asignatura no lo va a ver. Lo de Admin/Super Admin
// (NULL) es institucional, visible para cualquier docente asignado.
$creadoPor = $user['role'] === 'docente' ? ($user['identificacion'] ?? null) : null;

db()->prepare('INSERT INTO asignatura_anuncios (asignatura_id, titulo, mensaje, importancia, creado_por_identificacion) VALUES (?,?,?,?,?)')
    ->execute([$asignaturaId, $titulo, $body['mensaje'] ?? null, $body['importancia'] ?? 'Normal', $creadoPor]);

respond(['ok' => true, 'anuncio' => ['id' => (int) db()->lastInsertId(), 'titulo' => $titulo]]);
