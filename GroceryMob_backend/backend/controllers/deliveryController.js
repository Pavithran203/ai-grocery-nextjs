const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');

// ── POST /api/deliveries - Create new delivery ───────────────
const createDelivery = async (req, res) => {
    try {
        const {
            orderId,
            customerId,
            deliveryAddress,
            deliveryType = 'standard',
            estimatedDeliveryDate,
            deliveryCharge = 0,
            specialInstructions,
        } = req.body;

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Check if delivery already exists for this order
        const existing = await Delivery.findOne({ orderId });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Delivery for this order already exists.',
            });
        }

        const delivery = await Delivery.create({
            orderId,
            customerId,
            deliveryAddress,
            deliveryType,
            estimatedDeliveryDate,
            deliveryCharge,
            specialInstructions,
            status: 'pending',
        });

        res.status(201).json({ success: true, delivery });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/deliveries - Get all deliveries ────────────────
const getAllDeliveries = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, customerId } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (customerId) filter.customerId = customerId;

        const skip = (page - 1) * limit;

        const deliveries = await Delivery.find(filter)
            .populate('orderId', 'orderNumber totalAmount')
            .populate('customerId', 'firstName lastName email phone')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Delivery.countDocuments(filter);

        res.json({
            success: true,
            deliveries,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/deliveries/:id - Get single delivery ──────────
const getDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .populate('orderId')
            .populate('customerId');

        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery not found.' });
        }

        res.json({ success: true, delivery });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT /api/deliveries/:id - Update delivery ──────────────
const updateDelivery = async (req, res) => {
    try {
        const {
            status,
            deliveryPersonName,
            deliveryPersonPhone,
            estimatedDeliveryDate,
            deliverySlot,
            specialInstructions,
        } = req.body;

        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            {
                status,
                deliveryPersonName,
                deliveryPersonPhone,
                estimatedDeliveryDate,
                deliverySlot,
                specialInstructions,
            },
            { new: true, runValidators: true }
        );

        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery not found.' });
        }

        res.json({ success: true, delivery });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── DELETE /api/deliveries/:id - Delete delivery ──────────
const deleteDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findByIdAndDelete(req.params.id);

        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery not found.' });
        }

        res.json({ success: true, message: 'Delivery deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/deliveries/:id/track - Add tracking event ────
const addTrackingEvent = async (req, res) => {
    try {
        const { status, location, notes } = req.body;

        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery not found.' });
        }

        // Add tracking event
        delivery.trackingHistory.push({
            status,
            timestamp: new Date(),
            location,
            notes,
        });

        // Update delivery status
        delivery.status = status;

        // If delivered, set actual delivery date
        if (status === 'delivered') {
            delivery.actualDeliveryDate = new Date();
        }

        await delivery.save();
        res.json({ success: true, delivery });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/deliveries/:id/verify-otp - Verify OTP --------
const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;

        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery not found.' });
        }

        // For demo purposes, accept any 4-digit OTP
        if (!otp || otp.length !== 4) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid OTP format.' });
        }

        delivery.otp.verified = true;
        delivery.otp.verifiedAt = new Date();
        delivery.status = 'delivered';
        delivery.actualDeliveryDate = new Date();

        await delivery.save();
        res.json({ success: true, delivery, message: 'OTP verified successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/deliveries/:id/rate - Rate delivery ──────────
const rateDelivery = async (req, res) => {
    try {
        const { rating, feedback } = req.body;

        if (rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({ success: false, message: 'Rating must be between 1 and 5.' });
        }

        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            {
                deliveryRating: rating,
                deliveryFeedback: feedback || '',
            },
            { new: true }
        );

        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery not found.' });
        }

        res.json({ success: true, delivery });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/deliveries/stats - Delivery statistics ────────
const getDeliveryStats = async (req, res) => {
    try {
        const totalDeliveries = await Delivery.countDocuments();
        const deliveredCount = await Delivery.countDocuments({ status: 'delivered' });
        const inTransitCount = await Delivery.countDocuments({
            status: { $in: ['in_transit', 'out_for_delivery'] },
        });
        const failedCount = await Delivery.countDocuments({ status: 'failed' });

        const avgRating = await Delivery.aggregate([
            { $match: { deliveryRating: { $ne: null } } },
            { $group: { _id: null, avgRating: { $avg: '$deliveryRating' } } },
        ]);

        res.json({
            success: true,
            statistics: {
                totalDeliveries,
                deliveredCount,
                deliveryRate: ((deliveredCount / totalDeliveries) * 100).toFixed(1),
                inTransitCount,
                failedCount,
                avgRating: avgRating[0]?.avgRating?.toFixed(1) || 0,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createDelivery,
    getAllDeliveries,
    getDelivery,
    updateDelivery,
    deleteDelivery,
    addTrackingEvent,
    verifyOTP,
    rateDelivery,
    getDeliveryStats,
};
