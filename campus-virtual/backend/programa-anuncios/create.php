<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body       = json_body();
$programaId = (int) ($body['programaId'] ?? 0);
$titulo     = trim($body['titulo'] ?? '');
if ($programaId === 0 || $titulo === '') fail('El título es requerido.');
require_gestion_programa($user, $programaId);

// Si lo crea un Docente, queda marcado como suyo — un colega docente
// asignado al mismo programa no lo va a ver. Lo de Admin/Super Admin (NULL)
// es institucional, visible para cualquier docente asignado.
$creadoPor = $user['role'] === 'docente' ? ($user['identificacion'] ?? null) : null;

db()->prepare('INSERT INTO programa_anuncios (programa_id, titulo, mensaje, importancia, creado_por_identificacion) VALUES (?,?,?,?,?)')
    ->execute([$programaId, $titulo, $body['mensaje'] ?? null, $body['importancia'] ?? 'Normal', $creadoPor]);

respond(['ok' => true, 'anuncio' => ['id' => (int) db()->lastInsertId(), 'titulo' => $titulo]]);
