const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin (Optional for Demo Mode)
try {
  const serviceAccount = require('../config/firebase-admin.json');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.log('ℹ️ Running in Demo Auth mode (No firebase-admin config found)');
}

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  // --- START DEMO AUTH BYPASS ---
  if (process.env.NODE_ENV !== 'production' && token.startsWith('demo-token-')) {
    const demoUid = token.replace('demo-token-', '');
    let user = await User.findOne({ firebaseUid: demoUid });
    
    if (!user) {
      // Create a temporary mock user in the DB for the demo session
      // Use a unique email based on the demoUid to avoid duplicate key errors
      const email = demoUid.includes('guest') 
        ? `guest_${demoUid}@example.com` 
        : `user_${demoUid}@nearmart.com`;
        
      user = await User.create({
        firebaseUid: demoUid,
        email: email,
        name: demoUid.includes('guest') ? 'Guest User' : (demoUid === 'admin' ? 'Super Admin' : 'New User'),
        role: demoUid === 'admin' ? 'admin' : 'user',
        isGuest: demoUid.includes('guest')
      });
    }
    
    req.user = user;
    return next();
  }
  // --- END DEMO AUTH BYPASS ---

  try {
    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or Sync user in our MongoDB
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || `user_${decodedToken.uid}@nearmart.com`,
        name: decodedToken.name || 'User',
        isGuest: (decodedToken.firebase && decodedToken.firebase.sign_in_provider === 'anonymous')
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, adminOnly };
