# Low-Level Design (LLD)

## Extension
### Key Modules
- `src/content/fieldScanner.ts`
  - Walks DOM, pairs `<label>` with inputs using `for` and proximity.
  - Extracts constraints: `required`, `pattern`, `maxlength`, `type`.
  - Scores fields for confidence; builds a JSON schema.
- `src/popup/ocr.ts`
  - Wraps Tesseract worker. Pre-processing: grayscale, threshold, deskew (via wasm ops).
  - Post-processing: regex normalization for common IDs (Aadhaar, PAN), names, DOB.
- `src/popup/mapping.ts`
  - Zod schemas for doc entities; string cleaning utilities.
  - Fuzzy match (token sort ratio, trigram) to propose field matches.
- `src/popup/autofill.ts`
  - Sends `FillFields` to content script; supports `dryRun` and `preview` modes.
- `src/sw/tokenStore.ts`
  - Manages access/refresh tokens; handles refresh on 401.

### Messaging
```ts
type Message =
  | { kind: "ScanFields" }
  | { kind: "GetFields" }
  | { kind: "FillFields"; pairs: Array<{ fieldId: string; value: string }> }
  | { kind: "Auth.Login"; username: string; password: string }
  | { kind: "Auth.Logout" };
```

## API Service
- **Routes**: `/templates`, `/mappings`, `/logs`
- **Prisma models (MongoDB)**:
```prisma
model Template {
  id      String  @id @default(auto()) @map("_id") @db.ObjectId
  host    String
  name    String
  fields  Json
  createdAt DateTime @default(now())
}
model Mapping {
  id      String  @id @default(auto()) @map("_id") @db.ObjectId
  userId  String
  host    String
  map     Json
  createdAt DateTime @default(now())
}
model AuditLog {
  id      String  @id @default(auto()) @map("_id") @db.ObjectId
  userId  String
  action  String
  meta    Json
  createdAt DateTime @default(now())
}
```

## Auth Service
- Spring Security with stateless filter verifying JWT in `Authorization: Bearer ...`.
- RSA key pair loaded from `classpath:keys/`.
