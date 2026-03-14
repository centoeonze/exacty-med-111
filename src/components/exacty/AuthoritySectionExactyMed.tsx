import * as React from "react";
import estoqueImage from "@/assets/estoque.jpeg";
import vanImage from "@/assets/van.png";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { PackageCheck, ShieldCheck, Truck, Users } from "lucide-react";

const HIGHLIGHTS = [
  { icon: PackageCheck, label: "Estoque disponível" },
  { icon: Truck, label: "Entrega rápida na região" },
  { icon: Users, label: "Atendimento consultivo" },
  { icon: ShieldCheck, label: "Rastreabilidade total" },
];

const easeOut = [0.22, 1, 0.36, 1] as const;
const MAX_VAN_SCROLL_OFFSET = 24;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const AuthoritySectionExactyMed = () => {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const vanTrackRef = React.useRef<HTMLDivElement | null>(null);
  const vanRef = React.useRef<HTMLDivElement | null>(null);
  const stockVisualRef = React.useRef<HTMLDivElement | null>(null);
  const vanX = useMotionValue(0);
  const vanY = useMotionValue(0);
  const smoothVanX = useSpring(vanX, {
    stiffness: 130,
    damping: 24,
    mass: 1.72,
  });
  const smoothVanY = useSpring(vanY, {
    stiffness: 120,
    damping: 26,
    mass: 0.74,
  });

  React.useEffect(() => {
    const sectionElement = sectionRef.current;
    const trackElement = vanTrackRef.current;
    const vanElement = vanRef.current;
    const stockElement = stockVisualRef.current;

    if (!sectionElement || !trackElement || !vanElement || !stockElement) {
      return;
    }

    let frameId = 0;

    const updateVanPosition = () => {
      frameId = 0;

      const rect = sectionElement.getBoundingClientRect();
      const trackRect = trackElement.getBoundingClientRect();
      const stockRect = stockElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const trackWidth = trackRect.width;
      const vanWidth = vanElement.offsetWidth;

      if (!trackWidth || !vanWidth) {
        return;
      }

      const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
      const startX = -vanWidth * 0.94;
      const desiredEndX = stockRect.right - trackRect.left - vanWidth * 0.88;
      const endX = clamp(desiredEndX, startX, trackWidth - vanWidth - 10);

      vanX.set(startX + (endX - startX) * progress);
      vanY.set(progress * MAX_VAN_SCROLL_OFFSET);
    };

    const handleScroll = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateVanPosition);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="sobre" className="relative overflow-hidden bg-[#07050D] py-20 md:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(4,2,10,0.95),rgba(7,5,13,1))]" />
        <div className="absolute left-1/2 top-16 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:20px_20px] opacity-[0.03]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[94px] z-[24] hidden lg:block">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[90px] z-[30] hidden lg:block">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div
            ref={vanTrackRef}
            className="relative h-[150px] xl:h-[160px]"
          >
            <motion.div
              ref={vanRef}
              className="absolute bottom-0 left-0 will-change-transform"
              style={{ x: smoothVanX, y: smoothVanY }}
            >
              <div className="absolute inset-x-10 bottom-4 h-8 rounded-full bg-violet-500/10 blur-[24px]" />
              <img
                src={vanImage}
                alt=""
                aria-hidden="true"
                className="relative z-10 h-[143px] w-[322px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] xl:h-[152px] xl:w-[343px]"
              />
            </motion.div>
          </div>
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
              OPERAÇÃO, ESTOQUE E LOGÍSTICA CONTROLADA
            </p>

            <h2 className="text-[2.05rem] font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50 sm:text-[2.75rem] md:text-[3.4rem]">
              <span className="bg-[linear-gradient(180deg,#e9defd_0%,#d4b5ff_35%,#a855f7_68%,#7c3aed_100%)] bg-clip-text text-transparent">
                Distribuição especializada
              </span>{" "}
              para quem não pode correr riscos
            </h2>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-400">
              Procedência, armazenamento e prazo - tudo sob controle para a sua clínica.
            </p>

            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-zinc-400">
              Distribuidora especializada em profissionais da estética avançada, com operação orientada por
              disponibilidade, conservação adequada e atendimento consultivo. Atuamos em Londrina, Cambé, Ibiporã e
              região com entrega rápida e segura.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {HIGHLIGHTS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="group flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-white/[0.055]"
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
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/16 blur-[120px]" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] p-3.5 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-4">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_24%,transparent_100%)] opacity-70" />
              <div className="absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

              <div
                ref={stockVisualRef}
                className="relative z-10 aspect-[5/5.2] overflow-hidden rounded-[24px] border border-white/10 bg-black/20"
              >
                <img src={estoqueImage} alt="Estoque da Exacty Med" className="h-full w-full object-cover object-center" />

                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,5,13,0.94)_0%,rgba(7,5,13,0.34)_38%,rgba(7,5,13,0.06)_62%,transparent_76%)]" />

                <div className="pointer-events-none absolute left-4 top-4 z-20 sm:left-5 sm:top-5">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-200/80 backdrop-blur-xl sm:text-[11px]">
                    ESTOQUE REAL E OPERAÇÃO CONTROLADA
                  </span>
                </div>

                <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 sm:inset-x-5 sm:bottom-5">
                  <div className="rounded-[20px] border border-white/10 bg-black/35 px-4 py-3.5 backdrop-blur-xl">
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-violet-200/70 sm:text-[11px]">
                      DISPONIBILIDADE, CONSERVAÇÃO E LOGÍSTICA
                    </p>
                    <p className="mt-1.5 text-[13.5px] leading-[1.35rem] text-zinc-200 sm:text-sm sm:leading-6">
                      Evidência visual da operação Exacty Med com controle de estoque, rastreabilidade e suporte
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
