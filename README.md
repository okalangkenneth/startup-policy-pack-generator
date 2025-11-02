# Startup Policy Pack Generator

Generate GDPR-compliant privacy policies, terms of service, and compliance documents in minutes.

![Policy Pack Generator](https://img.shields.io/badge/License-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

## Overview

A professional, single-file web application that helps startups and small businesses generate customized legal policy documents including:

- **Privacy Policy** (GDPR-compliant)
- **Terms of Service**
- **AI Use Disclosure**
- **Cookie Policy**
- **Data Retention & Security Checklist**

## Features

- ✅ **Offline-first**: Works completely offline, no server required
- ✅ **Single-file distribution**: Entire app in one HTML file
- ✅ **Professional design**: Clean, modern UI with responsive layout
- ✅ **Customizable templates**: Easy placeholder-based customization
- ✅ **ZIP export**: Download all policies in one click
- ✅ **GDPR-focused**: Templates designed for European compliance

## Quick Start

### Option 1: Use Pre-built Version (Easiest)

1. Open `generator-react/dist/index.html` directly in your browser
2. Fill in your company details
3. Click "Generate Policy Pack ZIP"
4. Review and publish the generated documents

### Option 2: Run Development Server

```bash
cd generator-react
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Option 3: Build from Source

```bash
cd generator-react
npm install
npm run build
```

The built file will be in `generator-react/dist/index.html`

## Architecture

This project uses a unique **single-file build architecture**:

- Built with React 18 + Vite
- Uses `vite-plugin-singlefile` to inline all assets
- Templates embedded as raw strings at build time
- Works on `file://` protocol without any server
- Perfect for offline distribution

## Project Structure

```
policy-pack/
├── templates/                  # Source markdown templates
├── generator-react/            # React application
│   ├── src/
│   │   ├── App.jsx            # Main application
│   │   ├── templates/         # Templates for bundling
│   │   └── index.css          # Global styles
│   ├── dist/
│   │   └── index.html         # Single-file production build
│   └── package.json
├── CLAUDE.md                   # Development documentation
└── README.md
```

## Customization

### Modifying Templates

1. Edit templates in `templates/*.md`
2. Copy changes to `generator-react/src/templates/*.md`
3. Update `DEFAULTS` object in `App.jsx` if adding new placeholders
4. Rebuild with `npm run build`

### Adding New Fields

See `CLAUDE.md` for detailed instructions on adding new template placeholders and form fields.

## Legal Disclaimer

⚠️ **Important**: This generator creates informational templates only and does not constitute legal advice. Please review all generated documents with qualified legal counsel before publishing.

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Bundling**: vite-plugin-singlefile
- **ZIP Generation**: JSZip
- **File Download**: file-saver

## Development

### Commands

```bash
npm run dev       # Start development server
npm run build     # Build production version
npm run preview   # Preview production build
npm run clean     # Clean dist folder
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Credits

Created by Kenneth Okalang
- GitHub: [@okalangkenneth](https://github.com/okalangkenneth)

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Note**: Templates are designed for informational purposes. Always consult with legal professionals for compliance requirements specific to your jurisdiction and business.
