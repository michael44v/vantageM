<?php

declare(strict_types=1);

namespace VantageMarkets\Api\Admin;

use VantageMarkets\Models\User;
use VantageMarkets\Middleware\AuthMiddleware;
use VantageMarkets\Utils\Response;

/**
 * UsersController — Admin CRUD for /api/admin/users.
 *
 * All methods require a valid admin JWT.
 */
final class UsersController
{
    private User $userModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->userModel = new User();
        $this->auth      = new AuthMiddleware();
        $this->auth->requireAdmin();
    }

    // GET /api/admin/users
    public function index(): void
    {
        $page    = (int) ($_GET['page']    ?? 1);
        $perPage = (int) ($_GET['per_page'] ?? 20);
        $search  = $_GET['search'] ?? '';
        $status  = $_GET['status'] ?? '';

        $result = $this->userModel->getAll($page, $perPage, $search, $status);
        Response::success($result);
    }

    // GET /api/admin/users/{id}
    public function show(int $id): void
    {
        $user = $this->userModel->findById($id);
        if ($user === null) {
            Response::notFound("User #{$id} not found.");
        }
        Response::success($user);
    }

    // PUT /api/admin/users/{id}
    public function update(int $id): void
    {
        $body = $this->parseBody();

        $user = $this->userModel->findById($id);
        if ($user === null) {
            Response::notFound("User #{$id} not found.");
        }

        $updated = $this->userModel->update($id, $body);
        if (!$updated) {
            Response::error('No valid fields provided for update.');
        }

        Response::success(null, 'User updated successfully.');
    }

    // PATCH /api/admin/users/{id}/status
    public function updateStatus(int $id): void
    {
        $body   = $this->parseBody();
        $status = strtolower(trim($body['status'] ?? ''));

        if ($status === '') {
            Response::error('Status is required.');
        }

        $user = $this->userModel->findById($id);
        if ($user === null) {
            Response::notFound("User #{$id} not found.");
        }

        $updated = $this->userModel->updateStatus($id, $status);
        if (!$updated) {
            Response::error("Invalid status value '{$status}'.");
        }

        Response::success(null, "User status updated to '{$status}'.");
    }

    // DELETE /api/admin/users/{id}
    public function destroy(int $id): void
    {
        $user = $this->userModel->findById($id);
        if ($user === null) {
            Response::notFound("User #{$id} not found.");
        }

        $this->userModel->delete($id);
        Response::success(null, 'User deleted successfully.');
    }

    /** @return array<string, mixed> */
    private function parseBody(): array
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}
