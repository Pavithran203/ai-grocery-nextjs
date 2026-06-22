const API_URL = 'http://localhost:5000/api/auth';

async function runTests() {
  let passed = 0;
  let failed = 0;
  const uniqueId = Date.now();
  const validEmail = `test_${uniqueId}@example.com`;
  const validPassword = 'password123';
  let authToken = '';
  let resetToken = '';

  const test = async (id, name, reqFn, validateFn) => {
    try {
      const { res, body } = await reqFn();
      const isValid = validateFn(res, body);
      if (isValid) {
        console.log(`✅ [PASS] ${id}: ${name}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${id}: ${name} - Expected status/data mismatch. Status: ${res.status}, Body: ${JSON.stringify(body)}`);
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

  console.log('Running Authentication Test Cases...\n');

  // TC-AU-01
  await test('TC-AU-01', 'Register with valid data',
    () => req('/register', 'POST', { name: 'Test User', email: validEmail, password: validPassword, phone: '1234567890' }),
    (res, body) => {
      if (res.status === 201 && body.token && body.user) {
        authToken = body.token;
        return true;
      }
      return false;
    }
  );

  // TC-AU-02
  await test('TC-AU-02', 'Register with duplicate email',
    () => req('/register', 'POST', { name: 'Test User', email: validEmail, password: validPassword, phone: '1234567890' }),
    (res, body) => res.status === 409 || res.status === 400
  );

  // TC-AU-03
  await test('TC-AU-03', 'Register with missing name',
    () => req('/register', 'POST', { email: `name_${uniqueId}@example.com`, password: validPassword }),
    (res, body) => res.status === 400
  );

  // TC-AU-04
  await test('TC-AU-04', 'Register with invalid email format',
    () => req('/register', 'POST', { name: 'Test User', email: 'notanemail', password: validPassword }),
    (res, body) => res.status === 400 || res.status === 500
  );

  // TC-AU-05
  await test('TC-AU-05', 'Register with short password',
    () => req('/register', 'POST', { name: 'Test User', email: `short_${uniqueId}@example.com`, password: '123' }),
    (res, body) => res.status === 400 || res.status === 500
  );

  // TC-AU-06
  await test('TC-AU-06', 'Login with valid credentials',
    () => req('/login', 'POST', { email: validEmail, password: validPassword }),
    (res, body) => {
      if (res.status === 200 && body.token) {
        authToken = body.token; // Update token
        return true;
      }
      return false;
    }
  );

  // TC-AU-07
  await test('TC-AU-07', 'Login with wrong password',
    () => req('/login', 'POST', { email: validEmail, password: 'wrongpassword' }),
    (res, body) => res.status === 401
  );

  // TC-AU-08
  await test('TC-AU-08', 'Login with non-existent email',
    () => req('/login', 'POST', { email: `nonexistent_${uniqueId}@example.com`, password: validPassword }),
    (res, body) => res.status === 401
  );

  // TC-AU-09
  await test('TC-AU-09', 'Get current user (GET /me)',
    () => req('/me', 'GET', null, authToken),
    (res, body) => res.status === 200 && body.user && !body.user.password
  );

  // TC-AU-10
  await test('TC-AU-10', 'Get profile without token',
    () => req('/me', 'GET'),
    (res, body) => res.status === 401
  );

  // TC-AU-11
  await test('TC-AU-11', 'Update profile (PUT /me)',
    () => req('/me', 'PUT', { name: 'Updated Name', phone: '0987654321' }, authToken),
    (res, body) => res.status === 200 && body.user && body.user.name === 'Updated Name'
  );

  // TC-AU-12
  await test('TC-AU-12', 'Forgot password \u2013 valid email',
    () => req('/forgot-password', 'POST', { email: validEmail }),
    (res, body) => {
      if (res.status === 200 && body.resetToken) {
        resetToken = body.resetToken; // capture for next test
        return true;
      }
      return false;
    }
  );

  // TC-AU-13
  await test('TC-AU-13', 'Forgot password \u2013 unknown email',
    () => req('/forgot-password', 'POST', { email: `unknown_${uniqueId}@example.com` }),
    (res, body) => res.status === 404 || res.status === 200
  );

  // TC-AU-14
  await test('TC-AU-14', 'Reset password with valid token',
    () => req(`/reset-password/${resetToken}`, 'POST', { password: 'newpassword123' }),
    (res, body) => res.status === 200
  );

  // TC-AU-15
  await test('TC-AU-15', 'Reset password with expired/invalid token',
    () => req('/reset-password/invalid-or-fake-token', 'POST', { password: 'newpassword123' }),
    (res, body) => res.status === 400 || res.status === 500
  );

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
