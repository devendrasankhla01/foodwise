# Demo walkthrough

## Primary journey

1. Sign in as Institution. Show the overview, synthetic POS source and inventory alerts.
2. Demand forecast: choose tomorrow and Lunch; generate. Explain the per-item forecast and configurable buffer. Model MAE and baseline MAE are measured on a chronological holdout of synthetic data.
3. Add a confirmed school visit for 80 guests on the same date/meal. Regenerate: total predicted demand increases by exactly 80; portions are allocated according to item demand shares. The adjustment is explicit planning context.
4. Production planning: enter prepared and consumed servings. This is distinct from POS transactions and actual customer counts.
5. Surplus food: add Veg Thali, 40 servings, recorded preparation/detection times, a future availability limit, hot-held storage at the demo temperature, sealed packaging and checked handling declaration.
6. Open its journey. Upload a clear image. The actual ONNX model returns candidate object labels/confidence and a conservative limitation. Record your visual/handling review before matching. The image cannot certify safety.
7. Find recipient matches. Explain dietary/capacity/availability/remaining-window filters and weighted ranking. Send an offer to Annapurna Community Kitchen.
8. Sign out and sign in as Recipient. Open Food offers, accept with Need delivery. The delivery verification code belongs to the recipient; the pickup code belongs to the institution.
9. Sign out and sign in as Logistics. Accept the delivery, mark arrival. Ask the institution demo account for its pickup code and confirm pickup. Start transit. Ask the recipient demo account for its delivery code and confirm delivery. Codes are never shown in the logistics API.
10. Sign in as Recipient. Confirm actual received quantity. A late arrival requires an explicit review checkbox. Only now is the redistribution completed and counted in impact.
11. Sign in as Admin. Inspect Redistributions, Audit trail and Analytics. Generate an ESG PDF for a period containing the journey.

## Self pickup

Recipient Settings → enable self-pickup capability. Accept an eligible offer using Self pickup. Read the collection code from the institution account, then enter it when confirming receipt as Recipient. No unnecessary logistics task is created.

## After-hours scenario

Institution → Surplus food → After-hours case. This explicitly labeled demo scenario marks normal recipients as having declined for this record. It does not silently change the clock or disable the network. Find matches: only verified Night Shelter Alpha qualifies. Send the offer and use `night@foodwise.demo` to accept. Complete the same logistics steps. The after-hours flag is retained throughout the timeline and analytics.

## Recovery scenario

Institution → Surplus food → Recovery case. The declared window is ten minutes, shorter than the demo's minimum. Matching produces no candidates. Route to Recovery with a reason. Recovery page → confirm handover → complete. Recovered quantity increases while redistributed quantity remains unchanged.

## Useful edge cases

- Unavailable, wrong-dietary and insufficient-capacity recipients exist in the seed.
- Short or expired windows block matching and acceptance.
- Duplicate acceptance/claim or out-of-order delivery changes return conflicts.
- A wrong verification code leaves the state unchanged.
- No AI service: forecasting/vision show unavailable; other pages still operate.
- CSV duplicates are skipped; invalid rows have numbered errors.

All addresses/distances, historical records and logistics operations are demonstration data. No actual food dispatch or external message occurs.
