import { useState } from "react";
import { MobileMenu } from "../components/MobileMenu";
import { ProductCarousel } from "../components/ProductCarousel";
import { Product, ALL_PRODUCTS, imgBrisLogotipo, imgMenu, BAKERY_BG, imgBrisBlue, imgArrowDown, imgPhone, imgInstagram, imgFacebook, imgTiktok } from "../data";

export function LandingPage({
  onViewAll,
  onDetails,
}: {
  onViewAll: () => void;
  onDetails: (p: Product) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // just top 5 products for featured section
  const featuredProducts = ALL_PRODUCTS.slice(0, 5);

  function scrollTo(section: string) {
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="bg-[#0d4380] min-h-screen text-white font-[Outfit]">
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNav={scrollTo}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-5">
        <img src="https://res.cloudinary.com/dtxa1leih/image/upload/v1790335517/d992f_z8rjjg.png" alt="Bris" className="h-10" />
        <button onClick={() => setMenuOpen(true)}>
          <img src={imgMenu} alt="menu" className="w-6 h-6" />
        </button>
      </header>

      {/* Hero */}
      <section
        id="hero"
        className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden"
      >
        <img
          src={BAKERY_BG}
          alt="bakery"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0d4380]/80" />
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
          <img
            src="https://res.cloudinary.com/dtxa1leih/image/upload/v1790335517/e8597_hzai4j.png"
            alt="Bris"
            className="w-52 drop-shadow-2xl"
          />
          <button
            onClick={() => scrollTo("about")}
            className="bg-white text-[#0d4380] font-semibold text-sm px-10 py-2.5 rounded-[10px] hover:bg-white/90 transition-colors"
          >
            Saiba mais
          </button>
          <button onClick={() => scrollTo("about")}>
            <img src={imgArrowDown} alt="rolar" className="w-6 h-6 mt-2 animate-bounce" />
          </button>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-14 max-w-xl mx-auto">
        <p className="text-xs font-light tracking-widest mb-6">SOBRE NÓS</p>
        <div className="text-[13px] font-medium leading-[1.4] space-y-4">
          <p>Nascemos em 2026. Sim, eu sei… BEM recente.</p>
          <p>
            Ainda não tivemos tempo suficiente para construir aquela "HISTÓRIA"
            digna de filme, cheia de capítulos e memórias de anos. Mas,
            pensando bem, talvez essa seja justamente a parte mais bonita: você
            pode fazer parte dela desde o começo.
          </p>
          <p>
            Somos um casal que se ama e que também ama aquilo que faz. A Bris
            nasceu desse carinho, da vontade de criar algo nosso e,
            principalmente, de colocar amor em cada coisa que sai da nossa
            cozinha.
          </p>
          <p>
            Cada pão, brownie, biscoito ou qualquer outra coisa que preparamos
            carrega um pedacinho de nós. Desde a escolha dos ingredientes até
            aquele último detalhe antes de chegar às suas mãos, tudo é feito
            com cuidado e, claro, com muito amor.
          </p>
          <p>
            A nossa história ainda está começando. E talvez o mais legal seja
            saber que você pode estar nela. ❤️
          </p>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="px-6 py-10">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <p className="text-md font-light tracking-widest">NOSSOS PRODUTOS</p>
            <button
              onClick={onViewAll}
              className="text-xs font-light tracking-widest underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              VER TODOS
            </button>
          </div>

          <ProductCarousel products={featuredProducts} onDetails={onDetails} />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-white mt-10">
        <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4">
            <h2 className="font-extrabold text-[#0d4380] text-xl tracking-widest">
              FALE CONOSCO
            </h2>
            <p className="text-[#0d4380] text-xs font-medium leading-[1.4]">
              Estamos localizado em Torres Vedras,
              <br />
              por enquanto não temos espaço fisico
              <br />
              mas fazemos entregas
            </p>
            <div>
              <p className="text-[#0d4380] text-xs font-medium mb-1">
                Encomendas
              </p>
              <div className="flex items-center gap-2">
                <img src={imgPhone} alt="" className="w-5 h-5" />
                <span className="text-[#0d4380] font-medium text-sm">
                  961 800 870
                </span>
              </div>
            </div>
            <div>
              <p className="text-[#0d4380] text-xs font-medium mb-2">
                Siga-nos
              </p>
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/bris_pastelaria/">
                  <img src={imgInstagram} alt="Instagram" className="w-5 h-5" />
                </a>
                <img src={imgFacebook} alt="Facebook" className="w-5 h-5" />
                <img src={imgTiktok} alt="TikTok" className="w-5 h-5" />
              </div>
            </div>
          </div>
          <img
            src="https://res.cloudinary.com/dtxa1leih/image/upload/v1790335517/e8597_hzai4j.png"
            alt="Bris"
            className="w-40 self-center sm:self-auto"
          />
        </div>
        <div className="border-t border-[#0d4380]/10 px-6 py-4 max-w-xl mx-auto">
          <p className="text-[#0d4380] text-[10px] font-medium">
            © 2026 Bris. Todos os direitos reservados.
          </p>
        </div>
      </section>
    </div>
  );
}
