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
case 'admin_get_transactions':
    handle_admin_get_transactions($db);
    break;
case 'admin_approve_transaction':
    handle_admin_approve_transaction($db, $input);
    break;
case 'admin_reject_transaction':
    handle_admin_reject_transaction($db, $input);
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
    default:
        send_json(['success' => false, 'error' => 'Action not found: ' . $action], 404);
}

// --- 5. Action Handlers (Procedural) ---

function handle_login($db, $input) {
    $email = $db->real_escape_string($input['email'] ?? '');
    $pass = $input['password'] ?? '';

    $res = $db->query("SELECT * FROM users WHERE email = '$email' LIMIT 1");
    $user = $res->fetch_assoc();

    if ($user && password_verify($pass, $user['password_hash'])) {
        // Simple JWT simulation for this procedural version
        $token = base64_encode(json_encode(['id' => $user['id'], 'role' => $user['role']]));
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
    // In a real app, you'd extract user_id from token. Here we simulate for user 2.
    $res = $db->query("SELECT * FROM trading_accounts WHERE user_id = 2");
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

function handle_get_positions($db) {
    $acc_id = (int)($_GET['account_id'] ?? 0);
    $res = $db->query("SELECT * FROM positions WHERE trading_account_id = $acc_id AND status = 'open'");
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
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
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $amount      = (float)($input['amount']      ?? 0);
    $receipt_url = $db->real_escape_string($input['receipt_url'] ?? '');
    $tx_hash     = $db->real_escape_string($input['tx_hash']     ?? '');
    $method      = $db->real_escape_string($input['method']      ?? 'manual');

    if ($amount <= 0) send_json(['success' => false, 'error' => 'Invalid amount.'], 400);

    $reference = 'DEP-' . strtoupper(bin2hex(random_bytes(4)));

    $sql = "INSERT INTO transactions (user_id, reference, type, amount, method, status, receipt_url, tx_hash)
            VALUES ($user_id, '$reference', 'deposit', $amount, '$method', 'pending', '$receipt_url', '$tx_hash')";

    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'Deposit proof submitted. Under review.']);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}

function handle_execute_trade($db, $input) {
    $user_id = 2; // Simulated auth
    $acc_id = (int)$input['account_id'];
    $symbol = $db->real_escape_string($input['symbol']);
    $type = $db->real_escape_string($input['type']); // long/short
    $lots = (float)$input['lots'];
    $price = (float)$input['price'];

    // 1. Get Account Details (Balance & Leverage)
    $res = $db->query("SELECT balance, leverage FROM trading_accounts WHERE id = $acc_id AND user_id = $user_id LIMIT 1");
    $acc = $res->fetch_assoc();

    if (!$acc) send_json(['success' => false, 'error' => 'Account not found'], 404);

    // 2. Execution Mathematics (Margin Calculation)
    // Formula: (Lots * Contract Size * Price) / Leverage
    $contract_size = 100000;
    $required_margin = ($lots * $contract_size * $price) / $acc['leverage'];

    if ($acc['balance'] < $required_margin) {
        send_json(['success' => false, 'error' => 'Insufficient funds in trading account. Please transfer from wallet.'], 400);
    }

    // 3. Record Position
    $sql = "INSERT INTO positions (user_id, trading_account_id, symbol, type, lots, entry_price, current_price, status)
            VALUES ($user_id, $acc_id, '$symbol', '$type', $lots, $price, $price, 'open')";

    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'Order executed successfully', 'trade_id' => $db->insert_id]);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}

function handle_update_leverage($db, $input) {
    $acc_id = (int)$input['account_id'];
    $leverage = (int)$input['leverage'];
    $db->query("UPDATE trading_accounts SET leverage = $leverage WHERE id = $acc_id");
    send_json(['success' => true, 'message' => 'Leverage updated']);
}

function handle_internal_transfer($db, $input) {
    $user_id = 2; // Simulated auth
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

function get_auth_user_id(): int {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($header, 'Bearer ')) return 0;
    $token = base64_decode(substr($header, 7));
    $data  = json_decode($token, true);
    return (int)($data['id'] ?? 0);
}
 
// ─── GET ?action=get_signals ──────────────────────────────────────────────────
// Returns all active signal providers from the `signals` table.
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
 
// ─── POST ?action=copy_signal ─────────────────────────────────────────────────
// Creates a row in `copy_relationships`.
// Payload: { provider_id, trading_account_id, risk_multiplier }
function handle_copy_signal($db, $input) {
    $copier_id          = get_auth_user_id();
    $provider_id        = (int)($input['provider_id']        ?? 0);
    $trading_account_id = (int)($input['trading_account_id'] ?? 0);
    $risk_multiplier    = (float)($input['risk_multiplier']  ?? 1.0);
 
    if (!$copier_id || !$provider_id || !$trading_account_id) {
        send_json(['success' => false, 'error' => 'Missing required fields.'], 400);
    }
 
    // Prevent self-copy
    $prov_res = $db->query("SELECT user_id FROM signals WHERE id = $provider_id LIMIT 1");
    $prov     = $prov_res->fetch_assoc();
    if ($prov && (int)$prov['user_id'] === $copier_id) {
        send_json(['success' => false, 'error' => 'You cannot copy your own signal.'], 400);
    }
 
    // Upsert: if already copying, update; otherwise insert
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
        // Increment subscriber count on signals table
        $db->query("UPDATE signals SET subscribers = subscribers + 1 WHERE id = $provider_id");
        send_json(['success' => true, 'message' => 'You are now copying this provider.',
                   'data' => ['copy_id' => $db->insert_id]]);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
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
    $user_id  = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);
 
    $type_map = ['standard_stp' => 1, 'raw_ecn' => 1, 'pro_ecn' => 1];
    $type     = $db->real_escape_string($input['type'] ?? 'standard_stp');
    if (!isset($type_map[$type])) {
        send_json(['success' => false, 'error' => 'Invalid account type.'], 400);
    }
 
    $is_demo  = (bool)($input['is_demo']  ?? false) ? 1 : 0;
    $leverage = (int)($input['leverage']  ?? 500);
 
    // Generate unique 7-digit account number
    do {
        $acc_number = (string)rand(1000000, 9999999);
        $exists     = $db->query("SELECT id FROM trading_accounts WHERE account_number = '$acc_number' LIMIT 1");
    } while ($exists->num_rows > 0);
 
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

function handle_admin_reject_transaction($db, $input) {
    $txn_id = (int)($input['transaction_id'] ?? 0);
    $notes  = $db->real_escape_string($input['notes'] ?? '');

    if (!$txn_id) send_json(['success' => false, 'error' => 'Missing transaction_id.'], 400);

    $res = $db->query("SELECT * FROM transactions WHERE id = $txn_id LIMIT 1");
    $txn = $res->fetch_assoc();
    if (!$txn) send_json(['success' => false, 'error' => 'Transaction not found.'], 404);
    if ($txn['status'] !== 'pending') send_json(['success' => false, 'error' => 'Transaction is not pending.'], 409);

    $db->query("UPDATE transactions SET status = 'rejected', notes = '$notes' WHERE id = $txn_id");

    send_json(['success' => true, 'message' => 'Transaction rejected.']);
}

function handle_admin_get_transactions($db) {
    $sql = "SELECT t.*, u.name as user_name, u.email as user_email
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC";
    $res = $db->query($sql);
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}
