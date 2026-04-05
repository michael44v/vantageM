<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use PDO;

/**
 * Lead — Stores visitor enquiries and newsletter sign-ups from the public site.
 */
final class Lead
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Persist a new lead.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO leads (name, email, phone, country, source, message)
             VALUES (:name, :email, :phone, :country, :source, :message)'
        );

        $stmt->execute([
            ':name'    => trim($data['name'] ?? ''),
            ':email'   => strtolower(trim($data['email'] ?? '')),
            ':phone'   => $data['phone']   ?? null,
            ':country' => $data['country'] ?? null,
            ':source'  => $data['source']  ?? 'website',
            ':message' => $data['message'] ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Return all leads for the admin panel.
     *
     * @return list<array<string, mixed>>
     */
    public function getAll(int $limit = 100): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, phone, country, source, message, created_at
             FROM leads
             ORDER BY created_at DESC
             LIMIT :limit'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
