/**
 * Customer Database Test Script
 * Tests all customer API endpoints
 *
 * Run: node test-customers.js
 * Requires the backend server to be running at http://localhost:5000
 */

const API = 'http://localhost:5000/api';
const uniqueId = Date.now();

let passed = 0;
let failed = 0;
let customerId = '';

// ── Helpers ─────────────────────────────────────────────────────
const req = async (path, method, payload = null) => {
    const headers = { 'Content-Type': 'application/json' };
    const options = { method, headers };
    if (payload) options.body = JSON.stringify(payload);
    const res = await fetch(`${API}${path}`, options);
    let body;
    try {
        body = await res.json();
    } catch {
        body = await res.text();
    }
    return { res, body };
};

const test = async (id, name, fn, validate) => {
    try {
        const { res, body } = await fn();
        if (validate(res, body)) {
            console.log(`✅ [PASS] ${id}: ${name}`);
            passed++;
        } else {
            console.error(
                `❌ [FAIL] ${id}: ${name} — Status: ${res.status}, Body: ${JSON.stringify(body)}`
            );
            failed++;
        }
    } catch (err) {
        console.error(`❌ [FAIL] ${id}: ${name} — Error: ${err.message}`);
        failed++;
    }
};

// ── Tests ────────────────────────────────────────────────────────
const runTests = async () => {
    console.log('🧪 Running Customer Database Tests...\n');

    // TC-CUST-01: Create a customer
    await test(
        'TC-CUST-01',
        'Create a new customer',
        () =>
            req('/customers', 'POST', {
                firstName: 'John',
                lastName: 'Doe',
                email: `john_doe_${uniqueId}@test.com`,
                phone: '9876543210',
                primaryAddress: {
                    label: 'Home',
                    street: '123 Main Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    country: 'India',
                },
                dateOfBirth: '1990-01-15',
                accountType: 'regular',
                subscribeTonewsletter: true,
            }),
        (res, body) => {
            if (res.status === 201 && body.success && body.customer) {
                customerId = body.customer._id;
                return true;
            }
            return false;
        }
    );

    // TC-CUST-02: Get all customers
    await test(
        'TC-CUST-02',
        'Get all customers',
        () => req('/customers', 'GET'),
        (res, body) =>
            res.status === 200 && body.success === true && Array.isArray(body.customers)
    );

    // TC-CUST-03: Get single customer
    await test(
        'TC-CUST-03',
        'Get single customer by ID',
        () => req(`/customers/${customerId}`, 'GET'),
        (res, body) =>
            res.status === 200 && body.success === true && body.customer._id === customerId
    );

    // TC-CUST-04: Update customer
    await test(
        'TC-CUST-04',
        'Update customer details',
        () =>
            req(`/customers/${customerId}`, 'PUT', {
                firstName: 'Jonathan',
                accountType: 'premium',
            }),
        (res, body) =>
            res.status === 200 && body.success === true && body.customer.firstName === 'Jonathan'
    );

    // TC-CUST-05: Add alternate address
    await test(
        'TC-CUST-05',
        'Add alternate address to customer',
        () =>
            req(`/customers/${customerId}/address`, 'POST', {
                label: 'Work',
                street: '456 Business Park',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
                country: 'India',
            }),
        (res, body) =>
            res.status === 201 &&
            body.success === true &&
            body.customer.alternateAddresses.length > 0
    );

    // TC-CUST-06: Record customer order
    await test(
        'TC-CUST-06',
        'Record customer order and update metrics',
        () =>
            req(`/customers/${customerId}/order`, 'POST', {
                orderAmount: 2500,
            }),
        (res, body) =>
            res.status === 200 &&
            body.success === true &&
            body.customer.totalOrders === 1 &&
            body.customer.totalSpent === 2500
    );

    // TC-CUST-07: Add loyalty points
    await test(
        'TC-CUST-07',
        'Add loyalty points to customer',
        () =>
            req(`/customers/${customerId}/loyalty`, 'POST', {
                points: 250,
            }),
        (res, body) =>
            res.status === 200 && body.success === true && body.customer.loyaltyPoints === 250
    );

    // TC-CUST-08: Get customer statistics
    await test(
        'TC-CUST-08',
        'Get customer statistics',
        () => req('/customers/stats', 'GET'),
        (res, body) =>
            res.status === 200 &&
            body.success === true &&
            body.statistics.totalCustomers >= 0
    );

    // TC-CUST-09: Search customers
    await test(
        'TC-CUST-09',
        'Search customers by name',
        () => req(`/customers?search=John`, 'GET'),
        (res, body) =>
            res.status === 200 && body.success === true && Array.isArray(body.customers)
    );

    // TC-CUST-10: Filter by account type
    await test(
        'TC-CUST-10',
        'Filter customers by account type',
        () => req(`/customers?accountType=premium`, 'GET'),
        (res, body) =>
            res.status === 200 &&
            body.success === true &&
            (body.customers.length === 0 || body.customers[0].accountType === 'premium')
    );

    // TC-CUST-11: Duplicate email validation
    await test(
        'TC-CUST-11',
        'Duplicate email should be rejected',
        () =>
            req('/customers', 'POST', {
                firstName: 'Jane',
                lastName: 'Doe',
                email: `john_doe_${uniqueId}@test.com`,
                phone: '9876543211',
                primaryAddress: {
                    street: '789 Street',
                    city: 'Delhi',
                    state: 'Delhi',
                    pincode: '110001',
                },
            }),
        (res) => res.status === 409
    );

    // TC-CUST-12: Delete customer
    await test(
        'TC-CUST-12',
        'Delete customer',
        () => req(`/customers/${customerId}`, 'DELETE'),
        (res, body) => res.status === 200 && body.success === true
    );

    // ── Summary ────────────────────────────────────────────────
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${passed + failed}`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Customer database is working perfectly.');
    } else {
        console.log(`\n⚠️  ${failed} test(s) failed. Please check the errors above.`);
    }
};

runTests();
