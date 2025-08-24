# High-Level Architecture (HLD)

## Components
1. **Chrome Extension (MV3)**
   - **Popup UI (React + TS + Tailwind)**: Upload documents, run OCR, preview extracted fields, map to page inputs, and trigger autofill.
   - **Content Script**: Scans the active page, discovers form fields, labels, and constraints, and exposes a structured schema.
   - **Service Worker**: Mediates messaging, token storage, and background tasks (e.g., template sync).

2. **Auth Service (Spring Boot + JWT)**
   - Endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`.
   - Issues short-lived **access tokens** and longer-lived **refresh tokens** (signed with RSA).

3. **API Service (Node + Express + Prisma + MongoDB)**
   - Stores **templates** (field definitions per site), **mappings** (document field → site field), and **audit logs**.
   - Validates payloads using **Zod** and applies server-side safeguards.
   - Exposes endpoints to save and fetch mappings, templates, and usage logs.

## Data Flow
- User logs in via popup → obtains JWTs from **auth-service** → stores in `chrome.storage.session`.
- User uploads PDF/image → **popup** runs OCR (Tesseract) → normalizes using ML-lite heuristics + regex.
- **Content script** analyzes form DOM → returns candidate fields and metadata.
- **Popup** aligns document fields ↔ page fields (suggestions) → user approves → **content script** fills DOM.
- Optional: mappings/templates synced to **server** for future reuse.

## Security & Privacy
- Tokens in `chrome.storage.session` (ephemeral) + refresh in `chrome.storage.local` (encrypted at-rest, opt-in).
- No document leaves the device by default; server sync is opt-in per document or field.
- CSP hardened in MV3; no remote code; Tesseract wasm shipped locally.
