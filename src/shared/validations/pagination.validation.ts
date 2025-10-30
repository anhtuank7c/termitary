import { Static, t } from 'elysia';

// regex:  field|direction (asc|desc)  [,field|direction]*
export const sortPattern = '^(\\w+\\|(asc|desc))(,\\w+\\|(asc|desc))*$';
export const sortSchema = t.String({
  pattern: sortPattern,
});

export const querySchema = t.Object({
  limit: t.Optional(t.Number({ minimum: 1 })),
  skip: t.Optional(t.Number({ minimum: 0 })),
  sort: t.Optional(sortSchema),
});

export type PaginationQueryDto = Static<typeof querySchema>;
export type SortField = Static<typeof sortSchema>;
export type SortDirection = 'asc' | 'desc';

/**
 * Parse sort string into array of sort fields
 * Format: "field1|direction1,field2|direction2"
 * Example: "createdAt|desc,priority|asc"
 */
export function parseSortString(sort?: SortField): Record<string, SortDirection>[] {
  if (!sort) {
    return [];
  }

  return sort.split(',').map((pair) => {
    const [field, direction] = pair.split('|');
    const dir = direction.toLowerCase() === 'desc' ? 'desc' : 'asc';
    return { [field]: dir };
  });
}
