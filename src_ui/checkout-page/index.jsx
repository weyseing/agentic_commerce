import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ShoppingBag, CreditCard, Truck, Lock, X, Tag, Check,
  Shield, Package, ChevronRight
} from "lucide-react";

const MOCK_CART_ITEMS = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphone",
    price: 299.99,
    quantity: 1,
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop"
  },
  {
    id: 2,
    name: "Smart Watch Series 9",
    price: 449.0,
    quantity: 1,
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop"
  }
];

export default function CompactCheckout() {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const discount = appliedPromo ? subtotal * 0.1 : 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal + shipping + tax - discount;

  const updateQty = (id, d) =>
    setCartItems((it) =>
      it.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))
    );

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "SAVE10") setAppliedPromo({ code: promoCode });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("✅ Order placed successfully! Total: $" + total.toFixed(2));
  };

  const steps = [
    { num: 1, label: "Contact", icon: ShoppingBag },
    { num: 2, label: "Shipping", icon: Truck },
    { num: 3, label: "Payment", icon: CreditCard }
  ];

  return (
    <div className="w-full bg-neutral-50 flex justify-center p-6">
      <div className="w-full max-w-[1000px] bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-neutral-900">Checkout</h1>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-neutral-700">Secure</span>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center gap-6 py-3 border-b border-neutral-100 bg-neutral-50">
          {steps.map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 cursor-pointer transition ${
                step === s.num ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm ${
                  step >= s.num
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white border-neutral-300"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Form Area */}
          <div className="space-y-6">
            {/* Step 1 - Contact */}
            {step === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <h2 className="text-lg font-semibold text-neutral-900">Contact Information</h2>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition"
                >
                  Continue to Shipping
                </button>
              </div>
            )}

            {/* Step 2 - Shipping */}
            {step === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <h2 className="text-lg font-semibold text-neutral-900">Shipping Address</h2>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="col-span-2 px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={form.zipCode}
                    onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                    className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 - Payment */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-3 animate-fadeIn">
                <h2 className="text-lg font-semibold text-neutral-900">Payment Details</h2>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={form.cardNumber}
                  onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                />
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={form.cardName}
                  onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                    className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>Your payment is encrypted and secure.</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800"
                >
                  Complete Order – ${total.toFixed(2)}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-2.5 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50"
                >
                  Back to Shipping
                </button>
              </form>
            )}
          </div>

          {/* Summary */}
          <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 h-fit">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>
            <div className="space-y-4 mb-5 max-h-56 overflow-y-auto">
              {cartItems.map((i) => (
                <div key={i.id} className="flex gap-3 border-b border-neutral-100 pb-3">
                  <img
                    src={i.thumbnail}
                    alt={i.name}
                    className="w-14 h-14 rounded-lg object-cover border border-neutral-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900 line-clamp-1">{i.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-2 border border-neutral-200 px-2 py-0.5 rounded-md text-xs">
                        <button onClick={() => updateQty(i.id, -1)}>−</button>
                        <span>{i.quantity}</span>
                        <button onClick={() => updateQty(i.id, 1)}>+</button>
                      </div>
                      <span className="text-sm font-semibold">${(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping ? `$${shipping}` : "Free"}</span></div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span><span>- ${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 text-sm"
              />
              <button
                onClick={applyPromo}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800"
              >
                Apply
              </button>
            </div>
            {appliedPromo && (
              <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                ✅ Code applied: 10% off
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("checkout-page-root")).render(<CompactCheckout />);
