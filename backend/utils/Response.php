<?php

declare(strict_types=1);

namespace AbleMarkets\Utils;

/**
 * Response — Standardised JSON response helper.
 */
final class Response
{
    public static function json(mixed $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Success', int $code = 200): void
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    public static function error(string $message, int $code = 400, mixed $errors = null): void
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        self::json($payload, $code);
    }

    public static function notFound(string $message = 'Resource not found.'): void
    {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'Unauthorised. Please log in.'): void
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'You do not have permission to perform this action.'): void
    {
        self::error($message, 403);
    }
}
