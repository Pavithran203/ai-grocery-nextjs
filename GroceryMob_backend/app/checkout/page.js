"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { api, getToken } from "@/services/api";
import OrderSummary from "@/components/OrderSummary";
import { CheckCircle2, Loader2, MapPin, CreditCard, Clock } from "lucide-react";

export default function CheckoutPage() {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [payMethod, setPayMethod] = useState("COD");

  // Delivery slot
  const [deliverySlot, setDeliverySlot] = useState("");

  // Payment credentials
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardNumber: "",
    cardHolderName: "",
    cardExpiry: "",
    cardCvv: "",
    bankName: "",
    walletProvider: "",
    walletNumber: "",
  });

  const subtotal = getCartTotal();
  const discount = 0;

  const DELIVERY_SLOTS = [
    "Today, 10:00 AM – 12:00 PM",
    "Today,  2:00 PM –  4:00 PM",
    "Today,  6:00 PM –  8:00 PM",
    "Tomorrow, 9:00 AM – 11:00 AM",
    "Tomorrow, 1:00 PM –  3:00 PM",
  ];

  const inputClass =
    "w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm";



  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!getToken()) { router.push("/login"); return; }
    if (!deliverySlot) { setError("Please select a delivery slot."); setLoading(false); return; }

    // Validate payment credentials based on payment method
    if (payMethod === "upi" && !paymentDetails.upiId) {
      setError("Please enter your UPI ID.");
      setLoading(false);
      return;
    }
    if (payMethod === "card") {
      if (!paymentDetails.cardHolderName) {
        setError("Please enter cardholder name.");
        setLoading(false);
        return;
      }
      if (!paymentDetails.cardNumber || paymentDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        setError("Please enter a valid 16-digit card number.");
        setLoading(false);
        return;
      }
      if (!paymentDetails.cardExpiry || !/^\d{2}\/\d{2}$/.test(paymentDetails.cardExpiry)) {
        setError("Please enter expiry in MM/YY format.");
        setLoading(false);
        return;
      }
      if (!paymentDetails.cardCvv || paymentDetails.cardCvv.length < 3) {
        setError("Please enter a valid CVV.");
        setLoading(false);
        return;
      }
    }
    if (payMethod === "netbanking" && !paymentDetails.bankName) {
      setError("Please select a bank.");
      setLoading(false);
      return;
    }
    if (payMethod === "wallet" && !paymentDetails.walletProvider) {
      setError("Please select a wallet provider.");
      setLoading(false);
      return;
    }

    const f = e.target.elements;
    const deliveryAddress = {
      full_name: `${f.firstName.value} ${f.lastName.value}`.trim(),
      phone: f.phone.value,
      line1: f.line1.value,
      line2: f.line2?.value || "",
      city: f.city.value,
      state: f.state.value,
      pincode: f.pincode.value,
    };

    try {
      const order = await api.createOrder(
        deliveryAddress,
        payMethod,
        `Slot: ${deliverySlot}`,
        paymentDetails
      );
      clearCart();
      setSuccess(order);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally { setLoading(false); }
  };

  // Success state
  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-emerald-500 flex justify-center mb-6">
          <CheckCircle2 className="w-24 h-24" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Order Placed! 🎉</h2>
        <p className="text-gray-500 mb-1">Order #{success.orderNumber || success.order_number || success._id?.slice(-8).toUpperCase()}</p>
        <p className="text-gray-500 mb-2">Estimated delivery in ~10 minutes.</p>
        <p className="text-gray-500 mb-8">Total: <span className="font-bold text-gray-900 dark:text-white">₹{success.total?.toFixed(2)}</span></p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/")} className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-600 transition-colors">
            Continue Shopping
          </button>
          <button onClick={() => router.push("/orders")} className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            My Orders
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => router.push("/")} className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold">Shop Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 text-sm font-medium border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleCheckout} className="space-y-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800">

          {/* Delivery address */}
          <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-bold">Delivery Address</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">First Name</label>
              <input name="firstName" type="text" required placeholder="John" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Last Name</label>
              <input name="lastName" type="text" required placeholder="Doe" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
            <input name="phone" type="tel" required placeholder="10-digit mobile number" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Address Line 1</label>
            <input name="line1" type="text" required placeholder="Flat / House no. / Street" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Address Line 2 (optional)</label>
            <input name="line2" type="text" placeholder="Area / Landmark" className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
              <input name="city" type="text" required placeholder="Chennai" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">State</label>
              <input name="state" type="text" required placeholder="Tamil Nadu" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Pincode</label>
              <input name="pincode" type="text" required placeholder="600001" maxLength={6} className={inputClass} />
            </div>
          </div>

          {/* Delivery slot */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4">
              <Clock className="w-5 h-5 text-emerald-500" />
              <h3 className="text-xl font-bold">Delivery Slot</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {DELIVERY_SLOTS.map(slot => (
                <label key={slot} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${deliverySlot === slot ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}>
                  <input type="radio" name="slot" value={slot} checked={deliverySlot === slot} onChange={() => setDeliverySlot(slot)} className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{slot}</span>
                </label>
              ))}
            </div>
          </div>



          {/* Payment method */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              <h3 className="text-xl font-bold">Payment Method</h3>
            </div>
            <div className="space-y-3">
              {[
                { value: "COD", label: "Cash on Delivery", desc: "Pay when your order arrives" },
                { value: "upi", label: "UPI", desc: "GPay, PhonePe, Paytm, etc." },
                { value: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
                { value: "netbanking", label: "Net Banking", desc: "All major banks supported" },
                { value: "wallet", label: "Wallet", desc: "Paytm, Amazon Pay, etc." },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payMethod === opt.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}>
                  <input type="radio" name="payment" value={opt.value} checked={payMethod === opt.value} onChange={() => setPayMethod(opt.value)} className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Payment Credentials Form - Conditional Rendering */}
            {payMethod !== "COD" && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 mb-4">Payment Credentials</h4>

                {/* UPI */}
                {payMethod === "upi" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={paymentDetails.upiId}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                      required={payMethod === "upi"}
                      className={inputClass}
                    />
                  </div>
                )}

                {/* Credit/Debit Card */}
                {payMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentDetails.cardHolderName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolderName: e.target.value })}
                        required={payMethod === "card"}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ') })}
                        required={payMethod === "card"}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="12/25"
                          maxLength="5"
                          value={paymentDetails.cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                            setPaymentDetails({ ...paymentDetails, cardExpiry: val });
                          }}
                          required={payMethod === "card"}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength="4"
                          value={paymentDetails.cardCvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })}
                          required={payMethod === "card"}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {payMethod === "netbanking" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Select Bank</label>
                    <select
                      value={paymentDetails.bankName}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                      required={payMethod === "netbanking"}
                      className={inputClass}
                    >
                      <option value="">-- Choose a bank --</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                      <option value="IDBI">IDBI Bank</option>
                      <option value="YES">YES Bank</option>
                      <option value="SC">Standard Chartered</option>
                    </select>
                  </div>
                )}

                {/* Wallet */}
                {payMethod === "wallet" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Select Wallet</label>
                    <select
                      value={paymentDetails.walletProvider}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, walletProvider: e.target.value })}
                      required={payMethod === "wallet"}
                      className={inputClass}
                    >
                      <option value="">-- Choose a wallet --</option>
                      <option value="PAYTM">Paytm</option>
                      <option value="AMAZONPAY">Amazon Pay</option>
                      <option value="MOBIKWIK">MobiKwik</option>
                      <option value="FREECHARGE">Freecharge</option>
                    </select>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4">
                  ✓ Your payment information is secured and encrypted
                </p>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl py-4 font-bold text-base transition-colors">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        {/* Order summary */}
        <div>
          <div className="sticky top-24">
            <OrderSummary showButton={false} discount={discount} />
          </div>
        </div>
      </div>
    </div>
  );
}
