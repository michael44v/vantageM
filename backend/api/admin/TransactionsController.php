<?php

declare(strict_types=1);

namespace VantageMarkets\Api\Admin;

use VantageMarkets\Models\Transaction;
use VantageMarkets\Middleware\AuthMiddleware;
use VantageMarkets\Utils\Response;

/**
 * TransactionsController — Admin management of /api/admin/transactions.
 */
final class TransactionsController
{
    private Transaction $txModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->txModel = new Transaction();
        $this->auth    = new AuthMiddleware();
        $this->auth->requireAdmin();
    }

    // GET /api/admin/transactions
    public function index(): void
    {
        $page    = (int) ($_GET['page']     ?? 1);
        $perPage = (int) ($_GET['per_page'] ?? 20);
        $search  = $_GET['search'] ?? '';
        $type    = $_GET['type']   ?? '';
        $status  = $_GET['status'] ?? '';

        $result = $this->txModel->getAll($page, $perPage, $search, $type, $status);
        Response::success($result);
    }

    // PATCH /api/admin/transactions/{id}/approve
    public function approve(int $id): void
    {
        $tx = $this->txModel->findById($id);
        if ($tx === null) {
            Response::notFound("Transaction #{$id} not found.");
        }

        if (!in_array($tx['status'], ['pending', 'processing'], true)) {
            Response::error("Transaction cannot be approved from status '{$tx['status']}'.");
        }

        $this->txModel->updateStatus($id, 'completed');
        Response::success(null, 'Transaction approved successfully.');
    }

    // PATCH /api/admin/transactions/{id}/reject
    public function reject(int $id): void
    {
        $tx = $this->txModel->findById($id);
        if ($tx === null) {
            Response::notFound("Transaction #{$id} not found.");
        }

        if (!in_array($tx['status'], ['pending', 'processing'], true)) {
            Response::error("Transaction cannot be rejected from status '{$tx['status']}'.");
        }

        $this->txModel->updateStatus($id, 'rejected');
        Response::success(null, 'Transaction rejected.');
    }
}
