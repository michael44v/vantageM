<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use PDO;

/**
 * User — Data-access object for the `users` table.
 */
final class User
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
     * Return a paginated list of users with optional search and status filter.
     *
     * @return array{data: list<array<string,mixed>>, total: int, page: int, perPage: int}
     */
    public function getAll(int $page = 1, int $perPage = 20, string $search = '', string $status = ''): array
    {
        $offset = ($page - 1) * $perPage;
        $where  = [];
        $params = [];

        if ($search !== '') {
            $where[]          = '(name LIKE :search OR email LIKE :search OR country LIKE :search)';
            $params[':search'] = "%{$search}%";
        }

        if ($status !== '' && $status !== 'All') {
            $where[]          = 'status = :status';
            $params[':status'] = $status;
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        // Total count
        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM users {$whereClause}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // Paginated rows
        $params[':limit']  = $perPage;
        $params[':offset'] = $offset;

        $stmt = $this->db->prepare(
            "SELECT id, name, email, country, wallet_balance, status, created_at
             FROM users
             {$whereClause}
             ORDER BY created_at DESC
             LIMIT :limit OFFSET :offset"
        );

        // PDO requires explicit bindValue for integer parameters when EMULATE_PREPARES is off
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
     * Find a single user by primary key.
     *
     * @return array<string, mixed>|null
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, country, wallet_balance, status, created_at
             FROM users WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Find a user by email (includes hashed password for auth).
     *
     * @return array<string, mixed>|null
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, password_hash, role, status, wallet_balance
             FROM users WHERE email = :email LIMIT 1'
        );
        $stmt->execute([':email' => strtolower(trim($email))]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // -------------------------------------------------------------------------
    // Write
    // -------------------------------------------------------------------------

    /**
     * Create a new user record. Returns the new user's ID.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password_hash, phone, country, role, status)
             VALUES (:name, :email, :password_hash, :phone, :country, :role, :status)'
        );

        $stmt->execute([
            ':name'          => trim($data['name']),
            ':email'         => strtolower(trim($data['email'])),
            ':password_hash' => password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]),
            ':phone'         => $data['phone'] ?? null,
            ':country'       => $data['country'] ?? null,
            ':role'          => 'trader',
            ':status'        => 'pending',
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Update mutable user fields.
     *
     * @param array<string, mixed> $data
     */
    public function update(int $id, array $data): bool
    {
        $allowed = ['name', 'phone', 'country', 'status', 'wallet_balance'];
        $sets    = [];
        $params  = [':id' => $id];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[]           = "{$field} = :{$field}";
                $params[":{$field}"] = $data[$field];
            }
        }

        if (empty($sets)) {
            return false;
        }

        $stmt = $this->db->prepare(
            'UPDATE users SET ' . implode(', ', $sets) . ', updated_at = NOW() WHERE id = :id'
        );

        return $stmt->execute($params);
    }

    /**
     * Update only the user's status field.
     */
    public function updateStatus(int $id, string $status): bool
    {
        $allowed = ['active', 'pending', 'suspended'];
        if (!in_array(strtolower($status), $allowed, true)) {
            return false;
        }

        $stmt = $this->db->prepare(
            'UPDATE users SET status = :status, updated_at = NOW() WHERE id = :id'
        );
        return $stmt->execute([':status' => $status, ':id' => $id]);
    }

    /**
     * Soft-delete a user by setting their status to "deleted".
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET status = 'deleted', updated_at = NOW() WHERE id = :id"
        );
        return $stmt->execute([':id' => $id]);
    }

    // -------------------------------------------------------------------------
    // Aggregates
    // -------------------------------------------------------------------------

    /**
     * Return total user counts grouped by status.
     *
     * @return array<string, int>
     */
    public function getStatusCounts(): array
    {
        $stmt = $this->db->query(
            "SELECT status, COUNT(*) as count FROM users WHERE status != 'deleted' GROUP BY status"
        );
        $rows   = $stmt->fetchAll();
        $result = [];
        foreach ($rows as $row) {
            $result[$row['status']] = (int) $row['count'];
        }
        return $result;
    }
}
