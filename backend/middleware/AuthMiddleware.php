<?php

declare(strict_types=1);

namespace VantageMarkets\Middleware;

use VantageMarkets\Utils\Response;

/**
 * AuthMiddleware — Validates Bearer JWT tokens on protected routes.
 *
 * Uses a simple HS256 implementation without external dependencies.
 * For production, replace with a battle-tested JWT library such as
 * firebase/php-jwt or lcobucci/jwt.
 */
final class AuthMiddleware
{
    private string $secret;

    public function __construct()
    {
        $this->secret = $_ENV['JWT_SECRET'] ?? 'vantagemarkets_jwt_secret_change_in_production';
    }

    /**
     * Validate the Authorization header and return the decoded payload.
     * Calls Response::unauthorized() and exits if the token is missing or invalid.
     *
     * @return array<string, mixed>
     */
    public function requireAuth(): array
    {
        $token = $this->extractToken();
        if ($token === null) {
            Response::unauthorized('No authentication token provided.');
        }

        $payload = $this->verify($token);
        if ($payload === null) {
            Response::unauthorized('Invalid or expired token.');
        }

        return $payload;
    }

    /**
     * Require the authenticated user to have the "admin" role.
     *
     * @return array<string, mixed>
     */
    public function requireAdmin(): array
    {
        $payload = $this->requireAuth();
        if (($payload['role'] ?? '') !== 'admin') {
            Response::forbidden('Administrator access required.');
        }
        return $payload;
    }

    // -------------------------------------------------------------------------
    // Token helpers
    // -------------------------------------------------------------------------

    private function extractToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return null;
    }

    /**
     * Generate a signed JWT.
     *
     * @param array<string, mixed> $payload
     */
    public function generate(array $payload, int $expiresIn = 86400): string
    {
        $header    = $this->base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresIn;
        $body      = $this->base64url(json_encode($payload));
        $signature = $this->base64url(hash_hmac('sha256', "{$header}.{$body}", $this->secret, true));

        return "{$header}.{$body}.{$signature}";
    }

    /**
     * Verify a JWT and return its payload, or null if invalid/expired.
     *
     * @return array<string, mixed>|null
     */
    private function verify(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $body, $signature] = $parts;
        $expected = $this->base64url(hash_hmac('sha256', "{$header}.{$body}", $this->secret, true));

        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $payload = json_decode($this->base64urlDecode($body), true);
        if (!is_array($payload)) {
            return null;
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Token expired
        }

        return $payload;
    }

    private function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64urlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }
}
