<?php

declare(strict_types=1);

namespace VantageMarkets\Api;

use VantageMarkets\Models\Position;
use VantageMarkets\Utils\Response;
use VantageMarkets\Middleware\AuthMiddleware;

class TradingController
{
    private Position $positionModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->positionModel = new Position();
        $this->auth = new AuthMiddleware();
    }

    public function execute(): void
    {
        $decoded = $this->auth->validate();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($body['account_id']) || empty($body['symbol']) || empty($body['type']) || empty($body['lots']) || empty($body['price'])) {
            Response::error('All order fields are required.', 422);
        }

        $data = [
            'user_id' => $decoded['sub'],
            'trading_account_id' => $body['account_id'],
            'symbol' => $body['symbol'],
            'type' => $body['type'] === 'buy' ? 'long' : 'short',
            'lots' => $body['lots'],
            'entry_price' => $body['price'],
            'stop_loss' => $body['stop_loss'] ?? null,
            'take_profit' => $body['take_profit'] ?? null
        ];

        $id = $this->positionModel->create($data);
        Response::success(['id' => $id], 'Order executed successfully.');
    }

    public function positions(): void
    {
        $this->auth->validate();
        $accountId = (int) ($_GET['account_id'] ?? 0);
        if (!$accountId) {
            Response::error('Account ID is required.', 422);
        }

        $positions = $this->positionModel->findByAccountId($accountId);
        Response::success(['positions' => $positions]);
    }
}
