<?php
require __DIR__ . '/../bootstrap.php';

require_auth();

$stmt = db()->prepare('SELECT image_path, updated_at FROM ads WHERE id = 1');
$stmt->execute();
$row = $stmt->fetch();

respond([
    'ok'        => true,
    'hasAd'     => (bool) ($row['image_path'] ?? false),
    'updatedAt' => $row['updated_at'] ?? null,
]);
