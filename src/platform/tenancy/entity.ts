export interface TenantScopedEntity {
  id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface RepositoryQuery {
  organization_id: string;
}
