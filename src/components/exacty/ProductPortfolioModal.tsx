import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, UserRound, X } from "lucide-react";
import type { PortfolioItem } from "./productPortfolioData";
import { getWhatsAppUrl } from "./WhatsAppLink";

type ProductPortfolioModalProps = {
  isOpen: boolean;
  item: PortfolioItem | null;
  onClose: () => void;
};

const easeOut = [0.22, 1, 0.36, 1] as const;
const isAcidoHialuronicoTitle = (title: string) => title === "Preenchedores de Ácido Hialurônico";

const splitSemicolonList = (value: string) =>
  value
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

const SpecsValue = ({ label, value }: { label: string; value: string }) => {
  const [expanded, setExpanded] = React.useState(false);

  if (label !== "Marcas") {
    return <p className="mt-2 text-sm leading-6 text-zinc-200">{value}</p>;
  }

  const brands = splitSemicolonList(value);
  const visibleCount = 8;
  const visible = expanded ? brands : brands.slice(0, visibleCount);
  const hasMore = brands.length > visibleCount;

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2">
        {visible.map((brand) => (
          <span
            key={brand}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200 backdrop-blur-lg"
          >
            {brand}
          </span>
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs font-medium text-violet-300/80 transition-colors duration-200 hover:text-violet-200"
        >
          {expanded ? "Ver menos" : "Ver todas"}
        </button>
      ) : null}
    </div>
  );
};

const ProductPortfolioModal = ({ isOpen, item, onClose }: ProductPortfolioModalProps) => {
  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && item ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6"
        >
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Fechar modal"
          />

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.35, ease: easeOut }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-modal-title"
            className="relative z-10 w-full max-w-6xl"
          >
            <div className="relative max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[36px] border border-white/10 bg-white/[0.05] shadow-[0_40px_140px_rgba(0,0,0,0.52)] backdrop-blur-xl md:max-h-[calc(100vh-3rem)]">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_24%,transparent_100%)] opacity-70" />
              <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-zinc-200 backdrop-blur-lg transition-all duration-300 hover:border-violet-400/30 hover:bg-white/[0.08] hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative z-10 p-6 md:p-8 lg:p-10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                  <div className="relative flex min-h-[340px] items-center justify-center rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12),rgba(255,255,255,0.02)_42%,transparent_70%)] p-6 md:min-h-[420px]">
                    <div className="absolute inset-0 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_35%,transparent_100%)]" />
                    <img
                      src={item.image.src}
                      alt={item.title}
                      width={item.image.width}
                      height={item.image.height}
                      loading="eager"
                      decoding="async"
                      className="relative z-10 max-h-[320px] w-full object-contain md:max-h-[380px]"
                    />

                    {isAcidoHialuronicoTitle(item.title) ? (
                      <>
                        <div className="pointer-events-none absolute left-6 top-6 z-20 rounded-full bg-red-600/90 px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_16px_44px_rgba(185,28,28,0.22)]">
                          VENDA PARA PROFISSIONAIS HABILITADOS
                        </div>
                        <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-[min(92%,560px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-lg">
                          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-white/85">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-violet-300/80" aria-hidden="true" />
                              1ml
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-violet-300/80" aria-hidden="true" />
                              Gel estéril/Injetável
                            </span>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-violet-200/70">
                      FICHA COMERCIAL
                    </p>

                    <h3
                      id="portfolio-modal-title"
                      className="mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50 md:text-4xl"
                    >
                      {item.title}
                    </h3>

                    <p className="mt-4 text-base leading-8 text-zinc-400">{item.description}</p>

                    <div className="mt-8 space-y-6">
                      <div>
                        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-violet-200/70">
                          Profissionais que podem aplicar
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {item.canApply.map((role) => (
                            <div
                              key={role}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 backdrop-blur-lg"
                            >
                              <UserRound className="h-4 w-4 text-violet-300" />
                              <span>{role}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-violet-200/70">
                          Profissionais que podem comprar
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {item.canBuy.map((role) => (
                            <div
                              key={role}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 backdrop-blur-lg"
                            >
                              <ShieldCheck className="h-4 w-4 text-violet-300" />
                              <span>{role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-violet-200/70">
                        Especificações técnicas
                      </p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {item.specs.map((spec) => (
                          <div
                            key={spec.label}
                            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-lg"
                          >
                            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{spec.label}</p>
                            <SpecsValue label={spec.label} value={spec.value} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#8b5cf6_0%,#6d28d9_100%)] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(139,92,246,0.28)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_18px_36px_rgba(139,92,246,0.34)]"
                      >
                        Solicitar catálogo
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ProductPortfolioModal;
