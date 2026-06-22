const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
    {
        // Reference to order
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },

        // Customer info
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },

        // Delivery address
        deliveryAddress: {
            fullName: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: { type: String, default: 'India' },
        },

        // Delivery person
        deliveryPersonName: String,
        deliveryPersonPhone: String,
        deliveryPersonLocation: {
            latitude: Number,
            longitude: Number,
        },

        // Tracking info
        status: {
            type: String,
            enum: [
                'pending',
                'assigned',
                'picked_up',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'failed',
                'returned',
            ],
            default: 'pending',
        },

        estimatedDeliveryDate: Date,
        actualDeliveryDate: Date,

        // Tracking events
        trackingHistory: [
            {
                status: String,
                timestamp: { type: Date, default: Date.now },
                location: String,
                notes: String,
            },
        ],

        // Delivery details
        deliveryType: {
            type: String,
            enum: ['standard', 'express', 'scheduled'],
            default: 'standard',
        },

        deliverySlot: {
            startTime: String,
            endTime: String,
            date: Date,
        },

        // OTP and signature
        otp: {
            code: String,
            verified: { type: Boolean, default: false },
            verifiedAt: Date,
        },

        recipientSignature: String,
        recipientPhoto: String,

        // Cost
        deliveryCharge: {
            type: Number,
            default: 0,
        },

        // Feedback
        deliveryRating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },

        deliveryFeedback: String,

        // Special instructions
        specialInstructions: String,

        // Insurance
        insured: { type: Boolean, default: false },
        insuranceAmount: { type: Number, default: 0 },

        // Cancellation
        cancellationReason: String,
        cancelledAt: Date,
        cancelledBy: String,

        // Metadata
        attempts: { type: Number, default: 0 },
        lastAttemptAt: Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// Virtual for delivery days remaining
deliverySchema.virtual('daysRemaining').get(function () {
    if (!this.estimatedDeliveryDate) return null;
    const now = new Date();
    const daysMs = this.estimatedDeliveryDate - now;
    return Math.ceil(daysMs / (1000 * 60 * 60 * 24));
});

// Index for frequently queried fields
deliverySchema.index({ orderId: 1 });
deliverySchema.index({ customerId: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Delivery', deliverySchema);
