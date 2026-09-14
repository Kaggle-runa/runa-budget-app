import assert from "node:assert/strict";
import { test } from "node:test";
import { decideApiAuth } from "./http";
import { hashTransactionWrite, readIdempotencyKey } from "./ledger-keys";

const sample = {
  date: "2026-09-14",
  type: "income" as const,
  amount: 500,
  category: "support",
  title: "YouTube Super Chat",
  memo: null,
  projectId: null,
  source: "youtube",
  sourceEventId: "superchat_xxxxx",
};

test("同じ本文のハッシュは一致し、金額が違うと変わる", () => {
  assert.equal(hashTransactionWrite(sample), hashTransactionWrite({ ...sample }));
  assert.notEqual(
    hashTransactionWrite(sample),
    hashTransactionWrite({ ...sample, amount: 501 })
  );
});

test("Idempotency-Key の読み取り", () => {
  const missing = readIdempotencyKey(new Request("http://localhost/api/v1/transactions"));
  assert.equal(missing.ok, true);
  if (missing.ok) assert.equal(missing.key, null);

  const ok = readIdempotencyKey(
    new Request("http://localhost/api/v1/transactions", {
      headers: { "Idempotency-Key": "youtube:superchat_xxxxx" },
    })
  );
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.key, "youtube:superchat_xxxxx");

  const tooLong = readIdempotencyKey(
    new Request("http://localhost/api/v1/transactions", {
      headers: { "Idempotency-Key": "x".repeat(201) },
    })
  );
  assert.equal(tooLong.ok, false);
});

test("読み取りトークンでは POST できない", () => {
  const denied = decideApiAuth({
    method: "POST",
    writeConfigured: true,
    readConfigured: true,
    provided: true,
    isWrite: false,
    isRead: true,
  });
  assert.equal(denied.ok, false);
  if (!denied.ok) {
    assert.equal(denied.status, 401);
    assert.equal(denied.code, "UNAUTHORIZED");
  }
});

test("読み取りトークンで GET は通る", () => {
  const allowed = decideApiAuth({
    method: "GET",
    writeConfigured: true,
    readConfigured: true,
    provided: true,
    isWrite: false,
    isRead: true,
  });
  assert.equal(allowed.ok, true);
});

test("書き込みトークンで POST は通る", () => {
  const allowed = decideApiAuth({
    method: "POST",
    writeConfigured: true,
    readConfigured: true,
    provided: true,
    isWrite: true,
    isRead: false,
  });
  assert.equal(allowed.ok, true);
});
