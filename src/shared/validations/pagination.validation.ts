import { t } from "elysia";

export const query = t.Object({
    limit: t.Optional(t.Number()),
    skip: t.Optional(t.Number()),
    sort: t.Optional(
        t.String({
            // regex:  field|direction (asc|desc)  [,field|direction]*
            pattern:
                '^(\\w+\\|(asc|desc))(,\\w+\\|(asc|desc))*$',
        })
    ),
});
