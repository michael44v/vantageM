<?php

declare(strict_types=1);

namespace VantageMarkets\Config;

use mysqli;
use Exception;

/**
 * Database — Singleton MySQLi connection manager.
 *
 * Reads credentials from environment variables.
 * Uses the object-oriented mysqli extension as requested.
 */
final class Database
{
    private static ?Database $instance = null;
    private mysqli $connection;

    private function __construct()
    {
        $host     = $_ENV['DB_HOST']     ?? 'localhost';
        $port     = (int)($_ENV['DB_PORT'] ?? '3306');
        $name     = $_ENV['DB_NAME']     ?? 'vantagemarkets';
        $user     = $_ENV['DB_USER']     ?? 'root';
        $password = $_ENV['DB_PASSWORD'] ?? '';

        try {
            mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
            $this->connection = new mysqli($host, $user, $password, $name, $port);
            $this->connection->set_charset("utf8mb4");
        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error'   => 'Database connection failed.',
                'details' => $e->getMessage()
            ]);
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

    public function getConnection(): mysqli
    {
        return $this->connection;
    }

    /** Prevent cloning of the singleton. */
    private function __clone() {}
}
