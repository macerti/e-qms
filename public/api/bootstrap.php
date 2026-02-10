<?php
/**
 * Shared bootstrap for the PHP API.
 *
 * This file loads configuration, opens the database connection,
 * and ensures the records table exists.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Missing config.php. Copy config.example.php to config.php and fill in your DB credentials.',
    ]);
    exit;
}

$config = require $configPath;

try {
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $config['db_host'],
        $config['db_port'],
        $config['db_name']
    );
    $pdo = new PDO($dsn, $config['db_user'], $config['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed.', 'details' => $error->getMessage()]);
    exit;
}

// Ensure the records table exists for the API to use.
// Tenants table (multi-tenant support).
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL
    )"
);

// Users table (for future authentication).
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL
    )"
);

// Memberships table (users linked to tenants with a role).
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS memberships (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        tenant_id VARCHAR(36) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL,
        INDEX idx_memberships_user (user_id),
        INDEX idx_memberships_tenant (tenant_id)
    )"
);

// Records table stores JSON per tenant.
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS records (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        type VARCHAR(32) NOT NULL,
        data JSON NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_records_type (type),
        INDEX idx_records_tenant (tenant_id)
    )"
);

// Processes table (core process metadata).
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS processes (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        purpose TEXT,
        inputs JSON,
        outputs JSON,
        pilot_name VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        standard VARCHAR(50) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        revision_date DATETIME NOT NULL,
        revision_note TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_processes_tenant (tenant_id),
        INDEX idx_processes_code (code)
    )"
);

// Process activities table (steps within a process).
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS process_activities (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        process_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sequence INT NOT NULL DEFAULT 0,
        is_system_activity TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_activities_tenant (tenant_id),
        INDEX idx_activities_process (process_id)
    )"
);

// Requirements table (ISO clauses or other requirements).
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS requirements (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        clause_number VARCHAR(50) NOT NULL,
        clause_title VARCHAR(255) NOT NULL,
        description TEXT,
        requirement_type VARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_requirements_tenant (tenant_id)
    )"
);

// Activity-to-requirement allocation table.
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS activity_requirements (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        activity_id VARCHAR(36) NOT NULL,
        requirement_id VARCHAR(36) NOT NULL,
        allocated_at DATETIME NOT NULL,
        INDEX idx_allocations_tenant (tenant_id),
        INDEX idx_allocations_activity (activity_id),
        INDEX idx_allocations_requirement (requirement_id)
    )"
);

// Issues table (risks/opportunities).
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS issues (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        process_id VARCHAR(36) NOT NULL,
        code VARCHAR(50) NOT NULL,
        issue_type VARCHAR(50) NOT NULL,
        quadrant VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        context_nature VARCHAR(50) NOT NULL,
        severity INT,
        probability INT,
        criticity INT,
        priority VARCHAR(10),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        version INT NOT NULL DEFAULT 1,
        revision_date DATETIME NOT NULL,
        revision_note TEXT,
        INDEX idx_issues_tenant (tenant_id),
        INDEX idx_issues_process (process_id)
    )"
);

// Actions table (action plan items).
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS actions (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        process_id VARCHAR(36) NOT NULL,
        code VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        origin VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        deadline DATETIME,
        owner_name VARCHAR(255),
        completed_date DATETIME,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        version INT NOT NULL DEFAULT 1,
        revision_date DATETIME NOT NULL,
        revision_note TEXT,
        INDEX idx_actions_tenant (tenant_id),
        INDEX idx_actions_process (process_id)
    )"
);

// Documents table (documented information).
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        code VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        doc_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        owner_name VARCHAR(255),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        version INT NOT NULL DEFAULT 1,
        revision_date DATETIME NOT NULL,
        revision_note TEXT,
        INDEX idx_documents_tenant (tenant_id)
    )"
);

// Ensure legacy databases get the tenant_id column if needed.
$columnCheck = $pdo->prepare(
    "SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = :db
       AND TABLE_NAME = 'records'
       AND COLUMN_NAME = 'tenant_id'"
);
$columnCheck->execute(['db' => $config['db_name']]);
$columnExists = (int) $columnCheck->fetchColumn() > 0;

if (!$columnExists) {
    $pdo->exec("ALTER TABLE records ADD COLUMN tenant_id VARCHAR(36) NOT NULL DEFAULT ''");
    $pdo->exec("CREATE INDEX idx_records_tenant ON records (tenant_id)");
}
