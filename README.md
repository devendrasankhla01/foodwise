# FoodWise

A runnable food-management hackathon prototype by **Team Anvay — Connected to Create**, for SIH problem statement 26234.

**Prevent → Redistribute → Recover → Dispose**

## What is included

- React / Vite / TypeScript / Tailwind light dashboard with Radix controls, Lucide icons and Recharts.
- Four role-scoped workspaces: Institution, Recipient, Logistics Partner and Admin.
- Express / TypeScript API, bcrypt password hashing, JWT sessions, validation, role and ownership checks.
- Persistent local JSON demo storage and an optional Mongoose/MongoDB Atlas repository.
- 210 days × 5 items of synthetic daily POS aggregates, CSV preview, row validation and duplicate handling.
- Actual per-item Random Forest forecasting, chronological holdout, rolling baseline comparison and event-adjusted planning.
- Inventory, production entries, event booking, surplus, recipient requirements and weighted matching.
- Recipient acceptance/rejection, self-pickup or delivery, pickup and delivery codes, final recipient confirmation.
- After-Hours Surplus Redistribution Network, organic recovery, final disposal, audit trail and in-app notifications.
- Genuine CPU ONNX image classification using pretrained SqueezeNet. No random image results and no freshness claim.
- Simulated IoT, processing insights, route presentation and recovery destinations, explicitly labeled.
- Record-derived analytics, configurable illustrative impact factors, CSV export and real PDF reports.

## Start locally on Windows (PowerShell)

Install Node.js 22 or 24 LTS and Python 3.12. Extract this entire folder; do not open index.html directly.

In a terminal inside `foodwise`:

```powershell
npm run install:all
node scripts/setup.mjs
python -m venv ai-service/.venv
ai-service\.venv\Scripts\python.exe -m pip install -r ai-service/requirements.txt
cd ai-service
.venv\Scripts\python.exe download_model.py
cd ..
npm run build
npm run dev
```

Open **http://localhost:4173**. `npm run dev` starts all three services. Stop them with Ctrl+C. Model download is about 5 MB, while Python inference dependencies require additional space. The script verifies the model's known SHA-256. No paid AI API is required.

On macOS/Linux replace the two `.venv\Scripts\python.exe` commands with `ai-service/.venv/bin/python` (from root) and `.venv/bin/python` (inside ai-service). Use `python3 -m venv` if `python` is unavailable.

For three separate terminals instead:

```text
# Terminal 1, foodwise/backend
npm run build
npm start

# Terminal 2, foodwise/ai-service (Windows)
.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001

# Terminal 3, foodwise/frontend
npm run dev
```

For backend hot reload use `npm run dev` inside backend. In restricted environments that disallow the tsx watch socket, use `npm run build` then `npm start`.

| Service | Local address |
|---|---|
| Frontend | http://localhost:4173 |
| API | http://localhost:8000/api |
| API health | http://localhost:8000/health |
| AI service | http://localhost:8001 |
| AI health | http://localhost:8001/health |

## Demo accounts — DEMO ONLY

The common demo password is **FoodWise@2026**.

| Role | Email |
|---|---|
| Institution | institution@foodwise.demo |
| Recipient | recipient@foodwise.demo |
| Logistics Partner | logistics@foodwise.demo |
| Admin | admin@foodwise.demo |
| After-hours recipient | night@foodwise.demo |

Use separate browser profiles or sign out between roles. Session tokens use sessionStorage, so separate tabs can carry separate sessions. Demo shortcuts perform ordinary password login. They never change an authenticated user's role.

**Do not put private or operationally sensitive data into these publicly documented demo accounts.** Deploy with demo data for demonstrations. Production onboarding and private user provisioning are not implemented in this version.

## Connect MongoDB Atlas yourself

No Atlas account, cluster, user or credentials have been created on your behalf.

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create/select a project.
2. Create an available cluster suitable for your prototype. Review current plan terms in Atlas.
3. Under Database Access, create a **database user** (separate from your Atlas login). Use a strong password and grant read/write access only to the `foodwise` database.
4. Under Network Access, allow your current public IP for local development. For Render, allow the outbound IP addresses/ranges listed for your service. Prefer explicit allowlisting; do not leave unrestricted access as a routine production configuration.
5. Click Connect → Drivers → Node.js and copy the `mongodb+srv` URI.
6. Replace the username, password and cluster placeholders. Percent-encode special characters in the password. Include `/foodwise` before the query string.
7. Put the result in **backend/.env** only:

```dotenv
MONGODB_URI=mongodb+srv://YOUR_DB_USER:YOUR_ENCODED_PASSWORD@YOUR_CLUSTER/foodwise?retryWrites=true&w=majority
DEMO_MODE=true
```

8. Restart the backend. If the workspace is new, demo mode initializes it once. Existing workspace data is not automatically overwritten.
9. For an explicit reset of this demo workspace, from `backend` run:

```powershell
npm run seed -- --reset-demo
```

This requires `DEMO_MODE=true` and replaces the single FoodWise demo workspace. It does not drop the database or unrelated collections. Do not run it against a workspace you wish to keep.
10. Check `/health`: database should say **MongoDB connected**. Test login and create an inventory record, then restart and confirm it remains.
11. Atlas Data Explorer will show `foodwise.workspaces`, created by Mongoose automatically. You do not need to manually create collections.
12. Add the same URI to the Render API service's `MONGODB_URI` variable. Restart/redeploy and verify `/health` and login.

### Repository design and limits

This prototype uses **one versioned workspace document**, containing typed domain arrays, rather than many normalized collections. A compare-and-swap revision update makes each workflow mutation atomic, including exclusive acceptance and delivery claiming. Local demo mode uses a serialized queue and atomic JSON-file replacement. It is real persistence, not React-only state.

This intentionally bounded design is **not a multi-tenant production database architecture**. Imports are capped at 15,000 total POS records and Mongo writes at 12 MB. Larger deployments need per-domain collections, indexes, pagination queries and Mongo transactions. Local JSON mode supports a single API process and is not durable on ephemeral hosting disks. **Use Atlas on Render.** The Atlas adapter is implemented but was not exercised against a live Atlas account during this build because credentials were not supplied.

### Connection troubleshooting

- Authentication failed: use the database user's credentials, not your Atlas account password; check percent encoding and database permissions.
- Timeout / cannot connect: check your IP access list, Render outbound IPs, firewall and cluster availability.
- Malformed URI: replace every placeholder, avoid extra quotes/whitespace and keep the database name before `?`.
- Access denied: grant the database user read/write permission to `foodwise`.
- With a non-empty bad URI the application fails startup; it never silently switches to demo storage.

Atlas prerequisite reference: [Connect to an Atlas cluster](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).

## Deploy to your chosen providers

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). The frontend targets **Vercel**, the Node and Python services target **Render**. No services have been published to your accounts.

## Demo walkthrough

See [docs/DEMO_FLOW.md](docs/DEMO_FLOW.md). The main path is institution → recipient → logistics → recipient confirmation → admin report. The supplied alternate-recipient and short-window scenarios exercise after-hours matching and recovery.

## Tests

```powershell
npm test
npm run build
```

The additional integration harness launches its own isolated API and AI services and uses a temporary demo store:

```powershell
python scripts/integration_test.py
```

It exercises authentication, role protection, validation, matching, duplicate acceptance/claim rejection, code verification, full delivery, after-hours matching, recovery accounting, actual forecasting, event changes, actual ONNX inference and PDF generation. It uses ports 18000/18001. It does not write to your normal demo store.

## Honest boundaries

- Computer vision is a **general ImageNet object classifier**. It may misidentify local dishes, especially mixed meals, and does not detect spoilage or certify freshness. Brightness/contrast checks only assess image quality. Human handling review is required after uploading an image.
- The forecasting model is fit reproducibly on request from the requesting institution's eligible history. Predictions and evaluation metadata are saved. It is not online learning; future work can introduce periodic scheduled training.
- Events add an explicit proportional demand adjustment; surprise visits without context are not predictable.
- Demo storage rules (e.g., hot-holding/refrigeration thresholds) are configurable decision support, not regulatory compliance certification.
- Reporting combines quantities only via explicit kg/grams/serving conversions. Liter/packet items need declared serving equivalents. Environmental and monetary factors are illustrative, editable, and not audited.
- Photos are processed transiently; results persist, original uploaded photos do not. A thumbnail lasts for the current open detail panel only. Add authenticated object storage for permanent images.
- In-app notifications work. WhatsApp payload preparation is implemented; outbound WhatsApp delivery, templates, webhooks and consent management are not connected.
- POS CSV ingestion works; automatic POS/Tally synchronization remains future work.
- IoT values, processing data, route distances, logistics provider network and recovery partners are simulated.
- Registration, password recovery, multi-workspace production onboarding, permanent photo storage, split allocations and automatic offer retries are not implemented. There are no live commercial partnerships.
- Operating hours are explicitly stored and edited in UTC. Displayed event timestamps use the browser locale; event dates are calendar dates. Organization time-zone scheduling should be added before a real pilot.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/AI_MODEL.md](docs/AI_MODEL.md), [docs/API.md](docs/API.md) and [docs/VALIDATION.md](docs/VALIDATION.md).
