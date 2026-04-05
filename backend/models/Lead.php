<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use mysqli;

/**
 * Lead — Stores visitor enquiries and newsletter sign-ups from the public site using MySQLi.
 */
final class Lead
{
    private mysqli $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Persist a new lead.
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO leads (name, email, phone, country, source, message)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $phone = $data['phone']   ?? null;
        $country = $data['country'] ?? null;
        $source = $data['source']  ?? 'website';
        $message = $data['message'] ?? null;

        $stmt->bind_param("ssssss", $name, $email, $phone, $country, $source, $message);
        $stmt->execute();
        $id = $this->db->insert_id;
        $stmt->close();

        return (int) $id;
    }

    /**
     * Return all leads for the admin panel.
     */
    public function getAll(int $limit = 100): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, phone, country, source, message, created_at
             FROM leads
             ORDER BY created_at DESC
             LIMIT ?'
        );
        $stmt->bind_param("i", $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $data;
    }
}
