const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let passed = 0;
  let failed = 0;
  const uniqueId = Date.now();
  const validEmail = `user${uniqueId}@example.com`;
  
  let adminToken = '';
  let userToken = '';
  let validProductId = '';
  let validProductIdForSuggestion = '';
  let validProductIdForSuggestion2 = '';

  const test = async (id, name, reqFn, validateFn) => {
    try {
      const { res, body } = await reqFn();
      const isValid = validateFn(res, body);
      if (isValid) {
        console.log(`✅ [PASS] ${id}: ${name}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${id}: ${name} - Unexpected status/data. Status: ${res.status}, Body: ${JSON.stringify(body)}`);
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

  // Preparation
  console.log('--- Setting up test environment ---');
  // 1. Get Admin Token (from seed)
  const adminRes = await req('/auth/login', 'POST', { email: 'admin@nearmart.com', password: 'admin123' });
  if (adminRes.res.status === 200) adminToken = adminRes.body.token;
  else console.error('Failed to get Admin token!');

  // 2. Clear out any previous regular user or register a new one to get User Token
  const userRes = await req('/auth/register', 'POST', { name: 'Regular User', email: validEmail, password: 'password123', phone: '1234567890' });
  if (userRes.res.status === 201) userToken = userRes.body.token;
  else console.error('Failed to register regular user!');

  console.log('\nRunning Product API Test Cases...\n');

  // TC-PR-01
  await test('TC-PR-01', 'Get all products',
    () => req('/products', 'GET'),
    (res, body) => {
      if (res.status === 200 && body.success && Array.isArray(body.products) && body.products.length > 0) {
        validProductId = body.products[0]._id; // Save an ID for later
        return true;
      }
      return false;
    }
  );

  // TC-PR-02
  await test('TC-PR-02', 'Get products by category filter',
    () => req('/products?category=Fruits', 'GET'),
    (res, body) => {
      return res.status === 200 && Array.isArray(body.products) && body.products.every(p => p.category === 'Fruits');
    }
  );

  // TC-PR-03
  await test('TC-PR-03', 'Search products by keyword',
    () => req('/products?search=Apple', 'GET'),
    (res, body) => {
      return res.status === 200 && Array.isArray(body.products) && body.products.length > 0;
    }
  );

  // TC-PR-04
  await test('TC-PR-04', 'Get trending products',
    () => req('/products?trending=true', 'GET'),
    (res, body) => {
      return res.status === 200 && Array.isArray(body.products) && body.products.every(p => p.isTrending === true);
    }
  );

  // TC-PR-05
  await test('TC-PR-05', 'Get product by valid ID',
    () => req(`/products/${validProductId}`, 'GET'),
    (res, body) => {
      // Find one with suggestedWith array to test TC-PR-07 later
      return res.status === 200 && body.success && body.product._id === validProductId;
    }
  );

  // Prep for TC-PR-07: Get a product that might have suggestions
  const { body: allProducts } = await req('/products', 'GET');
  const suggestionProducts = allProducts.products?.filter(p => ['Milk', 'Bread', 'Eggs'].some(k => p.name.includes(k)));
  if (suggestionProducts && suggestionProducts.length > 0) {
    validProductIdForSuggestion = suggestionProducts[0]._id;
    if (suggestionProducts.length > 1) {
      validProductIdForSuggestion2 = suggestionProducts[1]._id;
    }
  }

  // TC-PR-06
  await test('TC-PR-06', 'Get product by invalid ID',
    () => req('/products/invalidid123', 'GET'),
    (res, body) => res.status === 404 || res.status === 400 || res.status === 500
  );

  // TC-PR-07
  await test('TC-PR-07', 'Get AI smart suggestions',
    () => req(`/products/suggestions?ids=${validProductIdForSuggestion},${validProductIdForSuggestion2}`, 'GET'),
    (res, body) => {
      return res.status === 200 && Array.isArray(body.suggestions);
    }
  );

  let newProductId = '';

  // TC-PR-08
  await test('TC-PR-08', 'Create product (admin)',
    () => req('/products', 'POST', { name: 'Test Product Admin', price: 100, category: 'Test', image: 'test.jpg' }, adminToken),
    (res, body) => {
      if (res.status === 201 && body.success && body.product) {
        newProductId = body.product._id;
        return true;
      }
      return false;
    }
  );

  // TC-PR-09
  await test('TC-PR-09', 'Create product (non-admin user)',
    () => req('/products', 'POST', { name: 'Test Product User', price: 50, category: 'Test', image: 'test.jpg' }, userToken),
    (res, body) => res.status === 403
  );

  // TC-PR-10
  await test('TC-PR-10', 'Create product without auth',
    () => req('/products', 'POST', { name: 'Test Product Anon', price: 50, category: 'Test', image: 'test.jpg' }),
    (res, body) => res.status === 401
  );

  // TC-PR-11
  await test('TC-PR-11', 'Update product (admin)',
    () => req(`/products/${newProductId}`, 'PUT', { price: 150 }, adminToken),
    (res, body) => {
      return res.status === 200 && body.success && body.product.price === 150;
    }
  );

  // TC-PR-12
  await test('TC-PR-12', 'Delete product (admin)',
    () => req(`/products/${newProductId}`, 'DELETE', null, adminToken),
    (res, body) => {
      return res.status === 200 && body.success;
    }
  );

  // TC-PR-13
  await test('TC-PR-13', 'Create product with missing required fields',
    () => req('/products', 'POST', { price: 100, category: 'Test', image: 'test.jpg' }, adminToken),
    (res, body) => res.status === 400 || res.status === 500
  );

  // TC-PR-14
  await test('TC-PR-14', 'Create product with negative price',
    () => req('/products', 'POST', { name: 'Negative Prod', price: -5, category: 'Test', image: 'test.jpg' }, adminToken),
    (res, body) => res.status === 400 || res.status === 500
  );

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
