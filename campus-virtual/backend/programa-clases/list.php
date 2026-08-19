<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

$stmt = db()->prepare(
    'SELECT c.*, a.nombre AS aula_nombre
     FROM programa_clases_virtuales c
     LEFT JOIN aulas_recursos a ON a.id = c.aula_recurso_id
     WHERE c.programa_id = ?
     ORDER BY c.fecha_inicio'
);
$stmt->execute([$programaId]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
