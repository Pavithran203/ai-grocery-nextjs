const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let passed = 0;
  let failed = 0;
  const uniqueId = Date.now();
  const validEmail = `user_offer_${uniqueId}@example.com`;
  
  let adminToken = '';
  let userToken = '';
  let validOfferId = '';

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
  // 1. Get Admin Token
  const adminRes = await req('/auth/login', 'POST', { email: 'admin@nearmart.com', password: 'admin123' });
  if (adminRes.res.status === 200) adminToken = adminRes.body.token;

  // 2. Setup Regular User
  const resUser = await req('/auth/register', 'POST', { name: 'Offer User', email: validEmail, password: 'password123' });
  if (resUser.res.status === 201) userToken = resUser.body.token;

  // Ensure SAVE10 exists. Delete if existing, to reset.
  const { body: offersInit } = await req('/offers', 'GET');
  const existingSave10 = offersInit.offers?.find(o => o.code === 'SAVE10');
  if (existingSave10) {
    validOfferId = existingSave10._id;
  } else {
    // Seed SAVE10
    const save10Res = await req('/offers', 'POST', { code: 'SAVE10', discountPercent: 10, description: '10% OFF' }, adminToken);
    if (save10Res.res.status === 201) validOfferId = save10Res.body.offer._id;
  }

  console.log('\nRunning Offers API Test Cases...\n');

  // TC-OF-01
  await test('TC-OF-01', 'Get all active offers',
    () => req('/offers', 'GET'),
    (res, body) => res.status === 200 && Array.isArray(body.offers)
  );

  // TC-OF-02
  await test('TC-OF-02', 'Validate valid coupon code',
    () => req(`/offers/validate?code=SAVE10`, 'GET'),
    (res, body) => res.status === 200 && body.valid === true && body.offer.code === 'SAVE10'
  );

  // TC-OF-03
  await test('TC-OF-03', 'Validate invalid/expired coupon',
    () => req('/offers/validate?code=EXPIRED99', 'GET'),
    (res, body) => res.status === 404 || res.status === 400
  );

  let tempOfferId = '';
  // TC-OF-04
  await test('TC-OF-04', 'Create offer (admin)',
    () => req('/offers', 'POST', { code: `TEST${uniqueId}`, discountPercent: 15, description: 'Test Coupon' }, adminToken),
    (res, body) => {
      if (res.status === 201 && body.offer && body.offer.discountPercent === 15) {
        tempOfferId = body.offer._id;
        return true;
      }
      return false;
    }
  );

  // TC-OF-05
  await test('TC-OF-05', 'Create offer (non-admin)',
    () => req('/offers', 'POST', { code: `USER${uniqueId}`, discountPercent: 5 }, userToken),
    (res, body) => res.status === 403
  );

  // TC-OF-06
  await test('TC-OF-06', 'Update offer (admin)',
    () => req(`/offers/${tempOfferId}`, 'PUT', { discountPercent: 20 }, adminToken),
    (res, body) => res.status === 200 && body.offer && body.offer.discountPercent === 20
  );

  // TC-OF-07
  await test('TC-OF-07', 'Delete offer (admin)',
    () => req(`/offers/${tempOfferId}`, 'DELETE', null, adminToken),
    (res, body) => res.status === 200 && body.message === 'Offer deleted.'
  );

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
