<?php
require __DIR__ . '/../bootstrap.php';

// Zoom llama aquí directo (sin header Authorization de Campus Virtual), así
// que NO se usa require_auth() — en vez de eso se valida que el aviso de
// verdad venga de Zoom con la firma que manda en los headers, usando el
// "Secret Token" del webhook guardado en config.php (zoom_webhook_secret).

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true) ?? [];

// Paso de verificación único que hace Zoom al guardar la URL del webhook en
// el portal de desarrolladores — hay que contestarle con un hash calculado
// con el mismo secreto para que la deje activa.
if (($data['event'] ?? '') === 'endpoint.url_validation') {
    $plainToken = $data['payload']['plainToken'] ?? '';
    $hash = hash_hmac('sha256', $plainToken, (string) config('zoom_webhook_secret'));
    respond(['plainToken' => $plainToken, 'encryptedToken' => $hash]);
}

// Para cualquier otro evento, se verifica la firma real.
$secret    = (string) config('zoom_webhook_secret');
$timestamp = $_SERVER['HTTP_X_ZM_REQUEST_TIMESTAMP'] ?? '';
$firmaRecibida = $_SERVER['HTTP_X_ZM_SIGNATURE'] ?? '';
$firmaEsperada = 'v0=' . hash_hmac('sha256', "v0:{$timestamp}:{$raw}", $secret);
if ($secret === '' || !hash_equals($firmaEsperada, $firmaRecibida)) {
    fail('Firma inválida.', 401);
}

// La grabación en la nube de esa reunión ya está lista — se guarda el link
// en la clase virtual correspondiente (la que tenga ese zoom_meeting_id),
// sin importar en cuál de los 4 módulos esté.
if (($data['event'] ?? '') === 'recording.completed') {
    $meetingId = (string) ($data['payload']['object']['id'] ?? '');
    $shareUrl  = $data['payload']['object']['share_url'] ?? null;
    if (!$shareUrl) {
        foreach ($data['payload']['object']['recording_files'] ?? [] as $f) {
            if (($f['file_type'] ?? '') === 'MP4' && !empty($f['play_url'])) { $shareUrl = $f['play_url']; break; }
        }
    }
    // Zoom le pide clave a cualquiera que abra el link sin estar loggeado con
    // la cuenta dueña de la grabación — y ningún estudiante lo está. Si no se
    // le pega la clave al link, a todos les sale ese candado pidiéndola.
    $password = $data['payload']['object']['password'] ?? null;
    if ($shareUrl && $password && !str_contains($shareUrl, 'pwd=')) {
        $separador = str_contains($shareUrl, '?') ? '&' : '?';
        $shareUrl .= $separador . 'pwd=' . urlencode($password);
    }
    if ($meetingId !== '' && $shareUrl) {
        // grabacion_password queda también aparte (no solo pegada al link)
        // para poder mostrársela en texto a estudiantes/docentes que ya
        // tienen acceso real a esa clase — útil si Zoom igual la vuelve a
        // pedir pese al pwd= en la URL.
        foreach (['asignatura_clases_virtuales', 'curso_clases_virtuales', 'curso_ligero_clases_virtuales', 'programa_clases_virtuales'] as $tabla) {
            db()->prepare("UPDATE {$tabla} SET grabacion_url = ?, grabacion_password = ? WHERE zoom_meeting_id = ?")->execute([$shareUrl, $password, $meetingId]);
        }
    }
}

respond(['ok' => true]);
