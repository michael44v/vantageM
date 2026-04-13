<?php
require __DIR__ . '/src/PHPMailer.php';
require __DIR__ . '/src/SMTP.php';
require __DIR__ . '/src/Exception.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$data  = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $_GET['action'] ?? '';

if ($action !== 'send_mail') {
    echo json_encode(['success' => false, 'error' => 'Invalid action']);
    exit;
}

$firstName   = trim($data['first_name']   ?? 'Trader');
$lastName    = trim($data['last_name']    ?? '');
$fullName    = trim("$firstName $lastName") ?: 'Trader';
$email       = trim($data['email']        ?? 'michaelnwankwoscloud@gmail.com');
$verifyToken = trim($data['verify_token'] ?? '');
$subject     = trim($data['subject']      ?? '');
$customMsg   = trim($data['message']      ?? '');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid recipient email.']);
    exit;
}

// Verification link — points to your React app's /verify page
$verifyUrl = "https://vantageCFD.com/verify?token=" . urlencode($verifyToken);

if (empty($subject)) {
    $subject = "Confirm Your vāntãgeCFD Email Address";
}

if (!empty($customMsg)) {
    $html  = $customMsg;
    $plain = strip_tags($customMsg);
} else {
    $html    = build_confirmation_email($firstName, $verifyUrl);
    $plain   = "Hi $firstName,\n\nPlease confirm your vāntãgeCFD account by clicking the link below:\n\n$verifyUrl\n\nThis link expires in 24 hours. If you did not register, ignore this email.\n\nvāntãgeCFD Team";
}

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'mail.vantageCFD.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'noreply@vantageCFD.com';
    $mail->Password   = 'victor47009A?';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom('noreply@vantageCFD.com', 'vāntãgeCFD');
    $mail->addAddress($email, $fullName);

    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $html;
    $mail->AltBody = $plain;

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Email sent to ' . $email]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $mail->ErrorInfo]);
}

// ── Email template ────────────────────────────────────────────────────────────
function build_confirmation_email(string $first_name, string $verify_url): string {
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#EEF0F5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F5;padding:48px 16px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="100%" style="max-width:568px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

        <!-- ── Top accent bar ── -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#C9A84C 0%,#F0D080 50%,#C9A84C 100%);"></td></tr>

        <!-- ── Header ── -->
        <tr>
          <td style="background:linear-gradient(160deg,#0A1628 0%,#0D1F3C 60%,#112040 100%);padding:36px 44px 44px;">

            <!-- Logo -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
              <tr>
                <td style="width:38px;height:38px;background:#C9A84C;border-radius:8px;text-align:center;vertical-align:middle;">
                  <span style="color:#0A1628;font-size:20px;font-weight:900;line-height:38px;display:block;">V</span>
                </td>
                <td style="padding-left:11px;vertical-align:middle;">
                  <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.3px;">vāntãgeCFD</span>
                </td>
              </tr>
            </table>

            <!-- Headline -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.4px;line-height:1.2;">
                    Confirm Your Email Address
                  </h1>
                  <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.50);line-height:1.6;max-width:380px;">
                    Hi <strong style="color:rgba(255,255,255,0.85);">$first_name</strong> — one quick step to activate your account.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── Body ── -->
        <tr>
          <td style="padding:44px 44px 36px;">

            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.8;">
              Thank you for registering with <strong style="color:#0A1628;">vāntãgeCFD</strong>. To complete your account setup and gain full access to global markets, please confirm your email address by clicking the button below.
            </p>

            <!-- CTA button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="$verify_url"
                     style="display:inline-block;background:linear-gradient(135deg,#C9A84C 0%,#E8C97A 100%);color:#0A1628;font-size:16px;font-weight:800;text-decoration:none;padding:16px 56px;border-radius:12px;letter-spacing:0.2px;box-shadow:0 4px 14px rgba(201,168,76,0.35);">
                    ✓ &nbsp;Verify My Email
                  </a>
                </td>
              </tr>
            </table>

            <!-- Expiry note -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <span style="font-size:12px;color:#9CA3AF;">This link expires in <strong style="color:#6B7280;">24 hours</strong></span>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="border-top:1px solid #EEF0F5;"></td>
              </tr>
            </table>

            <!-- What you get -->
            <p style="margin:0 0 16px;font-size:12px;font-weight:800;color:#0A1628;text-transform:uppercase;letter-spacing:0.8px;">
              After verifying you'll unlock
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td width="50%" style="padding:0 6px 10px 0;vertical-align:top;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#F8F9FA;border:1px solid #EAEDF0;border-radius:10px;padding:14px 16px;">
                        <div style="font-size:12px;font-weight:700;color:#0A1628;">1,000+ Markets</div>
                        <div style="font-size:11px;color:#9CA3AF;margin-top:2px;">Forex · Gold · Crypto</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="50%" style="padding:0 0 10px 6px;vertical-align:top;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#F8F9FA;border:1px solid #EAEDF0;border-radius:10px;padding:14px 16px;">
                        <div style="font-size:12px;font-weight:700;color:#0A1628;">0.0 pip Spreads</div>
                        <div style="font-size:11px;color:#9CA3AF;margin-top:2px;">Raw ECN · No Desk</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;line-height:1.7;">
              If you did not create a vāntãgeCFD account, you can safely ignore this email.<br/>
              Questions? <a href="mailto:support@vantageCFD.com" style="color:#C9A84C;text-decoration:none;font-weight:600;">support@vantageCFD.com</a>
            </p>

          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="background:#F7F8FA;border-top:1px solid #EEF0F5;padding:22px 44px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:11px;color:#9CA3AF;line-height:2.0;">
                  <strong style="color:#6B7280;">vāntãgeCFD Ltd.</strong><br/>
                  ASIC · FCA · CIMA · VFSC<br/>
                  <a href="https://vantageCFD.com" style="color:#C9A84C;text-decoration:none;">vantageCFD.com</a>
                </td>
                <td align="right" style="font-size:10px;color:#D1D5DB;vertical-align:bottom;white-space:nowrap;">
                  © 2026 vāntãgeCFD<br/>All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Bottom accent bar ── -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#C9A84C 0%,#F0D080 50%,#C9A84C 100%);"></td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
HTML;
}
