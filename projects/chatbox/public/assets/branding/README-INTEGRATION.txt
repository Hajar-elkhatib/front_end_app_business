# VentureLens Brand Assets

Brand name: VentureLens  
Tagline: Validate your idea. Understand your risks. Move forward.

## Files to place in Angular

Recommended destination after checking `angular.json`:

`projects/chatbox/src/assets/branding/`

Copy:
- `venturelens-logo-light.svg` — full logo with tagline for light backgrounds
- `venturelens-logo-dark.svg` — full logo with tagline for dark backgrounds
- `venturelens-logo-compact-light.svg` — sidebar/header logo on light backgrounds
- `venturelens-logo-compact-dark.svg` — sidebar/header logo on dark backgrounds
- `venturelens-icon.svg` — icon-only version for collapsed sidebar
- `venturelens-favicon.svg` or `favicon.ico` — browser tab icon
- `venturelens-app-icon-192.png` and `venturelens-app-icon-512.png` — app/PWA icons if needed

## File to place in Spring Boot for PDF

Recommended destination:

`src/main/resources/branding/venturelens-logo-light.png`

Use:
- `venturelens-logo-light.png` — PDF header logo on white background.

## Integration rule

Replace visible platform branding `NexusAI` with `VentureLens`.
Do not rename user-created project data in MongoDB, API endpoints, Java class names, model files, or Git repository folders.
