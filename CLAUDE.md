# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## PROJECT IDENTITY

**Project Type**: Static Policy Document Generator
**Primary Goal**: Generate customizable startup policy documents (Privacy Policy, Terms of Service, AI Use Disclosure, Cookie Policy, Data Retention Checklist) for GDPR/privacy compliance
**Target Users**: Startups and small businesses needing legal policy templates

## TECH STACK

- **Framework**: React 18 + Vite (single-file build)
- **Language**: JavaScript (ES6+, JSX)
- **Build Tool**: Vite with `vite-plugin-singlefile` for standalone distribution
- **Styling**: Inline styles (no external CSS framework)
- **Dependencies**: JSZip (archive generation), file-saver (download handling)
- **Deployment**: Static HTML file (can be opened locally via `file://`)

---

## CRITICAL: SINGLE-FILE BUILD ARCHITECTURE

This project uses a **unique single-file architecture** where the entire application is bundled into a single `dist/index.html` file that works offline without a server.

### Key Architectural Constraints

1. **No External File Fetching**: All resources (templates, assets) MUST be inlined at build time
   - Templates are imported with `?raw` suffix: `import template from './file.md?raw'`
   - Never use `fetch()` for local files (won't work on `file://` protocol)

2. **Vite Configuration** (`vite.config.js`):
   - Uses `vite-plugin-singlefile` to inline all JS/CSS into HTML
   - `base: './'` ensures relative paths work on `file://`
   - `assetsInlineLimit: 100000000` forces all assets to be inlined

3. **Template System**:
   - Markdown templates in `generator-react/src/templates/*.md` contain placeholders like `[COMPANY_NAME]`
   - `fill(template, map)` function (App.jsx:51) performs string replacement
   - Templates are embedded as raw strings at compile time

### Distribution Model

- **Development**: `generator-react/` (editable source)
- **Production**: `generator-react/dist/index.html` (single self-contained file)
- **Deliverables**: `deliverables/` contains packaged versions for customers

---

## PROJECT STRUCTURE

```
policy-pack/
├── templates/                      # Original markdown templates (source of truth)
│   ├── privacy-policy.md
│   ├── terms-of-service.md
│   ├── ai-use-disclosure.md
│   ├── cookie-policy.md
│   └── retention-security-checklist.md
├── generator-react/                # React generator application
│   ├── src/
│   │   ├── App.jsx                 # Main component with form + ZIP generation
│   │   ├── main.jsx                # Entry point
│   │   ├── templates/              # Templates copied here for bundling
│   │   │   └── *.md                # Imported with ?raw suffix
│   │   └── index.css               # Global styles
│   ├── dist/                       # Built single-file output
│   │   └── index.html              # Self-contained app (distribute this)
│   ├── vite.config.js              # Single-file build configuration
│   └── package.json
└── deliverables/                   # Packaged versions for customers
    └── Startup-Policy-Pack-v1/
        ├── templates/              # Standalone templates
        └── generator/
            └── dist/index.html     # Standalone generator
```

---

## COMMANDS

### Development (inside `generator-react/`)

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Build single-file dist/index.html for distribution
npm run preview   # Preview the built dist/index.html locally
npm run clean     # Remove dist/ folder
```

### Testing the Single-File Build

1. Run `npm run build` in `generator-react/`
2. Open `generator-react/dist/index.html` directly in browser
3. Verify all templates load and ZIP generation works offline

---

## CODING STANDARDS

### React Patterns

- Use functional components with hooks (no class components)
- Keep all logic in `App.jsx` (single-component design)
- Inline styles only (no external CSS dependencies)
- Use `const` for all declarations

### Template Editing

When modifying templates:

1. **Edit the source templates** in `templates/*.md` first
2. **Copy changes to** `generator-react/src/templates/*.md`
3. **Update DEFAULTS** in `App.jsx` if adding new placeholders
4. **Test template replacement** by generating a ZIP

### Placeholder Convention

- Format: `[PLACEHOLDER_NAME]` in templates
- Must exist in `DEFAULTS` object (App.jsx:12)
- Use `SCREAMING_SNAKE_CASE` for consistency
- Replace ALL occurrences globally (regex flag: `/\\[${k}\\]/g`)

### Adding New Templates

```javascript
// 1. Add to imports (App.jsx:5-10)
import newTemplate from "./templates/new-template.md?raw";

// 2. Add placeholders to DEFAULTS (App.jsx:12)
NEW_FIELD: "default value",

// 3. Add to files array (App.jsx:66)
["new-template.md", newTemplate],

// 4. Add form fields to render (App.jsx:109+)
<Field name="NEW_FIELD" label="New Field" />
```

---

## DEPLOYMENT WORKFLOW

### Creating a Deliverable Package

1. Update templates in `templates/*.md`
2. Copy to `generator-react/src/templates/*.md`
3. Run `npm run build` in `generator-react/`
4. Copy `dist/index.html` to `deliverables/[version]/generator/dist/`
5. Copy `templates/*.md` to `deliverables/[version]/templates/`
6. Create ZIP for customer distribution

### Important Build Notes

- The `dist/index.html` must be **completely self-contained**
- Test by opening directly from filesystem (no server)
- File size will be ~200-500KB due to inlined JSZip library
- No internet connection required for customer use

---

## PLACEHOLDER REFERENCE

### Required Fields (No Defaults)
- `COMPANY_NAME`: Legal entity name
- `PRODUCT_NAME`: Application/service name
- `WEBSITE_URL`: Primary domain
- `CONTACT_EMAIL`: General contact
- `COMPANY_ADDRESS`: Physical address
- `SECURITY_CONTACT_EMAIL`: Security issues

### Optional Fields (Have Defaults)
- `DPO_NAME`, `DPO_EMAIL`: Data Protection Officer
- `PAYMENT_PROCESSOR`: Payment service (default: "Stripe")
- `PROCESSORS_URL`: Subprocessors list URL
- `RETENTION_SUMMARY`: Data retention period
- `SUPERVISORY_AUTHORITY_NAME`: GDPR authority (default: Swedish IMY)
- `SUPERVISORY_AUTHORITY_URL`: Authority website
- `GOVERNING_LAW`: Jurisdiction (default: "Sweden")
- `VENUE`: Legal venue (default: "Stockholm, Sweden")
- `AI_USE_AREAS`, `AI_PROVIDERS`: AI disclosure details
- `ANALYTICS_TOOL`: Analytics service (default: "Plausible")
- `COOKIE_RETENTION`: Cookie lifetime
- `LAST_UPDATED`: Auto-set to current date

Full list in `App.jsx:12-49`.

---

## LEGAL DISCLAIMER

This project generates **informational templates only** and does not constitute legal advice. Always include disclaimer:

```
**Informational only — not legal advice.**
```

When modifying templates:
- Maintain GDPR/privacy law accuracy
- Preserve all disclosure requirements
- Keep language clear and user-friendly
- Test all placeholder replacements
- Verify no legal requirements are weakened

---

## COMMON DEVELOPMENT TASKS

### Updating Default Values

Edit `DEFAULTS` object in `App.jsx:12-49` to change pre-filled values.

### Fixing Template Rendering Issues

1. Check import uses `?raw` suffix
2. Verify placeholder format: `[NAME]` (square brackets)
3. Confirm placeholder exists in `DEFAULTS`
4. Test `fill()` function with console.log

### Build Not Working Offline

1. Verify `vite-plugin-singlefile` is in `package.json`
2. Check `base: './'` in `vite.config.js`
3. Ensure no `fetch()` calls in code
4. Confirm assets are under `assetsInlineLimit`

---

## PRIORITY ORDER

1. **Legal Accuracy**: Templates must remain legally sound
2. **Offline Functionality**: Must work without internet/server
3. **User Experience**: Simple form → generate ZIP workflow
4. **Template Completeness**: Cover core GDPR/privacy requirements
