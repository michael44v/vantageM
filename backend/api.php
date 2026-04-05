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
        handle_upload_kyc($db);
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
    send_json(['success' => true, 'message' => 'Deposit initiated', 'url' => 'https://commerce.coinbase.com/charges/mock']);
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
