<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use mysqli;

class Position
{
    private mysqli $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByAccountId(int $accountId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM positions WHERE trading_account_id = ? AND status = 'open'");
        $stmt->bind_param("i", $accountId);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $data;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO positions (user_id, trading_account_id, symbol, type, lots, entry_price, current_price, stop_loss, take_profit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        $userId = $data['user_id'];
        $accId = $data['trading_account_id'];
        $symbol = $data['symbol'];
        $type = $data['type'];
        $lots = $data['lots'];
        $entry = $data['entry_price'];
        $current = $data['entry_price']; // Initial current_price = entry_price
        $sl = $data['stop_loss'] ?? null;
        $tp = $data['take_profit'] ?? null;

        $stmt->bind_param("iisssdddd", $userId, $accId, $symbol, $type, $lots, $entry, $current, $sl, $tp);
        $stmt->execute();
        $id = $this->db->insert_id;
        $stmt->close();

        return (int) $id;
    }
}
