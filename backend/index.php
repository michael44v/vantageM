<?php

declare(strict_types=1);

/**
 * Vantage Markets — PHP API Entry Point
 *
 * All requests are routed through this file via the .htaccess rewrite rule.
 * This is a lightweight manual router; no third-party framework is required.
 */

// ─── Bootstrap ───────────────────────────────────────────────────────────────

define('ROOT_PATH', __DIR__);

// Load environment variables from .env if it exists (simple key=value format)
$envFile = ROOT_PATH . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
    }
}

// PSR-4 style autoloader
spl_autoload_register(function (string $class): void {
    $base      = ROOT_PATH . '/';
    $prefix    = 'VantageMarkets\\';
    $prefixLen = strlen($prefix);

    if (!str_starts_with($class, $prefix)) return;

    $relative = substr($class, $prefixLen);
    $file     = $base . str_replace('\\', '/', $relative) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// ─── CORS Headers ────────────────────────────────────────────────────────────

$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    $_ENV['FRONTEND_URL'] ?? 'https://vantagemarkets.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Router ──────────────────────────────────────────────────────────────────

use VantageMarkets\Utils\Response;

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip /api prefix if present
$path = preg_replace('#^/api#', '', $uri);
$path = rtrim($path, '/') ?: '/';

// Helper: match a URI pattern and extract named segments
function matchRoute(string $pattern, string $path, array &$params): bool
{
    $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';
    if (preg_match($regex, $path, $matches)) {
        foreach ($matches as $key => $value) {
            if (is_string($key)) {
                $params[$key] = is_numeric($value) ? (int) $value : $value;
            }
        }
        return true;
    }
    return false;
}

$params = [];

// ── Auth ─────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $path === '/auth/login') {
    (new VantageMarkets\Api\Auth\AuthController())->login();

} elseif ($method === 'POST' && $path === '/auth/register') {
    (new VantageMarkets\Api\Auth\AuthController())->register();

} elseif ($method === 'POST' && $path === '/auth/logout') {
    (new VantageMarkets\Api\Auth\AuthController())->logout();

// ── Leads ─────────────────────────────────────────────────────────────────────
} elseif ($method === 'POST' && $path === '/leads') {
    (new VantageMarkets\Api\Leads\LeadsController())->store();

// ── Accounts ─────────────────────────────────────────────────────────────────
} elseif ($method === 'GET' && $path === '/accounts') {
    (new VantageMarkets\Api\AccountController())->list();

} elseif ($method === 'POST' && $path === '/accounts') {
    (new VantageMarkets\Api\AccountController())->create();

// ── KYC ──────────────────────────────────────────────────────────────────────
} elseif ($method === 'GET' && $path === '/kyc') {
    (new VantageMarkets\Api\KYCController())->list();

} elseif ($method === 'POST' && $path === '/kyc/upload') {
    (new VantageMarkets\Api\KYCController())->upload();

// ── Payments ─────────────────────────────────────────────────────────────────
} elseif ($method === 'POST' && $path === '/payments/deposit') {
    (new VantageMarkets\Api\PaymentController())->deposit();

} elseif ($method === 'POST' && $path === '/payments/transfer') {
    (new VantageMarkets\Api\PaymentController())->transfer();

// ── Trading ──────────────────────────────────────────────────────────────────
} elseif ($method === 'POST' && $path === '/trading/execute') {
    (new VantageMarkets\Api\TradingController())->execute();

} elseif ($method === 'GET' && $path === '/trading/positions') {
    (new VantageMarkets\Api\TradingController())->positions();

// ── Copy Trading ─────────────────────────────────────────────────────────────
} elseif ($method === 'GET' && $path === '/signals') {
    (new VantageMarkets\Api\CopyTradingController())->list();

} elseif ($method === 'POST' && $path === '/signals/copy') {
    (new VantageMarkets\Api\CopyTradingController())->copy();

// ── Admin Dashboard ───────────────────────────────────────────────────────────
} elseif ($method === 'GET' && $path === '/admin/dashboard/stats') {
    (new VantageMarkets\Api\Admin\DashboardController())->stats();

// ── Admin Users ───────────────────────────────────────────────────────────────
} elseif ($method === 'GET' && $path === '/admin/users') {
    (new VantageMarkets\Api\Admin\UsersController())->index();

} elseif ($method === 'GET' && matchRoute('/admin/users/{id}', $path, $params)) {
    (new VantageMarkets\Api\Admin\UsersController())->show($params['id']);

} elseif ($method === 'PUT' && matchRoute('/admin/users/{id}', $path, $params)) {
    (new VantageMarkets\Api\Admin\UsersController())->update($params['id']);

} elseif ($method === 'PATCH' && matchRoute('/admin/users/{id}/status', $path, $params)) {
    (new VantageMarkets\Api\Admin\UsersController())->updateStatus($params['id']);

} elseif ($method === 'DELETE' && matchRoute('/admin/users/{id}', $path, $params)) {
    (new VantageMarkets\Api\Admin\UsersController())->destroy($params['id']);

// ── Admin Transactions ────────────────────────────────────────────────────────
} elseif ($method === 'GET' && $path === '/admin/transactions') {
    (new VantageMarkets\Api\Admin\TransactionsController())->index();

} elseif ($method === 'PATCH' && matchRoute('/admin/transactions/{id}/approve', $path, $params)) {
    (new VantageMarkets\Api\Admin\TransactionsController())->approve($params['id']);

} elseif ($method === 'PATCH' && matchRoute('/admin/transactions/{id}/reject', $path, $params)) {
    (new VantageMarkets\Api\Admin\TransactionsController())->reject($params['id']);

// ── 404 ──────────────────────────────────────────────────────────────────────
} else {
    Response::error("Endpoint [{$method}] {$path} not found.", 404);
}
