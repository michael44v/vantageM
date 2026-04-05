<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use PDO;

class Position
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByAccountId(int $accountId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM positions WHERE trading_account_id = :account_id AND status = 'open'");
        $stmt->execute([':account_id' => $accountId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO positions (user_id, trading_account_id, symbol, type, lots, entry_price, current_price, stop_loss, take_profit)
             VALUES (:user_id, :trading_account_id, :symbol, :type, :lots, :entry_price, :current_price, :stop_loss, :take_profit)"
        );

        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':trading_account_id' => $data['trading_account_id'],
            ':symbol' => $data['symbol'],
            ':type' => $data['type'],
            ':lots' => $data['lots'],
            ':entry_price' => $data['entry_price'],
            ':current_price' => $data['entry_price'], // Initial current_price = entry_price
            ':stop_loss' => $data['stop_loss'] ?? null,
            ':take_profit' => $data['take_profit'] ?? null
        ]);

        return (int) $this->db->lastInsertId();
    }
}
