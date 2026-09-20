# Validation record

Verified on 20 September 2026 in the build environment.

## Passed

- Frontend TypeScript check and production Vite build.
- Backend TypeScript production build.
- Six domain tests covering eligibility, after-hours fallback, uncertain/contaminated handling, full verified handover, expired/cross-organization requests, malformed CSV dates and duplicate imports.
- Integration harness: 42 HTTP assertions against isolated API and AI services.
- Five account logins (four main roles plus an after-hours recipient).
- Unauthenticated requests and recipient access to admin routes rejected.
- Surplus creation validation and computed recipient matching.
- Duplicate acceptance/claim and invalid state transitions rejected.
- Pickup/delivery codes scoped to the institution/recipient rather than the logistics partner.
- Full delivery followed by recipient confirmation and updated accounting.
- After-hours recipient selection and separate recovery accounting.
- Real Random Forest/baseline forecasting; a confirmed 80-person event adds exactly 80 servings across item predictions.
- Real ONNX image inference, expected model checksum and top-five output. Test input was a generated solid-color image to check execution, not food-classification accuracy.
- Real PDF download with embedded font; rendered report visually inspected for layout and legibility.
- Browser: institution demo login, overview rendering, surplus form and a successful saved surplus record.

## Not verified / limitations

- Live MongoDB Atlas connection: no URI supplied. Repository implementation has not been run against a live cluster.
- Vercel/Render publication: no provider account deployment performed.
- Exhaustive four-role browser QA and mobile viewport testing were not completed. Automatic approval review rejected further browser inspection because its usage limit was reached. API checks continued independently; no alternate browser-control route was used.
- Forecasting/vision were tested through their actual Python service. The managed browser preview did not have access to that Python environment, so its AI routes correctly reported unavailable.
- Model output accuracy on real food, freshness detection, regulatory food-safety compliance, environmental-factor validity and operational pilot results are not claimed.

Run commands and scenario instructions are in README.md and DEMO_FLOW.md. Tests use a disposable isolated store; their data is not part of the shipped starting workspace.
