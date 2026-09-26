# Project conventions

- Before changing project behavior, read `README.md` and `doc/HANDOFF.md` for the current architecture and chat flow.
- Read `doc/MIGRATION_PLAN.md` when working on frontend migration or its validation history.
- Treat the code, shared API contracts, and database as the source of truth when documentation differs from the implementation.
- Keep code concise, readable, and explicit about intent.
- Prefer established framework and library APIs over custom utilities.
- Use Lodash when it makes collection or object transformations clearer.
- In longer files, group related business methods with WebStorm-compatible `//region Name` and `//endregion` comments; keep short files ungrouped.
- Keep controllers thin and place application logic in focused services.
