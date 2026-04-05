<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use PDO;

class Signal
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll(): array
    {
        $stmt = $this->db->query("SELECT s.*, u.name as provider_name FROM signals s JOIN users u ON s.user_id = u.id WHERE s.status = 'active'");
        return $stmt->fetchAll();
    }
}
