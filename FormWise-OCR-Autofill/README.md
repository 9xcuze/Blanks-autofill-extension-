# FormWise OCR Autofill Version 1.01

A modern, open-source Chrome Extension that scans web forms, extracts data from user-uploaded documents via OCR, and generates robust autofill suggestions. It comes with:
- **Chrome Extension (MV3)** using React + TypeScript + Tailwind for a clean, trustworthy UI.
- **API Service (Node.js + Express + Prisma + MongoDB)** for templates, mappings, and audit logs.
- **Auth Service (Spring Boot + JWT)** for secure login/refresh and token validation.
- **End-to-end docs**: Architecture (HLD), Design (LLD), API, Security, Contribution, and Extension usage.

> Monorepo layout:
```
FormWise-OCR-Autofill/
  extension/           # Chrome extension (MV3)
  server/              # Node.js API (Express + Prisma + MongoDB)
  auth-service/        # Spring Boot JWT microservice
  docs/                # HLD, LLD, guides
  .github/workflows/   # CI pipeline
  docker-compose.yml   # One command dev stack
```

## Quick Start (Dev)
1. **Auth Service**: `cd auth-service && ./mvnw spring-boot:run`
2. **API Service**: `cd server && npm i && npx prisma generate && npm run dev`
3. **Extension**:
   - `cd extension && npm i`
   - `npm run dev` (builds into `dist/`)
   - Load `dist` as an unpacked extension in Chrome.
4. Configure `.env` files (see each service's README).

---

## Why this project?
Forms often request the same details across portals. **FormWise** extracts these from trusted documents (Aadhaar, PAN, license, transcripts, etc.), validates with schemas, and auto-suggests fields you approve to fill. Your data stays under your control.
