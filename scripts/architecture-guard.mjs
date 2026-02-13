import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const errors = [];

function lines(cmd) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    return out ? out.split('\n') : [];
  } catch {
    return [];
  }
}

const uiDomainImports = lines(`rg -n "@/domains/" src/components src/pages src/ui`);
if (uiDomainImports.length) errors.push(`UI must not import @/domains directly:\n${uiDomainImports.join('\n')}`);

const domainReactImports = [
  ...lines(`rg -n "from \\\"react" src/domains`),
  ...lines(`rg -n "from \\\"react-" src/domains`),
  ...lines(`rg -n "from 'react" src/domains`),
  ...lines(`rg -n "from 'react-" src/domains`),
];
if (domainReactImports.length) errors.push(`Domain files must not import React:\n${domainReactImports.join('\n')}`);

const entityOutsideDomains = lines(`rg -n "interface\\s+\\w*Entity\\b|type\\s+\\w*Entity\\s*=" src --glob '!src/domains/**' --glob '!src/platform/tenancy/entity.ts'`);
if (entityOutsideDomains.length) errors.push(`Entity shapes must live in /domains:\n${entityOutsideDomains.join('\n')}`);

const domainModelFiles = lines(`rg -l "interface\\s+\\w*Entity\\b|type\\s+\\w*Entity\\s*=" src/domains --glob "**/*.ts"`);
for (const file of domainModelFiles) {
  const text = readFileSync(file, 'utf8');
  const hasTenancy = text.includes('organization_id') || text.includes('TenantScopedEntity') || text.includes('BaseEntity');
  if (!hasTenancy) errors.push(`Tenancy guard failed in ${file}: organization_id is missing.`);
}

if (errors.length) {
  console.error(errors.join('\n\n'));
  process.exit(1);
}

console.log('architecture guard passed');
