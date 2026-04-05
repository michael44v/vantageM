<?php

declare(strict_types=1);

namespace AbleMarkets\Models;

use AbleMarkets\Config\Database;
use PDO;

/**
 * Transaction — Data-access object for the `transactions` table.
 */
final class Transaction
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /**
     * Return a paginated list of transactions with optional filters.
     *
     * @return array{data: list<array<string,mixed>>, total: int, page: int, perPage: int}
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
        $params = [];

        if ($search !== '') {
            $where[]           = '(u.name LIKE :search OR t.reference LIKE :search)';
            $params[':search']  = "%{$search}%";
        }
        if ($type !== '' && $type !== 'All') {
            $where[]          = 't.type = :type';
            $params[':type']   = $type;
        }
        if ($status !== '' && $status !== 'All') {
            $where[]           = 't.status = :status';
            $params[':status']  = $status;
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $countStmt = $this->db->prepare(
            "SELECT COUNT(*) FROM transactions t
             LEFT JOIN users u ON u.id = t.user_id
             {$whereClause}"
        );
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $params[':limit']  = $perPage;
        $params[':offset'] = $offset;

        $stmt = $this->db->prepare(
            "SELECT t.id, t.reference, u.name AS user_name, t.type, t.amount,
                    t.currency, t.method, t.status, t.created_at
             FROM transactions t
             LEFT JOIN users u ON u.id = t.user_id
             {$whereClause}
             ORDER BY t.created_at DESC
             LIMIT :limit OFFSET :offset"
        );

        foreach ($params as $key => $value) {
            if (in_array($key, [':limit', ':offset'], true)) {
                $stmt->bindValue($key, $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue($key, $value);
            }
        }

        $stmt->execute();

        return [
            'data'    => $stmt->fetchAll(),
            'total'   => $total,
            'page'    => $page,
            'perPage' => $perPage,
        ];
    }

    /**
     * Find a transaction by primary key.
     *
     * @return array<string, mixed>|null
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT t.*, u.name AS user_name, u.email AS user_email
             FROM transactions t
             LEFT JOIN users u ON u.id = t.user_id
             WHERE t.id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // -------------------------------------------------------------------------
    // Write
    // -------------------------------------------------------------------------

    /**
     * Create a new transaction record.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO transactions (user_id, reference, type, amount, currency, method, status)
             VALUES (:user_id, :reference, :type, :amount, :currency, :method, :status)'
        );

        $stmt->execute([
            ':user_id'   => $data['user_id'],
            ':reference' => $data['reference'] ?? $this->generateReference(),
            ':type'      => $data['type'],       // deposit | withdrawal
            ':amount'    => $data['amount'],
            ':currency'  => $data['currency'] ?? 'USD',
            ':method'    => $data['method'],
            ':status'    => 'pending',
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Update a transaction's status.
     *
     * @param string $status  One of: completed, rejected, processing, pending
     */
    public function updateStatus(int $id, string $status): bool
    {
        $allowed = ['pending', 'processing', 'completed', 'rejected'];
        if (!in_array($status, $allowed, true)) {
            return false;
        }

        $stmt = $this->db->prepare(
            'UPDATE transactions SET status = :status, updated_at = NOW() WHERE id = :id'
        );
        return $stmt->execute([':status' => $status, ':id' => $id]);
    }

    // -------------------------------------------------------------------------
    // Aggregates
    // -------------------------------------------------------------------------

    /**
     * Return summary figures for the admin dashboard.
     *
     * @return array{total_deposits: float, total_withdrawals: float, pending_count: int}
     */
    public function getSummary(): array
    {
        $stmt = $this->db->query(
            "SELECT
                COALESCE(SUM(CASE WHEN type = 'deposit'    AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_deposits,
                COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_withdrawals,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count
             FROM transactions"
        );

        $row = $stmt->fetch();
        return [
            'total_deposits'    => (float) $row['total_deposits'],
            'total_withdrawals' => (float) $row['total_withdrawals'],
            'pending_count'     => (int)   $row['pending_count'],
        ];
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function generateReference(): string
    {
        return 'TXN-' . strtoupper(substr(uniqid('', true), -8));
    }
}
