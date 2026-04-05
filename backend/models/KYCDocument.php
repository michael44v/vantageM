<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use PDO;

class KYCDocument
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByUserId(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM kyc_documents WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO kyc_documents (user_id, document_type, file_url, status)
             VALUES (:user_id, :document_type, :file_url, 'pending')"
        );

        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':document_type' => $data['document_type'],
            ':file_url' => $data['file_url']
        ]);

        return (int) $this->db->lastInsertId();
    }
}
