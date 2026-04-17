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
$email       = trim($data['email']        ?? '');
$verifyToken = trim($data['verify_token'] ?? '');
$resetToken  = trim($data['reset_token']  ?? '');
$subject     = trim($data['subject']      ?? '');
$customMsg   = trim($data['message']      ?? '');
$type        = trim($data['type']         ?? 'verification');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid recipient email.']);
    exit;
}

if ($type === 'password_reset') {
    $subject = $subject ?: "Reset Your vāntãgeCFD Password";
    $resetUrl = "https://vantagecfd.com/reset-password?token=" . urlencode($resetToken) . "&email=" . urlencode($email);
    $headline = "Reset Your Password";
    $bodyText = "We received a request to reset your password. If you didn't make this request, you can safely ignore this email. Otherwise, click the button below to set a new password.";
    $ctaText = "Reset Password";
    $ctaUrl = $resetUrl;
} elseif (!empty($customMsg)) {
    $subject = $subject ?: "Message from vāntãgeCFD";
    $headline = $subject;
    $bodyText = $customMsg;
    $ctaText = "Go to Dashboard";
    $ctaUrl = "https://vantagecfd.com/dashboard";
} else {
    $subject = $subject ?: "Confirm Your vāntãgeCFD Email Address";
    $verifyUrl = "https://vantagecfd.com/verify?token=" . urlencode($verifyToken);
    $headline = "Confirm Your Email Address";
    $bodyText = "Thank you for registering with vāntãgeCFD. To complete your account setup and gain full access to global markets, please confirm your email address by clicking the button below.";
    $ctaText = "Verify My Email";
    $ctaUrl = $verifyUrl;
}

$html = build_app_email($firstName, $headline, $bodyText, $ctaText, $ctaUrl);
$plain = "Hi $firstName,\n\n$bodyText\n\n$ctaUrl\n\nvāntãgeCFD Team";

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

function build_app_email(string $first_name, string $headline, string $body_text, string $cta_text, string $cta_url): string {
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
      <table width="100%" style="max-width:568px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
        <tr><td style="height:4px;background:linear-gradient(90deg,#C9A84C 0%,#F0D080 50%,#C9A84C 100%);"></td></tr>
        <tr>
          <td style="background:linear-gradient(160deg,#0A1628 0%,#0D1F3C 60%,#112040 100%);padding:36px 44px 44px;">
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
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.4px;line-height:1.2;">$headline</h1>
                  <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.50);line-height:1.6;max-width:380px;">
                    Hi <strong style="color:rgba(255,255,255,0.85);">$first_name</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:44px 44px 36px;">
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.8;">$body_text</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="$cta_url"
                     style="display:inline-block;background:linear-gradient(135deg,#C9A84C 0%,#E8C97A 100%);color:#0A1628;font-size:16px;font-weight:800;text-decoration:none;padding:16px 56px;border-radius:12px;letter-spacing:0.2px;box-shadow:0 4px 14px rgba(201,168,76,0.35);">
                    $cta_text
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;line-height:1.7;">
              Questions? <a href="mailto:support@vantageCFD.com" style="color:#C9A84C;text-decoration:none;font-weight:600;">support@vantageCFD.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#F7F8FA;border-top:1px solid #EEF0F5;padding:22px 44px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:11px;color:#9CA3AF;line-height:2.0;">
                  <strong style="color:#6B7280;">vāntãgeCFD Ltd.</strong><br/>
                  ASIC · FCA · CIMA · VFSC<br/>
                  <a href="https://vantagecfd.com" style="color:#C9A84C;text-decoration:none;">vantagecfd.com</a>
                </td>
                <td align="right" style="font-size:10px;color:#D1D5DB;vertical-align:bottom;white-space:nowrap;">
                  © 2026 vāntãgeCFD<br/>All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:4px;background:linear-gradient(90deg,#C9A84C 0%,#F0D080 50%,#C9A84C 100%);"></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}
