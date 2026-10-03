# Repository agent rules

## Theme ownership

- This repository is the source of truth for the in-development **Bluum Verified** theme. Keep its code, assets, build metadata, and commit history here.
- Do not copy this theme into the built-in Medusa storefront as a way to develop or publish it. The Medusa project may connect to and sync this repository as a theme source.

## Activation safety

- Theme development events are never publication events. Syncing from GitHub, pushing commits, deploying this repository or the Medusa repository, creating or updating a build, previewing, testing, auditing, or taking screenshots must leave the live active storefront theme unchanged.
- Never activate this theme through code, an API call, a database update, a seed or migration, a script or CLI command, browser query parameters, an automated deployment, or any other non-UI path.
- The only permitted activation event is a separate, explicit **Activate** action in **Medusa Admin → Online Store → Themes**, followed by the UI confirmation. Do this only when the user explicitly asks to activate or publish this theme; requests to implement, sync, push, deploy, preview, test, or make the theme ready do not authorize activation.
- Until that explicit UI publication occurs, keep the built-in **Bluum** theme (`current`) active and use the Medusa Admin **Preview** action to review Bluum Verified without affecting customers.

## Responsive acceptance rule

- Every UI update must work on desktop, mobile phones, tablets, and iPads. Do not treat a desktop-only fix as complete.
- Verify the affected UI in a working local preview at representative phone widths (360, 390, 430px), tablet/iPad portrait widths (768, 820, 1024px), iPad landscape (1180px), and desktop (1280, 1440, 1920px). Include widths immediately below and above any changed breakpoint.
- Check alignment, overflow, touch targets, menu behavior, and portrait/landscape transitions. Keep unaffected layouts and the active theme unchanged.
- Clearly distinguish browser viewport emulation from testing on physical devices. Report any unavailable verification rather than claiming it passed.
