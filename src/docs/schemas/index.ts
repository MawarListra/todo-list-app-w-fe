/**
 * Export all schema definitions for OpenAPI documentation
 */

import { listSchemas } from './listSchemas';
import { taskSchemas } from './taskSchemas';
import { commonSchemas } from './commonSchemas';

export const allSchemas = {
  ...listSchemas,
  ...taskSchemas,
  ...commonSchemas
};

export * from './listSchemas';
export * from './taskSchemas';
export * from './commonSchemas';

export default allSchemas;
