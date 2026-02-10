<?php
/**
 * Minimal PHP API for shared hosting.
 *
 * This endpoint implements the same routes as the Node API:
 * - GET    /api/health
 * - GET    /api/records/{type}
 * - POST   /api/records/{type}
 * - PUT    /api/records/{type}/{id}
 * - DELETE /api/records/{type}/{id}
 *
 * It stores JSON blobs in a `records` table so the frontend can persist data.
 */

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$segments = array_values(array_filter(explode('/', $path)));
$tenantId = $_SERVER['HTTP_X_TENANT_ID'] ?? '';

// Helper: read JSON body safely.
function readJsonBody(): array
{
    $input = file_get_contents('php://input');
    if ($input === false || $input === '') {
        return [];
    }
    $decoded = json_decode($input, true);
    return is_array($decoded) ? $decoded : [];
}

// Helper: simple UUID v4 generator for backend-created records.
function generateUuid(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

// Helper: send a JSON response with status code.
function sendJson($payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

// GET /api/health
if ($method === 'GET' && $path === '/health') {
    sendJson([
        'status' => 'ok',
        'db' => 'connected',
        'time' => gmdate('c'),
    ]);
}

// Tenants bootstrap endpoints (no tenant header required).
if ($segments[0] ?? '' === 'tenants') {
    if ($method === 'GET') {
        $stmt = $pdo->query('SELECT id, name, created_at FROM tenants ORDER BY created_at DESC');
        sendJson($stmt->fetchAll());
    }

    if ($method === 'POST') {
        $payload = readJsonBody();
        $tenantId = $payload['id'] ?? generateUuid();
        $name = $payload['name'] ?? 'New Tenant';
        $now = gmdate('Y-m-d H:i:s');

        $stmt = $pdo->prepare('INSERT INTO tenants (id, name, created_at) VALUES (?, ?, ?)');
        $stmt->execute([$tenantId, $name, $now]);

        sendJson(['id' => $tenantId, 'name' => $name, 'created_at' => $now], 201);
    }
}

if ($tenantId === '' && $path !== '/health') {
    sendJson(['error' => 'Missing X-Tenant-Id header.'], 400);
}

// Users endpoint (requires tenant header for tenant scoping later).
if ($segments[0] ?? '' === 'users' && $method === 'POST') {
    $payload = readJsonBody();
    $userId = $payload['id'] ?? generateUuid();
    $email = $payload['email'] ?? '';
    $name = $payload['name'] ?? '';
    $password = $payload['password'] ?? '';

    if ($email === '' || $name === '' || $password === '') {
        sendJson(['error' => 'email, name, and password are required.'], 400);
    }

    $now = gmdate('Y-m-d H:i:s');
    $stmt = $pdo->prepare('INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        $userId,
        $email,
        $name,
        password_hash($password, PASSWORD_DEFAULT),
        $now,
    ]);

    sendJson(['id' => $userId, 'email' => $email, 'name' => $name, 'created_at' => $now], 201);
}

// Memberships endpoint (assign a user to a tenant).
if ($segments[0] ?? '' === 'memberships' && $method === 'POST') {
    $payload = readJsonBody();
    $membershipId = $payload['id'] ?? generateUuid();
    $userId = $payload['user_id'] ?? '';
    $role = $payload['role'] ?? 'viewer';
    $now = gmdate('Y-m-d H:i:s');

    if ($userId === '') {
        sendJson(['error' => 'user_id is required.'], 400);
    }

    $stmt = $pdo->prepare('INSERT INTO memberships (id, user_id, tenant_id, role, created_at) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$membershipId, $userId, $tenantId, $role, $now]);

    sendJson([
        'id' => $membershipId,
        'user_id' => $userId,
        'tenant_id' => $tenantId,
        'role' => $role,
        'created_at' => $now,
    ], 201);
}

if (count($segments) >= 2 && $segments[0] === 'records') {
    $type = $segments[1];

    if ($method === 'GET' && count($segments) === 2) {
        $stmt = $pdo->prepare(
            'SELECT data FROM records WHERE tenant_id = ? AND type = ? ORDER BY updated_at DESC'
        );
        $stmt->execute([$tenantId, $type]);
        $rows = $stmt->fetchAll();

        $records = array_map(function ($row) {
            $data = $row['data'];
            return is_string($data) ? json_decode($data, true) : $data;
        }, $rows);

        sendJson($records);
    }

    if ($method === 'POST' && count($segments) === 2) {
        $record = readJsonBody();
        if (!isset($record['id'])) {
            sendJson(['error' => 'Record must include an id.'], 400);
        }

        $now = gmdate('Y-m-d H:i:s');
        $stmt = $pdo->prepare(
            'INSERT INTO records (id, tenant_id, type, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $record['id'],
            $tenantId,
            $type,
            json_encode($record),
            $now,
            $now,
        ]);

        sendJson($record, 201);
    }

    if ($method === 'PUT' && count($segments) === 3) {
        $id = $segments[2];
        $record = readJsonBody();
        $record['id'] = $id;

        $now = gmdate('Y-m-d H:i:s');
        $stmt = $pdo->prepare(
            'UPDATE records SET data = ?, updated_at = ? WHERE id = ? AND type = ? AND tenant_id = ?'
        );
        $stmt->execute([
            json_encode($record),
            $now,
            $id,
            $type,
            $tenantId,
        ]);

        sendJson($record);
    }

    if ($method === 'DELETE' && count($segments) === 3) {
        $id = $segments[2];
        $stmt = $pdo->prepare('DELETE FROM records WHERE id = ? AND type = ? AND tenant_id = ?');
        $stmt->execute([$id, $type, $tenantId]);
        sendJson(['status' => 'deleted', 'id' => $id, 'type' => $type]);
    }
}

// Structured process endpoints (multi-tenant).
if ($segments[0] ?? '' === 'processes') {
    if ($method === 'GET' && count($segments) === 1) {
        $stmt = $pdo->prepare('SELECT * FROM processes WHERE tenant_id = ? ORDER BY updated_at DESC');
        $stmt->execute([$tenantId]);
        sendJson($stmt->fetchAll());
    }

    if ($method === 'POST' && count($segments) === 1) {
        $payload = readJsonBody();
        $processId = $payload['id'] ?? generateUuid();
        $now = gmdate('Y-m-d H:i:s');

        $stmt = $pdo->prepare(
            'INSERT INTO processes (id, tenant_id, code, name, type, purpose, inputs, outputs, pilot_name, status, standard, version, revision_date, revision_note, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $processId,
            $tenantId,
            $payload['code'] ?? '',
            $payload['name'] ?? '',
            $payload['type'] ?? 'support',
            $payload['purpose'] ?? null,
            json_encode($payload['inputs'] ?? []),
            json_encode($payload['outputs'] ?? []),
            $payload['pilotName'] ?? null,
            $payload['status'] ?? 'active',
            $payload['standard'] ?? 'ISO_9001',
            $payload['version'] ?? 1,
            $payload['revisionDate'] ?? $now,
            $payload['revisionNote'] ?? null,
            $payload['createdAt'] ?? $now,
            $payload['updatedAt'] ?? $now,
        ]);

        sendJson(['id' => $processId], 201);
    }

    if (count($segments) === 2) {
        $processId = $segments[1];

        if ($method === 'GET') {
            $stmt = $pdo->prepare('SELECT * FROM processes WHERE id = ? AND tenant_id = ?');
            $stmt->execute([$processId, $tenantId]);
            sendJson($stmt->fetch() ?: []);
        }

        if ($method === 'PUT') {
            $payload = readJsonBody();
            $now = gmdate('Y-m-d H:i:s');

            $stmt = $pdo->prepare(
                'UPDATE processes
                 SET code = ?, name = ?, type = ?, purpose = ?, inputs = ?, outputs = ?, pilot_name = ?, status = ?, standard = ?, version = ?, revision_date = ?, revision_note = ?, updated_at = ?
                 WHERE id = ? AND tenant_id = ?'
            );
            $stmt->execute([
                $payload['code'] ?? '',
                $payload['name'] ?? '',
                $payload['type'] ?? 'support',
                $payload['purpose'] ?? null,
                json_encode($payload['inputs'] ?? []),
                json_encode($payload['outputs'] ?? []),
                $payload['pilotName'] ?? null,
                $payload['status'] ?? 'active',
                $payload['standard'] ?? 'ISO_9001',
                $payload['version'] ?? 1,
                $payload['revisionDate'] ?? $now,
                $payload['revisionNote'] ?? null,
                $now,
                $processId,
                $tenantId,
            ]);

            sendJson(['id' => $processId]);
        }

        if ($method === 'DELETE') {
            $stmt = $pdo->prepare('DELETE FROM processes WHERE id = ? AND tenant_id = ?');
            $stmt->execute([$processId, $tenantId]);
            sendJson(['status' => 'deleted', 'id' => $processId]);
        }
    }
}

// Activity endpoints scoped to a process.
if ($segments[0] ?? '' === 'processes' && ($segments[2] ?? '') === 'activities') {
    $processId = $segments[1] ?? '';

    if ($method === 'GET' && count($segments) === 3) {
        $stmt = $pdo->prepare(
            'SELECT * FROM process_activities WHERE tenant_id = ? AND process_id = ? ORDER BY sequence ASC'
        );
        $stmt->execute([$tenantId, $processId]);
        sendJson($stmt->fetchAll());
    }

    if ($method === 'POST' && count($segments) === 3) {
        $payload = readJsonBody();
        $activityId = $payload['id'] ?? generateUuid();
        $now = gmdate('Y-m-d H:i:s');

        $stmt = $pdo->prepare(
            'INSERT INTO process_activities (id, tenant_id, process_id, name, description, sequence, is_system_activity, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $activityId,
            $tenantId,
            $processId,
            $payload['name'] ?? '',
            $payload['description'] ?? null,
            $payload['sequence'] ?? 0,
            $payload['isSystemActivity'] ?? 0,
            $now,
            $now,
        ]);

        sendJson(['id' => $activityId], 201);
    }
}

if ($segments[0] ?? '' === 'activities' && count($segments) === 2) {
    $activityId = $segments[1];
    if ($method === 'PUT') {
        $payload = readJsonBody();
        $now = gmdate('Y-m-d H:i:s');
        $stmt = $pdo->prepare(
            'UPDATE process_activities SET name = ?, description = ?, sequence = ?, is_system_activity = ?, updated_at = ? WHERE id = ? AND tenant_id = ?'
        );
        $stmt->execute([
            $payload['name'] ?? '',
            $payload['description'] ?? null,
            $payload['sequence'] ?? 0,
            $payload['isSystemActivity'] ?? 0,
            $now,
            $activityId,
            $tenantId,
        ]);
        sendJson(['id' => $activityId]);
    }

    if ($method === 'DELETE') {
        $stmt = $pdo->prepare('DELETE FROM process_activities WHERE id = ? AND tenant_id = ?');
        $stmt->execute([$activityId, $tenantId]);
        sendJson(['status' => 'deleted', 'id' => $activityId]);
    }
}

// Requirements endpoints.
if ($segments[0] ?? '' === 'requirements') {
    if ($method === 'GET' && count($segments) === 1) {
        $stmt = $pdo->prepare('SELECT * FROM requirements WHERE tenant_id = ? ORDER BY clause_number ASC');
        $stmt->execute([$tenantId]);
        sendJson($stmt->fetchAll());
    }

    if ($method === 'POST' && count($segments) === 1) {
        $payload = readJsonBody();
        $requirementId = $payload['id'] ?? generateUuid();
        $now = gmdate('Y-m-d H:i:s');

        $stmt = $pdo->prepare(
            'INSERT INTO requirements (id, tenant_id, clause_number, clause_title, description, requirement_type, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $requirementId,
            $tenantId,
            $payload['clauseNumber'] ?? '',
            $payload['clauseTitle'] ?? '',
            $payload['description'] ?? null,
            $payload['type'] ?? 'generic',
            $now,
            $now,
        ]);
        sendJson(['id' => $requirementId], 201);
    }
}

// Activity requirement allocation endpoints.
if ($segments[0] ?? '' === 'activities' && ($segments[2] ?? '') === 'requirements') {
    $activityId = $segments[1] ?? '';

    if ($method === 'GET' && count($segments) === 3) {
        $stmt = $pdo->prepare(
            'SELECT r.* FROM requirements r
             JOIN activity_requirements ar ON ar.requirement_id = r.id
             WHERE ar.tenant_id = ? AND ar.activity_id = ?'
        );
        $stmt->execute([$tenantId, $activityId]);
        sendJson($stmt->fetchAll());
    }

    if ($method === 'POST' && count($segments) === 3) {
        $payload = readJsonBody();
        $allocationId = $payload['id'] ?? generateUuid();
        $requirementId = $payload['requirement_id'] ?? '';
        if ($requirementId === '') {
            sendJson(['error' => 'requirement_id is required.'], 400);
        }
        $now = gmdate('Y-m-d H:i:s');
        $stmt = $pdo->prepare(
            'INSERT INTO activity_requirements (id, tenant_id, activity_id, requirement_id, allocated_at)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$allocationId, $tenantId, $activityId, $requirementId, $now]);
        sendJson(['id' => $allocationId], 201);
    }
}

if ($segments[0] ?? '' === 'activities' && ($segments[2] ?? '') === 'requirements' && count($segments) === 4) {
    $activityId = $segments[1];
    $requirementId = $segments[3];
    if ($method === 'DELETE') {
        $stmt = $pdo->prepare(
            'DELETE FROM activity_requirements WHERE tenant_id = ? AND activity_id = ? AND requirement_id = ?'
        );
        $stmt->execute([$tenantId, $activityId, $requirementId]);
        sendJson(['status' => 'deleted', 'activity_id' => $activityId, 'requirement_id' => $requirementId]);
    }
}

sendJson(['error' => 'Not found'], 404);
