import { useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { imgBrisLogotipoBlue } from '../data';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLoginPage({ onSuccess, onBack }: AdminLoginPageProps) {
  const { loginAdmin } = useStore();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pinValue = digits.join('');
  const isComplete = /^\d{6}$/.test(pinValue);

  function handleDigitChange(idx: number, raw: string) {
    setError(null);
    // Strictly allow ONLY numeric characters
    const numeric = raw.replace(/\D/g, '');
    if (!numeric) {
      setDigits((prev) => {
        const next = [...prev];
        next[idx] = '';
        return next;
      });
      return;
    }

    // Handle multi-digit paste or fast typing
    if (numeric.length > 1) {
      const sliced = numeric.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      for (let i = 0; i < sliced.length; i++) {
        next[i] = sliced[i];
      }
      setDigits(next);
      const focusIdx = Math.min(sliced.length, 5);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      next[idx] = numeric;
      return next;
    });
    if (idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await loginAdmin(pinValue);
    setSubmitting(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(res.error || 'Código inválido.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061e3c] via-[#0d4380] to-[#1a5fa8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src={imgBrisLogotipoBlue}
            alt="Bris Pastelaria"
            className="h-10 mb-5"
          />
          <div className="w-12 h-12 rounded-2xl bg-[#eef4fc] text-[#0d4380] flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#071f3b]">
            Painel Administrativo
          </h1>
          <p className="text-xs sm:text-sm text-[#647b96] mt-1.5">
            Digite o código de acesso de <strong>6 números</strong> para
            gerenciar produtos e promoções.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#526d8a]">
                Código PIN (6 dígitos)
              </label>
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0d4380] hover:underline cursor-pointer"
              >
                {showPin ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Mostrar
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2.5">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={digit}
                  autoFocus={idx === 0}
                  aria-label={`Dígito ${idx + 1} do PIN`}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-full h-14 text-center text-xl font-extrabold rounded-xl border-2 border-[#d6e4f7] bg-[#f8fafd] text-[#071f3b] focus:outline-none focus:border-[#0d4380] focus:bg-white transition-all"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isComplete || submitting}
            className="w-full py-3.5 px-5 rounded-xl bg-[#0d4380] hover:bg-[#092d58] disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Entrar no Painel
              </>
            )}
          </button>
        </form>

        <div className="mt-7 pt-5 border-t border-[#eff4fa] text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647b96] hover:text-[#0d4380] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a Loja
          </button>
        </div>
      </div>
    </div>
  );
}
