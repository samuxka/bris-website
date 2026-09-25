import { useState, useRef, UIEvent } from "react";
import { ProductCard } from "./ProductCard";
import { Product } from "../data";

export function ProductCarousel({
  products,
  onDetails,
}: {
  products: Product[];
  onDetails: (p: Product) => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.firstElementChild) {
      // Calculate active page based on scroll position
      const itemWidth = (e.currentTarget.firstElementChild as HTMLElement).offsetWidth + 16; // 16px for gap-4
      const newPage = Math.round(e.currentTarget.scrollLeft / itemWidth);
      if (newPage !== currentPage && newPage < products.length) {
        setCurrentPage(newPage);
      }
    }
  };

  const scrollToPage = (i: number) => {
    if (scrollRef.current && scrollRef.current.firstElementChild) {
      const itemWidth = (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 16;
      scrollRef.current.scrollTo({ left: i * itemWidth, behavior: "smooth" });
      setCurrentPage(i);
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 gap-4 pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[75%] sm:w-[250px]">
            <ProductCard product={p} onDetails={onDetails} />
          </div>
        ))}
        {/* Helper to ensure padding at the end of scroll */}
        <div className="shrink-0 w-2"></div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-2">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToPage(i)}
            className={`rounded-full transition-all ${
              i === currentPage
                ? "bg-white w-12 h-1.5"
                : "bg-[#b1b1b1] w-5 h-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
