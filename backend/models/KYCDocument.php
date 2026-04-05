<?php

declare(strict_types=1);

namespace VantageMarkets\Models;

use VantageMarkets\Config\Database;
use mysqli;

class KYCDocument
{
    private mysqli $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByUserId(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM kyc_documents WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $data;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO kyc_documents (user_id, document_type, file_url, status)
             VALUES (?, ?, ?, 'pending')"
        );

        $userId = $data['user_id'];
        $docType = $data['document_type'];
        $fileUrl = $data['file_url'];

        $stmt->bind_param("iss", $userId, $docType, $fileUrl);
        $stmt->execute();
        $id = $this->db->insert_id;
        $stmt->close();

        return (int) $id;
    }
}
