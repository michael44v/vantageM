<?php
/**
 * Vantage Markets - Simple API Gateway
 * Unified single-file backend (Procedural approach)
 */

declare(strict_types=1);

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

// Secret for "token" signing
define('JWT_SECRET', 'vantage_secret_2024');

// Helper to get user ID from Bearer token with simple signature check
function get_auth_user_id(): int {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($header, 'Bearer ')) return 0;
    
    $token_raw = substr($header, 7);
    $parts = explode('.', $token_raw);
    if (count($parts) !== 2) return 0;
    
    $payload_b64 = $parts[0];
    $sig = $parts[1];
    
    if (hash_hmac('sha256', $payload_b64, JWT_SECRET) !== $sig) {
        return 0; // Invalid signature
    }

    $data = json_decode(base64_decode($payload_b64), true);
    return (int)($data['id'] ?? 0);
}

function create_token($payload): string {
    $payload_b64 = base64_encode(json_encode($payload));
    $sig = hash_hmac('sha256', $payload_b64, JWT_SECRET);
    return $payload_b64 . '.' . $sig;
}

// --- 4. Routing ---
switch ($action) {
    case 'login':
        handle_login($db, $input);
        break;
    case 'register':
        handle_register($db, $input);
        break;
    case 'get_accounts':
        handle_get_accounts($db);
        break;
    case 'get_user_accounts':
        handle_get_user_accounts($db);
        break;
    case 'create_account':
        handle_create_account($db, $input);
        break;
    case 'get_positions':
        handle_get_positions($db);
        break;
    case 'close_position':
        handle_close_position($db, $input);
        break;
    case 'execute_trade':
        handle_execute_trade($db, $input);
        break;
    case 'deposit':
        handle_deposit($db, $input);
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
    case 'get_signals':
        handle_get_signals($db);
        break;
    case 'copy_signal':
        handle_copy_signal($db, $input);
        break;
    case 'get_kyc':
        handle_get_kyc($db);
        break;
    case 'upload_kyc':
        handle_upload_kyc_v2($db);
        break;
    case 'admin_get_users':
        handle_admin_get_users($db);
        break;
    case 'admin_dashboard_stats':
        handle_admin_dashboard_stats($db);
        break;
    case 'admin_approve_transaction':
        handle_admin_approve_transaction($db, $input);
        break;
    case 'admin_live_trades':
        handle_admin_live_trades($db);
        break;
    default:
        send_json(['success' => false, 'error' => 'Action not found: ' . $action], 404);
}

// --- 5. Action Handlers ---

function handle_login($db, $input) {
    $email = $db->real_escape_string($input['email'] ?? '');
    $pass = $input['password'] ?? '';

    $res = $db->query("SELECT * FROM users WHERE email = '$email' LIMIT 1");
    $user = $res->fetch_assoc();

    if ($user && password_verify($pass, $user['password_hash'])) {
        $token = create_token(['id' => $user['id'], 'role' => $user['role']]);
        send_json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'role' => $user['role'],
                'email' => $user['email']
            ]
        ]);
    }
    send_json(['success' => false, 'error' => 'Invalid credentials'], 401);
}

function handle_register($db, $input) {
    $name = $db->real_escape_string($input['first_name'] . ' ' . $input['last_name']);
    $email = $db->real_escape_string($input['email']);
    $pass = password_hash($input['password'], PASSWORD_BCRYPT);
    $country = $db->real_escape_string($input['country']);

    $sql = "INSERT INTO users (name, email, password_hash, country) VALUES ('$name', '$email', '$pass', '$country')";
    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'User registered']);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}

function handle_get_accounts($db) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $res = $db->query("SELECT * FROM trading_accounts WHERE user_id = $user_id");
    $accounts = $res->fetch_all(MYSQLI_ASSOC);

    // KYC status
    $kyc_res = $db->query(
        "SELECT document_type, status, rejection_reason
         FROM kyc_documents
         WHERE user_id = $user_id
         ORDER BY created_at DESC"
    );
    $kyc_rows = $kyc_res->fetch_all(MYSQLI_ASSOC);

    // Wallet Balance
    $bal = $db->query("SELECT wallet_balance FROM users WHERE id = $user_id LIMIT 1");
    $bal_data = $bal->fetch_assoc();

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
            'balance'  => $bal_data['wallet_balance'] ?? 0,
            'accounts' => $accounts,
            'kyc'      => $kyc,
        ],
    ]);
}

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

function handle_get_positions($db) {
    $user_id    = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $account_id = (int)($_GET['account_id'] ?? 0);

    $acc_res = $db->query(
        "SELECT id, balance, leverage FROM trading_accounts
         WHERE id = $account_id AND user_id = $user_id LIMIT 1"
    );
    if ($acc_res->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Account not found.'], 404);
    }

    $res = $db->query(
        "SELECT * FROM positions
         WHERE trading_account_id = $account_id
           AND status = 'open'
         ORDER BY created_at DESC"
    );
    $positions = $res->fetch_all(MYSQLI_ASSOC);

    foreach ($positions as &$p) {
        $move             = (rand(-50, 50) / 100000);
        $p['current_price'] = round((float)$p['entry_price'] + $move, 5);
        $direction        = $p['type'] === 'long' ? 1 : -1;
        $p['pnl']         = round(
            $direction * ($p['current_price'] - (float)$p['entry_price']) * (float)$p['lots'] * 100000,
            2
        );
    }

    send_json(['success' => true, 'data' => $positions]);
}

function handle_close_position($db, $input) {
    $user_id     = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $position_id = (int)($input['position_id'] ?? 0);
    if (!$position_id) send_json(['success' => false, 'error' => 'Missing position_id.'], 400);

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

    $move        = (rand(-50, 50) / 100000);
    $close_price = round((float)$pos['entry_price'] + $move, 5);
    $direction   = $pos['type'] === 'long' ? 1 : -1;
    $pnl         = round($direction * ($close_price - (float)$pos['entry_price']) * (float)$pos['lots'] * 100000, 2);

    $acc_id      = (int)$pos['trading_account_id'];

    // Calculate margin to return (Lots * 100,000 * EntryPrice) / Leverage
    $margin_to_return = ($pos['lots'] * 100000 * $pos['entry_price']) / $pos['leverage'];

    $db->begin_transaction();
    try {
        // 1. Close the primary position
        $db->query(
            "UPDATE positions
             SET status = 'closed', current_price = $close_price,
                 pnl = $pnl, closed_at = NOW()
             WHERE id = $position_id"
        );
        // 2. Return margin + credit/debit P&L
        $db->query(
            "UPDATE trading_accounts
             SET balance = balance + $margin_to_return + $pnl
             WHERE id = $acc_id"
        );

        // 3. Close all mirrored positions for copiers
        $mirrored = $db->query("SELECT p.*, a.leverage as acc_leverage FROM positions p JOIN trading_accounts a ON p.trading_account_id = a.id WHERE p.provider_position_id = $position_id AND p.status = 'open'");
        while ($m = $mirrored->fetch_assoc()) {
            $m_id      = (int)$m['id'];
            $m_acc_id  = (int)$m['trading_account_id'];
            $m_pnl     = round($direction * ($close_price - (float)$m['entry_price']) * (float)$m['lots'] * 100000, 2);
            $m_margin  = ($m['lots'] * 100000 * $m['entry_price']) / $m['acc_leverage'];

            $db->query("UPDATE positions SET status = 'closed', current_price = $close_price, pnl = $m_pnl, closed_at = NOW() WHERE id = $m_id");
            $db->query("UPDATE trading_accounts SET balance = balance + $m_margin + $m_pnl WHERE id = $m_acc_id");
        }

        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        send_json(['success' => false, 'error' => 'Failed to close position: ' . $e->getMessage()], 500);
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

function handle_execute_trade($db, $input) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $acc_id = (int)($input['account_id'] ?? 0);
    $symbol = $db->real_escape_string($input['symbol'] ?? '');
    $type   = $db->real_escape_string($input['type']   ?? ''); // long | short
    $lots   = (float)($input['lots']  ?? 0);
    $price  = (float)($input['price'] ?? 0);
    $sl     = !empty($input['stop_loss'])   ? (float)$input['stop_loss']   : 'NULL';
    $tp     = !empty($input['take_profit']) ? (float)$input['take_profit'] : 'NULL';

    if (!in_array($type, ['long','short']) || $lots <= 0 || $price <= 0) {
        send_json(['success' => false, 'error' => 'Invalid trade parameters.'], 400);
    }

    $acc_res = $db->query(
        "SELECT balance, leverage FROM trading_accounts
         WHERE id = $acc_id AND user_id = $user_id AND status = 'active' LIMIT 1"
    );
    if ($acc_res->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Account not found.'], 404);
    }
    $acc = $acc_res->fetch_assoc();

    $required_margin = ($lots * 100000 * $price) / $acc['leverage'];
    if ((float)$acc['balance'] < $required_margin) {
        send_json([
            'success' => false,
            'error'   => sprintf(
                'Insufficient margin. Required: $%.2f, Available: $%.2f',
                $required_margin,
                $acc['balance']
            ),
        ], 400);
    }

    $sl_val = is_numeric($sl) ? $sl : 'NULL';
    $tp_val = is_numeric($tp) ? $tp : 'NULL';

    $db->begin_transaction();
    try {
        $db->query(
            "INSERT INTO positions
                 (user_id, trading_account_id, symbol, type, lots,
                  entry_price, current_price, stop_loss, take_profit, status)
             VALUES
                 ($user_id, $acc_id, '$symbol', '$type', $lots,
                  $price, $price, $sl_val, $tp_val, 'open')"
        );
        $pos_id = $db->insert_id;

        $db->query(
            "UPDATE trading_accounts
             SET balance = balance - $required_margin
             WHERE id = $acc_id"
        );

        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        send_json(['success' => false, 'error' => 'Trade execution failed.'], 500);
    }

    $new = $db->query("SELECT * FROM positions WHERE id = $pos_id")->fetch_assoc();

    // Mirror to copiers
    $copiers = $db->query(
        "SELECT cr.copier_id, cr.trading_account_id, cr.risk_multiplier
         FROM   copy_relationships cr
         WHERE  cr.provider_id = $user_id AND cr.status = 'active'"
    );
    while ($copier = $copiers->fetch_assoc()) {
        $c_acc_id  = (int)$copier['trading_account_id'];
        $c_lots    = round($lots * (float)$copier['risk_multiplier'], 2);
        $c_id      = (int)$copier['copier_id'];
        $c_acc     = $db->query(
            "SELECT balance, leverage FROM trading_accounts WHERE id = $c_acc_id AND user_id = $c_id LIMIT 1"
        )->fetch_assoc();
        if (!$c_acc) continue;
        $c_margin = ($c_lots * 100000 * $price) / $c_acc['leverage'];
        if ((float)$c_acc['balance'] < $c_margin) continue;
        $db->query(
            "INSERT INTO positions (user_id, trading_account_id, symbol, type, lots, entry_price, current_price, stop_loss, take_profit, status, provider_position_id)
             VALUES ($c_id, $c_acc_id, '$symbol', '$type', $c_lots, $price, $price, $sl_val, $tp_val, 'open', $pos_id)"
        );
        $db->query("UPDATE trading_accounts SET balance = balance - $c_margin WHERE id = $c_acc_id");
    }

    send_json([
        'success' => true,
        'message' => 'Order executed.',
        'data'    => $new,
    ]);
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

function handle_internal_transfer($db, $input) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $acc_id = (int)$input['account_id'];
    $amount = (float)$input['amount'];
    $direction = $input['direction']; // wallet_to_acc or acc_to_wallet

    if ($direction === 'wallet_to_acc') {
        $db->query("UPDATE users SET wallet_balance = wallet_balance - $amount WHERE id = $user_id");
        $db->query("UPDATE trading_accounts SET balance = balance + $amount WHERE id = $acc_id");
    } else {
        $db->query("UPDATE trading_accounts SET balance = balance - $amount WHERE id = $acc_id");
        $db->query("UPDATE users SET wallet_balance = wallet_balance + $amount WHERE id = $user_id");
    }
    send_json(['success' => true, 'message' => 'Transfer successful']);
}

function handle_demo_topup($db, $input) {
    $user_id    = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $account_id = (int)($input['account_id'] ?? 0);
    $amount     = (float)($input['amount']     ?? 0);

    if ($amount <= 0 || $amount > 1000000) {
        send_json(['success' => false, 'error' => 'Invalid amount.'], 400);
    }

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

function handle_get_signals($db) {
    $sql = "SELECT s.id, s.name, s.description, s.roi, s.win_rate,
                   s.drawdown, s.subscribers, s.status,
                   u.name AS provider_name
            FROM   signals s
            JOIN   users   u ON s.user_id = u.id
            WHERE  s.status = 'active'
            ORDER  BY s.roi DESC";
    $res = $db->query($sql);
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

function handle_copy_signal($db, $input) {
    $copier_id          = get_auth_user_id();
    if (!$copier_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $provider_id        = (int)($input['provider_id']        ?? 0);
    $trading_account_id = (int)($input['trading_account_id'] ?? 0);
    $risk_multiplier    = (float)($input['risk_multiplier']  ?? 1.0);
 
    if (!$provider_id || !$trading_account_id) {
        send_json(['success' => false, 'error' => 'Missing required fields.'], 400);
    }
 
    $prov_res = $db->query("SELECT user_id FROM signals WHERE id = $provider_id LIMIT 1");
    $prov     = $prov_res->fetch_assoc();
    if ($prov && (int)$prov['user_id'] === $copier_id) {
        send_json(['success' => false, 'error' => 'You cannot copy your own signal.'], 400);
    }
 
    $check = $db->query(
        "SELECT id FROM copy_relationships
         WHERE copier_id = $copier_id AND provider_id = $provider_id
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
            VALUES ($copier_id, $provider_id, $trading_account_id, $risk_multiplier, 'active')";
 
    if ($db->query($sql)) {
        $db->query("UPDATE signals SET subscribers = subscribers + 1 WHERE id = $provider_id");
        send_json(['success' => true, 'message' => 'You are now copying this provider.',
                   'data' => ['copy_id' => $db->insert_id]]);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}

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

function handle_upload_kyc_v2($db) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);
 
    $file_url   = $_POST['file_url']         ?? '';
    $doc_type   = $db->real_escape_string($_POST['document_type'] ?? 'identity');
 
    if (!in_array($doc_type, ['identity', 'address'])) {
        send_json(['success' => false, 'error' => 'Invalid document type.'], 400);
    }
 
    if (empty($file_url)) {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            send_json(['success' => false, 'error' => 'No file received.'], 400);
        }
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

function handle_admin_approve_transaction($db, $input) {
    $txn_id = (int)($input['transaction_id'] ?? 0);
    if (!$txn_id) send_json(['success' => false, 'error' => 'Missing transaction_id.'], 400);
 
    $res = $db->query("SELECT * FROM transactions WHERE id = $txn_id LIMIT 1");
    $txn = $res->fetch_assoc();
    if (!$txn) send_json(['success' => false, 'error' => 'Transaction not found.'], 404);
    if ($txn['status'] !== 'pending') send_json(['success' => false, 'error' => 'Transaction is not pending.'], 409);
 
    $db->query("UPDATE transactions SET status = 'completed' WHERE id = $txn_id");
 
    if ($txn['type'] === 'deposit') {
        $uid    = (int)$txn['user_id'];
        $amount = (float)$txn['amount'];
        $db->query("UPDATE users SET wallet_balance = wallet_balance + $amount WHERE id = $uid");
    }
 
    send_json(['success' => true, 'message' => 'Transaction approved and wallet credited.']);
}

function handle_admin_live_trades($db) {
    $sql = "SELECT p.*, u.name as trader_name, a.account_number
            FROM positions p
            JOIN users u ON p.user_id = u.id
            JOIN trading_accounts a ON p.trading_account_id = a.id
            WHERE p.status = 'open'";
    $res = $db->query($sql);
    $trades = $res->fetch_all(MYSQLI_ASSOC);

    foreach ($trades as &$t) {
        $move = (rand(-10, 10) / 10000);
        $t['current_price'] = (float)$t['current_price'] + $move;
        $t['pnl'] = ($t['type'] === 'long' ? 1 : -1) * ($t['current_price'] - $t['entry_price']) * ($t['lots'] * 100000);
    }

    send_json(['success' => true, 'data' => $trades]);
}
