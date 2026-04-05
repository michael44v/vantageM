<?php

declare(strict_types=1);

namespace VantageMarkets\Api;

use VantageMarkets\Models\KYCDocument;
use VantageMarkets\Utils\Response;
use VantageMarkets\Middleware\AuthMiddleware;

class KYCController
{
    private KYCDocument $kycModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->kycModel = new KYCDocument();
        $this->auth = new AuthMiddleware();
    }

    public function list(): void
    {
        $decoded = $this->auth->validate();
        $documents = $this->kycModel->findByUserId($decoded['sub']);
        Response::success(['documents' => $documents]);
    }

    public function upload(): void
    {
        $decoded = $this->auth->validate();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($body['document_type']) || empty($body['file_url'])) {
            Response::error('Document type and file URL are required.', 422);
        }

        $id = $this->kycModel->create([
            'user_id' => $decoded['sub'],
            'document_type' => $body['document_type'],
            'file_url' => $body['file_url']
        ]);

        Response::success(['id' => $id], 'Document uploaded successfully and is pending review.');
    }
}
