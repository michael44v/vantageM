<?php
/**
 * vāntãgeCFD - Simple API Gateway
 * Unified single-file backend (Procedural approach)
 */

declare(strict_types=1);

// --- 0. Error Handling ---
error_reporting(E_ALL);
ini_set('display_errors', '0');

set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server Error: ' . $e->getMessage()]);
    exit;
});

// --- 1. CORS Headers ---
$allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- 2. Database Connection ---
$host = 'localhost';
$user = 'jvrzjzbc_root';
$pass = 'victor47009A?';
$name = 'jvrzjzbc_vantage_db';

$db = new mysqli($host, $user, $pass, $name);
if ($db->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Connection failed: ' . $db->connect_error]);
    exit;
}
$db->set_charset("utf8mb4");

// --- 3. Request Parsing ---
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Simple Response Helper
function send_json($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// --- 4. Routing ---
switch ($action) {
    
    case 'create_account':
    handle_create_account($db, $input);
    break;
case 'get_signals':
    handle_get_signals($db);
    break;
case 'copy_signal':
    handle_copy_signal($db, $input);
    break;
case 'get_kyc':
    handle_get_kyc($db);
    break;
case 'admin_get_users':
    handle_admin_get_users($db);
    break;
case 'admin_dashboard_stats':
    handle_admin_dashboard_stats($db);
    break;
    
    case 'verify_email_token':
    handle_verify_email_token($db, $input);
    break;
case 'resend_verification':
    handle_resend_verification($db, $input);
    break;
case 'admin_approve_transaction':
    handle_admin_approve_transaction($db, $input);
    break;
    case 'get_transactions':
    handle_get_transactions($db);
    break;
    case 'get_trade_history':
    handle_get_trade_history($db);
    break;
    case 'login':
        handle_login($db, $input);
        break;
    case 'register':
        handle_register($db, $input);
        break;
    case 'get_accounts':
        handle_get_accounts($db);
        break;
    case 'get_positions':
        handle_get_positions($db);
        break;
        case 'close_position':
    handle_close_position($db, $input);
    break;
    
    case 'get_my_copies':
        handle_get_my_copies($db, $input);
    break;
case 'get_user_accounts':
    handle_get_user_accounts($db);
    break;
    case 'admin_live_trades':
        handle_admin_live_trades($db);
        break;
    case 'upload_kyc':
        handle_upload_kyc_v2($db);
        break;
    case 'deposit':
        
        handle_deposit($db, $input);
        break;
    case 'execute_trade':
        handle_execute_trade($db, $input);
        break;
    case 'update_leverage':
        handle_update_leverage($db, $input);
        break;
    case 'internal_transfer':
        handle_internal_transfer($db, $input);
        break;
    case 'demo_topup':
        handle_demo_topup($db, $input);
    break;
    
    
    case 'upload_kyc_url':
    handle_upload_kyc_url($db, $input);
    break;
    
    case 'submit_deposit':
    handle_submit_deposit($db, $input);
    break;
case 'submit_withdrawal':
    handle_submit_withdrawal($db, $input);
    break;
case 'admin_get_deposits':
    handle_admin_get_deposits($db);
    break;
case 'admin_approve_deposit':
    handle_admin_approve_deposit($db, $input);
    break;
case 'admin_reject_deposit':
    handle_admin_reject_deposit($db, $input);
    break;

case 'admin_update_user':
    handle_admin_update_user($db, $input);
    break;
case 'admin_delete_user':
    handle_admin_delete_user($db, $input);
    break;
case 'admin_get_signals':
    handle_admin_get_signals($db);
    break;
case 'admin_upsert_signal':
    handle_admin_upsert_signal($db, $input);
    break;
case 'admin_delete_signal':
    handle_admin_delete_signal($db, $input);
    break;
case 'admin_get_settings':
    handle_admin_get_settings($db);
    break;
case 'admin_update_settings':
    handle_admin_update_settings($db, $input);
    break;
case 'get_site_settings':
    handle_get_site_settings($db);
    break;

    case 'forgot_password':
    handle_forgot_password($db, $input);
    break;
    case 'reset_password':
    handle_reset_password($db, $input);
    break;
    
    default:
        send_json(['success' => false, 'error' => 'Action not found: ' . $action], 404);
}




//

// ─── POST ?action=verify_email_token ─────────────────────────────────────────
function handle_verify_email_token($db, $input) {
    $token = $db->real_escape_string(trim($input['token'] ?? ''));

    if (strlen($token) < 32) {
        send_json(['success' => false, 'error' => 'Invalid verification token.'], 400);
    }

    $res = $db->query(
        "SELECT ev.id, ev.user_id, ev.expires_at, ev.used_at,
                u.name, u.email, u.role, u.status
         FROM   email_verifications ev
         JOIN   users u ON u.id = ev.user_id
         WHERE  ev.token = '$token'
         LIMIT  1"
    );

    if ($res->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Verification link is invalid or has expired.'], 400);
    }

    $row = $res->fetch_assoc();

    // Already verified
    if ($row['used_at'] !== null) {
        $auth_token = base64_encode(json_encode(['id' => $row['user_id'], 'role' => $row['role']]));
        send_json([
            'success' => true,
            'already' => true,
            'message' => 'Your email is already verified. You can log in.',
            'token'   => $auth_token,
            'user'    => [
                'id'                => $row['user_id'],
                'name'              => $row['name'],
                'email'             => $row['email'],
                'role'              => $row['role'],
                'email_verified_at' => $row['used_at']
            ],
        ]);
    }

    // Expired
    if (strtotime($row['expires_at']) < time()) {
        send_json([
            'success' => false,
            'expired' => true,
            'user_id' => $row['user_id'],
            'error'   => 'This verification link has expired. Request a new one.',
        ], 400);
    }

    $ev_id   = (int)$row['id'];
    $user_id = (int)$row['user_id'];

    $db->begin_transaction();
    try {
        $db->query("UPDATE email_verifications SET used_at = NOW() WHERE id = $ev_id");
        $db->query(
            "UPDATE users SET status = 'active', email_verified_at = NOW()
             WHERE id = $user_id"
        );
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        send_json(['success' => false, 'error' => 'Verification failed. Please try again.'], 500);
    }

    $auth_token = base64_encode(json_encode(['id' => $user_id, 'role' => $row['role']]));

    send_json([
        'success' => true,
        'message' => 'Email verified! Welcome to vāntãgeCFD.',
        'token'   => $auth_token,
        'user'    => [
            'id'                => $user_id,
            'name'              => $row['name'],
            'email'             => $row['email'],
            'role'              => $row['role'],
            'email_verified_at' => date('Y-m-d H:i:s')
        ],
    ]);
}

// ─── POST ?action=resend_verification ─────────────────────────────────────────
function handle_resend_verification($db, $input) {
    $user_id = (int)($input['user_id'] ?? 0);
    if (!$user_id) send_json(['success' => false, 'error' => 'Missing user_id.'], 400);

    $res = $db->query("SELECT name, email, email_verified_at FROM users WHERE id = $user_id LIMIT 1");
    $user = $res->fetch_assoc();
    if (!$user) send_json(['success' => false, 'error' => 'User not found.'], 404);
    if ($user['email_verified_at'] !== null) {
        send_json(['success' => false, 'error' => 'Email already verified.'], 409);
    }

    // Invalidate old tokens
    $db->query("UPDATE email_verifications SET used_at = NOW() WHERE user_id = $user_id AND used_at IS NULL");

    // New token
    $token     = bin2hex(random_bytes(32));
    $token_esc = $db->real_escape_string($token);
    $expires   = date('Y-m-d H:i:s', strtotime('+24 hours'));
    $db->query("INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($user_id, '$token_esc', '$expires')");

    $first = explode(' ', $user['name'])[0];

    // Call mails.php via cURL
    _call_mailer($user['email'], $first, '', $token);

    send_json(['success' => true, 'message' => 'Verification email resent.']);
}

// ─── Helper: call mails.php ───────────────────────────────────────────────────
function _call_mailer(string $email, string $firstName, string $lastName, string $token): void {
    $payload = json_encode([
        'first_name'   => $firstName,
        'last_name'    => $lastName,
        'email'        => $email,
        'verify_token' => $token,
    ]);
    $ch = curl_init('https://vantagemarketts.com/backend/mails.php?action=send_mail');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 8,
    ]);
    curl_exec($ch);
    curl_close($ch);
}
// ─── GET ?action=get_transactions ────────────────────────────────────────────
// Returns combined view: deposit_requests + transactions (withdrawals/transfers)
// Query params: type (all|deposit|withdrawal|transfer), status, page, per_page
function handle_get_transactions($db) {
    $user_id  = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $type     = $db->real_escape_string($_GET['type']     ?? 'all');
    $status   = $db->real_escape_string($_GET['status']   ?? '');
    $page     = max(1, (int)($_GET['page']     ?? 1));
    $per_page = min(50, (int)($_GET['per_page'] ?? 15));
    $offset   = ($page - 1) * $per_page;

    // ── Build unified UNION query ─────────────────────────────────────────────
    // Deposits come from deposit_requests table
    // Withdrawals / transfers come from transactions table

    $deposit_where  = "dr.user_id = $user_id";
    $txn_where      = "t.user_id  = $user_id AND t.type IN ('withdrawal','internal_transfer')";

    if ($status) {
        $deposit_where .= " AND dr.status = '$status'";
        $txn_where     .= " AND t.status  = '$status'";
    }

    // Type filter
    $include_deposits  = in_array($type, ['all', 'deposit']);
    $include_withdrawals = in_array($type, ['all', 'withdrawal']);
    $include_transfers   = in_array($type, ['all', 'transfer']);

    $parts = [];

    if ($include_deposits) {
        $parts[] = "SELECT
            dr.id,
            'deposit'             AS type,
            dr.amount,
            dr.currency,
            dr.method,
            dr.crypto_symbol,
            NULL                  AS crypto_address,
            dr.tx_ref             AS reference,
            dr.receipt_url,
            dr.status,
            dr.admin_note         AS notes,
            dr.created_at,
            dr.updated_at
        FROM deposit_requests dr
        WHERE $deposit_where";
    }

    if ($include_withdrawals) {
        $parts[] = "SELECT
            t.id,
            'withdrawal'          AS type,
            t.amount,
            t.currency,
            t.method,
            t.crypto_symbol,
            t.crypto_address,
            t.reference,
            NULL                  AS receipt_url,
            t.status,
            t.notes,
            t.created_at,
            t.updated_at
        FROM transactions t
        WHERE $txn_where AND t.type = 'withdrawal'";
    }

    if ($include_transfers) {
        $parts[] = "SELECT
            t.id,
            'transfer'            AS type,
            t.amount,
            t.currency,
            t.method,
            NULL                  AS crypto_symbol,
            NULL                  AS crypto_address,
            t.reference,
            NULL                  AS receipt_url,
            t.status,
            t.notes,
            t.created_at,
            t.updated_at
        FROM transactions t
        WHERE $txn_where AND t.type = 'internal_transfer'";
    }

    if (empty($parts)) {
        send_json(['success' => true, 'data' => [], 'meta' => ['page' => 1, 'last_page' => 1, 'total' => 0]]);
    }

    $union_sql = implode(' UNION ALL ', $parts);

    // Count total
    $count_res = $db->query("SELECT COUNT(*) c FROM ($union_sql) combined");
    $total     = (int)$count_res->fetch_assoc()['c'];

    // Paginated data
    $res  = $db->query(
        "SELECT * FROM ($union_sql) combined
         ORDER BY created_at DESC
         LIMIT $per_page OFFSET $offset"
    );

    send_json([
        'success' => true,
        'data'    => $res->fetch_all(MYSQLI_ASSOC),
        'meta'    => [
            'page'      => $page,
            'per_page'  => $per_page,
            'total'     => $total,
            'last_page' => max(1, (int)ceil($total / $per_page)),
        ],
    ]);
}

function handle_upload_kyc_url($db, $input) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $doc_type  = $db->real_escape_string($input['document_type'] ?? '');
    $file_url  = $db->real_escape_string($input['file_url']      ?? '');
    $public_id = $db->real_escape_string($input['public_id']     ?? '');

    if (!in_array($doc_type, ['identity', 'address'])) {
        send_json(['success' => false, 'error' => 'Invalid document type.'], 400);
    }
    if (empty($file_url)) {
        send_json(['success' => false, 'error' => 'file_url is required.'], 400);
    }

    $sql = "INSERT INTO kyc_documents (user_id, document_type, file_url, status)
            VALUES ($user_id, '$doc_type', '$file_url', 'pending')";

    if ($db->query($sql)) {
        send_json([
            'success' => true,
            'message' => 'Document received. Under review within 24 hours.',
            'data'    => ['kyc_id' => $db->insert_id],
        ]);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}

// ─── POST ?action=submit_deposit ─────────────────────────────────────────────
// Payload: { amount, currency, method, crypto_symbol?, tx_ref, receipt_url }
function handle_submit_deposit($db, $input) {
    $user_id      = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $amount        = (float)($input['amount']        ?? 0);
    $currency      = $db->real_escape_string($input['currency']      ?? 'USD');
    $method        = $db->real_escape_string($input['method']        ?? 'bank_wire');
    $crypto_symbol = $db->real_escape_string($input['crypto_symbol'] ?? '');
    $tx_ref        = $db->real_escape_string($input['tx_ref']        ?? '');
    $receipt_url   = $db->real_escape_string($input['receipt_url']   ?? '');

    if ($amount < 100)     send_json(['success' => false, 'error' => 'Minimum deposit is $100.'],       400);
    if ($amount > 500000000)  send_json(['success' => false, 'error' => 'Maximum deposit is $15,000,000.'],   400);
    if (empty($tx_ref))   send_json(['success' => false, 'error' => 'Transaction reference required.'], 400);
    if (empty($receipt_url)) send_json(['success' => false, 'error' => 'Receipt URL required.'],      400);

    $crypto_val = !empty($crypto_symbol) ? "'$crypto_symbol'" : 'NULL';

    $sql = "INSERT INTO deposit_requests
                (user_id, amount, currency, method, crypto_symbol, tx_ref, receipt_url, status)
            VALUES
                ($user_id, $amount, '$currency', '$method', $crypto_val, '$tx_ref', '$receipt_url', 'pending')";

    if ($db->query($sql)) {
        send_json([
            'success' => true,
            'message' => 'Deposit request submitted. We will credit your wallet within 24 hours.',
            'data'    => ['request_id' => $db->insert_id],
        ]);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}

// ─── POST ?action=submit_withdrawal ──────────────────────────────────────────
// Payload: { amount, method, bank_name?, account_name?, account_number?,
//            crypto_symbol?, crypto_address? }
function handle_submit_withdrawal($db, $input) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $amount         = (float)($input['amount'] ?? 0);
    $method         = $db->real_escape_string($input['method'] ?? 'bank');
    $crypto_symbol  = $db->real_escape_string($input['crypto_symbol']  ?? '');
    $crypto_address = $db->real_escape_string($input['crypto_address'] ?? '');
    $bank_name      = $db->real_escape_string($input['bank_name']      ?? '');
    $account_name   = $db->real_escape_string($input['account_name']   ?? '');
    $account_number = $db->real_escape_string($input['account_number'] ?? '');

    if ($amount < 10) send_json(['success' => false, 'error' => 'Minimum withdrawal is $10.'], 400);

    // Check wallet balance
    $w = $db->query("SELECT wallet_balance FROM users WHERE id = $user_id LIMIT 1")->fetch_assoc();
    if ((float)$w['wallet_balance'] < $amount) {
        send_json(['success' => false, 'error' => sprintf('Insufficient balance ($%.2f available).', $w['wallet_balance'])], 400);
    }

    // Build notes string
    if ($method === 'crypto') {
        $notes = "Crypto withdrawal: $crypto_symbol to $crypto_address";
        $method_label = "crypto_$crypto_symbol";
    } else {
        $notes = "Bank: $bank_name | Name: $account_name | Acc: $account_number";
        $method_label = 'bank_wire';
    }
    $notes_esc    = $db->real_escape_string($notes);
    $method_esc   = $db->real_escape_string($method_label);
    $ref          = 'WD-' . strtoupper(substr(md5(uniqid()), 0, 12));
    $crypto_s_val = !empty($crypto_symbol)  ? "'$crypto_symbol'"  : 'NULL';
    $crypto_a_val = !empty($crypto_address) ? "'$crypto_address'" : 'NULL';

    $db->begin_transaction();
    try {
        // Insert transaction record
        $db->query(
            "INSERT INTO transactions
                 (user_id, reference, type, amount, currency, method,
                  crypto_symbol, crypto_address, status, notes)
             VALUES
                 ($user_id, '$ref', 'withdrawal', $amount, 'USD', '$method_esc',
                  $crypto_s_val, $crypto_a_val, 'pending', '$notes_esc')"
        );
        // Deduct from wallet immediately (hold pending admin approval)
        $db->query("UPDATE users SET wallet_balance = wallet_balance - $amount WHERE id = $user_id");
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        send_json(['success' => false, 'error' => 'Failed to submit withdrawal.'], 500);
    }

    send_json([
        'success' => true,
        'message' => 'Withdrawal request submitted. Processing within 1–3 business days.',
        'data'    => ['reference' => $ref],
    ]);
}

// ─── GET ?action=admin_get_deposits ──────────────────────────────────────────
function handle_admin_get_deposits($db) {
    $status   = $db->real_escape_string($_GET['status']   ?? '');
    $page     = max(1, (int)($_GET['page']     ?? 1));
    $per_page = min(50, (int)($_GET['per_page'] ?? 20));
    $offset   = ($page - 1) * $per_page;

    $where = $status ? "WHERE dr.status = '$status'" : "";

    $total = (int)$db->query("SELECT COUNT(*) c FROM deposit_requests dr $where")->fetch_assoc()['c'];

    $res = $db->query(
        "SELECT dr.*, u.name AS user_name, u.email AS user_email
         FROM   deposit_requests dr
         JOIN   users u ON u.id = dr.user_id
         $where
         ORDER  BY dr.created_at DESC
         LIMIT  $per_page OFFSET $offset"
    );

    send_json([
        'success' => true,
        'data'    => $res->fetch_all(MYSQLI_ASSOC),
        'meta'    => [
            'page'      => $page,
            'per_page'  => $per_page,
            'total'     => $total,
            'last_page' => (int)ceil($total / $per_page),
        ],
    ]);
}

// ─── POST ?action=admin_approve_deposit ──────────────────────────────────────
// Payload: { deposit_id }
function handle_admin_approve_deposit($db, $input) {
    $deposit_id = (int)($input['deposit_id'] ?? 0);
    if (!$deposit_id) send_json(['success' => false, 'error' => 'Missing deposit_id.'], 400);

    $res = $db->query("SELECT * FROM deposit_requests WHERE id = $deposit_id LIMIT 1");
    $dep = $res->fetch_assoc();
    if (!$dep)                         send_json(['success' => false, 'error' => 'Not found.'],         404);
    if ($dep['status'] !== 'pending')  send_json(['success' => false, 'error' => 'Already processed.'], 409);

    $uid    = (int)$dep['user_id'];
    $amount = (float)$dep['amount'];

    $db->begin_transaction();
    try {
        $db->query("UPDATE deposit_requests SET status = 'approved' WHERE id = $deposit_id");
        $db->query("UPDATE users SET wallet_balance = wallet_balance + $amount WHERE id = $uid");
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        send_json(['success' => false, 'error' => 'Failed to approve.'], 500);
    }

    send_json(['success' => true, 'message' => "Deposit approved. \$$amount credited to user #$uid."]);
}

// ─── POST ?action=admin_reject_deposit ───────────────────────────────────────
// Payload: { deposit_id, admin_note? }
function handle_admin_reject_deposit($db, $input) {
    $deposit_id = (int)($input['deposit_id'] ?? 0);
    $note       = $db->real_escape_string($input['admin_note'] ?? '');
    if (!$deposit_id) send_json(['success' => false, 'error' => 'Missing deposit_id.'], 400);

    $res = $db->query("SELECT status FROM deposit_requests WHERE id = $deposit_id LIMIT 1");
    $dep = $res->fetch_assoc();
    if (!$dep)                        send_json(['success' => false, 'error' => 'Not found.'],         404);
    if ($dep['status'] !== 'pending') send_json(['success' => false, 'error' => 'Already processed.'], 409);

    $db->query("UPDATE deposit_requests SET status = 'rejected', admin_note = '$note' WHERE id = $deposit_id");

    send_json(['success' => true, 'message' => 'Deposit rejected.']);
}
// ─── POST ?action=execute_trade ───────────────────────────────────────────────
function handle_execute_trade($db, $input) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $acc_id = (int)($input['account_id'] ?? 0);
    $symbol = $db->real_escape_string($input['symbol'] ?? '');
    $type   = $db->real_escape_string($input['type']   ?? '');
    $lots   = (float)($input['lots']  ?? 0);
    $price  = (float)($input['price'] ?? 0);
    $sl     = !empty($input['stop_loss'])   ? (float)$input['stop_loss']   : null;
    $tp     = !empty($input['take_profit']) ? (float)$input['take_profit'] : null;
    $sl_val = $sl !== null ? $sl : 'NULL';
    $tp_val = $tp !== null ? $tp : 'NULL';

    if (!in_array($type, ['long','short']) || $lots <= 0 || $price <= 0) {
        send_json(['success' => false, 'error' => 'Invalid trade parameters.'], 400);
    }

    // Verify account belongs to user
    $acc_res = $db->query(
        "SELECT balance, leverage FROM trading_accounts
         WHERE id = $acc_id AND user_id = $user_id AND status = 'active' LIMIT 1"
    );
    if ($acc_res->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Account not found.'], 404);
    }
    $acc              = $acc_res->fetch_assoc();
    $provider_balance = (float)$acc['balance'];
    $provider_leverage= (int)$acc['leverage'];
    $contract_size    = 100000;

    // Margin = (lots × contract_size × price) / leverage
    $required_margin  = ($lots * $contract_size * $price) / $provider_leverage;

    if ($provider_balance < $required_margin) {
        send_json([
            'success' => false,
            'error'   => sprintf('Insufficient margin. Required: $%.2f, Available: $%.2f',
                $required_margin, $provider_balance),
        ], 400);
    }

    // ── Risk % = margin / provider_balance ────────────────────────────────────
    // This is the fraction of the provider's account risked on this trade.
    // Each copier will risk this SAME fraction of THEIR account.
    $provider_risk_pct = $provider_balance > 0 ? $required_margin / $provider_balance : 0;

    $db->begin_transaction();
    try {
        // Insert provider's position (manual)
        $db->query(
            "INSERT INTO positions
                 (user_id, trading_account_id, symbol, type, lots,
                  entry_price, current_price, stop_loss, take_profit,
                  status, execution_type)
             VALUES
                 ($user_id, $acc_id, '$symbol', '$type', $lots,
                  $price, $price, $sl_val, $tp_val,
                  'open', 'manual')"
        );
        $provider_pos_id = $db->insert_id;
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        send_json(['success' => false, 'error' => 'Trade execution failed.'], 500);
    }

    $new = $db->query("SELECT * FROM positions WHERE id = $provider_pos_id")->fetch_assoc();

    // ── Mirror to copiers using % risk ───────────────────────────────────────
    // copier_id in copy_relationships = the user copying
    // provider_id = matches signals.user_id = this $user_id
    $copiers = $db->query(
        "SELECT cr.copier_id, cr.trading_account_id, cr.risk_multiplier
         FROM   copy_relationships cr
         WHERE  cr.provider_id = $user_id
           AND  cr.status      = 'active'"
    );

    while ($copier = $copiers->fetch_assoc()) {
        $c_user_id   = (int)$copier['copier_id'];
        $c_acc_id    = (int)$copier['trading_account_id'];
        $risk_mult   = (float)$copier['risk_multiplier'];

        // Get copier account details
        $c_res = $db->query(
            "SELECT balance, leverage FROM trading_accounts
             WHERE id = $c_acc_id AND user_id = $c_user_id AND status = 'active' LIMIT 1"
        );
        if ($c_res->num_rows === 0) continue;
        $c_acc      = $c_res->fetch_assoc();
        $c_balance  = (float)$c_acc['balance'];
        $c_leverage = (int)$c_acc['leverage'];

        // Copier's dollar risk = same % of their balance × risk_multiplier
        // e.g. provider risked 2% of $25k = $500
        //      copier balance = $1000, risk_mult = 1.0 → risk $20 (2% of $1000)
        //      copier balance = $1000, risk_mult = 0.5 → risk $10 (1% of $1000)
        $c_dollar_risk = $c_balance * $provider_risk_pct * $risk_mult;

        // Back-calculate lots from dollar_risk:
        // margin = lots × contract_size × price / leverage
        // lots   = margin × leverage / (contract_size × price)
        if ($price <= 0 || $c_leverage <= 0) continue;
        $c_lots = round(($c_dollar_risk * $c_leverage) / ($contract_size * $price), 2);

        // Enforce minimum lot size
        if ($c_lots < 0.01) $c_lots = 0.01;

        // Check copier has enough balance for the margin
        $c_margin = ($c_lots * $contract_size * $price) / $c_leverage;
        if ($c_balance < $c_margin) continue; // skip if can't afford

        // Insert copier position (copy execution_type, link to provider position)
        $db->query(
            "INSERT INTO positions
                 (user_id, trading_account_id, symbol, type, lots,
                  entry_price, current_price, stop_loss, take_profit,
                  status, execution_type, copy_trade_id)
             VALUES
                 ($c_user_id, $c_acc_id, '$symbol', '$type', $c_lots,
                  $price, $price, $sl_val, $tp_val,
                  'open', 'copy', $provider_pos_id)"
        );
    }

    send_json([
        'success' => true,
        'message' => 'Order executed successfully.',
        'data'    => $new,
    ]);
}

// ─── GET ?action=get_positions&account_id={id} ────────────────────────────────
function handle_get_positions($db) {
    $user_id    = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $account_id = (int)($_GET['account_id'] ?? 0);

    $acc_res = $db->query(
        "SELECT id FROM trading_accounts
         WHERE id = $account_id AND user_id = $user_id LIMIT 1"
    );
    if ($acc_res->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Account not found.'], 404);
    }

    // Include execution_type and copy_trade_id in SELECT
    $res = $db->query(
        "SELECT p.*, p.execution_type, p.copy_trade_id,
                -- provider name for copy trades
                CASE WHEN p.copy_trade_id IS NOT NULL
                     THEN (SELECT u.name FROM positions pp
                           JOIN users u ON pp.user_id = u.id
                           WHERE pp.id = p.copy_trade_id LIMIT 1)
                     ELSE NULL
                END AS copied_from_name
         FROM   positions p
         WHERE  p.trading_account_id = $account_id
           AND  p.status = 'open'
         ORDER  BY p.created_at DESC"
    );
    $positions = $res->fetch_all(MYSQLI_ASSOC);

    // Simulate live price + P&L
    foreach ($positions as &$p) {
        $move              = (rand(-50, 50) / 100000);
        $p['current_price']= round((float)$p['entry_price'] + $move, 5);
        $direction         = $p['type'] === 'long' ? 1 : -1;
        $p['pnl']          = round(
            $direction * ($p['current_price'] - (float)$p['entry_price']) * (float)$p['lots'] * 100000,
            2
        );
    }

    send_json(['success' => true, 'data' => $positions]);
}

// ─── GET ?action=get_signals ──────────────────────────────────────────────────
function handle_get_signals($db) {
    // Join with users for provider_name
    // Also compute real stats from positions table for credibility
    $sql = "SELECT
                s.id, s.name, s.description, s.roi, s.win_rate,
                s.drawdown, s.subscribers, s.status,
                u.name    AS provider_name,
                u.country AS provider_country,
                -- Count real closed trades for this provider
                (SELECT COUNT(*) FROM positions p
                 JOIN trading_accounts ta ON p.trading_account_id = ta.id
                 WHERE ta.user_id = s.user_id AND p.status = 'closed') AS total_trades,
                -- Count of profitable trades
                (SELECT COUNT(*) FROM positions p
                 JOIN trading_accounts ta ON p.trading_account_id = ta.id
                 WHERE ta.user_id = s.user_id AND p.status = 'closed' AND p.pnl > 0) AS winning_trades
            FROM   signals s
            JOIN   users   u ON s.user_id = u.id
            WHERE  s.status = 'active'
            ORDER  BY s.roi DESC";

    $res = $db->query($sql);
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

// ─── GET ?action=get_my_copy_relationships ────────────────────────────────────
// Returns which providers the current user is copying
function handle_get_my_copies($db) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $res = $db->query(
        "SELECT cr.id, cr.provider_id, cr.trading_account_id,
                cr.risk_multiplier, cr.status, cr.created_at,
                s.name AS signal_name,
                u.name AS provider_name,
                ta.account_number AS copy_account_number
         FROM   copy_relationships cr
         JOIN   signals s  ON s.user_id  = cr.provider_id
         JOIN   users   u  ON u.id       = cr.provider_id
         JOIN   trading_accounts ta ON ta.id = cr.trading_account_id
         WHERE  cr.copier_id = $user_id
         ORDER  BY cr.created_at DESC"
    );
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

// ─── POST ?action=stop_copy ────────────────────────────────────────────────────
function handle_stop_copy($db, $input) {
    $user_id     = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $provider_id = (int)($input['provider_id'] ?? 0);
    if (!$provider_id) send_json(['success' => false, 'error' => 'Missing provider_id.'], 400);

    $db->query(
        "UPDATE copy_relationships
         SET    status = 'stopped'
         WHERE  copier_id    = $user_id
           AND  provider_id  = $provider_id
           AND  status       = 'active'"
    );

    // Decrement subscriber count
    $db->query("UPDATE signals SET subscribers = GREATEST(subscribers - 1, 0) WHERE user_id = $provider_id");

    send_json(['success' => true, 'message' => 'Stopped copying this provider.']);
}
function handle_internal_transfer($db, $input) {
    $user_id  = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $acc_id    = (int)($input['account_id'] ?? 0);
    $amount    = (float)($input['amount']   ?? 0);
    $direction = $input['direction']         ?? '';

    if ($amount <= 0) {
        send_json(['success' => false, 'error' => 'Amount must be greater than zero.'], 400);
    }
    if (!in_array($direction, ['wallet_to_acc', 'acc_to_wallet'])) {
        send_json(['success' => false, 'error' => 'Invalid direction.'], 400);
    }

    // Verify account belongs to this user
    $acc_res = $db->query(
        "SELECT id, balance FROM trading_accounts
         WHERE id = $acc_id AND user_id = $user_id AND status = 'active' LIMIT 1"
    );
    if ($acc_res->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Account not found.'], 404);
    }
    $acc = $acc_res->fetch_assoc();

    // Get wallet balance
    $w_res    = $db->query("SELECT wallet_balance FROM users WHERE id = $user_id LIMIT 1");
    $wallet   = (float)$w_res->fetch_assoc()['wallet_balance'];

    // Balance checks
    if ($direction === 'wallet_to_acc' && $wallet < $amount) {
        send_json(['success' => false, 'error' => sprintf('Insufficient wallet balance ($%.2f available).', $wallet)], 400);
    }
    if ($direction === 'acc_to_wallet' && (float)$acc['balance'] < $amount) {
        send_json(['success' => false, 'error' => sprintf('Insufficient account balance ($%.2f available).', $acc['balance'])], 400);
    }

    // Execute atomically
    $db->begin_transaction();
    try {
        if ($direction === 'wallet_to_acc') {
            $db->query("UPDATE users SET wallet_balance = wallet_balance - $amount WHERE id = $user_id");
            $db->query("UPDATE trading_accounts SET balance = balance + $amount WHERE id = $acc_id");
        } else {
            $db->query("UPDATE trading_accounts SET balance = balance - $amount WHERE id = $acc_id");
            $db->query("UPDATE users SET wallet_balance = wallet_balance + $amount WHERE id = $user_id");
        }
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        send_json(['success' => false, 'error' => 'Transfer failed. Please try again.'], 500);
    }

    send_json(['success' => true, 'message' => 'Transfer completed successfully.']);
}
function handle_get_trade_history($db) {
    $user_id    = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $account_id = (int)($_GET['account_id'] ?? 0);
    $page       = max(1, (int)($_GET['page']     ?? 1));
    $per_page   = min(50, (int)($_GET['per_page'] ?? 20));
    $offset     = ($page - 1) * $per_page;

    // Verify account belongs to user
    $chk = $db->query("SELECT id FROM trading_accounts WHERE id = $account_id AND user_id = $user_id LIMIT 1");
    if ($chk->num_rows === 0) send_json(['success' => false, 'error' => 'Account not found.'], 404);

    $total = (int)$db->query(
        "SELECT COUNT(*) c FROM positions WHERE trading_account_id = $account_id AND status = 'closed'"
    )->fetch_assoc()['c'];

    $res = $db->query(
        "SELECT id, symbol, type, lots, entry_price, current_price AS close_price,
                pnl, stop_loss, take_profit, created_at, closed_at
         FROM   positions
         WHERE  trading_account_id = $account_id AND status = 'closed'
         ORDER  BY closed_at DESC
         LIMIT  $per_page OFFSET $offset"
    );

    send_json([
        'success' => true,
        'data'    => $res->fetch_all(MYSQLI_ASSOC),
        'meta'    => [
            'page'      => $page,
            'per_page'  => $per_page,
            'total'     => $total,
            'last_page' => (int)ceil($total / $per_page),
        ],
    ]);
}



// ─── POST ?action=close_position ─────────────────────────────────────────────
// Payload: { position_id }
function handle_close_position($db, $input) {
    $user_id     = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $position_id = (int)($input['position_id'] ?? 0);
    if (!$position_id) send_json(['success' => false, 'error' => 'Missing position_id.'], 400);

    // Fetch position and verify ownership
    $res = $db->query(
        "SELECT p.*, a.balance, a.leverage
         FROM positions p
         JOIN trading_accounts a ON p.trading_account_id = a.id
         WHERE p.id = $position_id
           AND p.user_id = $user_id
           AND p.status  = 'open'
         LIMIT 1"
    );
    if ($res->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Position not found or already closed.'], 404);
    }
    $pos = $res->fetch_assoc();

    // Calculate final P&L with simulated close price
    $move        = (rand(-50, 50) / 100000);
    $close_price = round((float)$pos['entry_price'] + $move, 5);
    $direction   = $pos['type'] === 'long' ? 1 : -1;
    $pnl         = round($direction * ($close_price - (float)$pos['entry_price']) * (float)$pos['lots'] * 100000, 2);

    $acc_id      = (int)$pos['trading_account_id'];

    // Close position + credit/debit account balance
    $db->begin_transaction();
    try {
        $db->query(
            "UPDATE positions
             SET status = 'closed', current_price = $close_price,
                 pnl = $pnl, closed_at = NOW()
             WHERE id = $position_id"
        );
        $db->query(
            "UPDATE trading_accounts
             SET balance = balance + $pnl
             WHERE id = $acc_id"
        );
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        send_json(['success' => false, 'error' => 'Failed to close position.'], 500);
    }

    send_json([
        'success'     => true,
        'message'     => 'Position closed.',
        'data'        => [
            'position_id' => $position_id,
            'close_price' => $close_price,
            'pnl'         => $pnl,
        ],
    ]);
}

// ─── GET ?action=get_user_accounts ────────────────────────────────────────────
// Returns full account list for the terminal account selector
function handle_get_user_accounts($db) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $res = $db->query(
        "SELECT id, account_number, type, is_demo, balance, leverage, currency, status
         FROM   trading_accounts
         WHERE  user_id = $user_id AND status = 'active'
         ORDER  BY is_demo ASC, created_at ASC"
    );
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}


//
function handle_demo_topup($db, $input) {
    $user_id    = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $account_id = (int)($input['account_id'] ?? 0);
    $amount     = (float)($input['amount']     ?? 0);

    if ($amount <= 0 || $amount > 1000000) {
        send_json(['success' => false, 'error' => 'Invalid amount.'], 400);
    }

    // Verify account belongs to user AND is a demo account
    $res = $db->query(
        "SELECT id FROM trading_accounts
         WHERE id = $account_id
           AND user_id = $user_id
           AND is_demo = 1
         LIMIT 1"
    );
    if ($res->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Demo account not found.'], 404);
    }

    $db->query("UPDATE trading_accounts SET balance = balance + $amount WHERE id = $account_id");

    send_json(['success' => true, 'message' => "Virtual funds added successfully."]);
}
// --- 5. Action Handlers (Procedural) ---

function handle_forgot_password($db, $input) {
    $email = $db->real_escape_string($input['email'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) send_json(['success' => false, 'error' => 'Invalid email'], 400);

    $res = $db->query("SELECT id, name FROM users WHERE email = '$email' LIMIT 1");
    if ($res->num_rows === 0) {
        // For security, don't reveal if user exists, but here we can just say success
        send_json(['success' => true, 'message' => 'If this email is registered, you will receive a reset link.']);
    }

    $user = $res->fetch_assoc();
    $user_id = $user['id'];
    $token = bin2hex(random_bytes(32));
    $token_hash = password_hash($token, PASSWORD_BCRYPT);
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $db->query("INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($user_id, '$token_hash', '$expires')");

    // In a real app, send email here. For now, we return it for the demo/frontend to use.
    send_json([
        'success' => true,
        'message' => 'Reset link generated (Demo mode).',
        'debug_token' => $token
    ]);
}

function handle_reset_password($db, $input) {
    $token = $input['token'] ?? '';
    $email = $db->real_escape_string($input['email'] ?? '');
    $new_pass = $input['password'] ?? '';

    if (empty($token) || empty($new_pass)) send_json(['success' => false, 'error' => 'Missing fields'], 400);

    $res = $db->query("SELECT pr.id, pr.user_id, pr.token_hash FROM password_resets pr JOIN users u ON u.id = pr.user_id WHERE u.email = '$email' AND pr.used_at IS NULL AND pr.expires_at > NOW() ORDER BY pr.created_at DESC LIMIT 1");

    if ($res->num_rows === 0) send_json(['success' => false, 'error' => 'Invalid or expired reset link'], 400);

    $row = $res->fetch_assoc();
    if (!password_verify($token, $row['token_hash'])) send_json(['success' => false, 'error' => 'Invalid token'], 400);

    $hash = password_hash($new_pass, PASSWORD_BCRYPT);
    $user_id = $row['user_id'];
    $pr_id = $row['id'];

    $db->begin_transaction();
    try {
        $db->query("UPDATE users SET password_hash = '$hash' WHERE id = $user_id");
        $db->query("UPDATE password_resets SET used_at = NOW() WHERE id = $pr_id");
        $db->commit();
        send_json(['success' => true, 'message' => 'Password reset successfully.']);
    } catch (Exception $e) {
        $db->rollback();
        send_json(['success' => false, 'error' => 'Failed to reset password'], 500);
    }
}

function handle_login($db, $input) {
    $email = $db->real_escape_string($input['email'] ?? '');
    $pass  = $input['password'] ?? '';

    $res  = $db->query("SELECT * FROM users WHERE email = '$email' LIMIT 1");
    $user = $res->fetch_assoc();

    if ($user && password_verify($pass, $user['password_hash'])) {
        $token = base64_encode(json_encode(['id' => $user['id'], 'role' => $user['role']]));
        send_json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'                => $user['id'],
                'name'              => $user['name'],
                'role'              => $user['role'],
                'email'             => $user['email'],
                'email_verified_at' => $user['email_verified_at'], // ← add this
            ],
        ]);
    }
    send_json(['success' => false, 'error' => 'Invalid credentials'], 401);
}

function handle_register($db, $input) {
    $first   = $db->real_escape_string(trim($input['first_name'] ?? ''));
    $last    = $db->real_escape_string(trim($input['last_name']  ?? ''));
    $name    = trim("$first $last");
    $email   = $db->real_escape_string(trim($input['email']      ?? ''));
    $country = $db->real_escape_string($input['country']         ?? '');
    $phone   = $db->real_escape_string($input['phone']           ?? '');
    $password = $input['password'] ?? '';

    if (empty($first))  send_json(['success' => false, 'error' => 'First name is required.'], 400);
    if (empty($last))   send_json(['success' => false, 'error' => 'Last name is required.'], 400);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_json(['success' => false, 'error' => 'Invalid email address.'], 400);
    }
    if (strlen($password) < 8) {
        send_json(['success' => false, 'error' => 'Password must be at least 8 characters.'], 400);
    }

    // Check duplicate
    $chk = $db->query("SELECT id FROM users WHERE email = '$email' LIMIT 1");
    if ($chk->num_rows > 0) {
        send_json(['success' => false, 'error' => 'Email already registered. Please log in.'], 409);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $sql  = "INSERT INTO users (name, email, password_hash, phone, country, status)
             VALUES ('$name', '$email', '$hash', '$phone', '$country', 'pending')";

    if (!$db->query($sql)) {
        send_json(['success' => false, 'error' => 'Registration failed: ' . $db->error], 500);
    }

    $user_id = $db->insert_id;

    // Send OTP immediately
  //  _send_otp_to_user($db, $user_id, $email, $first);

    // ── MUST return data.user_id
    // At the end of handle_register, before send_json, add:
$token     = bin2hex(random_bytes(32));
$token_esc = $db->real_escape_string($token);
$expires   = date('Y-m-d H:i:s', strtotime('+24 hours'));
$db->query("INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($user_id, '$token_esc', '$expires')");

// Also send OTP for in-app flow
//_send_otp_to_user($db, $user_id, $email, $first);

send_json([
    'success' => true,
    'message' => 'Account created. Please verify your email.',
    'data'    => [
        'user_id'      => $user_id,
        'email'        => $email,
        'verify_token' => $token,  // ← frontend passes this to mailService
    ],
]);


    send_json([
        'success' => true,
        'message' => 'Account created. Please verify your email.',
        'data'    => [
            'user_id' => $user_id,
            'email'   => $email,
        ],
    ]);
    
    
}
function handle_get_accounts($db) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $user_id = (int)$user_id; // ensure integer, safe for query

    // FIXED: Changed "user_id = 2" to "$user_id"
    $res = $db->query("SELECT * FROM trading_accounts WHERE user_id = $user_id");
    $accounts = $res->fetch_all(MYSQLI_ASSOC);

    // KYC status — get the latest doc for each type
    $kyc_res = $db->query(
        "SELECT document_type, status, rejection_reason
         FROM kyc_documents
         WHERE user_id = $user_id
         ORDER BY created_at DESC"
    );
    $kyc_rows = $kyc_res->fetch_all(MYSQLI_ASSOC);
    
    // Wallet Balance
    $bal = $db->query("SELECT wallet_balance FROM users WHERE id = $user_id LIMIT 1");
    $bal_data = $bal->fetch_assoc(); // Use fetch_assoc() for a single row instead of fetch_all

    // Shape KYC into { identity: {...}, address: {...} }
    $kyc = [];
    foreach ($kyc_rows as $row) {
        $type = $row['document_type'];
        if (!isset($kyc[$type])) { 
            $kyc[$type] = [
                'status'           => $row['status'],
                'rejection_reason' => $row['rejection_reason'],
            ];
        }
    }

    send_json([
        'success' => true,
        'data'    => [
            // Extract the actual value or default to 0
            'balance'  => $bal_data['wallet_balance'] ?? 0,
            'accounts' => $accounts,
            'kyc'      => $kyc,
        ],
    ]);
}


function handle_admin_live_trades($db) {
    // Admin function: Get all open positions across all users
    $sql = "SELECT p.*, u.name as trader_name, a.account_number
            FROM positions p
            JOIN users u ON p.user_id = u.id
            JOIN trading_accounts a ON p.trading_account_id = a.id
            WHERE p.status = 'open'";
    $res = $db->query($sql);
    $trades = $res->fetch_all(MYSQLI_ASSOC);

    // Live calculations (simulated)
    foreach ($trades as &$t) {
        // Simulate a small random price movement for "live" feel
        $move = (rand(-10, 10) / 10000);
        $t['current_price'] = (float)$t['current_price'] + $move;
        $t['pnl'] = ($t['type'] === 'long' ? 1 : -1) * ($t['current_price'] - $t['entry_price']) * ($t['lots'] * 100000);
    }

    send_json(['success' => true, 'data' => $trades]);
}

function handle_upload_kyc($db) {
    // Simple file upload logic
    if (!isset($_FILES['file'])) send_json(['success' => false, 'error' => 'No file']);
    send_json(['success' => true, 'message' => 'Document received for review']);
}

function handle_deposit($db, $input) {
    send_json(['success' => true, 'message' => 'Deposit initiated', 'url' => 'https://commerce.coinbase.com/charges/mock']);
}




function handle_update_leverage($db, $input) {
    $acc_id = (int)$input['account_id'];
    $leverage = (int)$input['leverage'];
    $db->query("UPDATE trading_accounts SET leverage = $leverage WHERE id = $acc_id");
    send_json(['success' => true, 'message' => 'Leverage updated']);

}

function get_auth_user_id(): int {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($header, 'Bearer ')) return 0;
    $token = base64_decode(substr($header, 7));
    $data  = json_decode($token, true);
    return (int)($data['id'] ?? 0);
}
 
// ─── GET ?action=get_signals ──────────────────────────────────────────────────

 
// ─── POST ?action=copy_signal ─────────────────────────────────────────────────
// Creates a row in `copy_relationships`.
// Payload: { provider_id, trading_account_id, risk_multiplier }
function handle_copy_signal($db, $input) {
    $copier_id          = get_auth_user_id();
    $signal_id          = (int)($input['provider_id']        ?? 0); // Frontend passes signal ID
    $trading_account_id = (int)($input['trading_account_id'] ?? 0);
    $risk_multiplier    = (float)($input['risk_multiplier']  ?? 1.0);
 
    if (!$copier_id || !$signal_id || !$trading_account_id) {
        send_json(['success' => false, 'error' => 'Missing required fields.'], 400);
    }
 
    // Get provider's user_id from signals table
    $prov_res = $db->query("SELECT user_id FROM signals WHERE id = $signal_id LIMIT 1");
    $prov     = $prov_res->fetch_assoc();
    if (!$prov) {
        send_json(['success' => false, 'error' => 'Signal provider not found.'], 404);
    }
    $provider_user_id = (int)$prov['user_id'];

    if ($provider_user_id === $copier_id) {
        send_json(['success' => false, 'error' => 'You cannot copy your own signal.'], 400);
    }
 
    // Upsert: if already copying this provider, update; otherwise insert
    $check = $db->query(
        "SELECT id FROM copy_relationships
         WHERE copier_id = $copier_id AND provider_id = $provider_user_id
         AND trading_account_id = $trading_account_id LIMIT 1"
    );
 
    if ($check->num_rows > 0) {
        $row_id = $check->fetch_assoc()['id'];
        $db->query(
            "UPDATE copy_relationships
             SET risk_multiplier = $risk_multiplier, status = 'active'
             WHERE id = $row_id"
        );
        send_json(['success' => true, 'message' => 'Copy relationship updated.']);
    }
 
    $sql = "INSERT INTO copy_relationships
                (copier_id, provider_id, trading_account_id, risk_multiplier, status)
            VALUES ($copier_id, $provider_user_id, $trading_account_id, $risk_multiplier, 'active')";
 
    if ($db->query($sql)) {
        // Increment subscriber count on signals table using signal_id
        $db->query("UPDATE signals SET subscribers = subscribers + 1 WHERE id = $signal_id");
        send_json(['success' => true, 'message' => 'You are now copying this provider.',
                   'data' => ['copy_id' => $db->insert_id]]);
    }
    send_json(['success' => false, 'error' => 'Database Error: ' . $db->error], 500);
}
 
// ─── GET ?action=get_kyc ──────────────────────────────────────────────────────
// Returns the authenticated user's KYC documents from `kyc_documents`.
function handle_get_kyc($db) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);
 
    $res = $db->query(
        "SELECT id, document_type, file_url, status, rejection_reason, created_at
         FROM   kyc_documents
         WHERE  user_id = $user_id
         ORDER  BY created_at DESC"
    );
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}
 
// ─── POST ?action=upload_kyc (updated) ───────────────────────────────────────
// Accepts either $_FILES['file'] (legacy) or JSON body with file_url (Cloudinary).
// Saves a row in `kyc_documents`.
function handle_upload_kyc_v2($db) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);
 
    // Prefer Cloudinary URL if present in POST fields
    $file_url   = $_POST['file_url']         ?? '';
    $doc_type   = $db->real_escape_string($_POST['document_type'] ?? 'identity');
 
    // Validate doc_type against DB enum
    if (!in_array($doc_type, ['identity', 'address'])) {
        send_json(['success' => false, 'error' => 'Invalid document type.'], 400);
    }
 
    // Fallback: if no Cloudinary URL, we just record the upload intent
    if (empty($file_url)) {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            send_json(['success' => false, 'error' => 'No file received.'], 400);
        }
        // In production you would upload the physical file to your server here.
        $file_url = '/uploads/kyc/' . basename($_FILES['file']['name']);
    }
 
    $file_url_esc = $db->real_escape_string($file_url);
 
    $sql = "INSERT INTO kyc_documents (user_id, document_type, file_url, status)
            VALUES ($user_id, '$doc_type', '$file_url_esc', 'pending')";
 
    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'Document received. Under review within 24 hours.',
                   'data' => ['kyc_id' => $db->insert_id]]);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}
 
// ─── POST ?action=create_account ─────────────────────────────────────────────
// Opens a new trading account. Generates a unique account number.
// Payload: { type, is_demo, leverage }
function handle_create_account($db, $input) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $type_map = ['standard_stp' => 1, 'raw_ecn' => 1, 'pro_ecn' => 1];
    $type     = $db->real_escape_string($input['type'] ?? 'standard_stp');
    if (!isset($type_map[$type])) {
        send_json(['success' => false, 'error' => 'Invalid account type.'], 400);
    }

    $is_demo  = !empty($input['is_demo']) ? 1 : 0;
    $leverage = (int)($input['leverage'] ?? 500);

    // ── ONE account per type per mode (live vs demo) ──────────────────
    $exists = $db->query(
        "SELECT id FROM trading_accounts
         WHERE user_id = $user_id
           AND type    = '$type'
           AND is_demo = $is_demo
         LIMIT 1"
    );
    if ($exists->num_rows > 0) {
        $mode = $is_demo ? 'demo' : 'live';
        send_json([
            'success' => false,
            'error'   => "You already have a $mode $type account. Only one per type allowed.",
        ], 409);
    }

    // Generate unique 7-digit account number
    do {
        $acc_number = (string)rand(1000000, 9999999);
        $chk = $db->query("SELECT id FROM trading_accounts WHERE account_number = '$acc_number' LIMIT 1");
    } while ($chk->num_rows > 0);

    $sql = "INSERT INTO trading_accounts
                (user_id, account_number, type, is_demo, balance, leverage, currency, status)
            VALUES ($user_id, '$acc_number', '$type', $is_demo, 0.00, $leverage, 'USD', 'active')";

    if ($db->query($sql)) {
        $new_id = $db->insert_id;
        $row    = $db->query("SELECT * FROM trading_accounts WHERE id = $new_id")->fetch_assoc();
        send_json(['success' => true, 'message' => 'Account created.', 'data' => $row]);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}
 
// ─── GET ?action=admin_get_users ─────────────────────────────────────────────
// Paginated user list. Query params: page (default 1), per_page (default 20).
function handle_admin_get_users($db) {
    $page     = max(1, (int)($_GET['page']     ?? 1));
    $per_page = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
    $offset   = ($page - 1) * $per_page;
 
    $total_res = $db->query("SELECT COUNT(*) AS cnt FROM users");
    $total     = (int)$total_res->fetch_assoc()['cnt'];
 
    $res  = $db->query(
        "SELECT id, name, email, phone, country, wallet_balance,
                role, status, email_verified_at, last_login_at, created_at
         FROM   users
         ORDER  BY created_at DESC
         LIMIT  $per_page OFFSET $offset"
    );
 
    send_json([
        'success'  => true,
        'data'     => $res->fetch_all(MYSQLI_ASSOC),
        'meta'     => [
            'page'       => $page,
            'per_page'   => $per_page,
            'total'      => $total,
            'last_page'  => (int)ceil($total / $per_page),
        ],
    ]);
}
 
// ─── GET ?action=admin_dashboard_stats ───────────────────────────────────────
function handle_admin_dashboard_stats($db) {
    $stats = [];
 
    $stats['total_users']        = (int)$db->query("SELECT COUNT(*) c FROM users WHERE role='trader'")->fetch_assoc()['c'];
    $stats['active_users']       = (int)$db->query("SELECT COUNT(*) c FROM users WHERE status='active'")->fetch_assoc()['c'];
    $stats['total_accounts']     = (int)$db->query("SELECT COUNT(*) c FROM trading_accounts")->fetch_assoc()['c'];
    $stats['open_positions']     = (int)$db->query("SELECT COUNT(*) c FROM positions WHERE status='open'")->fetch_assoc()['c'];
 
    $dep = $db->query("SELECT COALESCE(SUM(amount),0) s FROM transactions WHERE type='deposit' AND status='completed'");
    $stats['total_deposits']     = (float)$dep->fetch_assoc()['s'];
 
    $pend = $db->query("SELECT COUNT(*) c FROM transactions WHERE status='pending'");
    $stats['pending_transactions'] = (int)$pend->fetch_assoc()['c'];
 
    $kyc = $db->query("SELECT COUNT(*) c FROM kyc_documents WHERE status='pending'");
    $stats['pending_kyc']        = (int)$kyc->fetch_assoc()['c'];
 
    send_json(['success' => true, 'data' => $stats]);
}
 
// ─── POST ?action=admin_approve_transaction ───────────────────────────────────
// Payload: { transaction_id }
function is_admin(): bool {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($header, 'Bearer ')) return false;
    $token = base64_decode(substr($header, 7));
    $data  = json_decode($token, true);
    return ($data['role'] ?? '') === 'admin';
}

function handle_admin_update_user($db, $input) {
    if (!is_admin()) send_json(['success' => false, 'error' => 'Unauthorized'], 403);
    $id = (int)($input['id'] ?? 0);
    $name = $db->real_escape_string($input['name'] ?? '');
    $email = $db->real_escape_string($input['email'] ?? '');
    $status = $db->real_escape_string($input['status'] ?? 'pending');
    $role = $db->real_escape_string($input['role'] ?? 'trader');
    $balance = (float)($input['wallet_balance'] ?? 0);

    if (!$id) send_json(['success' => false, 'error' => 'Missing ID'], 400);

    $sql = "UPDATE users SET name='$name', email='$email', status='$status', role='$role', wallet_balance=$balance WHERE id=$id";
    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'User updated']);
    } else {
        send_json(['success' => false, 'error' => $db->error], 500);
    }
}

function handle_admin_delete_user($db, $input) {
    if (!is_admin()) send_json(['success' => false, 'error' => 'Unauthorized'], 403);
    $id = (int)($input['id'] ?? 0);
    if (!$id) send_json(['success' => false, 'error' => 'Missing ID'], 400);

    if ($db->query("DELETE FROM users WHERE id=$id")) {
        send_json(['success' => true, 'message' => 'User deleted']);
    } else {
        send_json(['success' => false, 'error' => $db->error], 500);
    }
}

function handle_admin_get_signals($db) {
    if (!is_admin()) send_json(['success' => false, 'error' => 'Unauthorized'], 403);
    $res = $db->query("SELECT s.*, u.email as provider_email FROM signals s JOIN users u ON u.id = s.user_id");
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

function handle_admin_upsert_signal($db, $input) {
    if (!is_admin()) send_json(['success' => false, 'error' => 'Unauthorized'], 403);
    $id = (int)($input['id'] ?? 0);
    $user_id = (int)($input['user_id'] ?? 0);
    $name = $db->real_escape_string($input['name'] ?? '');
    $desc = $db->real_escape_string($input['description'] ?? '');
    $roi = (float)($input['roi'] ?? 0);
    $win_rate = (float)($input['win_rate'] ?? 0);
    $drawdown = (float)($input['drawdown'] ?? 0);
    $status = $db->real_escape_string($input['status'] ?? 'active');

    if (!$user_id || !$name) send_json(['success' => false, 'error' => 'Missing fields'], 400);

    if ($id) {
        $sql = "UPDATE signals SET user_id=$user_id, name='$name', description='$desc', roi=$roi, win_rate=$win_rate, drawdown=$drawdown, status='$status' WHERE id=$id";
    } else {
        $sql = "INSERT INTO signals (user_id, name, description, roi, win_rate, drawdown, status) VALUES ($user_id, '$name', '$desc', $roi, $win_rate, $drawdown, '$status')";
    }

    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'Signal saved']);
    } else {
        send_json(['success' => false, 'error' => $db->error], 500);
    }
}

function handle_admin_get_settings($db) {
    if (!is_admin()) send_json(['success' => false, 'error' => 'Unauthorized'], 403);
    $res = $db->query("SELECT * FROM settings");
    $settings = [];
    while ($row = $res->fetch_assoc()) {
        $settings[$row['key']] = $row['value'];
    }
    send_json(['success' => true, 'data' => $settings]);
}

function handle_get_site_settings($db) {
    $res = $db->query("SELECT `key`, `value` FROM settings WHERE `key` IN ('site_name', 'site_logo', 'support_email', 'default_currency')");
    $settings = [];
    while ($row = $res->fetch_assoc()) {
        $settings[$row['key']] = $row['value'];
    }
    send_json(['success' => true, 'data' => $settings]);
}

function handle_admin_update_settings($db, $input) {
    if (!is_admin()) send_json(['success' => false, 'error' => 'Unauthorized'], 403);
    foreach ($input as $key => $value) {
        $key = $db->real_escape_string($key);
        $value = $db->real_escape_string((string)$value);
        $db->query("INSERT INTO settings (`key`, `value`) VALUES ('$key', '$value') ON DUPLICATE KEY UPDATE `value`='$value'");
    }
    send_json(['success' => true, 'message' => 'Settings updated']);
}

function handle_admin_delete_signal($db, $input) {
    if (!is_admin()) send_json(['success' => false, 'error' => 'Unauthorized'], 403);
    $id = (int)($input['id'] ?? 0);
    if (!$id) send_json(['success' => false, 'error' => 'Missing ID'], 400);

    if ($db->query("DELETE FROM signals WHERE id=$id")) {
        send_json(['success' => true, 'message' => 'Signal deleted']);
    } else {
        send_json(['success' => false, 'error' => $db->error], 500);
    }
}

function handle_admin_approve_transaction($db, $input) {
    $txn_id = (int)($input['transaction_id'] ?? 0);
    if (!$txn_id) send_json(['success' => false, 'error' => 'Missing transaction_id.'], 400);
 
    // Fetch transaction
    $res = $db->query("SELECT * FROM transactions WHERE id = $txn_id LIMIT 1");
    $txn = $res->fetch_assoc();
    if (!$txn) send_json(['success' => false, 'error' => 'Transaction not found.'], 404);
    if ($txn['status'] !== 'pending') send_json(['success' => false, 'error' => 'Transaction is not pending.'], 409);
 
    // Mark as completed
    $db->query("UPDATE transactions SET status = 'completed' WHERE id = $txn_id");
 
    // Credit the user's wallet for deposits
    if ($txn['type'] === 'deposit') {
        $uid    = (int)$txn['user_id'];
        $amount = (float)$txn['amount'];
        $db->query("UPDATE users SET wallet_balance = wallet_balance + $amount WHERE id = $uid");
    }
 
    send_json(['success' => true, 'message' => 'Transaction approved and wallet credited.']);
}
