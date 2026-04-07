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

// Drop-in helper used by all authenticated actions.
function get_auth_user_id(): int {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($header, 'Bearer ')) return 0;
    $token = base64_decode(substr($header, 7));
    $data  = json_decode($token, true);
    return (int)($data['id'] ?? 0);
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
    case 'create_account':
        handle_create_account($db, $input);
        break;
    case 'get_positions':
        handle_get_positions($db);
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
        handle_upload_kyc($db);
        break;
    case 'deposit':
        handle_deposit($db, $input);
        break;
    case 'admin_live_trades':
        handle_admin_live_trades($db);
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
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $res = $db->query("SELECT * FROM trading_accounts WHERE user_id = $user_id");
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

function handle_create_account($db, $input) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $type = $db->real_escape_string($input['type'] ?? 'standard_stp');
    $is_demo = (bool)($input['is_demo'] ?? false) ? 1 : 0;
    $leverage = (int)($input['leverage'] ?? 500);

    do {
        $acc_number = (string)rand(1000000, 9999999);
        $exists = $db->query("SELECT id FROM trading_accounts WHERE account_number = '$acc_number' LIMIT 1");
    } while ($exists->num_rows > 0);

    $sql = "INSERT INTO trading_accounts (user_id, account_number, type, is_demo, balance, leverage, currency, status)
            VALUES ($user_id, '$acc_number', '$type', $is_demo, 0.00, $leverage, 'USD', 'active')";

    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'Account created']);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}

function handle_get_positions($db) {
    $acc_id = (int)($_GET['account_id'] ?? 0);
    $res = $db->query("SELECT * FROM positions WHERE trading_account_id = $acc_id AND status = 'open'");
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

function handle_execute_trade($db, $input) {
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $acc_id = (int)$input['account_id'];
    $symbol = $db->real_escape_string($input['symbol']);
    $type = $db->real_escape_string($input['type']);
    $lots = (float)$input['lots'];
    $price = (float)$input['price'];

    $res = $db->query("SELECT balance, leverage FROM trading_accounts WHERE id = $acc_id AND user_id = $user_id LIMIT 1");
    $acc = $res->fetch_assoc();

    if (!$acc) send_json(['success' => false, 'error' => 'Account not found'], 404);

    $contract_size = 100000;
    $required_margin = ($lots * $contract_size * $price) / $acc['leverage'];

    if ($acc['balance'] < $required_margin) {
        send_json(['success' => false, 'error' => 'Insufficient funds in trading account.'], 400);
    }

    $sql = "INSERT INTO positions (user_id, trading_account_id, symbol, type, lots, entry_price, current_price, status)
            VALUES ($user_id, $acc_id, '$symbol', '$type', $lots, $price, $price, 'open')";

    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'Order executed successfully']);
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
    $user_id = get_auth_user_id();
    if (!$user_id) send_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $acc_id = (int)$input['account_id'];
    $amount = (float)$input['amount'];
    $direction = $input['direction'];

    if ($direction === 'wallet_to_acc') {
        $db->query("UPDATE users SET wallet_balance = wallet_balance - $amount WHERE id = $user_id");
        $db->query("UPDATE trading_accounts SET balance = balance + $amount WHERE id = $acc_id");
    } else {
        $db->query("UPDATE trading_accounts SET balance = balance - $amount WHERE id = $acc_id");
        $db->query("UPDATE users SET wallet_balance = wallet_balance + $amount WHERE id = $user_id");
    }
    send_json(['success' => true, 'message' => 'Transfer successful']);
}

function handle_get_signals($db) {
    $sql = "SELECT s.*, u.name AS provider_name FROM signals s JOIN users u ON s.user_id = u.id WHERE s.status = 'active'";
    $res = $db->query($sql);
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

function handle_copy_signal($db, $input) {
    $copier_id = get_auth_user_id();
    $provider_id = (int)($input['provider_id'] ?? 0);
    $trading_account_id = (int)($input['trading_account_id'] ?? 0);
    $risk_multiplier = (float)($input['risk_multiplier'] ?? 1.0);

    $sql = "INSERT INTO copy_relationships (copier_id, provider_id, trading_account_id, risk_multiplier, status)
            VALUES ($copier_id, $provider_id, $trading_account_id, $risk_multiplier, 'active')";

    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'Copying provider']);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}

function handle_get_kyc($db) {
    $user_id = get_auth_user_id();
    $res = $db->query("SELECT * FROM kyc_documents WHERE user_id = $user_id");
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

function handle_upload_kyc($db) {
    $user_id = get_auth_user_id();
    $doc_type = $db->real_escape_string($_POST['document_type'] ?? 'identity');
    $file_url = $db->real_escape_string($_POST['file_url'] ?? '');

    $sql = "INSERT INTO kyc_documents (user_id, document_type, file_url, status)
            VALUES ($user_id, '$doc_type', '$file_url', 'pending')";
    if ($db->query($sql)) {
        send_json(['success' => true, 'message' => 'Document uploaded']);
    }
    send_json(['success' => false, 'error' => $db->error], 500);
}

function handle_deposit($db, $input) {
    send_json(['success' => true, 'message' => 'Deposit initiated', 'url' => 'https://commerce.coinbase.com/charges/mock']);
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

function handle_admin_get_users($db) {
    $res = $db->query("SELECT id, name, email, country, wallet_balance, status, role, created_at FROM users");
    send_json(['success' => true, 'data' => $res->fetch_all(MYSQLI_ASSOC)]);
}

function handle_admin_dashboard_stats($db) {
    $stats = [
        'total_users' => (int)$db->query("SELECT COUNT(*) c FROM users WHERE role='trader'")->fetch_assoc()['c'],
        'open_positions' => (int)$db->query("SELECT COUNT(*) c FROM positions WHERE status='open'")->fetch_assoc()['c'],
        'pending_kyc' => (int)$db->query("SELECT COUNT(*) c FROM kyc_documents WHERE status='pending'")->fetch_assoc()['c']
    ];
    send_json(['success' => true, 'data' => $stats]);
}

function handle_admin_approve_transaction($db, $input) {
    $txn_id = (int)$input['transaction_id'];
    $db->query("UPDATE transactions SET status = 'completed' WHERE id = $txn_id");
    send_json(['success' => true, 'message' => 'Transaction approved']);
}
