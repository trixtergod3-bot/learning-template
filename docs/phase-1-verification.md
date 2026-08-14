# Phase 1 verification

## Automated checks

The foundation must pass:

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```

Test coverage currently proves:

- Application shell renders without environment variables.
- Course bundles validate and reject broken cross-references.
- Generated activities replay from stable seed/version input.
- Unknown generator versions fail closed.
- Runtime environment configuration is optional but rejects partial or legacy key input.
- The Supabase boundary returns `null` when unconfigured.

## Manual checks completed

- Desktop home page rendered with working primary navigation.
- Learn and Practice routes navigated without reload errors.
- Structured lesson content exposed appropriate semantic headings and definition lists.
- Practice route displayed both static and deterministically generated sources.
- Mobile navigation opened, contained every configured route, navigated, and closed.
- No browser console warnings or errors were present.

## Manual checks for reviewers

1. Run `npm ci` followed by `npm run dev`.
2. Open the displayed localhost URL.
3. Navigate Home → Learn → Practice → Progress → Profile.
4. Resize to approximately 390 px wide and use the menu button.
5. Confirm focus is visible while tabbing through navigation and buttons.
6. Enable reduced-motion preference at the operating-system/browser level and confirm navigation does
   not rely on motion.
7. Confirm the header says `Local mode` with no `.env.local` present.

No Supabase connectivity test belongs in Phase 1.
