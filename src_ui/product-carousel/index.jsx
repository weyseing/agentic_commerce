import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import { createRoot } from "react-dom/client";
import { useOpenAiGlobal } from "../use-openai-global.js";

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphone",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 2847,
    thumbnail:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Electronics",
    inStock: true,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Smart Watch Series 9",
    price: 449.0,
    rating: 4.9,
    reviews: 5234,
    thumbnail:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Wearables",
    inStock: true,
    badge: "New Arrival",
  },
  {
    id: 3,
    name: "Premium Leather Backpack",
    price: 179.99,
    originalPrice: 229.99,
    rating: 4.7,
    reviews: 1092,
    thumbnail:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    category: "Accessories",
    inStock: true,
    badge: "Sale",
  },
  {
    id: 4,
    name: "Minimalist Running Shoes",
    price: 129.99,
    rating: 4.6,
    reviews: 3421,
    thumbnail:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    category: "Footwear",
    inStock: true,
  },
  {
    id: 5,
    name: "Stainless Steel Water Bottle",
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.9,
    reviews: 8762,
    thumbnail:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    category: "Lifestyle",
    inStock: true,
    badge: "Eco-Friendly",
  },
  {
    id: 6,
    name: "Mechanical Keyboard RGB",
    price: 189.99,
    rating: 4.8,
    reviews: 4156,
    thumbnail:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
    category: "Gaming",
    inStock: false,
  },
];

function getMCPToolOutput() {
  const data = useOpenAiGlobal("toolOutput");
  return data || {};
}

export default function ProductCarousel() {
  const MCPToolOutput = getMCPToolOutput();
  const products = MCPToolOutput?.products?.items || MOCK_PRODUCTS;

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const scrollRef = React.useRef(null);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < products.length - 1;

  const scroll = (dir) => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = 280 + 16;
    const scrollAmt = dir === "left" ? -cardWidth : cardWidth;
    container.scrollBy({ left: scrollAmt, behavior: "smooth" });
    setCurrentIndex((prev) =>
      dir === "left"
        ? Math.max(0, prev - 1)
        : Math.min(products.length - 1, prev + 1)
    );
  };

  return (
    <div className="bg-neutral-50 flex justify-center py-12 px-4">
      <div className="w-full max-w-[1000px] bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Featured Products</h1>
            <p className="text-sm text-neutral-600 mt-1">
              Curated picks just for you
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-100 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-700" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-100 transition-all"
              >
                <ArrowRight className="w-4 h-4 text-neutral-700" />
              </button>
            )}
          </div>
        </div>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                const container = scrollRef.current;
                if (container) {
                  container.scrollTo({
                    left: index * (280 + 16),
                    behavior: "smooth",
                  });
                }
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-neutral-900"
                  : "w-2 bg-neutral-300 hover:bg-neutral-400"
              }`}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

createRoot(document.getElementById("product-carousel-root")).render(<ProductCarousel />);
