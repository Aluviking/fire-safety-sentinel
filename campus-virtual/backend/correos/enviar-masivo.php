<?php
require __DIR__ . '/../bootstrap.php';

// Envío de correo de bienvenida vía mail() nativo de PHP (el hosting ya trae
// su propio correo, sin depender de un servicio externo de pago) -- pensado
// para volúmenes chicos (decenas), no para campañas masivas de verdad. Pausa
// corta entre cada envío para no parecer spam ni saturar el servidor.
$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$destinatarios = $body['destinatarios'] ?? [];
$asuntoTexto = trim($body['asunto'] ?? '') ?: 'Bienvenido a GFO Academy';
$asuntoTexto = str_replace(["\r", "\n"], '', $asuntoTexto);

if (!is_array($destinatarios) || count($destinatarios) === 0) fail('No hay destinatarios.');
if (count($destinatarios) > 100) fail('Máximo 100 destinatarios por envío (límite del servidor compartido).');

set_time_limit(180);

function plantilla_bienvenida_html(): string {
    return <<<'HTML'
<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Bienvenido a GFO Academy</title></head>
<body style="margin:0; background:#E9E2D8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E9E2D8; font-family: Arial, Helvetica, sans-serif;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 18px rgba(31,23,18,0.08); border:1px solid #ece7e1;">
        <tr>
          <td align="center" style="padding:28px 24px; border-bottom:1px solid #f1ede8;">
            <span style="font-size:19px; font-weight:800; letter-spacing:0.5px; color:#C41717;">GFO</span>
            <span style="font-size:19px; font-weight:700; letter-spacing:0.5px; color:#211c17;"> ACADEMY</span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:44px 32px 46px; background-color:#faf8f6;">
            <div style="font-size:26px; line-height:1.3; font-weight:700; color:#211c17; margin:0; text-align:center;">Bienvenido a GFO Academy</div>
            <div style="font-size:14.5px; line-height:1.65; color:#5c5349; margin-top:14px; max-width:380px; margin-left:auto; margin-right:auto; text-align:center;">Tu acceso a Campus Virtual ya está listo. Te invitamos a hacer parte de tu formación con nosotros.</div>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td style="background:#C41717; border-radius:8px;">
              <a href="https://www.siso.com.co" style="display:inline-block; padding:14px 34px; font-size:14px; font-weight:700; color:#ffffff; letter-spacing:0.3px; text-decoration:none;">Ir a siso.com.co</a>
            </td></tr></table>
          </td>
        </tr>
        <tr><td style="padding:38px 28px 6px;" align="center"><div style="font-size:19px; font-weight:800; color:#211c17;">Así puedes entrar</div></td></tr>
        <tr>
          <td style="padding:20px 24px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="33.3%" align="center" style="padding:0 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF4EC; border-radius:14px;"><tr><td align="center" style="padding:20px 12px;">
                <div style="width:34px; height:34px; border-radius:50%; background:#C41717; color:#ffffff; font-size:14px; font-weight:800; line-height:34px; margin:0 auto 10px;">1</div>
                <div style="font-size:13px; line-height:1.5; color:#3a342c; font-weight:600;">Entra a<br><span style="color:#C41717;">siso.com.co</span></div>
              </td></tr></table></td>
              <td width="33.3%" align="center" style="padding:0 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF4EC; border-radius:14px;"><tr><td align="center" style="padding:20px 12px;">
                <div style="width:34px; height:34px; border-radius:50%; background:#C41717; color:#ffffff; font-size:14px; font-weight:800; line-height:34px; margin:0 auto 10px;">2</div>
                <div style="font-size:13px; line-height:1.5; color:#3a342c; font-weight:600;">Haz clic en el botón<br>"Campus Virtual"</div>
              </td></tr></table></td>
              <td width="33.3%" align="center" style="padding:0 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF4EC; border-radius:14px;"><tr><td align="center" style="padding:20px 12px;">
                <div style="width:34px; height:34px; border-radius:50%; background:#C41717; color:#ffffff; font-size:14px; font-weight:800; line-height:34px; margin:0 auto 10px;">3</div>
                <div style="font-size:13px; line-height:1.5; color:#3a342c; font-weight:600;">Ingresa con tu<br>número de cédula</div>
              </td></tr></table></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 28px 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#C41717; border-radius:12px;"><tr><td align="center" style="padding:28px 24px;">
              <div style="font-size:16px; font-weight:700; color:#ffffff; margin-bottom:6px;">Tus datos de acceso</div>
              <div style="font-size:12.5px; color:rgba(255,255,255,0.8); margin-bottom:18px;">Usuario y contraseña son el mismo número</div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; max-width:360px;">
                <tr><td align="center" style="background:rgba(255,255,255,0.14); border-radius:12px; padding:14px 18px;">
                  <div style="font-size:11px; font-weight:700; letter-spacing:1px; color:rgba(255,255,255,0.75); text-transform:uppercase;">Usuario</div>
                  <div style="font-size:15px; font-weight:700; color:#ffffff; margin-top:4px;">Tu número de cédula</div>
                </td></tr>
                <tr><td style="height:10px; line-height:10px;">&nbsp;</td></tr>
                <tr><td align="center" style="background:rgba(255,255,255,0.14); border-radius:12px; padding:14px 18px;">
                  <div style="font-size:11px; font-weight:700; letter-spacing:1px; color:rgba(255,255,255,0.75); text-transform:uppercase;">Contraseña</div>
                  <div style="font-size:15px; font-weight:700; color:#ffffff; margin-top:4px;">Tu número de cédula</div>
                </td></tr>
              </table>
            </td></tr></table>
          </td>
        </tr>
        <tr>
          <td align="center" style="background:#211c17; padding:28px 28px;">
            <div style="font-size:13px; font-weight:800; color:#ffffff; letter-spacing:0.5px;">GFO ACADEMY</div>
            <div style="font-size:11.5px; color:#9a9188; margin-top:8px; line-height:1.6;">© 2026 GFO Academy. Todos los derechos reservados.<br>Campus Virtual · siso.com.co</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
HTML;
}

$asuntoHeader = '=?UTF-8?B?' . base64_encode($asuntoTexto) . '?=';
$headers = "From: GFO Academy <no-reply@siso.com.co>\r\n"
         . "Content-Type: text/html; charset=UTF-8\r\n"
         . "MIME-Version: 1.0\r\n";

$html = plantilla_bienvenida_html();

$enviados = 0;
$fallidos = [];
foreach ($destinatarios as $i => $d) {
    $correo = trim($d['correo'] ?? '');
    if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        $fallidos[] = ['correo' => $correo, 'error' => 'correo inválido'];
        continue;
    }
    $ok = @mail($correo, $asuntoHeader, $html, $headers);
    if ($ok) { $enviados++; } else { $fallidos[] = ['correo' => $correo, 'error' => 'mail() devolvió false']; }
    if ($i < count($destinatarios) - 1) usleep(800000); // ~0.8s entre envíos
}

log_trace(
    $user, 'correos_envio_masivo',
    "Envió $enviados correo(s) de bienvenida" . (count($fallidos) > 0 ? ", " . count($fallidos) . " fallido(s)" : "")
);

respond(['ok' => true, 'enviados' => $enviados, 'fallidos' => $fallidos]);
