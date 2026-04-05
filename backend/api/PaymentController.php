<?php

declare(strict_types=1);

namespace VantageMarkets\Api;

use VantageMarkets\Models\Transaction;
use VantageMarkets\Models\User;
use VantageMarkets\Models\TradingAccount;
use VantageMarkets\Utils\Response;
use VantageMarkets\Middleware\AuthMiddleware;
use VantageMarkets\Config\Database;

class PaymentController
{
    private Transaction $transactionModel;
    private User $userModel;
    private TradingAccount $accountModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->transactionModel = new Transaction();
        $this->userModel = new User();
        $this->accountModel = new TradingAccount();
        $this->auth = new AuthMiddleware();
    }

    public function deposit(): void
    {
        $decoded = $this->auth->validate();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($body['amount']) || empty($body['method'])) {
            Response::error('Amount and method are required.', 422);
        }

        $data = [
            'user_id' => $decoded['sub'],
            'type' => 'deposit',
            'amount' => $body['amount'],
            'method' => $body['method'],
            'status' => 'pending',
            'tx_hash' => $body['tx_hash'] ?? null,
            'receipt_url' => $body['receipt_url'] ?? null
        ];

        $id = $this->transactionModel->create($data);
        Response::success(['id' => $id], 'Deposit request submitted successfully.');
    }

    public function transfer(): void
    {
        $decoded = $this->auth->validate();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($body['amount']) || empty($body['from']) || empty($body['to'])) {
            Response::error('Amount, source, and destination are required.', 422);
        }

        // Simple mock of transfer logic
        // In a real app, this should be a DB transaction updating balances

        $data = [
            'user_id' => $decoded['sub'],
            'type' => 'internal_transfer',
            'amount' => $body['amount'],
            'method' => 'Internal',
            'status' => 'completed',
            'from_account_id' => $body['from'] === 'wallet' ? null : $body['from'],
            'to_account_id' => $body['to'] === 'wallet' ? null : $body['to'],
        ];

        $id = $this->transactionModel->create($data);
        Response::success(['id' => $id], 'Transfer completed successfully.');
    }
}
