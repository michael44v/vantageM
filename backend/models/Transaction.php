<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use mysqli;

/**
 * Transaction — Data-access object for the `transactions` table using MySQLi.
 */
final class Transaction
{
    private mysqli $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /**
     * Return a paginated list of transactions with optional filters.
     */
    public function getAll(
        int    $page      = 1,
        int    $perPage   = 20,
        string $search    = '',
        string $type      = '',
        string $status    = ''
    ): array {
        $offset = ($page - 1) * $perPage;
        $where  = [];
        $types  = "";
        $params = [];

        if ($search !== '') {
            $where[] = '(u.name LIKE ? OR t.reference LIKE ?)';
            $searchParam = "%{$search}%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $types .= "ss";
        }
        if ($type !== '' && $type !== 'All') {
            $where[] = 't.type = ?';
            $params[] = $type;
            $types .= "s";
        }
        if ($status !== '' && $status !== 'All') {
            $where[] = 't.status = ?';
            $params[] = $status;
            $types .= "s";
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        // Total count
        $countSql = "SELECT COUNT(*) FROM transactions t
                     LEFT JOIN users u ON u.id = t.user_id
                     {$whereClause}";
        $countStmt = $this->db->prepare($countSql);
        if ($params) {
            $countStmt->bind_param($types, ...$params);
        }
        $countStmt->execute();
        $total = 0;
        $countStmt->bind_result($total);
        $countStmt->fetch();
        $countStmt->close();

        // Paginated rows
        $sql = "SELECT t.id, t.reference, u.name AS user_name, t.type, t.amount,
                    t.currency, t.method, t.status, t.created_at
             FROM transactions t
             LEFT JOIN users u ON u.id = t.user_id
             {$whereClause}
             ORDER BY t.created_at DESC
             LIMIT ? OFFSET ?";

        $stmt = $this->db->prepare($sql);
        $finalTypes = $types . "ii";
        $finalParams = [...$params, $perPage, $offset];
        $stmt->bind_param($finalTypes, ...$finalParams);
        $stmt->execute();

        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return [
            'data'    => $data,
            'total'   => $total,
            'page'    => $page,
            'perPage' => $perPage,
        ];
    }

    /**
     * Find a transaction by primary key.
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT t.*, u.name AS user_name, u.email AS user_email
             FROM transactions t
             LEFT JOIN users u ON u.id = t.user_id
             WHERE t.id = ? LIMIT 1'
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    // -------------------------------------------------------------------------
    // Write
    // -------------------------------------------------------------------------

    /**
     * Create a new transaction record.
     */
    public function create(array $data): int
    {
        $sql = 'INSERT INTO transactions (user_id, reference, type, amount, currency, method, status, receipt_url, tx_hash, from_account_id, to_account_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        $stmt = $this->db->prepare($sql);

        $userId = $data['user_id'];
        $reference = $data['reference'] ?? $this->generateReference();
        $type = $data['type'];
        $amount = $data['amount'];
        $currency = $data['currency'] ?? 'USD';
        $method = $data['method'] ?? 'Internal';
        $status = $data['status'] ?? 'pending';
        $receiptUrl = $data['receipt_url'] ?? null;
        $txHash = $data['tx_hash'] ?? null;
        $fromAccId = $data['from_account_id'] ?? null;
        $toAccId = $data['to_account_id'] ?? null;

        $stmt->bind_param("isddsssssii", $userId, $reference, $type, $amount, $currency, $method, $status, $receiptUrl, $txHash, $fromAccId, $toAccId);
        $stmt->execute();
        $id = $this->db->insert_id;
        $stmt->close();

        return (int) $id;
    }

    /**
     * Update a transaction's status.
     */
    public function updateStatus(int $id, string $status): bool
    {
        $allowed = ['pending', 'processing', 'completed', 'rejected'];
        if (!in_array($status, $allowed, true)) {
            return false;
        }

        $stmt = $this->db->prepare(
            'UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?'
        );
        $stmt->bind_param("si", $status, $id);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }

    // -------------------------------------------------------------------------
    // Aggregates
    // -------------------------------------------------------------------------

    /**
     * Return summary figures for the admin dashboard.
     */
    public function getSummary(): array
    {
        $result = $this->db->query(
            "SELECT
                COALESCE(SUM(CASE WHEN type = 'deposit'    AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_deposits,
                COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_withdrawals,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count
             FROM transactions"
        );

        $row = $result->fetch_assoc();
        return [
            'total_deposits'    => (float) $row['total_deposits'],
            'total_withdrawals' => (float) $row['total_withdrawals'],
            'pending_count'     => (int)   $row['pending_count'],
        ];
    }

    private function generateReference(): string
    {
        return 'TXN-' . strtoupper(substr(uniqid('', true), -8));
    }
}
