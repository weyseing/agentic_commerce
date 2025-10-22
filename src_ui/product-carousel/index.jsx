import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import { createRoot } from "react-dom/client";
import { useOpenAiGlobal } from "../use-openai-global.js";

// product data
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 2847,
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Electronics",
    inStock: true,
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Smart Watch Series 9",
    price: 449.00,
    rating: 4.9,
    reviews: 5234,
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Wearables",
    inStock: true,
    badge: "New Arrival"
  },
  {
    id: 3,
    name: "Premium Leather Backpack",
    price: 179.99,
    originalPrice: 229.99,
    rating: 4.7,
    reviews: 1092,
    thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    category: "Accessories",
    inStock: true,
    badge: "Sale"
  },
  {
    id: 4,
    name: "Minimalist Running Shoes",
    price: 129.99,
    rating: 4.6,
    reviews: 3421,
    thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    category: "Footwear",
    inStock: true
  },
  {
    id: 5,
    name: "Stainless Steel Water Bottle",
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.9,
    reviews: 8762,
    thumbnail: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    category: "Lifestyle",
    inStock: true,
    badge: "Eco-Friendly"
  },
  {
    id: 6,
    name: "Mechanical Keyboard RGB",
    price: 189.99,
    rating: 4.8,
    reviews: 4156,
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
    category: "Gaming",
    inStock: false
  }
];

// Get MCP tool output
function getMCPToolOutput() {
  const data = useOpenAiGlobal("toolOutput");
  return data || {};
}

function App() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const scrollContainerRef = React.useRef(null);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < MOCK_PRODUCTS.length - 1;

  // Get MCP tool output
  const MCPToolOutput = getMCPToolOutput();
  
  // Get products from MCP output, fallback to mock data
  const products = MCPToolOutput?.products || MOCK_PRODUCTS;

  // scroll handler
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = 280 + 16;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setCurrentIndex(prev => 
      direction === 'left' 
        ? Math.max(0, prev - 1) 
        : Math.min(MOCK_PRODUCTS.length - 1, prev + 1)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Carousel Container */}
        <div className="relative">
          {/* Products Scroll Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-2xl shadow-slate-900/10 flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-110 z-10 border border-slate-200"
              aria-label="Previous products"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-2xl shadow-slate-900/10 flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-110 z-10 border border-slate-200"
              aria-label="Next products"
            >
              <ArrowRight className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
            </button>
          )}

          {/* Edge Gradients */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-100 via-slate-100/60 to-transparent pointer-events-none z-[5]" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-100 via-slate-100/60 to-transparent pointer-events-none z-[5]" />
          )}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-10">
          {MOCK_PRODUCTS.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                const container = scrollContainerRef.current;
                if (container) {
                  container.scrollTo({
                    left: index * (280 + 16),
                    behavior: 'smooth'
                  });
                }
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-10 bg-slate-900' 
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Mount to DOM
createRoot(document.getElementById("product-carousel-root")).render(<App />);