import acido from "@/assets/acido-hialuronico.png";
import bioestimulador from "@/assets/bioestimuladores-de-colageno.png";
import mockup from "@/assets/mockup.png";
import toxina from "@/assets/toxina-botulinica.png";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { getWhatsAppUrl } from "./WhatsAppLink";

const BADGES = [
  { icon: Clock3, text: "Entrega em até 3 horas" },
  { icon: MapPin, text: "Londrina • Cambé • Ibiporã" },
];

const easeOut = [0.22, 1, 0.36, 1] as const;
const productReveal = (delay: number) => ({
  initial: { opacity: 0, y: 22, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.72, delay, ease: easeOut },
});

const HeroExactyMed = () => (
  <section
    id="hero"
    className="hero-premium-bg relative min-h-screen overflow-hidden px-4 pb-16 pt-28 text-white sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-40"
  >
    <div className="pointer-events-none absolute inset-x-0 top-[12%] z-0 flex justify-center">
      <div className="hero-copy-backdrop h-[300px] w-[min(940px,92vw)]" />
    </div>

    <div className="pointer-events-none absolute left-1/2 top-[50%] z-0 h-72 w-[min(1100px,94vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(111,60,207,0.24),rgba(111,60,207,0.08)_42%,transparent_72%)] blur-[80px]" />

    <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
      <div className="relative w-full max-w-[1120px]">
        <div className="hero-copy-panel absolute inset-x-[6%] top-0 -z-10 h-[240px] rounded-[32px] sm:inset-x-[10%] sm:h-[270px] lg:inset-x-[18%] lg:h-[310px]" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeOut }}
          className="hero-top-badge mx-auto inline-flex items-center gap-2.5 px-4 py-2"
        >
          <ShieldCheck size={14} className="text-[#CBB6FF]" />
          <span>Distribuição especializada em estética avançada</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.78, delay: 0.08, ease: easeOut }}
          className="text-balance mx-auto mt-7 max-w-3xl font-display text-[2rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-[2.6rem] lg:text-[3.5rem]"
        >
          Produtos para harmonização facial com{" "}
          <span className="hero-gradient-text">procedência garantida</span> e{" "}
          <span className="hero-gradient-text-secondary">entrega rápida.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.16, ease: easeOut }}
          className="mx-auto mt-10 w-full max-w-6xl px-1 sm:mt-12 sm:px-4"
        >
          <div className="relative mx-auto h-[320px] w-full max-w-5xl sm:h-[390px] md:h-[470px] lg:h-[520px]">
            <div className="absolute inset-x-2 top-3 bottom-12 rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_30px_90px_rgba(5,3,10,0.34)] backdrop-blur-xl sm:inset-x-6 sm:top-4 sm:bottom-16 sm:rounded-[34px] md:inset-x-10 md:top-6 md:rounded-[38px] lg:inset-x-12 lg:top-10 lg:bottom-16 lg:rounded-[40px]" />
            <div className="absolute left-1/2 top-[40%] h-[150px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl sm:h-[190px] sm:w-[300px] md:h-[230px] md:w-[370px] lg:h-[250px] lg:w-[430px]" />
            <div className="absolute bottom-0 left-1/2 h-16 w-[94%] -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.05] shadow-[0_0_70px_rgba(139,92,246,0.16),0_22px_70px_rgba(1,1,6,0.45)] backdrop-blur-md sm:h-20 sm:w-[92%] md:h-24 md:w-[90%] lg:h-28 lg:w-[88%]" />

            <motion.div
              {...productReveal(0.22)}
              className="pointer-events-none absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 sm:block sm:h-[120px] sm:w-[134px] md:top-8 md:h-[156px] md:w-[172px] lg:top-10 lg:h-[192px] lg:w-[210px]"
            >
              <img
                src={bioestimulador}
                alt="Bioestimuladores de colágeno"
                className="h-full w-full object-contain opacity-78 drop-shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
              />
            </motion.div>

            <div className="absolute inset-x-2 bottom-[26px] z-20 flex items-end justify-center gap-1.5 sm:inset-x-6 sm:bottom-[34px] sm:gap-4 md:inset-x-10 md:bottom-[40px] md:gap-7 lg:inset-x-16 lg:bottom-8 lg:gap-14">
              <motion.div
                {...productReveal(0.28)}
                className="pointer-events-none relative z-20 h-[108px] w-[92px] shrink-0 sm:h-[150px] sm:w-[144px] md:h-[208px] md:w-[212px] lg:h-[242px] lg:w-[276px]"
              >
                <img
                  src={acido}
                  alt="Ácido hialurônico"
                  className="h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                />
              </motion.div>

              <motion.div
                {...productReveal(0.34)}
                className="pointer-events-none relative z-30 h-[160px] w-[108px] shrink-0 sm:h-[214px] sm:w-[148px] md:h-[288px] md:w-[198px] lg:h-[336px] lg:w-[244px]"
              >
                <img
                  src={mockup}
                  alt="Produto principal Exacty Med"
                  className="h-full w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
                />
              </motion.div>

              <motion.div
                {...productReveal(0.4)}
                className="pointer-events-none relative z-20 h-[108px] w-[92px] shrink-0 sm:h-[150px] sm:w-[144px] md:h-[208px] md:w-[212px] lg:h-[242px] lg:w-[276px]"
              >
                <img
                  src={toxina}
                  alt="Toxina botulínica"
                  className="h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, delay: 0.24, ease: easeOut }}
          className="text-balance mx-auto mt-10 max-w-3xl text-sm leading-relaxed text-[rgba(207,200,218,0.86)] sm:text-lg lg:text-[1.18rem]"
        >
          Distribuição homologada ANVISA, lote rastreável e transporte adequado para medicamentos, do nosso estoque até a sua clínica.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.32, ease: easeOut }}
          className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta-primary inline-flex w-full items-center justify-center gap-2.5 px-6 py-4 text-sm font-semibold text-white sm:w-auto sm:min-w-[250px]"
          >
            Falar com um consultor
            <ArrowRight size={16} />
          </a>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta-secondary inline-flex w-full items-center justify-center gap-2 px-6 py-4 text-sm font-semibold text-white sm:w-auto sm:min-w-[220px]"
          >
            Solicitar catálogo
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 text-[0.68rem] uppercase tracking-[0.26em] text-white/55 sm:text-xs"
        >
          Atendimento exclusivo para profissionais habilitados.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.48, ease: easeOut }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          {BADGES.map((badge) => (
            <span
              key={badge.text}
              className="hero-glass-pill inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-medium text-white/88"
            >
              <badge.icon size={14} className="text-[#D7C6FF]" />
              {badge.text}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroExactyMed;
