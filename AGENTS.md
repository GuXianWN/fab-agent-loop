# Project conventions

- Keep code concise, readable, and explicit about intent.
- Prefer established framework and library APIs over custom utilities.
- Use Lodash when it makes collection or object transformations clearer.
- In longer files, group related business methods with WebStorm-compatible `//region Name` and `//endregion` comments; keep short files ungrouped.
- Keep controllers thin and place application logic in focused services.
- Preserve the shared API contracts and the database as the source of truth.
