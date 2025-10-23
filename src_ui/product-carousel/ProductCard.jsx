import React from "react";
import { Star, ShoppingCart, Heart } from "lucide-react";

export default function ProductCard({ product }) {
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-w-[280px] max-w-[280px] flex-shrink-0 select-none">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-auto">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.badge && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${
                product.badge === 'Sale' ? 'bg-rose-50/95 text-rose-700 border-rose-200' :
                product.badge === 'New Arrival' ? 'bg-indigo-50/95 text-indigo-700 border-indigo-200' :
                product.badge === 'Best Seller' ? 'bg-amber-50/95 text-amber-700 border-amber-200' :
                'bg-emerald-50/95 text-emerald-700 border-emerald-200'
              }`}>
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-slate-700">
                -{discount}%
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center border border-slate-200 hover:border-slate-300 hover:scale-110 transition-all shadow-lg"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`}
            />
          </button>

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-white px-5 py-2.5 rounded-xl font-semibold text-slate-900 shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category */}
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            {product.category}
          </div>

          {/* Product Name */}
          <h3 className="text-base font-semibold text-slate-900 line-clamp-2 mb-3 min-h-[3rem] leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="text-sm font-bold text-slate-900">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {product.reviews.toLocaleString()} reviews
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2.5 mb-5">
            <span className="text-2xl font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-400 line-through font-medium">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
              !product.inStock 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : isAdding
                ? 'bg-emerald-600 text-white border border-emerald-700 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 border border-slate-900'
            }`}
          >
            {isAdding ? (
              <>
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4.5 h-4.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
