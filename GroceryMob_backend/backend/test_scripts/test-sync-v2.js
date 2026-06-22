const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

(async () => {
    try {
        console.log('\n🔄 Testing Complete Sync (User Profile + Orders)\n');

        const email = `test_${Date.now()}@example.com`;

        // 1. Register user
        console.log('1️⃣ Register user...');
        const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'John Smith',
            email: email,
            password: 'password123',
            phone: '9876543210'
        });

        const token = registerRes.data.token;
        console.log('✓ User registered:', email);
        console.log('  - Initial Account Type:', registerRes.data.user.accountType);

        // 2. Check Customer record after registration
        console.log('\n2️⃣ Check Customer record (should exist)...');
        const custRes1 = await axios.get(`${BASE_URL}/customers?search=${encodeURIComponent(email)}`);
        const cust1 = custRes1.data.customers[0];

        if (cust1) {
            console.log('✓ Customer record found');
            console.log('  - Name:', cust1.firstName, cust1.lastName);
            console.log('  - Account Type:', cust1.accountType);
            console.log('  - Orders:', cust1.totalOrders);
            console.log('  - Spent: ₹' + cust1.totalSpent);
        } else {
            console.log('❌ Customer record NOT found!');
        }

        // 3. Update user profile - change account type to PREMIUM
        console.log('\n3️⃣ Update account type to PREMIUM...');
        const updateRes = await axios.put(
            `${BASE_URL}/auth/me`,
            { name: 'John Smith', phone: '9876543210', accountType: 'premium' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✓ User account type updated:', updateRes.data.user.accountType);

        // Wait a bit for sync
        await new Promise(r => setTimeout(r, 300));

        // 4. Check Customer record after profile update
        console.log('\n4️⃣ Check Customer record (should be SYNCED)...');
        const custRes2 = await axios.get(`${BASE_URL}/customers?search=${encodeURIComponent(email)}`);
        const cust2 = custRes2.data.customers[0];

        if (cust2) {
            console.log('✓ Customer record checked');
            console.log('  - Account Type:', cust2.accountType);
            console.log('  - Status:', cust2.accountType === 'premium' ? '✅ SYNCED' : '❌ NOT SYNCED');
        }

        // 5. Update name as well
        console.log('\n5️⃣ Update user name...');
        const updateRes2 = await axios.put(
            `${BASE_URL}/auth/me`,
            { name: 'John Doe Premium', phone: '9876543210', accountType: 'premium' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✓ User name updated:', updateRes2.data.user.name);

        await new Promise(r => setTimeout(r, 300));

        // 6. Check Customer record after name update
        console.log('\n6️⃣ Check Customer record (name should be synced)...');
        const custRes3 = await axios.get(`${BASE_URL}/customers?search=${encodeURIComponent(email)}`);
        const cust3 = custRes3.data.customers[0];

        if (cust3) {
            console.log('✓ Customer record checked');
            console.log('  - First Name:', cust3.firstName);
            console.log('  - Last Name:', cust3.lastName);
            console.log('  - Status:', cust3.firstName === 'John' && cust3.lastName === 'Doe Premium' ? '✅ NAME SYNCED' : '❌ NAME NOT SYNCED');
        }

        console.log('\n\n🎉 Sync Tests Complete!\n\n');
    } catch (err) {
        console.error('\n❌ Error:');
        if (err.response?.data) {
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }
        process.exit(1);
    }
})();
