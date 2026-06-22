/**
 * Admin Panel Test Script
 * Tests: TC-AD-01, TC-AD-02, TC-AD-03, TC-AD-04
 *
 * Run:  node test-admin.js
 * Requires the backend server to be running at http://localhost:5000
 */

const API = 'http://localhost:5000/api';
const uniqueId = Date.now();

let passed = 0;
let failed = 0;
let adminToken = '';
let userToken = '';
let createdProductId = '';
let testOrderId = '';

// ── Helpers ─────────────────────────────────────────────────────────────────
const req = async (path, method, payload = null, token = null) => {
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
    const { res, body } = await fn();
    if (validate(res, body)) {
      console.log(`✅ [PASS] ${id}: ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${id}: ${name} — Status: ${res.status}, Body: ${JSON.stringify(body)}`);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [FAIL] ${id}: ${name} — Error: ${err.message}`);
    failed++;
  }
};

// ── Setup: Create admin & regular user ──────────────────────────────────────
const setup = async () => {
  console.log('Setting up test users…\n');

  // Register a normal user
  const { body: userBody } = await req('/auth/register', 'POST', {
    name: 'Normal User',
    email: `user_${uniqueId}@test.com`,
    password: 'password123',
    phone: '9999999999',
  });
  userToken = userBody.token || '';

  // Register a potential-admin user and then manually elevate (we'll try admin credentials)
  // Try logging in with pre-seeded admin credentials (common in dev setups)
  // You can override ADMIN_EMAIL / ADMIN_PASSWORD via env vars
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nearmart.com';
  const adminPass  = process.env.ADMIN_PASSWORD || 'admin123';
  const { body: adminBody } = await req('/auth/login', 'POST', {
    email: adminEmail,
    password: adminPass,
  });
  adminToken = adminBody.token || '';

  if (!adminToken) {
    console.warn(
      '⚠️  Could not obtain admin token. Set ADMIN_EMAIL and ADMIN_PASSWORD env vars,\n' +
      '    or ensure an admin account exists in the database.\n' +
      '    TC-AD-01, TC-AD-03, TC-AD-04 may fail.\n'
    );
  }
};

// ── TC-AD-01: Admin dashboard endpoint accessible ───────────────────────────
// Proxy check: admin can call the admin-only orders list endpoint
const runTC_AD_01 = async () => {
  await test(
    'TC-AD-01',
    'Admin dashboard endpoint accessible (GET /orders/admin/all)',
    () => req('/orders/admin/all', 'GET', null, adminToken),
    (res, body) =>
      res.status === 200 && body.success === true && Array.isArray(body.orders)
  );
};

// ── TC-AD-02: Admin endpoint blocked for normal users ───────────────────────
const runTC_AD_02 = async () => {
  await test(
    'TC-AD-02',
    'Admin endpoint blocked for normal users (403 Forbidden)',
    () => req('/orders/admin/all', 'GET', null, userToken),
    (res) => res.status === 403
  );
};

// ── TC-AD-03: Admin can add a new product ───────────────────────────────────
const runTC_AD_03 = async () => {
  await test(
    'TC-AD-03',
    'Admin can create a new product (POST /products)',
    () =>
      req('/products', 'POST', {
        name:  `Test Mango ${uniqueId}`,
        price: 120,
        originalPrice: 150,
        category: 'Fruits',
        image: 'https://example.com/mango.jpg',
        description: 'Sweet Alphonso mangoes',
        unit: '1 kg',
        stock: 50,
      }, adminToken),
    (res, body) => {
      if (res.status === 201 && body.success && body.product && body.product._id) {
        createdProductId = body.product._id;
        return true;
      }
      return false;
    }
  );

  // Verify product appears in the public listing
  await test(
    'TC-AD-03b',
    'Newly created product appears in product listing',
    () => req(`/products/${createdProductId}`, 'GET'),
    (res, body) =>
      res.status === 200 && body.product && body.product._id === createdProductId
  );
};

// ── TC-AD-04: Admin can update order status ──────────────────────────────────
const runTC_AD_04 = async () => {
  // First, get an order to work with (grab from admin list)
  try {
    const { body } = await req('/orders/admin/all', 'GET', null, adminToken);
    const orders = body.orders || [];
    // Pick the first order that is not yet delivered/cancelled
    const target = orders.find(
      (o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
    );
    if (target) {
      testOrderId = target._id;
    } else if (orders.length > 0) {
      testOrderId = orders[0]._id; // fallback: any order
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch orders list to run TC-AD-04:', err.message);
  }

  if (!testOrderId) {
    // Create a quick order so we have something to update
    console.warn('  No existing orders found — creating a test order for TC-AD-04…');

    // Add a product to cart (use userToken) then place order
    if (createdProductId) {
      await req('/cart', 'POST', { productId: createdProductId, quantity: 1 }, userToken);
      const { body: orderBody } = await req('/orders', 'POST', {
        deliveryAddress: {
          fullName: 'Test User', phone: '9999999999',
          line1: '1 Test Street', city: 'Mumbai',
          state: 'Maharashtra', pincode: '400001',
        },
        paymentMethod: 'COD',
      }, userToken);
      testOrderId = orderBody?.order?._id || '';
    }
  }

  await test(
    'TC-AD-04',
    `Admin can update order status to 'packed' (PUT /orders/${testOrderId?.slice(-6)}/status)`,
    () =>
      testOrderId
        ? req(`/orders/${testOrderId}/status`, 'PUT', { orderStatus: 'packed' }, adminToken)
        : Promise.resolve({ res: { status: 0 }, body: { error: 'No order available' } }),
    (res, body) =>
      res.status === 200 && body.success && body.order?.orderStatus === 'packed'
  );
};

// ── Main ────────────────────────────────────────────────────────────────────
(async () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Admin Panel Test Cases (TC-AD-01 to 04)   ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  await setup();

  console.log('\n─── Running Tests ───────────────────────────────\n');
  await runTC_AD_01();
  await runTC_AD_02();
  await runTC_AD_03();
  await runTC_AD_04();

  console.log('\n─── Results ─────────────────────────────────────');
  console.log(`  Total Passed : ${passed}`);
  console.log(`  Total Failed : ${failed}`);
  console.log('─────────────────────────────────────────────────\n');

  process.exit(failed > 0 ? 1 : 0);
})();
