<?php
require __DIR__ . '/../bootstrap.php';

// Prende/apaga, para UNA matrícula puntual, si ese estudiante puede ver sus
// notas y/o su certificado desde Campus Virtual -- apagado por defecto
// (ver ALTER TABLE matriculas en schema.sql). Solo toca estas 2 columnas,
// nunca el resto de la matrícula.

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT m.*, p.id AS programa_id FROM matriculas m
    LEFT JOIN programas p ON (p.nombre = m.programa OR m.programa LIKE CONCAT(p.nombre, \' - %\'))
    WHERE m.id = ? LIMIT 1');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) fail('Matrícula no encontrada.', 404);

// Docente solo puede tocar esto si de verdad es dueño de ese programa
// (mismo candado que usa el resto de este módulo); admin/super_admin
// siempre pasan.
if ($row['programa_id']) {
    require_gestion_programa($user, (int) $row['programa_id']);
} else {
    require_role($user, ['super_admin']);
}

$mostrarNotas = array_key_exists('mostrarNotas', $body) ? (!empty($body['mostrarNotas']) ? 1 : 0) : $row['mostrar_notas'];
$mostrarCertificado = array_key_exists('mostrarCertificado', $body) ? (!empty($body['mostrarCertificado']) ? 1 : 0) : $row['mostrar_certificado'];

db()->prepare('UPDATE matriculas SET mostrar_notas = ?, mostrar_certificado = ? WHERE id = ?')
    ->execute([$mostrarNotas, $mostrarCertificado, $id]);

log_trace($user, 'matricula_permisos', "Actualizó qué puede ver el estudiante de la matrícula #$id (notas: $mostrarNotas, certificado: $mostrarCertificado)");
respond(['ok' => true, 'mostrarNotas' => (bool) $mostrarNotas, 'mostrarCertificado' => (bool) $mostrarCertificado]);
