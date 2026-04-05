<?php

declare(strict_types=1);

namespace AbleMarkets\Api\Auth;

use AbleMarkets\Models\User;
use AbleMarkets\Middleware\AuthMiddleware;
use AbleMarkets\Utils\Response;

/**
 * AuthController — Handles /api/auth/login and /api/auth/register.
 */
final class AuthController
{
    private User $userModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->userModel = new User();
        $this->auth      = new AuthMiddleware();
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/login
    // -------------------------------------------------------------------------

    public function login(): void
    {
        $body = $this->parseBody();

        $email    = trim($body['email']    ?? '');
        $password = trim($body['password'] ?? '');

        if ($email === '' || $password === '') {
            Response::error('Email and password are required.');
        }

        $user = $this->userModel->findByEmail($email);

        if ($user === null || !password_verify($password, $user['password_hash'])) {
            // Use a generic message to avoid user enumeration
            Response::error('Invalid email or password.', 401);
        }

        if ($user['status'] === 'suspended') {
            Response::error('Your account has been suspended. Please contact support.', 403);
        }

        $token = $this->auth->generate([
            'sub'   => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
            'name'  => $user['name'],
        ]);

        Response::success([
            'token' => $token,
            'user'  => [
                'id'           => $user['id'],
                'name'         => $user['name'],
                'email'        => $user['email'],
                'role'         => $user['role'],
                'account_type' => $user['account_type'],
            ],
        ], 'Login successful.');
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/register
    // -------------------------------------------------------------------------

    public function register(): void
    {
        $body = $this->parseBody();

        // Validate required fields
        $errors = $this->validateRegistration($body);
        if (!empty($errors)) {
            Response::error('Validation failed.', 422, $errors);
        }

        // Check for duplicate email
        $existing = $this->userModel->findByEmail($body['email']);
        if ($existing !== null) {
            Response::error('An account with this email address already exists.', 409);
        }

        $name = trim(($body['first_name'] ?? '') . ' ' . ($body['last_name'] ?? ''));

        $userId = $this->userModel->create([
            'name'         => $name,
            'email'        => $body['email'],
            'password'     => $body['password'],
            'phone'        => $body['phone']        ?? null,
            'country'      => $body['country']      ?? null,
            'account_type' => $body['account_type'] ?? 'standard',
        ]);

        Response::success(
            ['user_id' => $userId],
            'Account created successfully. Please verify your email before logging in.',
            201
        );
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/logout
    // -------------------------------------------------------------------------

    public function logout(): void
    {
        // JWT is stateless — the client simply discards the token.
        // If you implement a token blacklist (e.g. Redis), add revocation here.
        Response::success(null, 'Logged out successfully.');
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * @return array<string, mixed>
     */
    private function parseBody(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    /**
     * @param array<string, mixed> $data
     * @return array<string, string>
     */
    private function validateRegistration(array $data): array
    {
        $errors = [];

        if (empty(trim($data['first_name'] ?? ''))) {
            $errors['first_name'] = 'First name is required.';
        }

        if (empty(trim($data['last_name'] ?? ''))) {
            $errors['last_name'] = 'Last name is required.';
        }

        if (!filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email address is required.';
        }

        if (strlen($data['password'] ?? '') < 8) {
            $errors['password'] = 'Password must be at least 8 characters.';
        }

        if (($data['password'] ?? '') !== ($data['confirm_password'] ?? '')) {
            $errors['confirm_password'] = 'Passwords do not match.';
        }

        if (empty($data['country'] ?? '')) {
            $errors['country'] = 'Country of residence is required.';
        }

        return $errors;
    }
}
