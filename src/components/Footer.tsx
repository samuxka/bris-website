import { MessageCircle, Phone } from 'lucide-react';
import {
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  WHATSAPP_NUMBER,
  imgBrisLogotipoWhite,
} from '../data';

interface FooterProps {
  onNavigate: (path: string, hash?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#061e3c] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="flex flex-col items-center text-center">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="mb-6 focus:outline-none cursor-pointer"
          >
            <img
              src={imgBrisLogotipoWhite}
              alt="Bris Pastelaria"
              className="h-10 w-auto object-contain"
            />
          </button>

          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs font-medium text-white/75 mb-6">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/', 'featured')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/', 'sale')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sale
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/', 'story')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Nossa História
            </button>
          </nav>

          {/* Social circular icons matching reference */}
          <div className="flex items-center gap-3 mb-10">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Bris Pastelaria"
              className="w-9 h-9 rounded-full bg-white text-[#061e3c] flex items-center justify-center hover:bg-[#dce9f9] transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Bris Pastelaria"
              className="w-9 h-9 rounded-full bg-white text-[#061e3c] flex items-center justify-center hover:bg-[#dce9f9] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              aria-label={`Ligar ${PHONE_DISPLAY}`}
              className="w-9 h-9 rounded-full bg-white text-[#061e3c] flex items-center justify-center hover:bg-[#dce9f9] transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/55">
          <p>
            © 2026 Bris Pastelaria · Torres Vedras ({PHONE_DISPLAY}). Todos os
            direitos reservados.
          </p>
          <div className="flex items-center gap-5">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Encomendas
            </a>
            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Área Administrativa
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
