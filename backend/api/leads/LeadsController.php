<?php

declare(strict_types=1);

namespace VantageMarkets\Api\Leads;

use VantageMarkets\Models\Lead;
use VantageMarkets\Utils\Response;

/**
 * LeadsController — Public endpoint for /api/leads (newsletter & enquiries).
 */
final class LeadsController
{
    private Lead $leadModel;

    public function __construct()
    {
        $this->leadModel = new Lead();
    }

    // POST /api/leads
    public function store(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $email = trim($body['email'] ?? '');
        $name  = trim($body['name']  ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid email address is required.');
        }

        $id = $this->leadModel->create([
            'name'    => $name,
            'email'   => $email,
            'phone'   => $body['phone']   ?? null,
            'country' => $body['country'] ?? null,
            'source'  => $body['source']  ?? 'homepage',
            'message' => $body['message'] ?? null,
        ]);

        Response::success(
            ['lead_id' => $id],
            'Thank you for your interest. A member of our team will be in touch shortly.',
            201
        );
    }
}
