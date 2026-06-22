const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema(
    {
        // Basic Information
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+@.+\..+/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            select: false,
            minlength: 6,
        },
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        dateOfBirth: {
            type: Date,
            default: null,
        },

        // Address Information
        primaryAddress: {
            label: { type: String, default: 'Home' },
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: { type: String, default: 'India' },
            isDefault: { type: Boolean, default: true },
        },
        alternateAddresses: [
            {
                label: String,
                street: String,
                city: String,
                state: String,
                pincode: String,
                country: { type: String, default: 'India' },
                isDefault: Boolean,
            },
        ],

        // Account Status
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active',
        },
        accountType: {
            type: String,
            enum: ['regular', 'premium', 'vip'],
            default: 'regular',
        },

        // Customer Metrics
        totalOrders: {
            type: Number,
            default: 0,
        },
        totalSpent: {
            type: Number,
            default: 0,
        },
        averageOrderValue: {
            type: Number,
            default: 0,
        },
        lastOrderDate: Date,
        loyaltyPoints: {
            type: Number,
            default: 0,
        },

        // Preferences
        preferredPaymentMethod: String,
        preferredDeliveryTime: String,
        subscribeToNewsletter: {
            type: Boolean,
            default: true,
        },
        preferredCategories: [String],

        // Contact Preferences
        allowSMS: {
            type: Boolean,
            default: true,
        },
        allowEmail: {
            type: Boolean,
            default: true,
        },
        allowPushNotifications: {
            type: Boolean,
            default: false,
        },

        // Notes & Tags
        internalNotes: String,
        tags: [String],

        // Metadata
        source: {
            type: String,
            enum: ['website', 'mobile_app', 'referral', 'social_media', 'other'],
            default: 'website',
        },
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
        },
        referredBy: mongoose.Schema.Types.ObjectId,

        // Activity Tracking
        lastActive: Date,
        loginCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// Virtual field for full name
customerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to update lastActive and hash password
customerSchema.pre('save', async function (next) {
    if (this.isModified()) {
        this.lastActive = new Date();
    }

    // Hash password if modified
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare password
customerSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update customer metrics
customerSchema.methods.updateMetrics = function (orderAmount) {
    this.totalOrders += 1;
    this.totalSpent += orderAmount;
    this.averageOrderValue = this.totalSpent / this.totalOrders;
    this.lastOrderDate = new Date();
    return this.save();
};

// Method to add loyalty points
customerSchema.methods.addLoyaltyPoints = function (points) {
    this.loyaltyPoints += points;
    return this.save();
};

// Indexes for frequently queried fields (email index is already created via unique:true)
customerSchema.index({ phone: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ totalSpent: -1 });

module.exports = mongoose.model('Customer', customerSchema);
