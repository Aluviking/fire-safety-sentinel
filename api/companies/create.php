<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
$nit    = trim($body['nit'] ?? '');
$sector = trim($body['sector'] ?? '');
if ($nombre === '' || $nit === '' || $sector === '') fail('Datos inválidos.');

$id = new_id('emp');
db()->prepare('INSERT INTO companies (id, nombre, nit, sector) VALUES (?,?,?,?)')
    ->execute([$id, $nombre, $nit, $sector]);

// Siembra las carpetas estándar del PHVA para esta empresa. A partir de aquí
// viven en custom_folders como cualquier otra carpeta: el admin puede
// renombrarlas o eliminarlas igual que las que él mismo cree.
$defaultFolders = [
    'P' => ['Política de SST', 'Objetivos e Indicadores SST', 'Identificación de Peligros',
            'Matriz de Requisitos Legales', 'Programa de Gestión SST', 'Plan de Trabajo Anual',
            'Roles y Responsabilidades'],
    'H' => ['Capacitaciones y Entrenamientos', 'Inspecciones de Seguridad', 'Investigación de Incidentes',
            'Elementos de Protección Personal', 'Gestión de Contratistas', 'Simulacros y Emergencias',
            'Exámenes Médicos Ocupacionales'],
    'V' => ['Indicadores de Gestión SST', 'Auditorías Internas', 'Revisión por la Dirección',
            'Registro de Accidentes de Trabajo', 'Enfermedades Laborales', 'No Conformidades',
            'Estadísticas de Siniestralidad'],
    'A' => ['Acciones Correctivas', 'Acciones Preventivas', 'Plan de Mejora Continua',
            'Lecciones Aprendidas', 'Actualizaciones del SG-SST'],
];
$insertFolder = db()->prepare(
    'INSERT INTO custom_folders (empresa_id, phva_phase, folder_name, created_by) VALUES (?,?,?,?)'
);
foreach ($defaultFolders as $phase => $names) {
    foreach ($names as $name) {
        $insertFolder->execute([$id, $phase, $name, $user['id']]);
    }
}

log_trace($user, 'company_create', $id, "Creó la empresa $nombre");

respond(['ok' => true, 'company' => ['id' => $id, 'nombre' => $nombre, 'nit' => $nit, 'sector' => $sector]]);
