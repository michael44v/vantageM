<?php

declare(strict_types=1);

namespace AbleMarkets\Api\Admin;

use AbleMarkets\Models\User;
use AbleMarkets\Models\Transaction;
use AbleMarkets\Middleware\AuthMiddleware;
use AbleMarkets\Utils\Response;

/**
 * DashboardController — Aggregated stats for /api/admin/dashboard.
 */
final class DashboardController
{
    private User $userModel;
    private Transaction $txModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->userModel = new User();
        $this->txModel   = new Transaction();
        $this->auth      = new AuthMiddleware();
        $this->auth->requireAdmin();
    }

    // GET /api/admin/dashboard/stats
    public function stats(): void
    {
        $userCounts = $this->userModel->getStatusCounts();
        $txSummary  = $this->txModel->getSummary();

        Response::success([
            'users' => [
                'total'   => array_sum($userCounts),
                'active'  => $userCounts['active']    ?? 0,
                'pending' => $userCounts['pending']   ?? 0,
                'suspended' => $userCounts['suspended'] ?? 0,
            ],
            'transactions' => [
                'total_deposits'    => $txSummary['total_deposits'],
                'total_withdrawals' => $txSummary['total_withdrawals'],
                'pending_count'     => $txSummary['pending_count'],
            ],
        ]);
    }
}
