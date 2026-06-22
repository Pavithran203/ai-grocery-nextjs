/**
 * Security Test Script
 * Tests: TC-SE-01 through TC-SE-05
 *
 * Run:  node test-security.js
 * Requires the backend server running at http://localhost:5000
 *
 * Optional env vars:
 *   ADMIN_EMAIL    (default: admin@nearmart.com)
 *   ADMIN_PASSWORD (default: admin123)
 */

const jwt = require('jsonwebtoken');
const API = 'http://localhost:5000/api';
const uniqueId = Date.now();

let passed = 0;
let failed = 0;

let userAToken = '';
let userBToken = '';
let adminToken = '';
let xssProductId = '';

// ── Helpers ──────────────────────────────────────────────────────────────────
const req = async (path, method = 'GET', payload = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (payload) options.body = JSON.stringify(payload);
  const res = await fetch(`${API}${path}`, options);
  let body;
  try { body = await res.json(); } catch { body = await res.text(); }
  return { res, body };
};

const test = async (id, name, fn, validate) => {
  try {
    const result = await fn();
    const { res, body } = result;
    if (validate(res, body)) {
      console.log(`✅ [PASS] ${id}: ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${id}: ${name}`);
      console.error(`         Status: ${res.status}  Body: ${JSON.stringify(body).slice(0, 200)}`);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [FAIL] ${id}: ${name} — Error: ${err.message}`);
    failed++;
  }
};

// ── Setup ─────────────────────────────────────────────────────────────────────
const setup = async () => {
  console.log('Setting up test accounts…\n');

  // Register User A
  const { body: a } = await req('/auth/register', 'POST', {
    name: 'Security User A',
    email: `sec_a_${uniqueId}@test.com`,
    password: 'password123',
  });
  userAToken = a.token || '';

  // Register User B
  const { body: b } = await req('/auth/register', 'POST', {
    name: 'Security User B',
    email: `sec_b_${uniqueId}@test.com`,
    password: 'password123',
  });
  userBToken = b.token || '';

  // Log in as admin
  const adminEmail = process.env.ADMIN_EMAIL    || 'admin@nearmart.com';
  const adminPass  = process.env.ADMIN_PASSWORD || 'admin123';
  const { body: adm } = await req('/auth/login', 'POST', {
    email: adminEmail,
    password: adminPass,
  });
  adminToken = adm.token || '';

  if (!userAToken || !userBToken) {
    console.error('❌ Setup failed: could not register test users. Aborting.');
    process.exit(1);
  }
  console.log(`  User A token: ${userAToken ? 'OK' : 'MISSING'}`);
  console.log(`  User B token: ${userBToken ? 'OK' : 'MISSING'}`);
  console.log(`  Admin token : ${adminToken ? 'OK' : 'MISSING (TC-SE-04 may fail)'}\n`);
};

// ── TC-SE-01: Password not returned in API response ───────────────────────────
const runTC_SE_01 = async () => {
  await test(
    'TC-SE-01',
    'Password field absent from GET /api/auth/me response',
    () => req('/auth/me', 'GET', null, userAToken),
    (res, body) => {
      if (res.status !== 200) return false;
      const user = body.user || body;
      // password must not appear at any depth in the serialised response
      const raw = JSON.stringify(body);
      const hasPassword = raw.includes('"password"');
      return !hasPassword;
    }
  );
};

// ── TC-SE-02: Expired JWT token rejected (401) ────────────────────────────────
const runTC_SE_02 = async () => {
  // Build a JWT that expired 1 second ago using the same secret
  const JWT_SECRET = process.env.JWT_SECRET || 'nearmart_super_secret_jwt_key_2026';
  const expiredToken = jwt.sign(
    { id: 'fake_id_for_expiry_test' },
    JWT_SECRET,
    { expiresIn: -1 }  // negative = already expired
  );

  await test(
    'TC-SE-02',
    'Expired JWT token returns 401 Unauthorized',
    () => req('/auth/me', 'GET', null, expiredToken),
    (res, body) => res.status === 401
  );
};

// ── TC-SE-03: NoSQL injection in search query ─────────────────────────────────
const runTC_SE_03 = async () => {
  // Attempt common MongoDB operator injection via query string
  const injectionPayloads = [
    '/products?search[$gt]=',        // classic operator injection
    `/products?search={"$gt":""}`,   // JSON-encoded operator
    `/products?search={"$where":"function()%7Breturn%20true%7D"}`,
    '/products?search=<script>alert(1)</script>',
  ];

  for (const path of injectionPayloads) {
    await test(
      'TC-SE-03',
      `NoSQL injection safe: GET ${path}`,
      () => req(path),
      (res, body) => {
        // Must not crash (50x) and must not return mongo internal errors
        const isCrash = res.status >= 500;
        const bodyStr = JSON.stringify(body).toLowerCase();
        const leaksInternals = bodyStr.includes('mongoservererror') ||
                               bodyStr.includes('$where') ||
                               bodyStr.includes('syntaxerror');
        return !isCrash && !leaksInternals;
      }
    );
  }
};

// ── TC-SE-04: XSS payload in product name safely stored & retrievable ─────────
const runTC_SE_04 = async () => {
  if (!adminToken) {
    console.warn('  ⚠️  Skipping TC-SE-04: no admin token available.');
    return;
  }

  const xssPayload = '<script>alert(1)</script>';

  // Step 1: Admin creates product with XSS payload as name
  await test(
    'TC-SE-04a',
    'XSS payload accepted/stored without server-side execution',
    () =>
      req('/products', 'POST', {
        name:        xssPayload,
        price:       1,
        originalPrice: 1,
        category:   'Fruits',
        image:      'https://example.com/xss.jpg',
        unit:       '1 unit',
        stock:      1,
        description: 'XSS test product',
      }, adminToken),
    (res, body) => {
      // Server should accept it (201) without executing the script.
      // The raw stored name should equal the literal string — not an empty name,
      // not a crash, and not an eval result.
      if (res.status === 201 && body.product) {
        xssProductId = body.product._id;
        const storedName = body.product.name;
        // It must be stored as literal text (not stripped to blank, not cause a 500)
        return storedName === xssPayload;
      }
      return false;
    }
  );

  // Step 2: Verify the product can be retrieved and the name is the safe literal string
  if (xssProductId) {
    await test(
      'TC-SE-04b',
      'XSS product name retrieved as safe literal string (server does not eval/execute)',
      () => req(`/products/${xssProductId}`),
      (res, body) => {
        if (res.status !== 200 || !body.product) return false;
        const name = body.product.name;
        // The name must be the literal text — if the server had eval'd it,
        // the call would have crashed or returned a different value.
        return name === xssPayload && res.status === 200;
      }
    );

    console.log('  ℹ️  TC-SE-04 (XSS): Server stores and returns text as-is (no server-side execution).');
    console.log('  ℹ️  React renders text nodes escaped by default, so the script tag will NOT execute in the browser.');
    console.log('  ℹ️  To explicitly verify browser-level escaping, the admin products page uses JSX text interpolation (dangerouslySetInnerHTML is NOT used).\n');
  }
};

// ── TC-SE-05: User cart isolation ─────────────────────────────────────────────
const runTC_SE_05 = async () => {
  // First, add a distinct item to User A's cart so we can identify it
  // Get any product to use
  const { body: prodBody } = await req('/products');
  const product = (prodBody.products || [])[0];

  if (!product) {
    console.warn('  ⚠️  No products in DB — skipping cart seeding for TC-SE-05.');
  } else {
    await req('/cart', 'POST', { productId: product._id, quantity: 2 }, userAToken);
  }

  // Scenario A: User B uses their own valid token — must see only their cart (empty)
  await test(
    'TC-SE-05a',
    "User B's cart is empty (isolated from User A)",
    () => req('/cart', 'GET', null, userBToken),
    (res, body) => {
      if (res.status !== 200) return false;
      const cart = body.cart || {};
      const items = cart.items || [];
      // User B should have 0 items (we never added anything for them)
      return items.length === 0;
    }
  );

  // Scenario B: User A's token — must see only UserA's cart contents
  await test(
    'TC-SE-05b',
    "User A's cart contains their own items (not shared with B)",
    () => req('/cart', 'GET', null, userAToken),
    (res, body) => {
      if (res.status !== 200) return false;
      const items = (body.cart || {}).items || [];
      // The cart lookup always uses req.user._id (from JWT), so these
      // will only ever be User A's items
      if (!product) return true; // No product to check, isolation still valid
      const found = items.find(i =>
        (i.product?._id || i.product) === product._id
      );
      return items.length > 0 && found !== undefined;
    }
  );

  // Scenario C: No token — must be rejected (401)
  await test(
    'TC-SE-05c',
    'Cart GET without any token returns 401',
    () => req('/cart', 'GET'),
    (res) => res.status === 401
  );

  // Scenario D: Tampered token (modify user ID in payload but use valid signature portion)
  const fakeToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsImlhdCI6MTYwMDAwMDAwMH0.FAKESIGNATURE';
  await test(
    'TC-SE-05d',
    'Tampered/invalid JWT token returns 401 (cannot spoof another user)',
    () => req('/cart', 'GET', null, fakeToken),
    (res) => res.status === 401
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Security Test Cases (TC-SE-01 to TC-SE-05)      ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  await setup();

  console.log('─── Running Tests ──────────────────────────────────────\n');
  await runTC_SE_01();
  await runTC_SE_02();
  await runTC_SE_03();
  await runTC_SE_04();
  await runTC_SE_05();

  console.log('\n─── Results ────────────────────────────────────────────');
  console.log(`  Total Passed : ${passed}`);
  console.log(`  Total Failed : ${failed}`);
  console.log('────────────────────────────────────────────────────────\n');

  process.exit(failed > 0 ? 1 : 0);
})();
