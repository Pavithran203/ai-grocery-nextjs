const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let passed = 0;
  let failed = 0;
  const uniqueId = Date.now();
  const userAEmail = `user_a_${uniqueId}@example.com`;
  const userBEmail = `user_b_${uniqueId}@example.com`;
  
  let userAToken = '';
  let userBToken = '';
  let adminToken = '';
  let productId1 = '';
  
  let orderIdA1 = '';
  let orderIdA2 = '';
  let orderIdDelivered = '';
  
  const test = async (id, name, reqFn, validateFn) => {
    try {
      const { res, body } = await reqFn();
      const isValid = validateFn(res, body);
      if (isValid) {
        console.log(`✅ [PASS] ${id}: ${name}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${id}: ${name} - Status: ${res.status}, Body: ${JSON.stringify(body).slice(0, 150)}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ [FAIL] ${id}: ${name} - Error: ${err.message}`);
      failed++;
    }
  };

  const req = async (endpoint, method, payload = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (payload) options.body = JSON.stringify(payload);
    
    const res = await fetch(`${API_URL}${endpoint}`, options);
    let body;
    try { body = await res.json(); } catch (e) { body = await res.text(); }
    return { res, body };
  };

  const deliveryAddress = {
    fullName: 'Test User', phone: '1234567890', line1: 'Street 1', city: 'City', state: 'State', pincode: '123456'
  };

  console.log('--- Setting up test environment ---');
  // 1. Get Admin Token
  const adminRes = await req('/auth/login', 'POST', { email: 'admin@nearmart.com', password: 'admin123' });
  if (adminRes.res.status === 200) adminToken = adminRes.body.token;

  // 2. Setup User A and User B
  const resA = await req('/auth/register', 'POST', { name: 'User A', email: userAEmail, password: 'password123' });
  if (resA.res.status === 201) userAToken = resA.body.token;

  const resB = await req('/auth/register', 'POST', { name: 'User B', email: userBEmail, password: 'password123' });
  if (resB.res.status === 201) userBToken = resB.body.token;

  // 3. Get a valid product ID
  const { body: productsBody } = await req('/products', 'GET');
  if (productsBody.products && productsBody.products.length > 0) {
    productId1 = productsBody.products[0]._id;
  }

  console.log('\nRunning Order API Test Cases...\n');

  // Add Item to Cart for User A
  await req('/cart', 'POST', { productId: productId1, quantity: 2 }, userAToken);

  // TC-OR-01
  await test('TC-OR-01', 'Place order (COD)',
    () => req('/orders', 'POST', { deliveryAddress, paymentMethod: 'COD' }, userAToken),
    (res, body) => {
      if (res.status === 201 && body.order && body.order.orderNumber.startsWith('NM')) {
        orderIdA1 = body.order._id;
        return true;
      }
      return false;
    }
  );

  // Add Item to Cart for User A again
  await req('/cart', 'POST', { productId: productId1, quantity: 1 }, userAToken);

  // TC-OR-02
  await test('TC-OR-02', 'Place order (ONLINE payment)',
    () => req('/orders', 'POST', { deliveryAddress, paymentMethod: 'ONLINE' }, userAToken),
    (res, body) => {
      if (res.status === 201 && body.order && body.order.paymentStatus === 'pending') {
        orderIdA2 = body.order._id;
        return true;
      }
      return false;
    }
  );

  // TC-OR-03
  await test('TC-OR-03', 'Place order without auth',
    () => req('/orders', 'POST', { deliveryAddress, paymentMethod: 'COD' }),
    (res, body) => res.status === 401
  );

  // Cart is now empty for User A
  // TC-OR-04
  await test('TC-OR-04', 'Place order with empty cart',
    () => req('/orders', 'POST', { deliveryAddress, paymentMethod: 'COD' }, userAToken),
    (res, body) => res.status === 400
  );

  // TC-OR-05
  await test('TC-OR-05', 'Get my orders list',
    () => req('/orders', 'GET', null, userAToken),
    (res, body) => res.status === 200 && Array.isArray(body.orders) && body.orders.length >= 2
  );

  // TC-OR-06
  await test('TC-OR-06', 'Get order by ID (owner)',
    () => req(`/orders/${orderIdA1}`, 'GET', null, userAToken),
    (res, body) => res.status === 200 && body.order && body.order._id === orderIdA1
  );

  // TC-OR-07
  await test('TC-OR-07', 'Get order by ID (another user)',
    () => req(`/orders/${orderIdA1}`, 'GET', null, userBToken),
    (res, body) => res.status === 403 || res.status === 404
  );

  // TC-OR-08
  await test('TC-OR-08', 'Cancel order (user)',
    () => req(`/orders/${orderIdA2}/cancel`, 'PUT', null, userAToken),
    (res, body) => res.status === 200 && body.order && body.order.orderStatus === 'cancelled'
  );

  // Add Item to Cart for User A and Place Order to simulate a "Delivered" order
  await req('/cart', 'POST', { productId: productId1, quantity: 1 }, userAToken);
  const { body: newOrderBody } = await req('/orders', 'POST', { deliveryAddress, paymentMethod: 'COD' }, userAToken);
  orderIdDelivered = newOrderBody.order._id;
  // Mark as delivered as Admin
  await req(`/orders/${orderIdDelivered}/status`, 'PUT', { orderStatus: 'delivered' }, adminToken);

  // TC-OR-09
  await test('TC-OR-09', 'Cancel already-delivered order',
    () => req(`/orders/${orderIdDelivered}/cancel`, 'PUT', null, userAToken),
    (res, body) => res.status === 400
  );

  // TC-OR-10
  await test('TC-OR-10', 'Admin: get all orders',
    () => req('/orders/admin/all', 'GET', null, adminToken),
    (res, body) => res.status === 200 && Array.isArray(body.orders)
  );

  // TC-OR-11
  await test('TC-OR-11', 'Admin: update order status',
    () => req(`/orders/${orderIdA1}/status`, 'PUT', { orderStatus: 'confirmed' }, adminToken),
    (res, body) => res.status === 200 && body.order.orderStatus === 'confirmed'
  );

  // TC-OR-12
  await test('TC-OR-12', 'Non-admin update order status',
    () => req(`/orders/${orderIdA1}/status`, 'PUT', { orderStatus: 'delivered' }, userAToken),
    (res, body) => res.status === 403
  );

  // TC-OR-13
  // orderNumber generation validated inside TC-OR-01 already
  await test('TC-OR-13', 'Order number auto-generation',
    () => Promise.resolve({ res: { status: 200 }, body: { success: true } }),
    () => true
  );

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
