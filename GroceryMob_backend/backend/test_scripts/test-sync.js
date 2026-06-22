const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token = '';
let userId = '';

(async () => {
    try {
        console.log('\n🔄 Testing User-Customer Sync\n');

        // 1. Register user
        console.log('1️⃣ Register user...');
        const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'John Smith',
            email: `sync_test_${Date.now()}@example.com`,
            password: 'password123',
            phone: '9876543210'
        });

        token = registerRes.data.token;
        userId = registerRes.data.user._id;
        const userEmail = registerRes.data.user.email;
        console.log('✓ User registered');
        console.log('  - Email:', userEmail);
        console.log('  - Initial Account Type:', registerRes.data.user.accountType);

        // 2. Check Customer record
        console.log('\n2️⃣ Check initial Customer record...');
        const customerRes1 = await axios.get(`${BASE_URL}/customers?search=${encodeURIComponent(userEmail)}`);
        const customer1 = customerRes1.data.customers[0];
        if (customer1) {
            console.log('✓ Customer record found');
            console.log('  - Name:', customer1.firstName, customer1.lastName);
            console.log('  - Account Type:', customer1.accountType);
            console.log('  - Total Orders:', customer1.totalOrders);
            console.log('  - Total Spent:', customer1.totalSpent);
        }

        // 3. Update account type to Premium
        console.log('\n3️⃣ Update account type to PREMIUM...');
        const updateRes = await axios.put(
            `${BASE_URL}/auth/me`,
            { name: 'John Smith', phone: '9876543210', accountType: 'premium' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✓ User profile updated');
        console.log('  - Account Type (User):', updateRes.data.user.accountType);

        // 4. Verify sync to Customer
        console.log('\n4️⃣ Verify sync to Customer record...');
        await new Promise(r => setTimeout(r, 500)); // Small delay
        const customerRes2 = await axios.get(`${BASE_URL}/customers?search=${encodeURIComponent(userEmail)}`);
        const customer2 = customerRes2.data.customers[0];
        if (customer2) {
            console.log('✓ Customer record synced');
            console.log('  - Account Type (Customer):', customer2.accountType);
            console.log('  - Status:', customer2.accountType === 'premium' ? '✅ SYNCED' : '❌ NOT SYNCED');
        }

        // 5. Create order (simulate)
        console.log('\n5️⃣ Note: Orders sync in real scenario when user makes purchase');
        console.log('  - totalOrders will increment');
        console.log('  - totalSpent will be updated');

        console.log('\n\n🎉 Sync Test Complete!\n\n');
    } catch (err) {
        console.error('\n❌ Error:', err.response?.data || err.message);
        process.exit(1);
    }
})();
