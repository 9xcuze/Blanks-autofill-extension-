# API Reference

## Auth Service (Spring Boot)
- `POST /auth/register` → { username, password }
- `POST /auth/login` → { username, password } → { accessToken, refreshToken }
- `POST /auth/refresh` → { refreshToken } → { accessToken }

## API Service (Express)
- `GET /health` → 200 OK
- `POST /templates` (auth) → create template
- `GET /templates?host=example.com` (auth) → list
- `POST /mappings` (auth) → upsert mapping
- `GET /mappings?host=example.com` (auth) → get mapping
- `POST /logs` (auth) → audit event

All authenticated routes require header: `Authorization: Bearer <accessToken>`.
