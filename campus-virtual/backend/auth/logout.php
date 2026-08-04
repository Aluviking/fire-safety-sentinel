<?php
require __DIR__ . '/../bootstrap.php';

$token = bearer_token();
if ($token) {
    db()->prepare('DELETE FROM sessions WHERE token = ?')->execute([$token]);
}
respond(['ok' => true]);
