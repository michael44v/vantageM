<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use mysqli;

/**
 * User — Data-access object for the `users` table using MySQLi.
 */
final class User
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
     * Return a paginated list of users with optional search and status filter.
     *
     * @return array{data: list<array<string,mixed>>, total: int, page: int, perPage: int}
     */
    public function getAll(int $page = 1, int $perPage = 20, string $search = '', string $status = ''): array
    {
        $offset = ($page - 1) * $perPage;
        $where  = [];
        $types  = "";
        $params = [];

        if ($search !== '') {
            $where[] = '(name LIKE ? OR email LIKE ? OR country LIKE ?)';
            $searchParam = "%{$search}%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
            $types .= "sss";
        }

        if ($status !== '' && $status !== 'All') {
            $where[] = 'status = ?';
            $params[] = $status;
            $types .= "s";
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        // Total count
        $countSql = "SELECT COUNT(*) FROM users {$whereClause}";
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
        $sql = "SELECT id, name, email, country, wallet_balance, status, created_at
                FROM users
                {$whereClause}
                ORDER BY created_at DESC
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
     * Find a single user by primary key.
     *
     * @return array<string, mixed>|null
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, country, wallet_balance, status, created_at
             FROM users WHERE id = ? LIMIT 1'
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    /**
     * Find a user by email (includes hashed password for auth).
     *
     * @return array<string, mixed>|null
     */
    public function findByEmail(string $email): ?array
    {
        $email = strtolower(trim($email));
        $stmt = $this->db->prepare(
            'SELECT id, name, email, password_hash, role, status, wallet_balance
             FROM users WHERE email = ? LIMIT 1'
        );
        $stmt->bind_param("s", $email);
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
     * Create a new user record. Returns the new user's ID.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password_hash, phone, country, role, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        $name = trim($data['name']);
        $email = strtolower(trim($data['email']));
        $hash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $phone = $data['phone'] ?? null;
        $country = $data['country'] ?? null;
        $role = 'trader';
        $status = 'pending';

        $stmt->bind_param("sssssss", $name, $email, $hash, $phone, $country, $role, $status);
        $stmt->execute();
        $id = $this->db->insert_id;
        $stmt->close();

        return (int) $id;
    }

    /**
     * Update mutable user fields.
     */
    public function update(int $id, array $data): bool
    {
        $allowed = ['name', 'phone', 'country', 'status', 'wallet_balance'];
        $sets    = [];
        $types   = "";
        $params  = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "{$field} = ?";
                $params[] = $data[$field];
                $types .= is_numeric($data[$field]) ? "d" : "s";
            }
        }

        if (empty($sets)) {
            return false;
        }

        $sql = 'UPDATE users SET ' . implode(', ', $sets) . ', updated_at = NOW() WHERE id = ?';
        $stmt = $this->db->prepare($sql);

        $params[] = $id;
        $types .= "i";

        $stmt->bind_param($types, ...$params);
        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }

    /**
     * Soft-delete a user by setting their status to "deleted".
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET status = 'deleted', updated_at = NOW() WHERE id = ?"
        );
        $stmt->bind_param("i", $id);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
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
        $result = $this->db->query(
            "SELECT status, COUNT(*) as count FROM users WHERE status != 'deleted' GROUP BY status"
        );

        $counts = [];
        while ($row = $result->fetch_assoc()) {
            $counts[$row['status']] = (int) $row['count'];
        }
        return $counts;
    }
}
