import * as React from "react";
import acido from "@/assets/acido-hialuronico.png";
import bioestimulador from "@/assets/bioestimuladores-de-colageno.png";
import mockup from "@/assets/mockup.png";
import soro from "@/assets/soro.png";
import toxina from "@/assets/toxina-botulinica.png";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, UserRound, X } from "lucide-react";
import { getWhatsAppUrl } from "./WhatsAppLink";

type ProductSpec = {
  label: string;
  value: string;
};

type PortfolioItem = {
  title: string;
  posterImage: string;
  detailImage: string;
  description: string;
  canApply: string[];
  canBuy: string[];
  specs: ProductSpec[];
};

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    title: "Toxina Botulínica",
    posterImage: toxina,
    detailImage: toxina,
    description:
      "Soluções para harmonização facial com procedência, rastreabilidade e suporte consultivo para rotinas clínicas que exigem conservação rigorosa.",
    canApply: ["Biomédicos", "Dentistas", "Médicos"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "Nabota, Botulim, Botox, Botulift" },
      { label: "Armazenamento", value: "Controle rigoroso de temperatura" },
      { label: "Disponibilidade", value: "Consulte estoque e lote" },
      { label: "Categoria", value: "Injetáveis para estética avançada" },
    ],
  },
  {
    title: "Preenchedores de Ácido Hialurônico",
    posterImage: acido,
    detailImage: acido,
    description:
      "Linhas para volumização, contorno e refinamento facial com procedência homologada e apoio comercial para escolha da melhor apresentação.",
    canApply: ["Biomédicos", "Dentistas", "Médicos"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "Rennova, Saypha, Finahfil, E.P.T.Q., Biogelis" },
      { label: "Apresentação", value: "Protocolos para volumização e refinamento" },
      { label: "Conservação", value: "Transporte e armazenamento monitorados" },
      { label: "Disponibilidade", value: "Consulte lote, validade e estoque" },
    ],
  },
  {
    title: "Bioestimuladores de Colágeno",
    posterImage: bioestimulador,
    detailImage: bioestimulador,
    description:
      "Portfólio voltado para protocolos de firmeza e estímulo dérmico, com rastreabilidade completa e suporte consultivo para planejamento clínico.",
    canApply: ["Biomédicos", "Dentistas", "Médicos"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "Elleva, Diamond, Nutriex" },
      { label: "Faixa de uso", value: "Protocolos faciais e corporais conforme indicação" },
      { label: "Armazenamento", value: "Condições controladas de conservação" },
      { label: "Disponibilidade", value: "Estoque consultivo sob demanda" },
    ],
  },
  {
    title: "Fios de PDO",
    posterImage: mockup,
    detailImage: mockup,
    description:
      "Fios para sustentação e estímulo tecidual com atendimento consultivo para protocolos avançados e disponibilidade alinhada à agenda da clínica.",
    canApply: ["Biomédicos", "Dentistas", "Médicos"],
    canBuy: ["Clínicas", "Profissionais habilitados", "Pessoa jurídica da área"],
    specs: [
      { label: "Marcas", value: "i-Thread, Prodeep" },
      { label: "Apresentação", value: "Configurações variadas para diferentes protocolos" },
      { label: "Categoria", value: "Sustentação e bioestimulação tecidual" },
      { label: "Disponibilidade", value: "Consulte medidas e estoque atual" },
    ],
  },
  {
    title: "Insumos Descartáveis",
    posterImage: soro,
    detailImage: soro,
    description:
      "Materiais de apoio para procedimentos estéticos com logística ágil, padronização de fornecimento e reposição para o dia a dia da clínica.",
    canApply: ["Biomédicos", "Dentistas", "Enfermeiros", "Médicos"],
    canBuy: ["Clínicas", "Consultórios", "Pessoa jurídica da área"],
    specs: [
      { label: "Aplicação", value: "Apoio a procedimentos clínicos e estéticos" },
      { label: "Disponibilidade", value: "Reposição recorrente conforme demanda" },
      { label: "Armazenamento", value: "Organização e logística para uso imediato" },
      { label: "Categoria", value: "Materiais descartáveis para rotina profissional" },
    ],
  },
  {
    title: "Equipamentos Estéticos",
    posterImage: mockup,
    detailImage: mockup,
    description:
      "Equipamentos e acessórios para complementar protocolos com atendimento consultivo, orientação comercial e curadoria alinhada ao perfil da clínica.",
    canApply: ["Biomédicos", "Dentistas", "Esteticistas", "Médicos"],
    canBuy: ["Clínicas", "Consultórios", "Pessoa jurídica da área"],
    specs: [
      { label: "Linhas", value: "Derma Pen, Derma Roller, Skin Vibra" },
      { label: "Categoria", value: "Equipamentos e acessórios para estética avançada" },
      { label: "Disponibilidade", value: "Consulte modelos e pronta-entrega" },
      { label: "Suporte", value: "Atendimento consultivo para seleção do portfólio" },
    ],
  },
];

const AUTOPLAY_DELAY = 10000;
const easeOut = [0.22, 1, 0.36, 1] as const;

const ProductPortfolioSection = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const selectedItem = selectedIndex !== null ? PORTFOLIO_ITEMS[selectedIndex] : null;

  const syncActiveSlide = React.useCallback(() => {
    if (!api) {
      return;
    }

    setActiveIndex(api.selectedScrollSnap());
  }, [api]);

  const handleSelectProduct = React.useCallback(
    (index: number) => {
      setSelectedIndex(index);
      setIsModalOpen(true);
      api?.scrollTo(index);
    },
    [api],
  );

  const handleCloseModal = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    syncActiveSlide();
    api.on("select", syncActiveSlide);
    api.on("reInit", syncActiveSlide);

    return () => {
      api.off("select", syncActiveSlide);
      api.off("reInit", syncActiveSlide);
    };
  }, [api, syncActiveSlide]);

  React.useEffect(() => {
    if (!api || isModalOpen) {
      return;
    }

    const interval = window.setInterval(() => {
      api.scrollNext();
    }, AUTOPLAY_DELAY);

    return () => {
      window.clearInterval(interval);
    };
  }, [api, activeIndex, isModalOpen]);

  React.useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen]);

  React.useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isModalOpen]);

  return (
    <>
      <section id="produtos" className="relative overflow-hidden bg-[#07050D] py-24 md:py-28 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(4,2,10,0.95),rgba(7,5,13,1))]" />
          <div className="absolute left-1/2 top-16 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-violet-600/18 blur-[130px]" />
          <div className="absolute left-1/2 top-1/3 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[180px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_34%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:18px_18px] opacity-[0.035]" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(to_top,rgba(7,5,13,0.94),transparent)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.72, ease: easeOut }}
            className="mx-auto mb-12 max-w-6xl text-center md:mb-16"
          >
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-violet-200/70">
              PORTFÓLIO ESPECIALIZADO PARA ESTÉTICA AVANÇADA
            </p>

            <h2 className="mx-auto max-w-6xl text-center text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50 sm:text-5xl md:text-6xl lg:whitespace-nowrap">
              <span className="text-zinc-50">Explore o portfólio da </span>
              <span className="bg-[linear-gradient(180deg,#e9defd_0%,#d4b5ff_35%,#a855f7_68%,#7c3aed_100%)] bg-clip-text text-transparent">
                Exacty Med
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-5xl text-center text-sm leading-7 text-zinc-400 sm:text-base lg:whitespace-nowrap">
              Selecione uma categoria para visualizar detalhes do produto, elegibilidade profissional e informações
              técnicas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.08, ease: easeOut }}
            className="relative mx-auto max-w-[1240px]"
          >
            <div className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/16 blur-[120px] sm:h-[420px] sm:w-[420px]" />
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-24 bg-gradient-to-r from-[#07050D] via-[#07050D]/92 to-transparent md:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-24 bg-gradient-to-l from-[#07050D] via-[#07050D]/92 to-transparent md:block" />

            <Carousel
              setApi={setApi}
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="cursor-grab items-stretch px-2 active:cursor-grabbing sm:px-4 md:px-10 lg:px-14">
                {PORTFOLIO_ITEMS.map((item, index) => {
                  const isActive = activeIndex === index;

                  return (
                    <CarouselItem
                      key={item.title}
                      className="basis-[66%] py-4 pl-4 sm:basis-[44%] sm:py-5 lg:basis-[30%] lg:py-6 xl:basis-[26%]"
                    >
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => handleSelectProduct(index)}
                        className={cn(
                          "group relative w-full overflow-hidden rounded-[32px] border bg-white/[0.04] text-left backdrop-blur-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07050D]",
                          "aspect-[0.72/1]",
                          isActive
                            ? "scale-[1.02] border-violet-400/40 shadow-[0_30px_100px_rgba(139,92,246,0.22)]"
                            : "border-white/10 opacity-80 hover:border-white/20 hover:opacity-100",
                        )}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_28%,rgba(0,0,0,0.34)_100%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(139,92,246,0.2),transparent_42%)]" />
                        <div className="absolute inset-3 rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
                        <div
                          className={cn(
                            "absolute inset-0 rounded-[32px] transition-opacity duration-300",
                            isActive
                              ? "bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_18%,rgba(139,92,246,0.12)_58%,rgba(255,255,255,0.02)_100%)] opacity-100"
                              : "opacity-0",
                          )}
                        />

                        <img
                          src={item.posterImage}
                          alt={item.title}
                          className="relative z-10 h-full w-full object-contain px-6 py-8 transition-transform duration-500 group-hover:scale-[1.03]"
                        />

                        <div className="absolute inset-x-4 bottom-4 z-20 rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,rgba(12,10,20,0.74),rgba(25,18,39,0.44))] px-4 py-3 backdrop-blur-xl">
                          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-violet-200/70">Categoria</p>
                          <p className="mt-1 text-sm font-medium leading-5 text-zinc-100">{item.title}</p>
                        </div>
                      </button>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              <CarouselPrevious
                variant="ghost"
                className="left-2 z-30 h-11 w-11 rounded-full border border-white/10 bg-white/[0.06] text-zinc-100 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 hover:border-violet-300/30 hover:bg-violet-500/12 hover:text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.18)] disabled:opacity-0 sm:left-4 md:left-6"
              />
              <CarouselNext
                variant="ghost"
                className="right-2 z-30 h-11 w-11 rounded-full border border-white/10 bg-white/[0.06] text-zinc-100 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 hover:border-violet-300/30 hover:bg-violet-500/12 hover:text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.18)] disabled:opacity-0 sm:right-4 md:right-6"
              />
            </Carousel>
          </motion.div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-6 text-zinc-500">
            Todos os produtos são comercializados exclusivamente para profissionais habilitados, conforme exigência
            regulatória.
          </p>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && selectedItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6"
          >
            <button
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={handleCloseModal}
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
              <div className="relative max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[36px] border border-white/10 bg-white/[0.05] shadow-[0_40px_140px_rgba(0,0,0,0.52)] backdrop-blur-2xl md:max-h-[calc(100vh-3rem)]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_24%,transparent_100%)] opacity-70" />
                <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

                <button
                  onClick={handleCloseModal}
                  className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-zinc-200 backdrop-blur-xl transition-all duration-300 hover:border-violet-400/30 hover:bg-white/[0.08] hover:text-white"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="relative z-10 p-6 md:p-8 lg:p-10">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                    <div className="relative flex min-h-[340px] items-center justify-center rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12),rgba(255,255,255,0.02)_42%,transparent_70%)] p-6 md:min-h-[420px]">
                      <div className="absolute inset-0 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_35%,transparent_100%)]" />
                      <img
                        src={selectedItem.detailImage}
                        alt={selectedItem.title}
                        className="relative z-10 max-h-[320px] w-full object-contain md:max-h-[380px]"
                      />
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-violet-200/70">
                        FICHA COMERCIAL
                      </p>

                      <h3
                        id="portfolio-modal-title"
                        className="mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50 md:text-4xl"
                      >
                        {selectedItem.title}
                      </h3>

                      <p className="mt-4 text-base leading-8 text-zinc-400">{selectedItem.description}</p>

                      <div className="mt-8 space-y-6">
                        <div>
                          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-violet-200/70">
                            Profissionais que podem aplicar
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {selectedItem.canApply.map((role) => (
                              <div
                                key={role}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 backdrop-blur-xl"
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
                            {selectedItem.canBuy.map((role) => (
                              <div
                                key={role}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 backdrop-blur-xl"
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
                          {selectedItem.specs.map((spec) => (
                            <div
                              key={spec.label}
                              className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl"
                            >
                              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{spec.label}</p>
                              <p className="mt-2 text-sm leading-6 text-zinc-200">{spec.value}</p>
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
    </>
  );
};

export default ProductPortfolioSection;
