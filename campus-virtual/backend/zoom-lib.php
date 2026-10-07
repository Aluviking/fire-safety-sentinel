<?php
/**
 * Integración con Zoom (Server-to-Server OAuth) para "Clases virtuales" —
 * crea la reunión de verdad con grabación automática en la nube activada, y
 * más tarde recibe un aviso de Zoom (webhook, ver zoom/webhook.php) apenas
 * esa grabación queda lista, para guardar el link en la clase
 * correspondiente sin que nadie tenga que ir a buscarla a mano.
 *
 * A diferencia de Google (OAuth con consentimiento por usuario), Server-to-
 * Server OAuth de Zoom NO requiere que un Super Admin "conecte" su cuenta
 * desde la app — las credenciales de config.php ya identifican la cuenta de
 * Zoom completa, así que basta con tenerlas puestas ahí para que funcione.
 */

function zoom_configurado(): bool
{
    return (bool) config('zoom_account_id') && (bool) config('zoom_client_id') && (bool) config('zoom_client_secret');
}

/** Token de acceso de corta duración (~1h) — se pide uno nuevo cada vez que
 *  hace falta en vez de guardarlo entre llamadas, para no complicar con
 *  expiración; Zoom no penaliza pedir tokens seguido para este volumen. */
function zoom_access_token(): string
{
    $ch = curl_init('https://zoom.us/oauth/token?grant_type=account_credentials&account_id=' . urlencode((string) config('zoom_account_id')));
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => '',
        CURLOPT_USERPWD        => config('zoom_client_id') . ':' . config('zoom_client_secret'),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
    ]);
    $body = curl_exec($ch);
    curl_close($ch);
    $data = json_decode((string) $body, true) ?? [];
    if (!isset($data['access_token'])) {
        throw new Exception('Zoom no devolvió un token válido: ' . ($data['reason'] ?? json_encode($data)));
    }
    return $data['access_token'];
}

/**
 * Crea la reunión con grabación automática en la nube. Devuelve
 * [meetingId, joinUrl]. Lanza Exception con el mensaje de Zoom si algo
 * falla (credenciales mal puestas, plan sin permiso, etc.).
 */
function zoom_crear_clase_virtual(string $titulo, string $fechaInicio, ?string $fechaFin): array
{
    if (!zoom_configurado()) throw new Exception('Zoom todavía no está configurado en el servidor (faltan las credenciales en config.php).');
    $token = zoom_access_token();

    $inicio = new DateTime($fechaInicio);
    $fin    = $fechaFin ? new DateTime($fechaFin) : (clone $inicio)->modify('+2 hours');
    $duracionMin = max(1, (int) round(($fin->getTimestamp() - $inicio->getTimestamp()) / 60));

    $body = [
        'topic'      => $titulo,
        'type'       => 2, // reunión programada (no instantánea, no recurrente)
        'start_time' => $inicio->format('Y-m-d\TH:i:s'),
        'duration'   => $duracionMin,
        'timezone'   => 'America/Bogota',
        'settings'   => [
            'auto_recording'    => 'cloud',
            'join_before_host'  => true,
        ],
    ];

    $resp = zoom_http_request('POST', 'https://api.zoom.us/v2/users/me/meetings', $token, $body);
    if (!isset($resp['id'])) {
        throw new Exception('Zoom no pudo crear la reunión: ' . ($resp['message'] ?? json_encode($resp)));
    }

    return ['meetingId' => (string) $resp['id'], 'joinUrl' => $resp['join_url'] ?? null];
}

/** Borra la reunión en Zoom (al eliminar la clase virtual desde Campus
 *  Virtual) — falla en silencio si ya no existe o si falta configuración,
 *  para no bloquear el borrado local por un error de Zoom. */
function zoom_borrar_reunion(?string $meetingId): void
{
    if (!$meetingId || !zoom_configurado()) return;
    try {
        $token = zoom_access_token();
        zoom_http_request('DELETE', "https://api.zoom.us/v2/meetings/{$meetingId}", $token, null);
    } catch (Exception $e) {
        error_log('[zoom_borrar_reunion] ' . $e->getMessage());
    }
}

/* ─── HTTP helper (cURL puro, sin dependencias externas) ──────────────────── */
function zoom_http_request(string $method, string $url, string $token, ?array $jsonBody): array
{
    $ch = curl_init($url);
    $opts = [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => ["Authorization: Bearer {$token}", 'Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
    ];
    if ($jsonBody !== null) $opts[CURLOPT_POSTFIELDS] = json_encode($jsonBody);
    curl_setopt_array($ch, $opts);
    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === '' || $status === 204) return ['ok' => true];
    return json_decode((string) $body, true) ?? [];
}
