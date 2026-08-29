export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenantId: number;
  permissions: string[];
  [key: string]: unknown;
}
