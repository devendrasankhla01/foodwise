# API summary

Base `/api`. JSON unless a multipart upload or file download is specified. Use `Authorization: Bearer <token>` after login. Errors return `{"error":"..."}`; validation 400, missing authentication 401, forbidden 403, absent record 404, state conflicts 409, upload limits 413, unavailable AI 503.

| Endpoint | Operation / roles |
|---|---|
| `POST /auth/login` | Email/password login |
| `GET /auth/config` | Whether demo login helpers are enabled |
| `GET /auth/me` | Current server-authoritative user |
| `GET /workspace` | Role-scoped dashboard records and analytics |
| `GET /records/:kind?page=1&limit=25&q=` | Paginated permitted POS, organizations, surplus, notifications, audit or production |
| `POST /inventory` | Institution adds stock |
| `PATCH /inventory/:id` | Institution updates owned stock |
| `POST /inventory/:id/consume` | Atomically subtract positive stock quantity |
| `POST /events` | Institution event/booking |
| `POST /production` | Actual preparation/consumption |
| `POST /pos/preview` | Multipart `file`; validate and preview CSV |
| `POST /pos/import` | Multipart `file`; import valid rows with duplicate summary |
| `GET /pos/sample` | Download current institution POS sample CSV |
| `POST /forecast` | Date, mealType, buffer, optional override/reason |
| `POST /surplus` | Create handling-context record |
| `GET /surplus/:id/matches` | Weighted matching and exclusion reasons |
| `POST /surplus/:id/vision` | Multipart `file`; real image inference |
| `POST /surplus/:id/action` | Body `{action,payload}`; role/state/ownership enforced |
| `PATCH /profile` | Own organization preferences |
| `PATCH /organizations/:id` | Admin verification/activation |
| `PATCH /settings` | Admin impact and timing assumptions |
| `PATCH /notifications/:id` | Mark own notification read |
| `PATCH /recovery/:id` | scheduled → handed over → completed |
| `GET /sensors` | Explicitly simulated sensor readings |
| `GET /status` | Admin integration status |
| `GET /analytics` | Role-scoped record-derived outcomes |
| `GET /analytics.csv` | Impact CSV |
| `GET /reports.pdf?from=YYYY-MM-DD&to=YYYY-MM-DD` | PDF, optional Admin institutionId |
| `POST /demo/scenario` | Institution; demo-only after-hours or recovery scenario |

Workflow actions: `offer`, `review`, `accept`, `reject`, `claim`, `arrive`, `pickup`, `transit`, `deliver`, `confirm`, `cancel`, `recover`, `dispose`. Codes are visible only to the relevant institution/recipient and never to the logistics partner. Reporting counts completed receipt once.

AI service: public `/health`; private-token `POST /forecast` and `POST /vision`. All AI requests originate from Node. No model service token is sent to the browser.
