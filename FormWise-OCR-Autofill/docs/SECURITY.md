# Security

- **Least privilege** extension permissions: `storage`, `scripting`, `activeTab`.
- **No remote scripts**. Tesseract wasm bundled locally under `/vendor/`.
- **JWT**: RS256, 15m access, 7d refresh.
- **Data minimization**: local-first OCR; server sync opt-in.
- **Input validation**: Zod (client), Prisma validations (server).
- **SAST**: `npm run lint` + `npm audit`; Dependabot ready.
