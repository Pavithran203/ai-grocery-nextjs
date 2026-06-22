require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/User');

async function listWebUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nearmart');
    console.log('✅ Connected successfully!\n');

    // Fetch ALL users who registered via the web app
    // Web users have a firebaseUid starting with "web_"
    const webUsers = await User.find({
      firebaseUid: { $regex: /^web_/, $options: 'i' }
    }).select('-password -__v').lean();

    // Also fetch users who registered via OTP (phone-based web login)
    const otpUsers = await User.find({
      firebaseUid: { $regex: /^user_/, $options: 'i' }
    }).select('-password -__v').lean();

    // Combine both
    const allWebUsers = [...webUsers, ...otpUsers];

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalWebSignIns: allWebUsers.length,
      },
      webUsers: allWebUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || 'Not provided',
        role: u.role,
        isActive: u.isActive,
        isGuest: u.isGuest || false,
        signedInAt: u.createdAt,
        lastUpdated: u.updatedAt,
      }))
    };

    fs.writeFileSync('web-users.json', JSON.stringify(report, null, 2));

    console.log(`✅ Found ${allWebUsers.length} web user(s):\n`);
    allWebUsers.forEach((u, i) => {
      console.log(`  ${i + 1}. 👤 ${u.name}  |  📧 ${u.email}  |  📱 ${u.phone || 'N/A'}  |  🕐 Joined: ${new Date(u.createdAt).toLocaleString()}`);
    });

    if (allWebUsers.length === 0) {
      console.log('  (No web users have signed in yet)');
    }

    console.log('\n➡️ Full details saved to "web-users.json"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
}

listWebUsers();
