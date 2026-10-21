<?php
require __DIR__ . '/../bootstrap.php';

// Prende/apaga, para UNA inscripción puntual, si ese estudiante puede ver
// su certificado desde Campus Virtual -- apagado por defecto. Cursos
// ligeros no maneja notas (evaluaciones/notas_finales son solo del
// histórico de programas/cursos de Q10), así que aquí solo hay un
// interruptor, no dos.

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM curso_ligero_inscripciones WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) fail('Inscripción no encontrada.', 404);

require_gestion_curso_ligero($user, (int) $row['curso_ligero_id']);

$mostrarCertificado = array_key_exists('mostrarCertificado', $body) ? (!empty($body['mostrarCertificado']) ? 1 : 0) : $row['mostrar_certificado'];

db()->prepare('UPDATE curso_ligero_inscripciones SET mostrar_certificado = ? WHERE id = ?')
    ->execute([$mostrarCertificado, $id]);

log_trace($user, 'inscripcion_permisos', "Actualizó si el estudiante puede ver su certificado (inscripción #$id: $mostrarCertificado)");
respond(['ok' => true, 'mostrarCertificado' => (bool) $mostrarCertificado]);
