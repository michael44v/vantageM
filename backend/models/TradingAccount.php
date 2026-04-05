<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use PDO;

class TradingAccount
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByUserId(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM trading_accounts WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO trading_accounts (user_id, account_number, type, is_demo, balance, leverage, currency)
             VALUES (:user_id, :account_number, :type, :is_demo, :balance, :leverage, :currency)"
        );

        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':account_number' => $data['account_number'],
            ':type' => $data['type'],
            ':is_demo' => $data['is_demo'] ? 1 : 0,
            ':balance' => $data['balance'] ?? 0.00,
            ':leverage' => $data['leverage'] ?? 500,
            ':currency' => $data['currency'] ?? 'USD'
        ]);

        return (int) $this->db->lastInsertId();
    }
}
