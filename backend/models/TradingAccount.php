<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use mysqli;

class TradingAccount
{
    private mysqli $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByUserId(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM trading_accounts WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $data;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO trading_accounts (user_id, account_number, type, is_demo, balance, leverage, currency)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        $userId = $data['user_id'];
        $accNum = $data['account_number'];
        $type = $data['type'];
        $isDemo = $data['is_demo'] ? 1 : 0;
        $balance = $data['balance'] ?? 0.00;
        $leverage = $data['leverage'] ?? 500;
        $currency = $data['currency'] ?? 'USD';

        $stmt->bind_param("isssdis", $userId, $accNum, $type, $isDemo, $balance, $leverage, $currency);
        $stmt->execute();
        $id = $this->db->insert_id;
        $stmt->close();

        return (int) $id;
    }
}
