export const COUPONS_DB = [
  { code: "SAVE10", type: "percentage", value: 10, minCartValue: 200, desc: "Get 10% off on orders above ₹200" },
  { code: "FLAT50", type: "flat", value: 50, minCartValue: 300, desc: "Flat ₹50 off on orders above ₹300" },
  { code: "FREESHIP", type: "delivery", value: 0, minCartValue: 199, desc: "Free delivery on orders above ₹199" },
  { code: "FESTIVE20", type: "percentage", value: 20, minCartValue: 500, desc: "Festival Special: 20% off on orders above ₹500" },
  { code: "EXPIRED15", type: "percentage", value: 15, minCartValue: 100, isExpired: true, desc: "15% off (Expired)" }
];

export const couponService = {
  validateCoupon: (code, cartTotal) => {
    if (!code) {
      return { success: false, message: "Please enter a coupon code." };
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = COUPONS_DB.find(c => c.code === normalizedCode);

    if (!coupon) {
      return { success: false, message: "Invalid coupon code." };
    }

    if (coupon.isExpired) {
      return { success: false, message: "This coupon has expired." };
    }

    if (cartTotal < coupon.minCartValue) {
      return { 
        success: false, 
        message: `Add items worth ₹${coupon.minCartValue - cartTotal} more to apply this coupon.` 
      };
    }

    // Validation successful
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.floor(cartTotal * (coupon.value / 100));
    } else if (coupon.type === "flat") {
      discountAmount = coupon.value;
    }
    // For 'delivery' type, the discount is dynamically evaluated in CheckoutScreen based on slot fee

    return { 
      success: true, 
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        desc: coupon.desc,
        discountAmount: discountAmount
      },
      message: "Coupon applied successfully!"
    };
  }
};
