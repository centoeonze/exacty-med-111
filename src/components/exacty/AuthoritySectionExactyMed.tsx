import * as React from "react";
import estoqueImage from "@/assets/optimized/estoque.webp";
import vanImage from "@/assets/optimized/van.webp";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Globe2, Route, ShieldCheck, Truck } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Globe2, label: "Envio para todo Brasil" },
  { icon: Truck, label: "Entrega em até 3h em Londrina, Cambé e Ibiporã" },
  { icon: Route, label: "Logística própria" },
  { icon: ShieldCheck, label: "Rastreabilidade total" },
];

const easeOut = [0.22, 1, 0.36, 1] as const;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

type OperationPhoto = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
};

const createOperationPlaceholderDataUri = (title: string) => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1120" viewBox="0 0 900 1120">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#140b22"/>
      <stop offset="0.6" stop-color="#07050d"/>
      <stop offset="1" stop-color="#05020b"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="rgba(255,255,255,0.18)"/>
      <stop offset="0.5" stop-color="rgba(169,124,255,0.16)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0.10)"/>
    </linearGradient>
  </defs>

  <rect x="60" y="60" width="780" height="1000" rx="54" fill="url(#bg)" stroke="url(#edge)" stroke-width="2"/>
  <circle cx="450" cy="470" r="260" fill="rgba(139,92,246,0.11)"/>
  <rect x="150" y="260" width="600" height="520" rx="42" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
  <text x="450" y="520" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="34" font-weight="700" fill="rgba(233,222,253,0.92)">
    ${title}
  </text>
  <text x="450" y="568" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="18" font-weight="500" fill="rgba(207,200,218,0.78)">
    Placeholder preparado para foto real
  </text>
</svg>
`.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const AuthoritySectionExactyMed = () => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const vanTrackRef = React.useRef<HTMLDivElement | null>(null);
  const vanRef = React.useRef<HTMLDivElement | null>(null);
  const stockVisualRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [vanBounds, setVanBounds] = React.useState({ startX: -240, endX: -240 });
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = React.useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const rawVanX = useTransform(scrollYProgress, [0, 1], [vanBounds.startX, vanBounds.endX], { clamp: true });
  const vanX = useSpring(
    rawVanX,
    prefersReducedMotion ? { stiffness: 1000, damping: 1000 } : { stiffness: 180, damping: 30, mass: 0.45 },
  );

  React.useEffect(() => {
    const trackElement = vanTrackRef.current;
    const vanElement = vanRef.current;
    const stockElement = stockVisualRef.current;

    if (!trackElement || !vanElement || !stockElement) {
      return;
    }

    let frameId = 0;

    const updateVanBounds = () => {
      frameId = 0;

      const trackRect = trackElement.getBoundingClientRect();
      const stockRect = stockElement.getBoundingClientRect();
      const trackWidth = trackRect.width;
      const vanWidth = vanElement.offsetWidth;

      if (!trackWidth || !vanWidth) {
        return;
      }

      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const startX = -vanWidth * 1.2;
      const targetRatio = isMobile ? 0.5 : isTablet ? 0.56 : 0.62;
      const desiredEndX = stockRect.left - trackRect.left + stockRect.width * targetRatio - vanWidth * 0.5;
      const edgePadding = isMobile ? 12 : isTablet ? 24 : 36;
      const endX = clamp(desiredEndX, startX, trackWidth - vanWidth - edgePadding);

      setVanBounds((currentBounds) => {
        if (currentBounds.startX === startX && currentBounds.endX === endX) {
          return currentBounds;
        }

        return { startX, endX };
      });
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateVanBounds);
    };

    requestUpdate();
    window.addEventListener("resize", requestUpdate);

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(requestUpdate) : null;

    resizeObserver?.observe(trackElement);
    resizeObserver?.observe(stockElement);
    resizeObserver?.observe(vanElement);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver?.disconnect();
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const operationPhotos = React.useMemo<OperationPhoto[]>(
    () => [
      {
        src: estoqueImage,
        alt: "Estoque Exacty Med",
        title: "Estoque",
        description: "Ambiente controlado para armazenamento dos produtos.",
      },
      {
        src: createOperationPlaceholderDataUri("Separação de pedidos"),
        alt: "Separação de pedidos Exacty Med",
        title: "Separação",
        description: "Processo de separação e conferência dos pedidos.",
      },
      {
        src: createOperationPlaceholderDataUri("Treinamentos"),
        alt: "Treinamentos Exacty Med",
        title: "Treinamentos",
        description: "Workshops, relacionamento e bastidores da distribuição.",
      },
    ],
    [],
  );

  React.useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  return (
    <section
      ref={sectionRef}
      id="sobre"
      className="exacty-section-blend relative overflow-hidden bg-transparent pt-20 pb-28 md:pt-24 md:pb-32 lg:pt-28 lg:pb-36"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,13,0.72)_0%,rgba(11,7,18,0.44)_40%,rgba(7,5,13,0.72)_100%)]" />
        <div className="absolute left-1/2 top-16 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[108px]" />
        <div className="absolute left-1/2 top-1/3 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[148px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_34%)]" />
        <div className="absolute left-1/2 bottom-0 h-28 w-[min(920px,90vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(122,78,228,0.08),rgba(122,78,228,0.02)_48%,transparent_76%)] blur-[40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:20px_20px] opacity-[0.03]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[16] md:bottom-6 lg:bottom-8">
        <div ref={vanTrackRef} className="relative h-[88px] sm:h-[96px] md:h-[108px] lg:h-[118px] xl:h-[126px]">
          <div className="absolute inset-x-0 bottom-4 sm:bottom-5 md:bottom-6 lg:bottom-7">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            <div className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 bg-[linear-gradient(90deg,rgba(124,58,237,0),rgba(124,58,237,0.14),rgba(124,58,237,0))] blur-[28px]" />
          </div>

          <motion.div
            ref={vanRef}
            className="absolute bottom-0 left-0 pointer-events-none select-none will-change-transform"
            style={{ x: vanX }}
          >
            <div className="absolute inset-x-2 bottom-2 h-4 rounded-full bg-black/35 blur-[16px] sm:inset-x-4 sm:h-5 md:bottom-3 md:h-6" />
            <img
              src={vanImage}
              width={480}
              height={480}
              loading="lazy"
              decoding="async"
              alt=""
              aria-hidden="true"
              className="relative z-10 w-[110px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] sm:w-[122px] md:w-[140px] lg:w-[180px]"
            />
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.72, ease: easeOut }}
            className="max-w-2xl"
          >
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.28em] text-violet-200/70 sm:text-[11px]">
              Qualidade, Inovação e Confiança
            </p>

            <h2 className="text-[2.05rem] font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50 sm:text-[2.75rem] md:text-[3.4rem]">
              <span className="bg-[linear-gradient(180deg,#e9defd_0%,#d4b5ff_35%,#a855f7_68%,#7c3aed_100%)] bg-clip-text text-transparent">
                Distribuição especializada
              </span>{" "}
              para quem não pode correr riscos
            </h2>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-400">
              A Exacty Med é uma empresa especializada em oferecer soluções de alta qualidade para o setor de saúde e
              estética avançada. Nosso compromisso é proporcionar aos profissionais acesso a produtos inovadores e
              reconhecidos pela qualidade e segurança. Trabalhamos com marcas renomadas mundialmente garantindo produtos
              confiáveis e aprovados pela ANVISA. Prezamos pela excelência no atendimento através de curadoria técnica,
              relacionamento próximo e transparência.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {HIGHLIGHTS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="group flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.24)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-white/[0.055]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-[0_0_24px_rgba(139,92,246,0.12)]">
                      <Icon className="h-[18px] w-[18px]" />
                    </div>

                    <span className="text-[15px] font-medium text-zinc-100">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.08, ease: easeOut }}
            className="relative"
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/16 blur-[96px]" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] p-3.5 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl md:p-4">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_24%,transparent_100%)] opacity-70" />
              <div className="absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

              <div
                ref={stockVisualRef}
                className="relative z-10 aspect-[5/5.2] overflow-hidden rounded-[24px] border border-white/10 bg-black/20"
              >
                <Carousel
                  setApi={setCarouselApi}
                  opts={{ align: "center", loop: operationPhotos.length > 1 }}
                  className="h-full w-full"
                >
                  <CarouselContent className="h-full">
                    {operationPhotos.map((photo) => (
                      <CarouselItem key={photo.alt} className="h-full">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          width={720}
                          height={960}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover object-center"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious
                    variant="ghost"
                    className="left-3 z-30 h-10 w-10 rounded-full border border-white/10 bg-white/[0.06] text-zinc-100 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-lg transition-all duration-300 hover:border-violet-300/30 hover:bg-violet-500/12 hover:text-white disabled:opacity-0"
                  />
                  <CarouselNext
                    variant="ghost"
                    className="right-3 z-30 h-10 w-10 rounded-full border border-white/10 bg-white/[0.06] text-zinc-100 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-lg transition-all duration-300 hover:border-violet-300/30 hover:bg-violet-500/12 hover:text-white disabled:opacity-0"
                  />
                </Carousel>

                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,5,13,0.94)_0%,rgba(7,5,13,0.34)_38%,rgba(7,5,13,0.06)_62%,transparent_76%)]" />

                <div className="pointer-events-none absolute left-4 top-4 z-20 sm:left-5 sm:top-5">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-200/80 backdrop-blur-lg sm:text-[11px]">
                    ESTOQUE REAL E OPERAÇÃO CONTROLADA
                  </span>
                </div>

                <div className="absolute left-1/2 top-[22px] z-20 flex -translate-x-1/2 items-center gap-2 sm:top-[26px]">
                  {operationPhotos.map((photo, idx) => (
                    <button
                      key={photo.alt}
                      type="button"
                      aria-label={`Ir para ${photo.title ?? `foto ${idx + 1}`}`}
                      onClick={() => carouselApi?.scrollTo(idx)}
                      className={[
                        "h-1.5 w-6 rounded-full transition-all duration-300",
                        idx === activeSlide ? "bg-violet-200/70" : "bg-white/15 hover:bg-white/25",
                      ].join(" ")}
                    />
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 sm:inset-x-5 sm:bottom-5">
                  <div className="rounded-[20px] border border-white/10 bg-black/35 px-4 py-3.5 backdrop-blur-lg">
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-violet-200/70 sm:text-[11px]">
                      Controle rigoroso em cada etapa
                    </p>
                    <p className="mt-1.5 text-[13.5px] leading-[1.35rem] text-zinc-200 sm:text-sm sm:leading-6">
                      Evidência real da operação Exacty Med com controle de estoque, rastreabilidade e suporte
                      consultivo para profissionais da estética avançada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuthoritySectionExactyMed;
