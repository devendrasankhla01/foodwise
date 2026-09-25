import test from "node:test";
import assert from "node:assert/strict";
import { seedData } from "../src/services/seedData.js";
import {
  matches,
  assess,
  workflow,
  visibleSurplus,
  analytics,
} from "../src/services/domain.js";
import { parseCsv, importCsv } from "../src/services/csv.js";
import type { Actor, Surplus } from "../src/types.js";
const institution: Actor = {
  id: "user-institution",
  name: "Institution",
  role: "INSTITUTION",
  organizationId: "inst-1",
};
const recipient: Actor = {
  id: "user-recipient",
  name: "Recipient",
  role: "RECIPIENT",
  organizationId: "rec-1",
};
const logistics: Actor = {
  id: "user-logistics",
  name: "Logistics",
  role: "LOGISTICS",
  organizationId: "log-1",
};
const item = (): Surplus => ({
  id: "test-food",
  organizationId: "inst-1",
  createdAt: new Date().toISOString(),
  foodName: "Veg meals",
  category: "Cooked meals",
  dietaryType: "Vegetarian",
  quantity: 40,
  unit: "servings",
  servings: 40,
  preparedAt: new Date(Date.now() - 3600000).toISOString(),
  detectedAt: new Date().toISOString(),
  availableUntil: new Date(Date.now() + 7200000).toISOString(),
  storageMethod: "Hot held",
  temperature: 65,
  packagingStatus: "Sealed",
  declaration: true,
  organic: true,
  contaminated: false,
  status: "available",
  assessment: "potentially suitable",
  assessmentReasons: [],
  afterHours: false,
  timeline: [],
});
test("matching excludes unavailable, wrong dietary type, low capacity and short window", async () => {
  const s = await seedData();
  const x = item();
  const m = matches(s, x, 12);
  assert.ok(m.matches.some((r) => r.recipientId === "rec-1"));
  for (const rid of ["rec-3", "rec-4", "rec-5", "rec-6"])
    assert.ok(!m.matches.some((r) => r.recipientId === rid));
  x.availableUntil = new Date(Date.now() + 50000).toISOString();
  assert.equal(matches(s, x).matches.length, 0);
});
test("after-hours fallback runs only after regular eligibility is exhausted", async () => {
  const s = await seedData();
  const x = item();
  x.rejectedRecipientIds = ["rec-1", "rec-2"];
  const m = matches(s, x, 12);
  assert.equal(m.afterHours, true);
  assert.deepEqual(
    m.matches.map((r) => r.recipientId),
    ["rec-3"],
  );
});
test("handling uncertainty and contamination block automated matching", async () => {
  const s = await seedData();
  const x = item();
  x.declaration = false;
  assert.equal(assess(x).status, "manual review");
  assert.equal(matches(s, x).matches.length, 0);
  x.contaminated = true;
  assert.equal(assess(x).status, "not recommended");
});
test("institution-managed delivery to verified receipt; codes are role-scoped", async () => {
  const s = await seedData();
  const x = item();
  s.surplus.unshift(x);
  workflow(s, institution, x.id, "offer", { recipientId: "rec-1" });
  workflow(s, recipient, x.id, "accept", { mode: "delivery" });
  assert.throws(() =>
    workflow(s, recipient, x.id, "accept", { mode: "delivery" }),
  );
  const pickup = x.pickupCode,
    delivery = x.deliveryCode;
  assert.equal(
    visibleSurplus(s, logistics).find((r) => r.id === x.id)?.pickupCode,
    undefined,
  );
  assert.equal(
    visibleSurplus(s, recipient).find((r) => r.id === x.id)?.deliveryCode,
    delivery,
  );
  workflow(s, institution, x.id, "claim", {});
  assert.throws(() =>
    workflow(s, institution, x.id, "deliver", { code: delivery }),
  );
  workflow(s, institution, x.id, "arrive", {});
  assert.throws(() =>
    workflow(s, institution, x.id, "pickup", { code: "000000" }),
  );
  workflow(s, institution, x.id, "pickup", { code: pickup });
  workflow(s, institution, x.id, "transit", {});
  workflow(s, institution, x.id, "deliver", { code: delivery });
  const before = analytics(s, institution).redistributed;
  workflow(s, recipient, x.id, "confirm", { quantity: 38 });
  assert.equal(x.status, "completed");
  assert.ok(analytics(s, institution).redistributed > before);
  assert.throws(() =>
    workflow(s, recipient, x.id, "confirm", { quantity: 38 }),
  );
});
test("expired offers and cross-organization access reject", async () => {
  const s = await seedData();
  const x = item();
  s.surplus.unshift(x);
  workflow(s, institution, x.id, "offer", { recipientId: "rec-1" });
  x.availableUntil = new Date(Date.now() - 1000).toISOString();
  assert.throws(() =>
    workflow(s, recipient, x.id, "accept", { mode: "delivery" }),
  );
  assert.throws(() =>
    workflow(
      s,
      { ...institution, organizationId: "inst-2" },
      x.id,
      "cancel",
      {},
    ),
  );
});
test("CSV invalid calendar dates, missing fields and duplicates", async () => {
  assert.throws(() => parseCsv("date,itemName\n2026-01-01,Rice"));
  const text =
    "transactionId,date,itemName,quantitySold,mealType,unitPrice\nT1,2026-01-02,Rice,4,Lunch,10\nT1,2026-01-02,Rice,4,Lunch,10\nT2,2026-02-31,Rice,4,Lunch,10";
  const s = await seedData();
  const result = importCsv(s, institution, text, "test.csv");
  assert.equal(result.imported, 1);
  assert.equal(result.duplicates, 1);
  assert.equal(result.errors.length, 1);
});

test("delivery management rejects unrelated institutions, recipients and legacy logistics", async () => {
  const s = await seedData();
  const x = item();
  s.surplus.unshift(x);
  workflow(s, institution, x.id, "offer", { recipientId: "rec-1" });
  workflow(s, recipient, x.id, "accept", { mode: "delivery" });
  for (const actor of [
    recipient,
    logistics,
    { ...institution, organizationId: "inst-2" },
  ])
    assert.throws(() => workflow(s, actor, x.id, "claim", {}));
  const admin: Actor = {
    id: "user-admin",
    role: "ADMIN",
    organizationId: "admin",
    name: "Admin",
  };
  workflow(s, admin, x.id, "claim", {});
  assert.equal(x.status, "assigned");
  assert.equal(
    visibleSurplus(s, admin).find((r) => r.id === x.id)?.pickupCode,
    x.pickupCode,
  );
});
test("self pickup remains recipient-confirmed and requires source code", async () => {
  const s = await seedData();
  s.organizations.find((o) => o.id === "rec-1")!.pickup = true;
  const x = item();
  s.surplus.unshift(x);
  workflow(s, institution, x.id, "offer", { recipientId: "rec-1" });
  workflow(s, recipient, x.id, "accept", { mode: "self" });
  assert.throws(() =>
    workflow(s, recipient, x.id, "confirm", { quantity: 40, code: "wrong" }),
  );
  workflow(s, recipient, x.id, "confirm", { quantity: 40, code: x.pickupCode });
  assert.equal(x.status, "completed");
});
test("recovery remains separate from redistribution impact", async () => {
  const s = await seedData();
  const x = item();
  s.surplus.unshift(x);
  const before = analytics(s, institution);
  workflow(s, institution, x.id, "recover", {
    reason: "Unavoidable preparation surplus",
  });
  assert.equal(analytics(s, institution).recovered, before.recovered);
  s.recovery[0].status = "completed";
  assert.equal(analytics(s, institution).recovered, before.recovered + 16);
  assert.equal(analytics(s, institution).redistributed, before.redistributed);
});
