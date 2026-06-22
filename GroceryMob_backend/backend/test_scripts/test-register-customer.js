/**
 * Test: Register user and verify customer is created
 */
const API = 'http://localhost:5000/api';
const uniqueId = Date.now();

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

(async () => {
    try {
        console.log('🧪 Testing User Registration → Customer Creation\n');

        // Register new user
        console.log('1️⃣  Registering new user...');
        const { res: regRes, body: regBody } = await req('/auth/register', 'POST', {
            name: 'John Doe',
            email: `john_${uniqueId}@example.com`,
            password: 'password123',
            phone: '9876543210',
        });

        if (regRes.status !== 201) {
            console.error('❌ Registration failed:', regBody.message);
            process.exit(1);
        }

        console.log('✅ User registered successfully');
        console.log(`   Email: ${regBody.user.email}`);
        console.log(`   Name: ${regBody.user.name}\n`);

        // Check if customer was created
        console.log('2️⃣  Checking if customer was created...');
        const { res: custRes, body: custBody } = await req(
            `/customers?search=${regBody.user.email}`,
            'GET'
        );

        if (custRes.status !== 200) {
            console.error('❌ Failed to fetch customers:', custBody.message);
            process.exit(1);
        }

        const customer = custBody.customers.find((c) => c.email === regBody.user.email);

        if (customer) {
            console.log('✅ Customer record created automatically!');
            console.log(`   Customer ID: ${customer._id}`);
            console.log(`   Name: ${customer.firstName} ${customer.lastName}`);
            console.log(`   Email: ${customer.email}`);
            console.log(`   Account Type: ${customer.accountType}`);
            console.log(`   Status: ${customer.status}`);
            console.log('\n🎉 Registration & Customer Creation Working Perfectly!');
        } else {
            console.error('❌ Customer record NOT found after registration');
            process.exit(1);
        }
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
