<?php
/**
 * Script de solo lectura -- revisa si alguna fila importada de Q10 en
 * `evaluaciones` menciona "foro" en algún campo de texto libre (parametro,
 * asignatura, codigo_curso, observaciones). Se corre por SSH, nunca por URL.
 */
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('Solo desde CLI.');
}

$config = require __DIR__ . '/../config.php';
$pdo = new PDO(
    "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
    $config['db_user'], $config['db_pass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

$stmt = $pdo->query(
    "SELECT DISTINCT codigo_curso, asignatura, parametro, observaciones
     FROM evaluaciones
     WHERE parametro LIKE '%foro%' OR asignatura LIKE '%foro%' OR codigo_curso LIKE '%foro%' OR observaciones LIKE '%foro%'
     ORDER BY asignatura, parametro"
);
$rows = $stmt->fetchAll();

if (empty($rows)) {
    echo "Sin resultados -- ninguna fila de `evaluaciones` (data de Q10) menciona \"foro\" en ningún campo.\n";
} else {
    foreach ($rows as $r) {
        echo "curso=\"{$r['codigo_curso']}\" asignatura=\"{$r['asignatura']}\" parametro=\"{$r['parametro']}\" observaciones=\"{$r['observaciones']}\"\n";
    }
}
