<?php

declare(strict_types=1);

namespace VantageMarkets\Api;

use VantageMarkets\Models\Signal;
use VantageMarkets\Utils\Response;
use VantageMarkets\Middleware\AuthMiddleware;

class CopyTradingController
{
    private Signal $signalModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->signalModel = new Signal();
        $this->auth = new AuthMiddleware();
    }

    public function list(): void
    {
        $this->auth->validate();
        $signals = $this->signalModel->getAll();
        Response::success(['signals' => $signals]);
    }

    public function copy(): void
    {
        $this->auth->validate();
        // Placeholder for copying logic
        Response::success(null, 'Successfully started copying signal.');
    }
}
