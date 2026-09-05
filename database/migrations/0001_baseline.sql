-- 0001_baseline.sql
-- Baseline schema, extracted from the CREATE TABLE statements that
-- public/api/bootstrap.php currently runs inline on every request.
-- This migration is idempotent (IF NOT EXISTS) so it is safe to run
-- against an existing database that already has these tables.
--
-- Technical debt note (see docs/DEV_LOG.md): schema definition
-- currently lives in two places (bootstrap.php and this file). The
-- long-term fix is to make this migrations/ folder the single source
-- of truth and have bootstrap.php stop creating/altering tables at
-- request time. Do not remove the bootstrap.php logic until the
-- migration workflow has been proven in production and this note is
-- removed.

CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_memberships_user (user_id),
    INDEX idx_memberships_tenant (tenant_id)
);

CREATE TABLE IF NOT EXISTS records (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    type VARCHAR(32) NOT NULL,
    data JSON NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_records_type (type),
    INDEX idx_records_tenant (tenant_id)
);

CREATE TABLE IF NOT EXISTS processes (
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
);

CREATE TABLE IF NOT EXISTS process_activities (
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
);

CREATE TABLE IF NOT EXISTS requirements (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    clause_number VARCHAR(50) NOT NULL,
    clause_title VARCHAR(255) NOT NULL,
    description TEXT,
    requirement_type VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_requirements_tenant (tenant_id)
);

CREATE TABLE IF NOT EXISTS activity_requirements (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    activity_id VARCHAR(36) NOT NULL,
    requirement_id VARCHAR(36) NOT NULL,
    allocated_at DATETIME NOT NULL,
    INDEX idx_allocations_tenant (tenant_id),
    INDEX idx_allocations_activity (activity_id),
    INDEX idx_allocations_requirement (requirement_id)
);

CREATE TABLE IF NOT EXISTS issues (
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
);

CREATE TABLE IF NOT EXISTS actions (
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
);

CREATE TABLE IF NOT EXISTS documents (
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
);

-- Legacy safety net: add tenant_id to `records` if an older DB predates it.
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'records'
      AND COLUMN_NAME = 'tenant_id'
);
SET @ddl = IF(@col_exists = 0,
    'ALTER TABLE records ADD COLUMN tenant_id VARCHAR(36) NOT NULL DEFAULT ''''',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'records'
      AND INDEX_NAME = 'idx_records_tenant'
);
SET @ddl2 = IF(@idx_exists = 0,
    'CREATE INDEX idx_records_tenant ON records (tenant_id)',
    'SELECT 1'
);
PREPARE stmt2 FROM @ddl2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
