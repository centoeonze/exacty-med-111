import exactyImage from "@/assets/optimized/exacty.webp";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { getWhatsAppUrl } from "./WhatsAppLink";

const BADGES = [
  { icon: Clock3, text: "Entrega em até 3 horas" },
  { icon: MapPin, text: "Londrina • Cambé • Ibiporã" },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

const HeroExactyMed = () => (
  <section
    id="hero"
    className="hero-premium-bg relative overflow-hidden px-4 pb-12 pt-24 text-white sm:px-6 sm:pb-14 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-32"
  >
    <div className="pointer-events-none absolute inset-x-0 top-[12%] z-0 flex justify-center">
      <div className="hero-copy-backdrop h-[300px] w-[min(940px,92vw)]" />
    </div>

    <div className="pointer-events-none absolute left-1/2 top-[50%] z-0 h-72 w-[min(1100px,94vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(111,60,207,0.24),rgba(111,60,207,0.08)_42%,transparent_72%)] blur-[68px]" />

    <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
      <div className="relative w-full max-w-[1120px]">
        <div className="pointer-events-none absolute inset-x-[18%] top-6 -z-10 h-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(130,80,255,0.18),transparent_64%)] blur-3xl sm:inset-x-[22%] sm:top-8 sm:h-36 lg:top-10 lg:h-44" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeOut }}
          className="hero-top-badge mx-auto inline-flex items-center gap-2.5 px-5 py-2"
        >
          <ShieldCheck size={14} className="text-[#CBB6FF]" />
          <span>Distribuição especializada em estética avançada</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.78, delay: 0.08, ease: easeOut }}
          className="text-balance mx-auto mt-5 max-w-3xl font-display text-[2rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:mt-6 sm:text-[2.6rem] lg:text-[3.5rem]"
        >
          Produtos para harmonização facial com{" "}
          <span className="hero-gradient-text">procedência garantida</span> e{" "}
          <span className="hero-gradient-text-secondary">entrega rápida.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.16, ease: easeOut }}
          className="mx-auto mt-3 w-full max-w-6xl px-1 sm:mt-4 sm:px-4"
        >
          <div className="relative mx-auto w-full max-w-[1100px] px-4 sm:px-6 md:px-10">
            <div className="pointer-events-none absolute left-1/2 top-[45%] -z-10 h-[260px] w-[90%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(129,84,235,0.24)_0%,rgba(88,48,166,0.17)_34%,rgba(18,8,29,0.11)_58%,transparent_80%)] blur-[64px] sm:h-[320px] sm:max-w-[760px] md:h-[380px] md:max-w-[820px] lg:h-[430px]" />
            <div className="pointer-events-none absolute inset-x-[8%] bottom-[5%] -z-10 h-[150px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(153,116,255,0.1)_0%,rgba(99,62,187,0.08)_32%,rgba(18,8,29,0.08)_56%,rgba(9,6,15,0)_82%)] blur-[72px] sm:h-[178px] md:inset-x-[10%] md:h-[206px]" />
            <div className="pointer-events-none absolute inset-x-[14%] bottom-[3%] -z-10 h-[92px] rounded-full bg-[linear-gradient(180deg,rgba(17,11,24,0)_0%,rgba(53,31,78,0.05)_42%,rgba(18,8,29,0.12)_72%,rgba(9,6,15,0.22)_100%)] blur-[18px] sm:h-[104px] md:h-[116px]" />
            <div className="flex items-center justify-center overflow-visible pt-0 pb-1 sm:pt-1 sm:pb-2 md:pt-2 md:pb-2">
              <div className="relative isolate w-full max-w-[860px] overflow-visible">
                <div className="pointer-events-none absolute inset-x-[8%] top-[18%] z-0 h-[210px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(140,97,255,0.16)_0%,rgba(94,56,178,0.14)_30%,rgba(18,8,29,0.08)_58%,transparent_80%)] blur-[60px] sm:inset-x-[10%] sm:h-[250px] md:h-[290px] lg:h-[320px]" />
                <div className="pointer-events-none absolute inset-x-[6%] bottom-[4%] z-0 h-[118px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,135,255,0.12)_0%,rgba(107,70,198,0.09)_34%,rgba(16,9,24,0.06)_58%,rgba(16,9,24,0)_82%)] blur-[48px] sm:h-[132px] md:h-[148px]" />
                <div className="pointer-events-none absolute left-1/2 bottom-[6.8%] z-[8] h-[62px] w-[82%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(7,5,11,0.64)_0%,rgba(39,23,60,0.42)_28%,rgba(71,44,106,0.18)_52%,rgba(9,6,15,0)_80%)] blur-[18px] sm:h-[68px] sm:w-[78%] md:h-[74px] md:w-[74%]" />
                <img
                  src={exactyImage}
                  alt="Linha de produtos Exacty Med"
                  width={1400}
                  height={627}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="relative z-10 mx-auto block h-auto w-full max-w-[90vw] object-contain select-none [filter:drop-shadow(0_18px_16px_rgba(9,6,15,0.18))_drop-shadow(0_34px_28px_rgba(11,7,18,0.34))] sm:max-w-[620px] md:max-w-[700px] lg:max-w-[780px]"
                  draggable={false}
                />
                <div className="pointer-events-none absolute inset-x-[5%] bottom-[2.2%] z-[12] h-[56px] bg-[linear-gradient(180deg,rgba(8,6,14,0)_0%,rgba(33,20,50,0.05)_26%,rgba(16,10,25,0.18)_66%,rgba(10,7,16,0.24)_100%)] blur-[5px] sm:h-[64px] md:h-[72px]" />
                <div className="pointer-events-none absolute left-1/2 bottom-[2.8%] z-[12] h-[40px] w-[60%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(12,8,18,0.3)_0%,rgba(47,28,72,0.2)_38%,rgba(9,6,15,0)_78%)] blur-[16px] sm:h-[44px] sm:w-[58%] md:h-[50px] md:w-[54%]" />
                <div className="pointer-events-none absolute inset-x-[10%] bottom-[-3.5%] z-20 h-[54px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(182,151,255,0.07)_0%,rgba(103,66,194,0.07)_38%,rgba(9,6,15,0)_78%)] blur-[20px] sm:h-[58px] md:h-[64px]" />
              </div>
            </div>
            <div className="pointer-events-none mx-auto h-[52px] w-[88%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(12,8,20,0.38)_0%,rgba(72,44,112,0.16)_30%,rgba(18,8,29,0.08)_56%,rgba(9,6,15,0)_82%)] opacity-95 blur-[16px] sm:h-[58px] md:h-[66px]" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, delay: 0.24, ease: easeOut }}
          className="text-balance mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-[rgba(207,200,218,0.86)] sm:mt-2.5 sm:text-lg lg:text-[1.18rem]"
        >
          Distribuição homologada ANVISA, lote rastreável e transporte adequado para medicamentos, do nosso estoque até
          a sua clínica.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.32, ease: easeOut }}
          className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:mt-7 sm:flex-row"
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
          className="mt-4 text-[0.68rem] uppercase tracking-[0.26em] text-white/55 sm:mt-5 sm:text-xs"
        >
          Atendimento exclusivo para profissionais habilitados.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.48, ease: easeOut }}
          className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-5"
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
