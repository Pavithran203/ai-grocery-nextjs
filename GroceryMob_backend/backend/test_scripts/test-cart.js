const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let passed = 0;
  let failed = 0;
  const uniqueId = Date.now();
  const validEmail = `user_cart_${uniqueId}@example.com`;
  let userToken = '';
  
  let validProductId1 = '';
  let validProductId2 = '';
  let outOfStockProductId = '';

  const test = async (id, name, reqFn, validateFn) => {
    try {
      const { res, body } = await reqFn();
      const isValid = validateFn(res, body);
      if (isValid) {
        console.log(`✅ [PASS] ${id}: ${name}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${id}: ${name} - Unexpected outcome. Status: ${res.status}, Body: ${JSON.stringify(body).slice(0, 150)}`);
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

  console.log('--- Setting up test environment ---');
  // 1. Get User Token
  const userRes = await req('/auth/register', 'POST', { name: 'Cart Tester', email: validEmail, password: 'password123', phone: '1234567890' });
  if (userRes.res.status === 201) userToken = userRes.body.token;

  // 2. Fetch products for tests
  const { body: allProductsBody } = await req('/products', 'GET');
  const products = allProductsBody.products;
  if (products && products.length >= 2) {
    validProductId1 = products[0]._id;
    validProductId2 = products[1]._id;
  }
  
  // Create an out-of-stock product using admin token (just to ensure we have one)
  const adminRes = await req('/auth/login', 'POST', { email: 'admin@nearmart.com', password: 'admin123' });
  let adminToken = adminRes.body.token;
  const oosProductRes = await req('/products', 'POST', { name: 'OOS Product', price: 50, category: 'Test', image: 'test.jpg', stock: 0 }, adminToken);
  if (oosProductRes.res.status === 201) {
    outOfStockProductId = oosProductRes.body.product._id;
  } else {
    console.error('Failed to create out-of-stock product');
  }

  console.log('\nRunning Cart API Test Cases...\n');

  // TC-CA-01
  await test('TC-CA-01', 'Get empty cart',
    () => req('/cart', 'GET', null, userToken),
    (res, body) => res.status === 200 && Array.isArray(body.cart.items) && body.cart.items.length === 0 && body.cart.total === 0
  );

  // TC-CA-02
  await test('TC-CA-02', 'Add item to cart',
    () => req('/cart', 'POST', { productId: validProductId1, quantity: 1 }, userToken),
    (res, body) => res.status === 200 && body.cart.items.find(i => i.product._id === validProductId1 || i.product === validProductId1)
  );

  // TC-CA-03
  await test('TC-CA-03', 'Add same item again (quantity merge)',
    () => req('/cart', 'POST', { productId: validProductId1, quantity: 1 }, userToken),
    (res, body) => {
      const item = body.cart.items.find(i => i.product._id === validProductId1 || i.product === validProductId1);
      return res.status === 200 && item && item.quantity === 2;
    }
  );

  // TC-CA-04
  await test('TC-CA-04', 'Add item without auth',
    () => req('/cart', 'POST', { productId: validProductId2, quantity: 1 }),
    (res, body) => res.status === 401
  );

  // TC-CA-05
  await test('TC-CA-05', 'Update cart item quantity',
    () => req(`/cart/${validProductId1}`, 'PUT', { quantity: 3 }, userToken),
    (res, body) => {
      const item = body.cart.items.find(i => i.product._id === validProductId1 || i.product === validProductId1);
      return res.status === 200 && item && item.quantity === 3;
    }
  );

  // TC-CA-06
  await test('TC-CA-06', 'Update quantity to 0 or negative',
    () => req(`/cart/${validProductId1}`, 'PUT', { quantity: 0 }, userToken),
    (res, body) => {
      // API might remove item or return validation error 
      const item = body.cart?.items?.find(i => i.product._id === validProductId1 || i.product === validProductId1);
      return (res.status === 200 && !item) || res.status === 400; // Success removed OR Validation Error
    }
  );

  // Re-add product 1 and product 2 for TC-CA-07 and TC-CA-09
  await req('/cart', 'POST', { productId: validProductId1, quantity: 2 }, userToken);
  await req('/cart', 'POST', { productId: validProductId2, quantity: 1 }, userToken);

  // TC-CA-09 (Check calculation before removal)
  await test('TC-CA-09', 'Cart total calculation',
    () => req('/cart', 'GET', null, userToken),
    (res, body) => {
      if (res.status === 200 && body.cart) {
        let expectedTotal = 0;
        body.cart.items.forEach(i => { expectedTotal += i.price * i.quantity; });
        return body.cart.total === expectedTotal;
      }
      return false;
    }
  );

  // TC-CA-07
  await test('TC-CA-07', 'Remove specific item from cart',
    () => req(`/cart/${validProductId1}`, 'DELETE', null, userToken),
    (res, body) => {
      const item1 = body.cart.items.find(i => i.product._id === validProductId1 || i.product === validProductId1);
      const item2 = body.cart.items.find(i => i.product._id === validProductId2 || i.product === validProductId2);
      return res.status === 200 && !item1 && item2;
    }
  );

  // TC-CA-08
  await test('TC-CA-08', 'Clear entire cart',
    () => req('/cart/clear', 'DELETE', null, userToken),
    (res, body) => res.status === 200 && body.message === 'Cart cleared.'
  );

  // TC-CA-10
  await test('TC-CA-10', 'Add out-of-stock product',
    () => req('/cart', 'POST', { productId: outOfStockProductId, quantity: 1 }, userToken),
    (res, body) => res.status === 400 || res.status === 404
  );

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
