import { imgBrisLogotipoBlue, imgClose, imgHouse, imgUser, imgBag, imgPhone } from "../data";

export function MobileMenu({
  open,
  onClose,
  onNav,
}: {
  open: boolean;
  onClose: () => void;
  onNav: (section: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#d9d9d9] w-[85%] max-w-sm h-full pt-6 pb-10 flex flex-col">
        <div className="flex items-center justify-between px-6">
          <img src={imgBrisLogotipoBlue} alt="Bris" className="h-10" />
          <button onClick={onClose}>
            <img src={imgClose} alt="fechar" className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-10 flex flex-col gap-6 px-8">
          {[
            { icon: imgHouse, label: "INICIO", section: "hero" },
            { icon: imgUser, label: "SOBRE NÓS", section: "about" },
            { icon: imgBag, label: "PRODUTOS", section: "products" },
            { icon: imgPhone, label: "CONTATO", section: "contact" },
          ].map(({ icon, label, section }) => (
            <button
              key={section}
              className="flex items-center gap-4 text-[#0d4380] font-semibold text-[15px]"
              onClick={() => {
                onNav(section);
                onClose();
              }}
            >
              <img src={icon} alt="" className="w-9 h-9" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
