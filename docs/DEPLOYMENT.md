# Vercel + Render deployment

The project has not been deployed to an external account. You own Atlas creation and provider configuration.

## 1. Atlas

Follow the detailed README steps. Keep a dedicated `foodwise` database for the demo. Add Render's displayed outbound IP ranges to the Atlas access list. Do not put the URI into Vercel frontend variables.

## 2. Render AI web service

Connect a Git repository containing the complete source. Select **New → Web Service**.

| Setting | Value |
|---|---|
| Root directory | `ai-service` |
| Runtime | Python |
| Python version | 3.12.x |
| Build command | `pip install -r requirements.txt && python download_model.py` |
| Start command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Health check | `/health` |
| `AI_SERVICE_TOKEN` | A new long random secret shared only with the Node API |
| `CV_MODEL_PATH` | `models/squeezenet.onnx` |

The model is CPU-only. Use a service plan with sufficient memory for NumPy, scikit-learn and ONNX Runtime; availability and limits vary by current plan. The model download verifies its checksum. No GPU is required. The general model is not a scientifically validated freshness detector.

Save the resulting AI service base URL. Protected inference routes require the private service header. Do not give the service token to the frontend.

## 3. Render Node API web service

Create another Web Service from the same repository.

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Runtime | Node |
| Node version | 22 or 24 LTS |
| Build command | `npm ci --include=dev && npm run build` |
| Start command | `npm start` |
| Health check | `/health` |
| `MONGODB_URI` | Your Atlas URI with `/foodwise` |
| `JWT_SECRET` | A separately generated random secret, at least 32 characters |
| `FRONTEND_URL` | Exact Vercel frontend origin; comma-separated allowlist if needed |
| `AI_SERVICE_URL` | Render AI base URL, with no trailing slash |
| `AI_SERVICE_TOKEN` | Same private token as the AI service |
| `DEMO_MODE` | `true` for the seeded hackathon demonstration |
| `WHATSAPP_ENABLED` | `false` |

`PORT` is supplied by Render. Never use local JSON storage as your persistent hosted database. Do not include local `.env` files in Git. All accounts in the demo use publicly documented demo passwords; use synthetic data only. Production onboarding is outside this version; setting `DEMO_MODE=false` requires pre-provisioned private accounts and does not by itself turn this prototype into a production system.

If the database has no FoodWise workspace, demo initialization runs once on first successful connection. To explicitly reset existing demo data from your local backend using the same Atlas URI, run `npm run seed -- --reset-demo` with `DEMO_MODE=true`. This replaces only the FoodWise workspace record.

Check `/health` for `MongoDB connected`. A wrong configured URI must fail startup rather than silently switching storage.

## 4. Vercel frontend

Import the repository into Vercel.

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | `frontend` |
| Install | `npm ci` |
| Build | `npm run build` |
| Output directory | `dist` |
| `VITE_API_BASE_URL` | `https://YOUR-NODE-SERVICE.onrender.com/api` |

`frontend/vercel.json` rewrites application paths to `index.html`. After deployment, set the exact frontend origin in the Node service's `FRONTEND_URL`. Redeploy the frontend after changing Vite variables: they are embedded at build time.

## Verification

1. Open the Vercel login page and enter a demo account.
2. Open Inventory and save an item; refresh to verify persistence.
3. Generate a forecast; inspect model evaluation.
4. Add surplus, upload an image and record the required human review.
5. Complete institution → recipient → logistics → recipient handover.
6. Generate a PDF and review the reporting period and assumptions.
7. Refresh a nested URL such as `/inventory` to verify SPA routing.
8. Open Admin → Integration status. POS/Tally/IoT/logistics labels must remain truthful.

Cold service starts may delay first requests. The API uses a 60-second inference timeout; retry once after the AI health endpoint becomes healthy. Other API operations stay independent of AI availability. An unavailable model returns a visible error rather than a fabricated result.

References: [Render Express deployment](https://render.com/docs/deploy-node-express-app), [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Atlas connection prerequisites](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).
