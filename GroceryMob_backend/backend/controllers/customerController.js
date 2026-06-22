const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');

// ── POST /api/customers - Create new customer ────────────────────
const createCustomer = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { firstName, lastName, email, phone, primaryAddress } = req.body;

        // Check if customer already exists
        const existing = await Customer.findOne({ email });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Customer with this email already exists.',
            });
        }

        const customer = await Customer.create({
            firstName,
            lastName,
            email,
            phone,
            primaryAddress,
            ...req.body,
        });

        res.status(201).json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/customers - Get all customers ──────────────────────
const getAllCustomers = async (req, res) => {
    try {
        const { status, accountType, page = 1, limit = 20, search } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (accountType) filter.accountType = accountType;

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        const customers = await Customer.find(filter)
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Customer.countDocuments(filter);

        res.json({
            success: true,
            customers,
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

// ── GET /api/customers/:id - Get single customer ────────────────
const getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT /api/customers/:id - Update customer ────────────────────
const updateCustomer = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            primaryAddress,
            status,
            accountType,
            preferredPaymentMethod,
            subscribeTonewsletter,
            allowSMS,
            allowEmail,
            allowPushNotifications,
            internalNotes,
            tags,
        } = req.body;

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            {
                firstName,
                lastName,
                phone,
                dateOfBirth,
                primaryAddress,
                status,
                accountType,
                preferredPaymentMethod,
                subscribeToNewsletter: subscribeTonewsletter,
                allowSMS,
                allowEmail,
                allowPushNotifications,
                internalNotes,
                tags,
            },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── DELETE /api/customers/:id - Delete customer ─────────────────
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        res.json({ success: true, message: 'Customer deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/customers/:id/address - Add alternate address ──────
const addAddress = async (req, res) => {
    try {
        const { label, street, city, state, pincode, country } = req.body;

        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        customer.alternateAddresses.push({
            label: label || 'Other',
            street,
            city,
            state,
            pincode,
            country: country || 'India',
        });

        await customer.save();
        res.status(201).json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/customers/stats - Get customer statistics ──────────
const getStatistics = async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ status: 'active' });
        const premiumCustomers = await Customer.countDocuments({ accountType: 'premium' });
        const vipCustomers = await Customer.countDocuments({ accountType: 'vip' });

        const topSpenders = await Customer.find()
            .sort({ totalSpent: -1 })
            .limit(10);

        const avgOrderValue = await Customer.aggregate([
            {
                $group: {
                    _id: null,
                    avgOrderValue: { $avg: '$averageOrderValue' },
                    totalRevenue: { $sum: '$totalSpent' },
                },
            },
        ]);

        res.json({
            success: true,
            statistics: {
                totalCustomers,
                activeCustomers,
                premiumCustomers,
                vipCustomers,
                topSpenders,
                avgOrderValue: avgOrderValue[0]?.avgOrderValue || 0,
                totalRevenue: avgOrderValue[0]?.totalRevenue || 0,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/customers/:id/loyalty - Add loyalty points ─────────
const addLoyaltyPoints = async (req, res) => {
    try {
        const { points } = req.body;

        if (!points || points <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Points must be a positive number.',
            });
        }

        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        await customer.addLoyaltyPoints(points);
        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/customers/:id/order - Record customer order ────────
const recordOrder = async (req, res) => {
    try {
        const { orderAmount } = req.body;

        if (!orderAmount || orderAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Order amount must be a positive number.',
            });
        }

        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        await customer.updateMetrics(orderAmount);
        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/customers/:id/reset-password - Admin reset customer password ──
const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.',
            });
        }

        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        // Update password
        customer.password = newPassword;
        customer.passwordResetToken = undefined;
        customer.passwordResetExpires = undefined;
        await customer.save();

        res.json({
            success: true,
            message: 'Password reset successfully.',
            customer: {
                _id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomer,
    updateCustomer,
    deleteCustomer,
    addAddress,
    getStatistics,
    addLoyaltyPoints,
    recordOrder,
    resetPassword,
};
