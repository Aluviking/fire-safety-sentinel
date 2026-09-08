<?php
require __DIR__ . '/../bootstrap.php';

// Búsqueda rápida de personas (estudiantes/docentes) por nombre o cédula,
// para el buscador del navbar — "solo escribir y ya saber si está o no
// registrado", sin tener que entrar al módulo de Estudiantes/Docentes. Cada
// tabla se busca solo si el usuario tiene permiso de verla.

$user = require_auth();

$q = trim($_GET['q'] ?? '');
if (mb_strlen($q) < 2) respond(['ok' => true, 'personas' => []]);

$permisos = user_permisos($user);
$puedeVer = function (string $modulo) use ($permisos): bool {
    return $permisos['all'] || (($permisos['modulos'][$modulo]['ver'] ?? false) === true);
};

$like = '%' . $q . '%';
$personas = [];

if ($puedeVer('institucional.estudiantes')) {
    $stmt = db()->prepare(
        "SELECT id, nombre_completo, identificacion, 'estudiante' AS tipo
         FROM estudiantes
         WHERE nombre_completo LIKE ? OR identificacion LIKE ?
         ORDER BY nombre_completo LIMIT 8"
    );
    $stmt->execute([$like, $like]);
    $personas = array_merge($personas, $stmt->fetchAll());
}

if ($puedeVer('institucional.docentes')) {
    $stmt = db()->prepare(
        "SELECT id, nombre_completo, identificacion, 'docente' AS tipo
         FROM docentes
         WHERE nombre_completo LIKE ? OR identificacion LIKE ?
         ORDER BY nombre_completo LIMIT 8"
    );
    $stmt->execute([$like, $like]);
    $personas = array_merge($personas, $stmt->fetchAll());
}

respond(['ok' => true, 'personas' => $personas]);
