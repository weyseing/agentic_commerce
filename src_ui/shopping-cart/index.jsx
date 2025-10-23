import React, { useState } from "react";
import {
  ShoppingCart, X, Plus, Minus, ArrowRight, Trash2, Tag, ShoppingBag, Heart, Check
} from "lucide-react";
import { createRoot } from "react-dom/client";

const MOCK_CART_ITEMS = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphone",
    price: 299.99,
    originalPrice: 399.99,
    quantity: 1,
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    category: "Electronics",
    inStock: true
  },
  {
    id: 2,
    name: "Smart Watch Series 9",
    price: 449.0,
    quantity: 1,
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
    category: "Wearables",
    inStock: true
  },
  {
    id: 3,
    name: "Premium Leather Backpack",
    price: 179.99,
    originalPrice: 229.99,
    quantity: 2,
    thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
    category: "Accessories",
    inStock: true
  }
];

export default function CompactCart() {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = appliedPromo ? subtotal * 0.1 : 0;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal + shipping + tax - discount;
  const itemsCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const updateQty = (id, d) =>
    setCartItems((items) =>
      items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))
    );

  const removeItem = (id) => setCartItems((items) => items.filter((i) => i.id !== id));

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setAppliedPromo({ code: promoCode, discount: 10 });
    }
  };

  return (
    <div className="bg-neutral-50 flex justify-center p-6">
      <div className="w-full max-w-[1000px] bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">Your Cart</h1>
              <p className="text-sm text-neutral-600">
                {itemsCount} {itemsCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900 transition">
            <span className="font-medium">Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-1">Your cart is empty</h2>
                <p className="text-sm text-neutral-600 mb-4">Add items to get started</p>
                <button className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const discountPercent = item.originalPrice
                    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 transition"
                    >
                      <div className="relative">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover border border-neutral-200"
                        />
                        {discountPercent > 0 && (
                          <div className="absolute -top-2 -right-2 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                            -{discountPercent}%
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-neutral-900 truncate">{item.name}</p>
                        <p className="text-xs text-neutral-600 mb-1">{item.category}</p>
                        <p
                          className={`text-xs font-medium inline-block px-2 py-0.5 rounded ${
                            item.inStock
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-2 border border-neutral-200 rounded-lg px-2 py-0.5 bg-neutral-50">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="p-1 w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-white hover:bg-neutral-900 rounded transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-semibold w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="p-1 w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-white hover:bg-neutral-900 rounded transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-neutral-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                <button className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition text-sm">
                  <Heart className="w-4 h-4" /> Save for Later
                </button>
                <button
                  onClick={() => setCartItems([])}
                  className="flex items-center gap-2 text-sm text-neutral-600 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" /> Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 h-fit">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h2>
            <div className="mb-4">
              <label className="text-sm font-medium text-neutral-700">Promo Code</label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 text-sm outline-none"
                  />
                </div>
                <button
                  onClick={applyPromo}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                  <Check className="w-3 h-3" /> Code applied: {appliedPromo.discount}% off
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm border-t border-neutral-200 pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span><span>- ${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between"><span>Shipping</span><span>{shipping ? `$${shipping}` : "Free"}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full mt-4 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            {shipping > 0 && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-center">
                Add <span className="font-semibold text-neutral-900">${(100 - subtotal).toFixed(2)}</span> more for free shipping
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("shopping-cart-root")).render(<CompactCart />);
