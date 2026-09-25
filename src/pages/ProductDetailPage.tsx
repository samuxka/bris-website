import { useState } from "react";
import { Product, imgBrisLogotipo } from "../data";
import { BackArrow } from "../components/BackArrow";

export function ProductDetailPage({
  product,
  onBack,
}: {
  product: Product;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"ingredientes" | "recheios" | "especificacoes">("ingredientes");

  return (
    <div className="bg-[#0d4380] min-h-screen text-white">
      <header className="sticky top-0 z-40 flex items-center gap-4 px-6 py-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          <BackArrow />
          Voltar
        </button>
        <img src={imgBrisLogotipo} alt="Bris" className="h-9 ml-auto" />
      </header>

      <div className="max-w-xl mx-auto px-6 pb-20">
        {/* Product hero */}
        <div className="bg-white/10 rounded-2xl flex items-center justify-center h-64 mb-8">
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-auto object-contain drop-shadow-xl"
          />
        </div>

        {/* Title + price */}
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-2xl font-extrabold tracking-widest">{product.name}</h1>
          <span className="text-2xl font-extrabold">{product.price}</span>
        </div>

        {/* Category badge */}
        <span className="inline-block bg-white/15 text-white text-[10px] font-semibold px-3 py-1 rounded-full mb-5">
          {product.category}
        </span>

        {/* Description */}
        <p className="text-white/80 text-sm leading-[1.6] mb-8">{product.description}</p>

        {/* Tabs */}
        <div className="flex border-b border-white/20 mb-6">
          {(["ingredientes", "recheios", "especificacoes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 mr-6 text-xs font-semibold tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-white text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {t === "ingredientes" ? "Ingredientes" : t === "recheios" ? "Recheios" : "Especificações"}
            </button>
          ))}
        </div>

        {tab === "ingredientes" && (
          <div>
            {product.ingredients && product.ingredients.length > 0 ? (
              <ul className="space-y-2">
                {product.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/50 text-sm">Informação não disponível.</p>
            )}

            {product.allergens && product.allergens.length > 0 && (
              <div className="mt-8 bg-white/10 rounded-xl p-4">
                <p className="text-xs font-semibold tracking-widest mb-3 text-white/60 uppercase">
                  Alergénios
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((a) => (
                    <span
                      key={a}
                      className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "recheios" && (
          <div className="space-y-2">
            {product.recheios && product.recheios.length > 0 ? (
              <ul className="space-y-2">
                {product.recheios.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/50 text-sm">Informação não disponível.</p>
            )}
          </div>
        )}

        {tab === "especificacoes" && (
          <div className="space-y-4">
            {[
              { label: "Peso / Quantidade", value: product.weight },
              { label: "Porções", value: product.servings },
              { label: "Validade", value: product.shelf },
              { label: "Categoria", value: product.category },
            ].map(({ label, value }) =>
              value ? (
                <div
                  key={label}
                  className="flex items-start justify-between border-b border-white/10 pb-4"
                >
                  <span className="text-xs text-white/50 font-medium">{label}</span>
                  <span className="text-sm font-semibold text-right max-w-[55%]">{value}</span>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Order CTA */}
        <div className="mt-10 bg-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[#0d4380] font-extrabold text-sm mb-0.5">Quer encomendar?</p>
            <p className="text-[#0d4380]/60 text-xs">Contacta-nos pelo WhatsApp</p>
          </div>
          <a
            href="https://wa.me/351961800870"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0d4380] text-white text-xs font-semibold px-5 py-2.5 rounded-[10px] hover:bg-[#092d58] transition-colors"
          >
            Encomendar
          </a>
        </div>
      </div>
    </div>
  );
}
