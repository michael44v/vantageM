<?php

declare(strict_types=1);

namespace VantageMarkets\Api;

use VantageMarkets\Models\TradingAccount;
use VantageMarkets\Models\User;
use VantageMarkets\Utils\Response;
use VantageMarkets\Middleware\AuthMiddleware;

class AccountController
{
    private TradingAccount $accountModel;
    private User $userModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->accountModel = new TradingAccount();
        $this->userModel = new User();
        $this->auth = new AuthMiddleware();
    }

    public function list(): void
    {
        $decoded = $this->auth->validate();
        $accounts = $this->accountModel->findByUserId($decoded['sub']);
        $user = $this->userModel->findById($decoded['sub']);

        Response::success([
            'accounts' => $accounts,
            'wallet_balance' => $user['wallet_balance'] ?? 0
        ]);
    }

    public function create(): void
    {
        $decoded = $this->auth->validate();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $data = [
            'user_id' => $decoded['sub'],
            'account_number' => (string) rand(1000000, 9999999),
            'type' => $body['type'] ?? 'standard_stp',
            'is_demo' => $body['is_demo'] ?? false,
            'balance' => ($body['is_demo'] ?? false) ? 10000.00 : 0.00,
            'leverage' => $body['leverage'] ?? 500,
        ];

        $id = $this->accountModel->create($data);
        Response::success(['id' => $id], 'Trading account created successfully.', 201);
    }
}
