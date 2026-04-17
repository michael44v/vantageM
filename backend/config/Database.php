<?php

declare(strict_types=1);

namespace VantageMarkets\Config;

use PDO;
use PDOException;

/**
 * Database — Singleton PDO connection manager.
 *
 * Reads credentials from environment variables (set in .env or server config).
 * Falls back to default local values for development.
 */
final class Database;
{
    private static ?Database $instance = null;
    private PDO $connection;

    private function __construct()
    {
        $host     = $_ENV['DB_HOST']     ?? 'localhost';
        $port     = $_ENV['DB_PORT']     ?? '3306';
        $name     = $_ENV['DB_NAME']     ?? 'vantagemarkets';
        $user     = $_ENV['DB_USER']     ?? 'root';
        $password = $_ENV['DB_PASSWORD'] ?? '';
        $charset  = 'utf8mb4';

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->connection = new PDO($dsn, $user, $password, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed.']);
            exit;
        }
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO
    {
        return $this->connection;
    }

    /** Prevent cloning of the singleton. */
    private function __clone() {}
}
