import { randomUUID, randomInt } from "node:crypto";
import type { Actor, Organization, State, Surplus, Row } from "../types.js";
export const id = () => randomUUID();
export const now = () => new Date().toISOString();
export function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}
export function audit(s: State, a: Actor, action: string, entityId: string) {
  s.audit.unshift({
    id: id(),
    organizationId: a.organizationId,
    createdAt: now(),
    actor: a.name,
    role: a.role,
    action,
    entityId,
  });
}
export function notify(
  s: State,
  org: string,
  title: string,
  message: string,
  path = "/redistribution",
) {
  s.notifications.unshift({
    id: id(),
    organizationId: org,
    createdAt: now(),
    title,
    message,
    path,
    read: false,
    channel: "in-app",
    whatsapp: "Not configured / adapter ready",
  });
}
export function owned(s: State, a: Actor, surplusId: string) {
  const x = s.surplus.find((r) => r.id === surplusId);
  if (!x) fail("Record not found", 404);
  if (
    a.role !== "ADMIN" &&
    x.organizationId !== a.organizationId &&
    x.recipientId !== a.organizationId &&
    x.partnerId !== a.organizationId &&
    !(a.role === "LOGISTICS" && x.status === "delivery requested")
  )
    fail("Access denied", 403);
  return x;
}
export function assess(x: Surplus, minutes = 30) {
  const reasons: string[] = [];
  let status = "potentially suitable";
  if (new Date(x.availableUntil).getTime() - Date.now() < minutes * 60000) {
    status = "not recommended";
    reasons.push("Insufficient remaining redistribution window.");
  }
  if (x.contaminated) {
    status = "not recommended";
    reasons.push("Contamination concern declared.");
  }
  if (
    !x.declaration ||
    x.packagingStatus !== "Sealed" ||
    x.temperature === null
  ) {
    if (status !== "not recommended") status = "manual review";
    reasons.push(
      "Handling declaration, sealed packaging and temperature record require review.",
    );
  }
  if (!["Hot held", "Refrigerated", "Shelf stable"].includes(x.storageMethod)) {
    if (status !== "not recommended") status = "manual review";
    reasons.push("Storage method needs manual review.");
  }
  if (
    (x.storageMethod === "Hot held" && (x.temperature ?? 0) < 60) ||
    (x.storageMethod === "Refrigerated" && (x.temperature ?? 100) > 5)
  ) {
    if (status !== "not recommended") status = "manual review";
    reasons.push(
      "Temperature falls outside demo handling policy. This is not a universal safety standard.",
    );
  }
  if (!reasons.length)
    reasons.push(
      "Handling declaration and packaging recorded; remaining time meets configured demo policy.",
    );
  return { status, reasons };
}
export function matches(s: State, x: Surplus, hour = new Date().getUTCHours()) {
  const assessment = assess(x, s.settings.minimumWindowMinutes);
  if (x.cv && !x.cv.reviewConfirmed)
    return {
      matches: [],
      afterHours: false,
      reason:
        "Uploaded visual assessment requires an institution handling review before matching.",
      excluded: [],
    };
  if (assessment.status !== "potentially suitable")
    return {
      matches: [],
      afterHours: false,
      reason: assessment.reasons.join(" "),
      excluded: [],
    };
  const expiredOffers =
    x.status === "offered" &&
    Date.now() - Date.parse(x.offeredAt || x.createdAt) > 15 * 60000;
  const rejected = [
    ...(x.rejectedRecipientIds || []),
    ...(expiredOffers && x.recipientId ? [x.recipientId] : []),
  ];
  const reasons: { name: string; reason: string }[] = [];
  const candidates = s.organizations
    .filter((o) => o.type === "RECIPIENT")
    .filter((o) => {
      let reason = "";
      const servings = x.unit === "servings" ? x.quantity : x.servings;
      const travel =
        Math.ceil((o.distance / 20) * 60) + s.settings.pickupDelayMinutes;
      const open =
        o.openHour <= o.closeHour
          ? hour >= o.openHour && hour < o.closeHour
          : hour >= o.openHour || hour < o.closeHour;
      if (!o.verified || !o.active) reason = "Not verified or inactive";
      else if (!o.available || !open) reason = "Unavailable or closed";
      else if (rejected.includes(o.id)) reason = "Declined or offer timed out";
      else if (
        !o.dietary.includes(x.dietaryType) ||
        !o.categories.includes(x.category)
      )
        reason = "Food preferences do not match";
      else if (!servings || o.capacity < servings || o.requirement < servings)
        reason = "Insufficient capacity or current requirement";
      else if (x.storageMethod === "Refrigerated" && !o.refrigeration)
        reason = "Refrigeration required";
      else if (Date.parse(x.availableUntil) - Date.now() < travel * 60000)
        reason = "Delivery cannot fit remaining window";
      if (reason) reasons.push({ name: o.name, reason });
      return !reason;
    });
  const regular = candidates.filter((o) => !o.afterHours);
  const afterHours = !regular.length;
  const selected = afterHours
    ? candidates.filter((o) => o.afterHours)
    : regular;
  return {
    afterHours,
    reason: afterHours
      ? "No eligible regular recipient remains. Checking verified after-hours recipients."
      : "Eligible regular recipients available.",
    excluded: reasons,
    matches: selected
      .map((o) => {
        const quantity = x.unit === "servings" ? x.quantity : x.servings;
        const components = {
          compatibility: 30,
          capacity: 20,
          need: Math.round(20 * Math.min(quantity / o.requirement, 1)),
          distance: Math.max(0, 20 - o.distance * 2),
          pickup: o.pickup ? 10 : 5,
        };
        return {
          recipientId: o.id,
          name: o.name,
          score: Math.round(
            Object.values(components).reduce((a, b) => a + b, 0),
          ),
          distance: o.distance,
          capacity: o.capacity,
          requirement: o.requirement,
          pickup: o.pickup,
          estimatedTravelTime:
            Math.ceil((o.distance / 20) * 60) + s.settings.pickupDelayMinutes,
          componentScores: components,
          reasons: [
            `Accepts ${x.dietaryType.toLowerCase()} ${x.category.toLowerCase()}`,
            `Capacity ${o.capacity} servings; current need ${o.requirement}`,
            `${o.distance} km simulated distance`,
            o.pickup ? "Self-pickup available" : "Delivery required",
            "Travel fits declared availability window",
          ],
        };
      })
      .sort((a, b) => b.score - a.score),
  };
}
export function timeline(s: State, a: Actor, x: Surplus, action: string) {
  x.timeline.push({ at: now(), action, actor: a.name });
  audit(s, a, action, x.id);
}
export function workflow(
  s: State,
  a: Actor,
  surplusId: string,
  action: string,
  payload: Record<string, unknown>,
) {
  const x = owned(s, a, surplusId);
  const role = (r: string) => {
    if (a.role !== r) fail("This action is unavailable for your role", 403);
  };
  const manageDelivery = () => {
    if (
      a.role !== "ADMIN" &&
      !(a.role === "INSTITUTION" && a.organizationId === x.organizationId)
    )
      fail("Only the source institution or an admin can manage delivery.", 403);
  };
  const state = (allowed: string[]) => {
    if (!allowed.includes(x.status))
      fail("Record changed or this transition is not allowed", 409);
  };
  const timely = () => {
    if (Date.parse(x.availableUntil) <= Date.now())
      fail("This offer is no longer available.", 409);
  };
  if (action === "offer") {
    role("INSTITUTION");
    state(["available", "rejected", "offered"]);
    if (
      x.status === "offered" &&
      Date.now() - Date.parse(x.offeredAt || x.createdAt) < 15 * 60000
    )
      fail("An offer is already awaiting a response.", 409);
    const result = matches(s, x);
    const m = result.matches.find((m) => m.recipientId === payload.recipientId);
    if (!m) fail("Recipient no longer eligible", 409);
    x.recipientId = m.recipientId;
    x.status = "offered";
    x.offeredAt = now();
    x.afterHours = result.afterHours;
    x.matchReasons = m.reasons;
    x.estimatedTravelTime = m.estimatedTravelTime;
    notify(
      s,
      m.recipientId,
      "New surplus offer",
      `${x.foodName} · ${x.quantity} ${x.unit}`,
      "/offers",
    );
  } else if (action === "review") {
    role("INSTITUTION");
    state(["available", "rejected"]);
    if (!x.cv) fail("No visual assessment to review");
    if (!payload.confirmed) fail("Confirm review before continuing");
    x.cv.reviewConfirmed = true;
    x.cv.reviewedBy = a.name;
    x.cv.reviewedAt = now();
  } else if (action === "accept") {
    role("RECIPIENT");
    state(["offered"]);
    timely();
    const o = s.organizations.find((o) => o.id === a.organizationId)!;
    const qty = x.unit === "servings" ? x.quantity : x.servings;
    if (
      !o.available ||
      o.requirement < qty ||
      o.capacity < qty ||
      !o.active ||
      !o.verified ||
      !matches(s, x).matches.some((m) => m.recipientId === a.organizationId)
    )
      fail("Recipient capacity or availability changed", 409);
    if (!["delivery", "self"].includes(String(payload.mode)))
      fail("Select pickup mode");
    if (payload.mode === "self" && !o.pickup)
      fail("Enable pickup capability in your profile first");
    if (
      assess(x, s.settings.minimumWindowMinutes).status !==
      "potentially suitable"
    )
      fail("Handling information requires reassessment");
    o.requirement -= qty;
    x.pickupMode = String(payload.mode);
    x.status = payload.mode === "self" ? "self pickup" : "delivery requested";
    x.pickupCode = String(randomInt(100000, 1000000));
    x.deliveryCode = String(randomInt(100000, 1000000));
    notify(
      s,
      x.organizationId,
      "Offer accepted",
      `${o.name} accepted ${x.foodName}`,
    );
    if (payload.mode === "delivery")
      s.organizations
        .filter((o) => o.type === "ADMIN" && o.active)
        .forEach((o) =>
          notify(
            s,
            o.id,
            "Delivery arrangement needed",
            x.foodName,
            "/redistribution",
          ),
        );
  } else if (action === "reject") {
    role("RECIPIENT");
    state(["offered"]);
    x.status = "rejected";
    x.rejectedRecipientIds = [
      ...(x.rejectedRecipientIds || []),
      a.organizationId,
    ];
    notify(
      s,
      x.organizationId,
      "Offer declined",
      String(payload.reason || "Recipient declined"),
    );
  } else if (action === "claim") {
    manageDelivery();
    state(["delivery requested"]);
    timely();
    const o = s.organizations.find((o) => o.id === x.organizationId)!;
    if (!o.available || !o.verified || !o.active)
      fail("Source institution is unavailable or unverified");
    if (
      Date.parse(x.availableUntil) - Date.now() <
      (x.estimatedTravelTime || 30) * 60000
    )
      fail("Insufficient remaining delivery window");
    delete x.partnerId;
    x.deliveryManagedBy = a.organizationId;
    x.deliverySimulation = true;
    x.status = "assigned";
  } else if (action === "arrive") {
    manageDelivery();
    state(["assigned"]);
    timely();
    x.status = "arrived";
  } else if (action === "pickup") {
    manageDelivery();
    state(["arrived"]);
    timely();
    if (String(payload.code) !== x.pickupCode) fail("Incorrect pickup code");
    x.status = "picked up";
    delete x.pickupCode;
  } else if (action === "transit") {
    manageDelivery();
    state(["picked up"]);
    x.status = "in transit";
  } else if (action === "deliver") {
    manageDelivery();
    state(["in transit"]);
    if (String(payload.code) !== x.deliveryCode)
      fail("Incorrect delivery code");
    x.status = "delivered";
    delete x.deliveryCode;
    if (Date.parse(x.availableUntil) < Date.now()) x.reviewRequired = true;
    notify(
      s,
      x.recipientId!,
      "Delivery recorded",
      "Confirm received quantity and handling conditions.",
      "/requests",
    );
  } else if (action === "confirm") {
    role("RECIPIENT");
    state(["delivered", "self pickup"]);
    if (x.status === "self pickup") {
      timely();
      if (String(payload.code) !== x.pickupCode)
        fail("Incorrect collection code");
    }
    const q = Number(payload.quantity);
    if (!Number.isFinite(q) || q <= 0 || q > x.quantity)
      fail(
        "Received quantity must be positive and no more than allocated quantity",
      );
    if (
      (x.reviewRequired || Date.parse(x.availableUntil) < Date.now()) &&
      !payload.reviewConfirmed
    )
      fail("Late arrival requires an explicit handling review");
    x.receivedQuantity = q;
    x.receiptNote = String(payload.note || "");
    x.status = "completed";
    x.completedAt = now();
    delete x.pickupCode;
    delete x.deliveryCode;
    notify(
      s,
      x.organizationId,
      "Receipt confirmed",
      `${q} ${x.unit} received.`,
    );
  } else if (action === "cancel") {
    if (!["INSTITUTION", "RECIPIENT", "LOGISTICS", "ADMIN"].includes(a.role))
      fail("Access denied", 403);
    state([
      "available",
      "offered",
      "rejected",
      "delivery requested",
      "assigned",
      "arrived",
      "self pickup",
    ]);
    if (
      x.recipientId &&
      ["delivery requested", "assigned", "arrived", "self pickup"].includes(
        x.status,
      )
    ) {
      const o = s.organizations.find((o) => o.id === x.recipientId);
      if (o) o.requirement += x.unit === "servings" ? x.quantity : x.servings;
    }
    x.status = "cancelled";
    delete x.pickupCode;
    delete x.deliveryCode;
  } else if (action === "recover" || action === "dispose") {
    role("INSTITUTION");
    state(["available", "rejected", "cancelled", "expired"]);
    if (action === "recover" && (!x.organic || x.contaminated))
      fail("This material needs an approved specialist disposal assessment");
    const reason = String(payload.reason || "");
    if (reason.length < 5)
      fail("Provide the reason redistribution was not selected");
    x.status = action === "recover" ? "recovery" : "disposed";
    s.recovery.unshift({
      id: id(),
      organizationId: x.organizationId,
      createdAt: now(),
      surplusId: x.id,
      foodName: x.foodName,
      quantity: x.quantity,
      unit: x.unit,
      servings: x.servings,
      reason,
      method: action === "recover" ? "Composting" : "Final disposal",
      partner: "Green Loop Recovery (simulated)",
      status: action === "recover" ? "scheduled" : "completed",
    });
  } else fail("Unknown action", 404);
  timeline(s, a, x, action);
  return x;
}
export function visibleSurplus(s: State, a: Actor) {
  return s.surplus
    .filter(
      (x) =>
        a.role === "ADMIN" ||
        (a.role === "INSTITUTION" && x.organizationId === a.organizationId) ||
        (a.role === "RECIPIENT" && x.recipientId === a.organizationId) ||
        (a.role === "LOGISTICS" &&
          (x.partnerId === a.organizationId ||
            x.status === "delivery requested")),
    )
    .map((x) => {
      const copy = { ...x };
      if (
        a.role !== "ADMIN" &&
        (a.role !== "INSTITUTION" || a.organizationId !== x.organizationId)
      )
        delete copy.pickupCode;
      if (a.role !== "RECIPIENT" || a.organizationId !== x.recipientId)
        delete copy.deliveryCode;
      return {
        ...copy,
        status:
          ["available", "offered"].includes(x.status) &&
          Date.parse(x.availableUntil) < Date.now()
            ? "expired"
            : x.status,
      };
    });
}
export function analytics(s: State, a: Actor, from = "", to = "9999") {
  const xs = visibleSurplus(s, a).filter(
    (x) => x.createdAt.slice(0, 10) >= from && x.createdAt.slice(0, 10) <= to,
  );
  const kg = (x: { quantity: unknown; unit: unknown; servings?: unknown }) =>
    x.unit === "kg"
      ? Number(x.quantity)
      : x.unit === "grams"
        ? Number(x.quantity) / 1000
        : x.unit === "servings"
          ? Number(x.quantity) * s.settings.kgPerServing
          : Number(x.servings || 0) * s.settings.kgPerServing;
  const complete = xs.filter((x) => x.status === "completed");
  const redistributed = complete.reduce(
    (sum, x) =>
      sum +
      kg({
        ...x,
        quantity: x.receivedQuantity ?? x.quantity,
        servings:
          x.servings * ((x.receivedQuantity ?? x.quantity) / x.quantity),
      }),
    0,
  );
  const recovery = s.recovery.filter(
    (x) =>
      (a.role === "ADMIN" || x.organizationId === a.organizationId) &&
      x.createdAt.slice(0, 10) >= from &&
      x.createdAt.slice(0, 10) <= to,
  );
  const recovered = recovery
    .filter((x) => x.status === "completed" && x.method !== "Final disposal")
    .reduce(
      (sum, x) =>
        sum + kg({ quantity: x.quantity, unit: x.unit, servings: x.servings }),
      0,
    );
  const disposed = recovery
    .filter((x) => x.method === "Final disposal")
    .reduce(
      (sum, x) =>
        sum + kg({ quantity: x.quantity, unit: x.unit, servings: x.servings }),
      0,
    );
  const production = s.production.filter(
    (x) =>
      (a.role === "ADMIN" || x.organizationId === a.organizationId) &&
      String(x.date) >= from &&
      String(x.date) <= to,
  );
  const prevented = production.reduce(
    (n, x) =>
      n +
      Math.max(0, Number(x.baseline || x.prepared) - Number(x.prepared)) *
        s.settings.kgPerServing,
    0,
  );
  const totalPrepared = production.reduce((n, x) => n + Number(x.prepared), 0);
  const totalConsumed = production.reduce((n, x) => n + Number(x.consumed), 0);
  const series = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(Date.now() - (13 - i) * 86400000)
      .toISOString()
      .slice(0, 10);
    const p = production.filter((x) => x.date === day);
    return {
      date: day,
      label: new Date(day).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      prepared: p.length ? p.reduce((v, x) => v + Number(x.prepared), 0) : null,
      consumed: p.length ? p.reduce((v, x) => v + Number(x.consumed), 0) : null,
      surplusKg: p.length
        ? p.reduce(
            (v, x) =>
              v +
              Math.max(0, Number(x.prepared) - Number(x.consumed)) *
                s.settings.kgPerServing,
            0,
          )
        : null,
      preventedKg: p.length
        ? p.reduce(
            (v, x) =>
              v +
              Math.max(
                0,
                Number(x.baseline ?? x.prepared) - Number(x.prepared),
              ) *
                s.settings.kgPerServing,
            0,
          )
        : null,
      redistributed: complete
        .filter(
          (x) =>
            String((x as Row).completedAt || x.createdAt).slice(0, 10) === day,
        )
        .reduce(
          (v, x) =>
            v +
            kg({
              ...x,
              quantity: x.receivedQuantity ?? x.quantity,
              servings:
                x.servings * ((x.receivedQuantity ?? x.quantity) / x.quantity),
            }),
          0,
        ),
    };
  });
  return {
    redistributed: Math.round(redistributed * 10) / 10,
    recovered,
    disposed,
    prevented,
    totalPrepared,
    totalConsumed,
    active: xs.filter(
      (x) =>
        !["completed", "expired", "cancelled", "disposed", "recovery"].includes(
          x.status,
        ),
    ).length,
    completed: complete.length,
    afterHours: complete.filter((x) => x.afterHours).length,
    meals: Math.round(redistributed / s.settings.kgPerServing),
    estimatedCo2: Math.round((prevented + redistributed) * s.settings.co2PerKg),
    estimatedCost: Math.round(prevented * s.settings.costPerKg),
    series,
    methodology: s.settings,
  };
}
