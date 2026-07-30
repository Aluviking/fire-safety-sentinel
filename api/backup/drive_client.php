<?php
/**
 * Cliente mínimo de Google Drive API (sin Composer/librería oficial).
 * Se autentica como cuenta de servicio firmando un JWT a mano (RS256) y sube
 * archivos por HTTP directo — solo necesita curl + openssl, ya incluidos en PHP.
 */
declare(strict_types=1);

function drive_base64url(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/** @param array{client_email:string, private_key:string} $serviceAccount */
function drive_get_access_token(array $serviceAccount): string
{
    $now = time();
    $header = ['alg' => 'RS256', 'typ' => 'JWT'];
    $claims = [
        'iss'   => $serviceAccount['client_email'],
        'scope' => 'https://www.googleapis.com/auth/drive.file',
        'aud'   => 'https://oauth2.googleapis.com/token',
        'iat'   => $now,
        'exp'   => $now + 3600,
    ];

    $segments = [drive_base64url(json_encode($header)), drive_base64url(json_encode($claims))];
    $signingInput = implode('.', $segments);

    $signature = '';
    $ok = openssl_sign($signingInput, $signature, $serviceAccount['private_key'], 'SHA256');
    if (!$ok) throw new RuntimeException('No se pudo firmar el JWT para Google Drive (revisa la clave privada en config.php).');
    $segments[] = drive_base64url($signature);
    $jwt = implode('.', $segments);

    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]),
    ]);
    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode((string)$response, true);
    if ($status !== 200 || empty($data['access_token'])) {
        throw new RuntimeException('No se pudo obtener token de acceso de Google Drive: ' . $response);
    }
    return $data['access_token'];
}

/** Sube un archivo a una carpeta de Drive. Devuelve la respuesta de la API (id, name, size). */
function drive_upload_file(string $accessToken, string $filePath, string $filename, string $folderId, string $mimeType = 'application/zip'): array
{
    $metadata = json_encode(['name' => $filename, 'parents' => [$folderId]]);
    $boundary = 'siso-backup-' . bin2hex(random_bytes(8));

    $body  = "--$boundary\r\n";
    $body .= "Content-Type: application/json; charset=UTF-8\r\n\r\n";
    $body .= "$metadata\r\n";
    $body .= "--$boundary\r\n";
    $body .= "Content-Type: $mimeType\r\n\r\n";
    $body .= file_get_contents($filePath) . "\r\n";
    $body .= "--$boundary--";

    $ch = curl_init('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer $accessToken",
            "Content-Type: multipart/related; boundary=$boundary",
        ],
        CURLOPT_POSTFIELDS => $body,
    ]);
    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode((string)$response, true);
    if ($status < 200 || $status >= 300 || !is_array($data)) {
        throw new RuntimeException('Error al subir el archivo a Google Drive: ' . $response);
    }
    return $data;
}
