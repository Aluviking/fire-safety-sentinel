<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

$stmt = db()->prepare(
    'SELECT pd.id, pd.docente_id, d.identificacion, d.nombre_completo
     FROM programa_docentes pd
     JOIN docentes d ON d.id = pd.docente_id
     WHERE pd.programa_id = ?
     ORDER BY d.nombre_completo'
);
$stmt->execute([$programaId]);
respond(['ok' => true, 'docentes' => $stmt->fetchAll()]);
