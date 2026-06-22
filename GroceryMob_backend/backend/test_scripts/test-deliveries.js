const axios = require('axios');

const API = 'http://localhost:5000/api';
let passed = 0, failed = 0;

async function test(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (e) {
        console.log(`❌ ${name}`);
        const msg = e.response?.data?.message || e.response?.data?.errors?.[0]?.msg || e.message;
        if (msg) console.log(`   ${msg}`);
        failed++;
    }
}

async function run() {
    console.log('\n🚚 DELIVERY TEST SUITE\n');

    let token, userId, orderId, deliveryId;

    await test('Create user', async () => {
        const { data } = await axios.post(`${API}/auth/register`, {
            name: 'User ' + Date.now(),
            email: `test${Date.now()}@test.com`,
            password: 'password123'
        });
        token = data.token;
        userId = data.user._id;
    });

    await test('Create order', async () => {
        const { data } = await axios.post(`${API}/orders`, {
            items: [{ productId: 'p1', name: 'Item', price: 100, quantity: 1 }],
            shippingAddress: { fullName: 'Test', street: 'St', city: 'C', state: 'S', pincode: '123', phone: '999' },
            paymentMethod: 'card'
        }, { headers: { Authorization: `Bearer ${token}` } });
        orderId = data.order._id;
    });

    await test('Create delivery', async () => {
        const { data } = await axios.post(`${API}/deliveries`, {
            orderId, customerId: userId, deliveryType: 'standard',
            estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            deliveryAddress: { fullName: 'R', street: 'A', city: 'C', state: 'S', pincode: '456' }
        }, { headers: { Authorization: `Bearer ${token}` } });
        deliveryId = data.delivery._id;
    });

    await test('Get delivery', async () => {
        const { data } = await axios.get(`${API}/deliveries/${deliveryId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (data.delivery.status !== 'pending') throw new Error('Wrong status');
    });

    await test('Update delivery', async () => {
        await axios.put(`${API}/deliveries/${deliveryId}`, {
            status: 'assigned', deliveryPersonName: 'John', deliveryPersonPhone: '999'
        }, { headers: { Authorization: `Bearer ${token}` } });
    });

    await test('Add tracking', async () => {
        const { data } = await axios.post(`${API}/deliveries/${deliveryId}/track`, {
            status: 'picked_up', location: 'Hub A', notes: 'Picked'
        }, { headers: { Authorization: `Bearer ${token}` } });
        if (!data.delivery.trackingHistory?.length) throw new Error('No tracking');
    });

    await test('List deliveries', async () => {
        const { data } = await axios.get(`${API}/deliveries?page=1&limit=10`, { headers: { Authorization: `Bearer ${token}` } });
        if (!Array.isArray(data.deliveries)) throw new Error('Not array');
    });

    await test('Filter by status', async () => {
        const { data } = await axios.get(`${API}/deliveries?status=assigned`, { headers: { Authorization: `Bearer ${token}` } });
        if (!Array.isArray(data.deliveries)) throw new Error('Not array');
    });

    await test('Get stats', async () => {
        const { data } = await axios.get(`${API}/deliveries/stats`, { headers: { Authorization: `Bearer ${token}` } });
        if (typeof data.totalDeliveries !== 'number') throw new Error('Invalid');
    });

    await test('Mark in transit', async () => {
        await axios.post(`${API}/deliveries/${deliveryId}/track`, {
            status: 'in_transit', location: 'Hub B'
        }, { headers: { Authorization: `Bearer ${token}` } });
    });

    await test('Mark out for delivery', async () => {
        await axios.post(`${API}/deliveries/${deliveryId}/track`, {
            status: 'out_for_delivery', location: 'Hub C'
        }, { headers: { Authorization: `Bearer ${token}` } });
    });

    await test('Mark delivered', async () => {
        await axios.post(`${API}/deliveries/${deliveryId}/track`, {
            status: 'delivered', location: 'Home'
        }, { headers: { Authorization: `Bearer ${token}` } });
    });

    await test('Verify OTP', async () => {
        const { data } = await axios.get(`${API}/deliveries/${deliveryId}`, { headers: { Authorization: `Bearer ${token}` } });
        const otp = data.delivery.otp?.code;
        if (!otp) throw new Error('No OTP');
        const { data: verified } = await axios.post(`${API}/deliveries/${deliveryId}/verify-otp`, { otp }, { headers: { Authorization: `Bearer ${token}` } });
        if (!verified.delivery.otp?.verified) throw new Error('Not verified');
    });

    await test('Rate delivery', async () => {
        const { data } = await axios.post(`${API}/deliveries/${deliveryId}/rate`, {
            rating: 5, feedback: 'Great!'
        }, { headers: { Authorization: `Bearer ${token}` } });
        if (data.delivery.deliveryRating !== 5) throw new Error('Not saved');
    });

    console.log(`\n${'='.repeat(40)}`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log(`${'='.repeat(40)}\n`);

    process.exit(failed ? 1 : 0);
}

run().catch(e => console.error('Error:', e.message) || process.exit(1));
