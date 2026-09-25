import { ProductCarousel } from "../components/ProductCarousel";
import { BackArrow } from "../components/BackArrow";
import { Product, ALL_PRODUCTS, imgBrisLogotipo } from "../data";

export function CatalogPage({
  onBack,
  onDetails,
}: {
  onBack: () => void;
  onDetails: (p: Product) => void;
}) {
  const categories = Array.from(new Set(ALL_PRODUCTS.map(p => p.category)));

  return (
    <div className="bg-[#0d4380] min-h-screen text-white font-[Outfit]">
      <header className="sticky top-0 z-40 flex items-center gap-4 px-6 py-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          <BackArrow />
          Voltar
        </button>
        <img src="https://res.cloudinary.com/dtxa1leih/image/upload/v1790335517/d992f_z8rjjg.png" alt="Bris" className="h-9 ml-auto" />
      </header>

      <div className="px-6 pb-16 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold tracking-widest mb-2">
          CATÁLOGO
        </h1>
        <p className="text-white/60 text-xs mb-8">
          {ALL_PRODUCTS.length} produtos disponíveis
        </p>

        <div className="flex flex-col gap-14">
          {categories.map((cat) => {
            const categoryProducts = ALL_PRODUCTS.filter((p) => p.category === cat);
            return (
              <div key={cat} className="flex flex-col gap-6 items-start">
                <h3 className="text-xl font-extrabold tracking-widest uppercase text-center sm:text-left">{cat}</h3>
                <ProductCarousel products={categoryProducts} onDetails={onDetails} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
  